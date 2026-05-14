import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  recommended: boolean;
  razorpayPlanId?: string;
}

export interface SiteSettings {
  pricing: PricingPlan[];
  razorpayKeyId: string;
  razorpaySecretKey: string;
  razorpayEnabled: boolean;
  paymentButtonText: string;
  subscriptionMode: boolean;
}

const KV_KEY = "gst_site_settings";

const defaultSettings: SiteSettings = {
  pricing: [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "month",
      features: [
        "Unlimited invoices",
        "Multiple firms & parties",
        "GST & Non-GST support",
        "HSN code auto-detect",
        "Director signatures",
        "Company letterhead",
        "Tally-style invoice format",
        "Dashboard & reports",
        "Google login",
      ],
      recommended: true,
    },
  ],
  razorpayKeyId: "",
  razorpaySecretKey: "",
  razorpayEnabled: false,
  paymentButtonText: "Get Started",
  subscriptionMode: false,
};

export async function GET() {
  const settings: SiteSettings | null = await kv.get(KV_KEY);
  return Response.json({ data: settings || defaultSettings });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing: SiteSettings | null = await kv.get(KV_KEY);
    const updated: SiteSettings = { ...(existing || defaultSettings), ...body };
    await kv.set(KV_KEY, updated);
    return Response.json({ success: true, data: updated });
  } catch {
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
