import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Invoice } from "@/lib/gst-types";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "xml";
  const month = searchParams.get("month") || "";

  const invoices: Invoice[] = (await kv.get(`gst_invoices:${session.id}`)) || [];
  const filtered = month ? invoices.filter((inv) => inv.date.startsWith(month)) : invoices;

  if (format === "xml") {
    const xml = generateTallyXML(filtered);
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="tally_export_${month || "all"}.xml"`,
      },
    });
  }

  if (format === "csv") {
    const csv = generateCSV(filtered);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tally_export_${month || "all"}.csv"`,
      },
    });
  }

  if (format === "json") {
    const data = filtered.map((inv) => ({
      voucherType: "Sales",
      voucherNumber: inv.invoiceNumber,
      date: inv.date,
      partyName: inv.customer.name,
      gstin: inv.customer.gstin,
      placeOfSupply: inv.customer.state,
      items: inv.items.map((item) => ({
        name: item.description,
        hsn: item.hsn,
        qty: item.qty,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
        gstRate: item.gstRate,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
      })),
      subtotal: inv.subtotal,
      cgst: inv.totalCgst,
      sgst: inv.totalSgst,
      igst: inv.totalIgst,
      grandTotal: inv.grandTotal,
    }));
    return Response.json({ data });
  }

  return Response.json({ error: "Invalid format" }, { status: 400 });
}

function generateTallyXML(invoices: Invoice[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n<HEADER>\n<TALLYREQUEST>Import Data</TALLYREQUEST>\n</HEADER>\n<BODY>\n<IMPORTDATA>\n<REQUESTDESC>\n<REPORTNAME>Vouchers</REPORTNAME>\n</REQUESTDESC>\n<REQUESTDATA>\n`;

  for (const inv of invoices) {
    xml += `<TALLYMESSAGE>\n<VOUCHER VCHTYPE="Sales" ACTION="Create">\n`;
    xml += `<DATE>${inv.date.replace(/-/g, "")}</DATE>\n`;
    xml += `<VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>\n`;
    xml += `<PARTYLEDGERNAME>${escapeXml(inv.customer.name)}</PARTYLEDGERNAME>\n`;
    xml += `<GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>\n`;
    xml += `<PARTYGSTIN>${inv.customer.gstin || ""}</PARTYGSTIN>\n`;
    xml += `<PLACEOFSUPPLY>${inv.customer.state}</PLACEOFSUPPLY>\n`;

    for (const item of inv.items) {
      xml += `<ALLINVENTORYENTRIES.LIST>\n`;
      xml += `<STOCKITEMNAME>${escapeXml(item.description)}</STOCKITEMNAME>\n`;
      xml += `<RATE>${item.rate}</RATE>\n`;
      xml += `<ACTUALQTY>${item.qty} ${item.unit}</ACTUALQTY>\n`;
      xml += `<AMOUNT>${item.amount}</AMOUNT>\n`;
      xml += `<HSNCODE>${item.hsn}</HSNCODE>\n`;
      xml += `<GSTRATE>${item.gstRate}</GSTRATE>\n`;
      xml += `</ALLINVENTORYENTRIES.LIST>\n`;
    }

    if (inv.totalCgst > 0) {
      xml += `<LEDGERENTRIES.LIST>\n<LEDGERNAME>CGST</LEDGERNAME>\n<AMOUNT>${inv.totalCgst}</AMOUNT>\n</LEDGERENTRIES.LIST>\n`;
      xml += `<LEDGERENTRIES.LIST>\n<LEDGERNAME>SGST</LEDGERNAME>\n<AMOUNT>${inv.totalSgst}</AMOUNT>\n</LEDGERENTRIES.LIST>\n`;
    }
    if (inv.totalIgst > 0) {
      xml += `<LEDGERENTRIES.LIST>\n<LEDGERNAME>IGST</LEDGERNAME>\n<AMOUNT>${inv.totalIgst}</AMOUNT>\n</LEDGERENTRIES.LIST>\n`;
    }

    xml += `</VOUCHER>\n</TALLYMESSAGE>\n`;
  }

  xml += `</REQUESTDATA>\n</IMPORTDATA>\n</BODY>\n</ENVELOPE>`;
  return xml;
}

function generateCSV(invoices: Invoice[]): string {
  let csv = "Invoice Number,Date,Party Name,GSTIN,HSN,Description,Qty,Unit,Rate,Amount,GST Rate,CGST,SGST,IGST,Grand Total\n";
  for (const inv of invoices) {
    for (const item of inv.items) {
      csv += `${inv.invoiceNumber},${inv.date},"${inv.customer.name}",${inv.customer.gstin || ""},${item.hsn},"${item.description}",${item.qty},${item.unit},${item.rate},${item.amount},${item.gstRate}%,${item.cgst},${item.sgst},${item.igst},${inv.grandTotal}\n`;
    }
  }
  return csv;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
