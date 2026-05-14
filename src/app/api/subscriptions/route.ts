import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";

interface SiteSettings {
  razorpayKeyId: string;
  razorpaySecretKey: string;
  razorpayEnabled: boolean;
  subscriptionMode: boolean;
  pricing: { id: string; name: string; price: number; period: string; razorpayPlanId?: string }[];
}

interface UserSubscription {
  userId: string;
  planId: string;
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string;
  status: "active" | "pending" | "cancelled" | "expired";
  createdAt: string;
  expiresAt?: string;
}

const SUBS_KEY = "gst_subscriptions";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "admin") {
    const subs: UserSubscription[] = (await kv.get(SUBS_KEY)) || [];
    return Response.json({ data: subs });
  }

  const subs: UserSubscription[] = (await kv.get(SUBS_KEY)) || [];
  const userSub = subs.find((s) => s.userId === session.id && s.status === "active");
  return Response.json({ data: userSub || null });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { planId, razorpayPaymentId, razorpaySubscriptionId } = body;

    const settings: SiteSettings | null = await kv.get("gst_site_settings");
    if (!settings?.razorpayEnabled) {
      return Response.json({ error: "Payments not enabled" }, { status: 400 });
    }

    const plan = settings.pricing.find((p) => p.id === planId);
    if (!plan) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }

    const subs: UserSubscription[] = (await kv.get(SUBS_KEY)) || [];

    const existingIdx = subs.findIndex((s) => s.userId === session.id && s.status === "active");
    if (existingIdx >= 0) {
      subs[existingIdx].status = "cancelled";
    }

    const periodMs = plan.period === "year" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    const newSub: UserSubscription = {
      userId: session.id,
      planId: plan.id,
      razorpaySubscriptionId: razorpaySubscriptionId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: plan.period === "lifetime" ? undefined : new Date(Date.now() + periodMs).toISOString(),
    };

    subs.push(newSub);
    await kv.set(SUBS_KEY, subs);

    return Response.json({ success: true, data: newSub });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
