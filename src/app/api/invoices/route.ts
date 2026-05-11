import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Invoice, BusinessSettings } from "@/lib/gst-types";
import { generateId, calculateGST, isInterState } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const key = `gst_invoices:${session.id}`;
  const invoices: Invoice[] = (await kv.get(key)) || [];

  if (id) {
    const inv = invoices.find((i) => i.id === id);
    return Response.json({ data: inv || null });
  }

  const sorted = invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_invoices:${userId}`;
    const invoices: Invoice[] = (await kv.get(key)) || [];

    if (action === "create") {
      const settingsKey = `gst_settings:${userId}`;
      const settings: BusinessSettings | null = await kv.get(settingsKey);

      const lastNum = settings?.lastInvoiceNumber || 0;
      const prefix = settings?.invoicePrefix || "INV/2024-25/";
      const nextNum = lastNum + 1;
      const invoiceNumber = `${prefix}${String(nextNum).padStart(3, "0")}`;

      const sellerState = body.firm?.stateCode || settings?.stateCode || "";
      const buyerState = body.customer?.stateCode || "";
      const interState = isInterState(sellerState, buyerState);

      let subtotal = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;

      const items = (body.items || []).map((item: { qty: number; rate: number; gstRate: number; description: string; hsn: string; unit: string }) => {
        const amount = item.qty * item.rate;
        const gst = calculateGST(amount, item.gstRate, interState);
        subtotal += amount;
        totalCgst += gst.cgst;
        totalSgst += gst.sgst;
        totalIgst += gst.igst;
        return {
          description: item.description,
          hsn: item.hsn || "",
          qty: item.qty,
          unit: item.unit || "PCS",
          rate: item.rate,
          amount,
          gstRate: item.gstRate,
          cgst: gst.cgst,
          sgst: gst.sgst,
          igst: gst.igst,
        };
      });

      const totalTax = totalCgst + totalSgst + totalIgst;

      const invoice: Invoice = {
        id: generateId(),
        userId,
        invoiceNumber,
        invoiceType: body.invoiceType || "tax_invoice",
        referenceInvoiceId: body.referenceInvoiceId || undefined,
        referenceInvoiceNumber: body.referenceInvoiceNumber || undefined,
        date: body.date || new Date().toISOString().split("T")[0],
        dueDate: body.dueDate || "",
        firm: body.firm || undefined,
        customer: body.customer,
        items,
        subtotal,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax,
        grandTotal: subtotal + totalTax,
        amountPaid: 0,
        isInterState: interState,
        notes: body.notes || "",
        terms: body.terms || "",
        signature: body.signature || undefined,
        status: body.invoiceType === "quotation" || body.invoiceType === "proforma" ? "draft" : (body.status || "draft"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      invoices.push(invoice);
      await kv.set(key, invoices);

      if (settings && (body.invoiceType === "tax_invoice" || body.invoiceType === "bill_of_supply")) {
        await kv.set(settingsKey, { ...settings, lastInvoiceNumber: nextNum });
      }

      return Response.json({ success: true, data: invoice });
    }

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
