import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { User, Invoice } from "@/lib/gst-types";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users: User[] = (await kv.get("gst_users")) || [];
  const allInvoices: (Invoice & { clientName: string; clientEmail: string })[] = [];

  for (const user of users) {
    const invoices: Invoice[] = (await kv.get(`gst_invoices:${user.id}`)) || [];
    for (const inv of invoices) {
      allInvoices.push({ ...inv, clientName: user.name, clientEmail: user.email });
    }
  }

  allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Response.json({ data: allInvoices });
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

    const key = `gst_invoices:${userId}`;
    const invoices: Invoice[] = (await kv.get(key)) || [];

    if (action === "update_status") {
      const idx = invoices.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      invoices[idx].status = body.status;
      if (body.amountPaid !== undefined) invoices[idx].amountPaid = body.amountPaid;
      invoices[idx].updatedAt = new Date().toISOString();
      await kv.set(key, invoices);
      return Response.json({ success: true });
    }

    if (action === "delete") {
      const filtered = invoices.filter((i) => i.id !== body.id);
      await kv.set(key, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
