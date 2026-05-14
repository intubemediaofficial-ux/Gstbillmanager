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

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const thisMonth = now.toISOString().slice(0, 7);

  let totalInvoices = 0;
  let todayInvoices = 0;
  let monthInvoices = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;
  let totalRevenue = 0;

  const dailyCounts: Record<string, number> = {};
  const dailyRevenue: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};
  const monthlyRevenue: Record<string, number> = {};

  let signupsToday = 0;
  let signupsMonth = 0;

  for (const client of clients) {
    const createdDate = client.createdAt?.slice(0, 10) || "";
    const createdMonth = client.createdAt?.slice(0, 7) || "";
    if (createdDate === today) signupsToday++;
    if (createdMonth === thisMonth) signupsMonth++;

    const invoices: Invoice[] = (await kv.get(`gst_invoices:${client.id}`)) || [];
    totalInvoices += invoices.length;

    for (const inv of invoices) {
      const invDate = inv.createdAt?.slice(0, 10) || inv.date?.slice(0, 10) || "";
      const invMonth = invDate.slice(0, 7);

      dailyCounts[invDate] = (dailyCounts[invDate] || 0) + 1;
      monthlyCounts[invMonth] = (monthlyCounts[invMonth] || 0) + 1;

      if (invDate === today) todayInvoices++;
      if (invMonth === thisMonth) monthInvoices++;

      if (inv.status === "paid") {
        totalRevenue += inv.grandTotal;
        dailyRevenue[invDate] = (dailyRevenue[invDate] || 0) + inv.grandTotal;
        monthlyRevenue[invMonth] = (monthlyRevenue[invMonth] || 0) + inv.grandTotal;
        if (invDate === today) todayRevenue += inv.grandTotal;
        if (invMonth === thisMonth) monthRevenue += inv.grandTotal;
      }
    }
  }

  const last30Days: { date: string; invoices: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last30Days.push({ date: key, invoices: dailyCounts[key] || 0, revenue: dailyRevenue[key] || 0 });
  }

  const last12Months: { month: string; invoices: number; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    last12Months.push({ month: label, invoices: monthlyCounts[key] || 0, revenue: monthlyRevenue[key] || 0 });
  }

  const topClients = clients
    .map((c) => ({ name: c.name, email: c.email, createdAt: c.createdAt }))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 10);

  return Response.json({
    data: {
      totalUsers: clients.length,
      activeToday: signupsToday,
      signupsMonth,
      totalInvoices,
      todayInvoices,
      monthInvoices,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      last30Days,
      last12Months,
      recentSignups: topClients,
    },
  });
}
