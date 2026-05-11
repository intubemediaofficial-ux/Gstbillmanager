import { kv } from "@vercel/kv";
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
    if (user.role !== "client") continue;
    const invoices: Invoice[] = (await kv.get(`gst_invoices:${user.id}`)) || [];
    for (const inv of invoices) {
      allInvoices.push({ ...inv, clientName: user.name, clientEmail: user.email });
    }
  }

  allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Response.json({ data: allInvoices });
}
