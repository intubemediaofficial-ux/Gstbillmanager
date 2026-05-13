import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { User, Customer } from "@/lib/gst-types";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users: User[] = (await kv.get("gst_users")) || [];
  const allParties: (Customer & { ownerName: string; ownerEmail: string; ownerId: string })[] = [];

  for (const user of users) {
    const parties: Customer[] = (await kv.get(`gst_customers:${user.id}`)) || [];
    for (const p of parties) {
      allParties.push({ ...p, ownerName: user.name, ownerEmail: user.email, ownerId: user.id });
    }
  }

  return Response.json({ data: allParties });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, userId } = body;

    if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

    const parties: Customer[] = (await kv.get(`gst_customers:${userId}`)) || [];

    if (action === "update") {
      const idx = parties.findIndex((p) => p.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const party = parties[idx] as unknown as Record<string, unknown>;
      const fields = ["isGst", "name", "address", "city", "state", "stateCode", "pincode", "gstin", "pan", "phone", "email"];
      for (const f of fields) {
        if (body[f] !== undefined) party[f] = body[f];
      }
      if (body.gstin) parties[idx].gstin = body.gstin.toUpperCase();
      if (body.pan) parties[idx].pan = body.pan.toUpperCase();
      await kv.set(`gst_customers:${userId}`, parties);
      return Response.json({ success: true, data: parties[idx] });
    }

    if (action === "delete") {
      const filtered = parties.filter((p) => p.id !== body.id);
      await kv.set(`gst_customers:${userId}`, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
