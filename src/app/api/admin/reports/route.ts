import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { User, Invoice } from "@/lib/gst-types";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users: User[] = (await kv.get("gst_users")) || [];
  const clients = users.filter((u) => u.role === "client");

  let totalRevenue = 0;
  let totalPending = 0;
  let totalInvoices = 0;
  const clientStats: { name: string; email: string; invoiceCount: number; revenue: number; pending: number }[] = [];

  for (const client of clients) {
    const invoices: Invoice[] = (await kv.get(`gst_invoices:${client.id}`)) || [];
    let clientRevenue = 0;
    let clientPending = 0;

    for (const inv of invoices) {
      if (inv.status === "paid") clientRevenue += inv.grandTotal;
      if (inv.status === "sent" || inv.status === "partial" || inv.status === "overdue") {
        clientPending += inv.grandTotal - inv.amountPaid;
      }
    }

    totalRevenue += clientRevenue;
    totalPending += clientPending;
    totalInvoices += invoices.length;

    clientStats.push({
      name: client.name,
      email: client.email,
      invoiceCount: invoices.length,
      revenue: clientRevenue,
      pending: clientPending,
    });
  }

  return Response.json({
    data: {
      totalClients: clients.length,
      totalInvoices,
      totalRevenue,
      totalPending,
      clientStats,
    },
  });
}
