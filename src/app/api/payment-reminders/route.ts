import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Invoice } from "@/lib/gst-types";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const invoices: Invoice[] = (await kv.get(`gst_invoices:${session.id}`)) || [];

  const pending = invoices.filter((inv) =>
    (inv.status === "sent" || inv.status === "partial" || inv.status === "overdue") &&
    inv.grandTotal > inv.amountPaid
  ).map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customer.name,
    customerPhone: inv.customer.gstin ? "" : "",
    grandTotal: inv.grandTotal,
    amountPaid: inv.amountPaid,
    balance: inv.grandTotal - inv.amountPaid,
    dueDate: inv.dueDate,
    status: inv.status,
    date: inv.date,
  }));

  return Response.json({ data: pending });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, invoiceId } = body;

  if (action === "send_whatsapp") {
    const invoices: Invoice[] = (await kv.get(`gst_invoices:${session.id}`)) || [];
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return Response.json({ error: "Invoice not found" }, { status: 404 });

    const balance = inv.grandTotal - inv.amountPaid;
    const text = `🔔 *Payment Reminder*\n\n📄 Invoice: *${inv.invoiceNumber}*\n👤 Dear ${inv.customer.name},\n💰 Amount Due: *₹${balance.toLocaleString("en-IN")}*\n📅 Invoice Date: ${inv.date}\n${inv.dueDate ? `⏰ Due Date: ${inv.dueDate}` : ""}\n\nPlease make the payment at your earliest convenience.\n\n🙏 Thank you!\n*${inv.firm?.name || "GST Bill Manager"}*`;

    return Response.json({
      success: true,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(text)}`,
      message: text,
    });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
