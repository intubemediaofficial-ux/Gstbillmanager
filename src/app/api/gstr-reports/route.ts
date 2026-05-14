import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Invoice } from "@/lib/gst-types";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get("type") || "gstr1";
  const month = searchParams.get("month") || new Date().toISOString().substring(0, 7);

  const invoices: Invoice[] = (await kv.get(`gst_invoices:${session.id}`)) || [];

  const monthInvoices = invoices.filter((inv) => inv.date.startsWith(month) && inv.invoiceType === "tax_invoice");

  if (reportType === "gstr1") {
    const b2b = monthInvoices.filter((inv) => inv.customer.gstin);
    const b2c = monthInvoices.filter((inv) => !inv.customer.gstin);

    const b2bRows = b2b.map((inv) => ({
      gstin: inv.customer.gstin,
      partyName: inv.customer.name,
      invoiceNumber: inv.invoiceNumber,
      date: inv.date,
      taxableValue: inv.subtotal,
      cgst: inv.totalCgst,
      sgst: inv.totalSgst,
      igst: inv.totalIgst,
      total: inv.grandTotal,
      placeOfSupply: inv.customer.stateCode + " - " + inv.customer.state,
    }));

    const b2cTotal = b2c.reduce((acc, inv) => ({
      taxableValue: acc.taxableValue + inv.subtotal,
      cgst: acc.cgst + inv.totalCgst,
      sgst: acc.sgst + inv.totalSgst,
      igst: acc.igst + inv.totalIgst,
      total: acc.total + inv.grandTotal,
      count: acc.count + 1,
    }), { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0, count: 0 });

    return Response.json({
      data: {
        type: "gstr1",
        month,
        b2b: b2bRows,
        b2cSummary: b2cTotal,
        totalInvoices: monthInvoices.length,
        totalTaxable: monthInvoices.reduce((s, i) => s + i.subtotal, 0),
        totalTax: monthInvoices.reduce((s, i) => s + i.totalTax, 0),
        totalValue: monthInvoices.reduce((s, i) => s + i.grandTotal, 0),
      },
    });
  }

  if (reportType === "gstr3b") {
    const allMonth = invoices.filter((inv) => inv.date.startsWith(month));
    const sales = allMonth.filter((inv) => inv.invoiceType === "tax_invoice" || inv.invoiceType === "bill_of_supply");
    const creditNotes = allMonth.filter((inv) => inv.invoiceType === "credit_note");
    const debitNotes = allMonth.filter((inv) => inv.invoiceType === "debit_note");

    const sum = (arr: Invoice[]) => ({
      taxableValue: arr.reduce((s, i) => s + i.subtotal, 0),
      cgst: arr.reduce((s, i) => s + i.totalCgst, 0),
      sgst: arr.reduce((s, i) => s + i.totalSgst, 0),
      igst: arr.reduce((s, i) => s + i.totalIgst, 0),
      cess: 0,
      total: arr.reduce((s, i) => s + i.grandTotal, 0),
      count: arr.length,
    });

    const salesSum = sum(sales);
    const cnSum = sum(creditNotes);
    const dnSum = sum(debitNotes);

    return Response.json({
      data: {
        type: "gstr3b",
        month,
        outwardSupplies: salesSum,
        creditNotes: cnSum,
        debitNotes: dnSum,
        netTaxPayable: {
          cgst: salesSum.cgst - cnSum.cgst + dnSum.cgst,
          sgst: salesSum.sgst - cnSum.sgst + dnSum.sgst,
          igst: salesSum.igst - cnSum.igst + dnSum.igst,
          total: (salesSum.cgst - cnSum.cgst + dnSum.cgst) + (salesSum.sgst - cnSum.sgst + dnSum.sgst) + (salesSum.igst - cnSum.igst + dnSum.igst),
        },
      },
    });
  }

  if (reportType === "hsn") {
    const hsnMap: Record<string, { hsn: string; description: string; uqc: string; totalQty: number; taxableValue: number; cgst: number; sgst: number; igst: number; total: number }> = {};
    monthInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const k = item.hsn || "N/A";
        if (!hsnMap[k]) hsnMap[k] = { hsn: k, description: item.description, uqc: item.unit, totalQty: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        hsnMap[k].totalQty += item.qty;
        hsnMap[k].taxableValue += item.amount;
        hsnMap[k].cgst += item.cgst;
        hsnMap[k].sgst += item.sgst;
        hsnMap[k].igst += item.igst;
        hsnMap[k].total += item.amount + item.cgst + item.sgst + item.igst;
      });
    });

    return Response.json({ data: { type: "hsn", month, items: Object.values(hsnMap) } });
  }

  return Response.json({ error: "Invalid report type" }, { status: 400 });
}
