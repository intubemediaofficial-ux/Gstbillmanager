import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { EWayBill } from "@/lib/gst-types";

function key(uid: string) { return `gst_eway_bills:${uid}`; }

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const uid = session.role === "admin" && searchParams.get("userId") ? searchParams.get("userId")! : session.id;

  const bills: EWayBill[] = (await kv.get(key(uid))) || [];
  return Response.json({ data: bills.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, userId: bodyUserId } = body;
  const uid = session.role === "admin" && bodyUserId ? bodyUserId : session.id;

  if (action === "create") {
    const bills: EWayBill[] = (await kv.get(key(uid))) || [];
    const newBill: EWayBill = {
      id: crypto.randomUUID(),
      userId: uid,
      invoiceId: body.invoiceId || "",
      invoiceNumber: body.invoiceNumber || "",
      transporterName: body.transporterName || "",
      transporterId: body.transporterId || "",
      vehicleNumber: body.vehicleNumber || "",
      vehicleType: body.vehicleType || "regular",
      transportMode: body.transportMode || "road",
      distance: body.distance || 0,
      fromState: body.fromState || "",
      toState: body.toState || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    bills.push(newBill);
    await kv.set(key(uid), bills);
    return Response.json({ success: true, data: newBill });
  }

  if (action === "cancel") {
    const bills: EWayBill[] = (await kv.get(key(uid))) || [];
    const idx = bills.findIndex((b) => b.id === body.id);
    if (idx >= 0) {
      bills[idx].status = "cancelled";
      await kv.set(key(uid), bills);
    }
    return Response.json({ success: true });
  }

  if (action === "delete") {
    const bills: EWayBill[] = (await kv.get(key(uid))) || [];
    await kv.set(key(uid), bills.filter((b) => b.id !== body.id));
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
