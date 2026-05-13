import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { User, Firm } from "@/lib/gst-types";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users: User[] = (await kv.get("gst_users")) || [];
  const allFirms: (Firm & { ownerName: string; ownerEmail: string; ownerId: string })[] = [];

  for (const user of users) {
    const firms: Firm[] = (await kv.get(`firms_${user.id}`)) || [];
    for (const firm of firms) {
      allFirms.push({ ...firm, ownerName: user.name, ownerEmail: user.email, ownerId: user.id });
    }
  }

  return Response.json({ data: allFirms });
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

    const firms: Firm[] = (await kv.get(`firms_${userId}`)) || [];

    if (action === "update") {
      const idx = firms.findIndex((f) => f.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const firm = firms[idx] as unknown as Record<string, unknown>;
      const fields = ["isGst", "name", "address", "city", "state", "stateCode", "pincode", "gstin", "pan", "phone", "email", "bankName", "accountNumber", "ifscCode", "branchName", "hsnCode", "signatureText", "letterhead"];
      for (const f of fields) {
        if (body[f] !== undefined) firm[f] = body[f];
      }
      await kv.set(`firms_${userId}`, firms);
      return Response.json({ success: true, data: firms[idx] });
    }

    if (action === "delete") {
      const filtered = firms.filter((f) => f.id !== body.id);
      await kv.set(`firms_${userId}`, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
