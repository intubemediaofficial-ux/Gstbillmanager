import { kv } from "@/lib/kv";
import type { Invoice } from "@/lib/gst-types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("id");
  const userId = searchParams.get("uid");

  if (!invoiceId || !userId) {
    return Response.json({ error: "Missing id or uid" }, { status: 400 });
  }

  const key = `gst_invoices:${userId}`;
  const invoices: Invoice[] = (await kv.get(key)) || [];
  const invoice = invoices.find((i) => i.id === invoiceId);

  if (!invoice) {
    return Response.json({ error: "Invoice not found" }, { status: 404 });
  }

  const fullMode = searchParams.get("full") === "1";

  if (fullMode) {
    return Response.json({ data: invoice });
  }

  return Response.json({
    data: {
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: invoice.invoiceType,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      firm: {
        name: invoice.firm?.name || "",
        gstin: invoice.firm?.gstin || "",
        address: invoice.firm?.address || "",
        city: invoice.firm?.city || "",
        state: invoice.firm?.state || "",
        phone: invoice.firm?.phone || "",
      },
      customer: {
        name: invoice.customer.name,
        gstin: invoice.customer.gstin,
        address: invoice.customer.address,
        city: invoice.customer.city,
        state: invoice.customer.state,
        phone: (invoice.customer as Record<string, string>).phone || "",
      },
      items: invoice.items.map((item) => ({
        name: item.description,
        hsn: item.hsn,
        quantity: item.qty,
        rate: item.rate,
        amount: item.amount,
        gstRate: item.gstRate,
        gstAmount: item.cgst + item.sgst + item.igst,
      })),
      subtotal: invoice.subtotal,
      totalTax: invoice.totalTax,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      amountInWords: "",
      createdAt: invoice.createdAt,
    },
  });
}
