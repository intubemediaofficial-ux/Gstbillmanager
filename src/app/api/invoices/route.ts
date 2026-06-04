import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Invoice, BusinessSettings } from "@/lib/gst-types";
import { generateId, calculateGST, isInterState } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const checkNumber = searchParams.get("checkNumber");
  const adminUserId = searchParams.get("adminUserId");

  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;
  const key = `gst_invoices:${lookupUserId}`;
  const invoices: Invoice[] = (await kv.get(key)) || [];

  if (checkNumber) {
    const exists = invoices.some((i) => i.invoiceNumber === checkNumber);
    return Response.json({ exists });
  }

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

      const customNumber = body.customInvoiceNumber;
      let invoiceNumber: string;
      if (customNumber) {
        const dup = invoices.some((i) => i.invoiceNumber === customNumber);
        if (dup) return Response.json({ error: `Bill #${customNumber} already exists` }, { status: 400 });
        invoiceNumber = customNumber;
      } else {
        const lastNum = settings?.lastInvoiceNumber || 0;
        const prefix = settings?.invoicePrefix || "INV/2024-25/";
        const nextNum = lastNum + 1;
        invoiceNumber = `${prefix}${String(nextNum).padStart(3, "0")}`;
      }

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
        firm: body.firm ? { ...body.firm, logo: body.firm.logo || undefined } : undefined,
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
        gstMode: body.gstMode || "exclude",
        signature: body.signature || undefined,
        letterhead: body.letterhead || undefined,
        columnVisibility: body.columnVisibility || undefined,
        template: body.template || "premium",
        status: body.invoiceType === "quotation" || body.invoiceType === "proforma" ? "draft" : (body.status || "draft"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      invoices.push(invoice);
      await kv.set(key, invoices);

      if (!customNumber && settings && (body.invoiceType === "tax_invoice" || body.invoiceType === "bill_of_supply")) {
        const lastNum = settings.lastInvoiceNumber || 0;
        await kv.set(settingsKey, { ...settings, lastInvoiceNumber: lastNum + 1 });
      }

      return Response.json({ success: true, data: invoice });
    }

    if (action === "update") {
      const idx = invoices.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });

      const sellerState = body.firm?.stateCode || invoices[idx].firm?.stateCode || "";
      const buyerState = body.customer?.stateCode || invoices[idx].customer?.stateCode || "";
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

      invoices[idx] = {
        ...invoices[idx],
        invoiceType: body.invoiceType || invoices[idx].invoiceType,
        date: body.date || invoices[idx].date,
        dueDate: body.dueDate !== undefined ? body.dueDate : invoices[idx].dueDate,
        firm: body.firm || invoices[idx].firm,
        customer: body.customer || invoices[idx].customer,
        items,
        subtotal,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax,
        grandTotal: subtotal + totalTax,
        isInterState: interState,
        notes: body.notes !== undefined ? body.notes : invoices[idx].notes,
        terms: body.terms !== undefined ? body.terms : invoices[idx].terms,
        gstMode: body.gstMode || invoices[idx].gstMode,
        signature: body.signature !== undefined ? body.signature : invoices[idx].signature,
        letterhead: body.letterhead !== undefined ? body.letterhead : invoices[idx].letterhead,
        columnVisibility: body.columnVisibility || invoices[idx].columnVisibility,
        template: body.template || invoices[idx].template,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(key, invoices);
      return Response.json({ success: true, data: invoices[idx] });
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

    if (action === "convert_quotation") {
      const idx = invoices.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const quote = invoices[idx];
      const settingsKey = `gst_settings:${userId}`;
      const settings: BusinessSettings | null = await kv.get(settingsKey);
      const lastNum = settings?.lastInvoiceNumber || 0;
      const prefix = settings?.invoicePrefix || "INV/2024-25/";
      const nextNum = lastNum + 1;
      const invoiceNumber = `${prefix}${String(nextNum).padStart(3, "0")}`;
      const newInvoice: Invoice = {
        ...quote,
        id: generateId(),
        invoiceNumber,
        invoiceType: "tax_invoice",
        referenceInvoiceId: quote.id,
        referenceInvoiceNumber: quote.invoiceNumber,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      invoices.push(newInvoice);
      invoices[idx].status = "paid";
      invoices[idx].updatedAt = new Date().toISOString();
      await kv.set(key, invoices);
      if (settings) await kv.set(settingsKey, { ...settings, lastInvoiceNumber: nextNum });
      return Response.json({ success: true, data: newInvoice });
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
