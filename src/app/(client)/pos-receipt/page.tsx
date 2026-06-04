"use client";

import { useState, useEffect, useRef } from "react";
import { Printer, Loader2, Download } from "lucide-react";
import type { Invoice, Firm } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function POSReceiptPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<"58mm" | "80mm">("80mm");
  const receiptRef = useRef<HTMLDivElement>(null);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/firms").then((r) => r.json()),
    ]).then(([iRes, fRes]) => {
      const invs = iRes.data || [];
      setInvoices(invs);
      setFirms(fRes.data || []);
      if (invs.length > 0) setSelectedInvoice(invs[0]);
    }).finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const width = paperSize === "58mm" ? "58mm" : "80mm";
    printWindow.document.write(`<!DOCTYPE html><html><head><style>
      @page { size: ${width} auto; margin: 0; }
      body { font-family: 'Courier New', monospace; font-size: 10px; width: ${width}; margin: 0 auto; padding: 4px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .border-top { border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
      .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 1px 0; vertical-align: top; }
    </style></head><body>${receiptRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadText = () => {
    if (!selectedInvoice) return;
    const inv = selectedInvoice;
    const firm = inv.firm || firms[0];
    let text = "";
    text += `${"=".repeat(32)}\n`;
    text += `${(firm?.name || "").padStart(16 + (firm?.name || "").length / 2)}\n`;
    if (firm?.address) text += `${firm.address}\n`;
    if (firm?.phone) text += `Ph: ${firm.phone}\n`;
    if (firm?.gstin) text += `GSTIN: ${firm.gstin}\n`;
    text += `${"=".repeat(32)}\n`;
    text += `Bill No: ${inv.invoiceNumber}\n`;
    text += `Date: ${formatDate(inv.date)}\n`;
    text += `Customer: ${inv.customer.name}\n`;
    text += `${"-".repeat(32)}\n`;
    text += `${"Item".padEnd(16)}${"Qty".padStart(4)}${"Amt".padStart(10)}\n`;
    text += `${"-".repeat(32)}\n`;
    for (const item of inv.items) {
      text += `${item.description.substring(0, 16).padEnd(16)}${String(item.qty).padStart(4)}${formatCurrency(item.rate * item.qty).padStart(10)}\n`;
    }
    text += `${"-".repeat(32)}\n`;
    text += `${"Subtotal:".padEnd(20)}${formatCurrency(inv.subtotal).padStart(12)}\n`;
    if (inv.totalTax > 0) text += `${"GST:".padEnd(20)}${formatCurrency(inv.totalTax).padStart(12)}\n`;
    text += `${"=".repeat(32)}\n`;
    text += `${"TOTAL:".padEnd(20)}${formatCurrency(inv.grandTotal).padStart(12)}\n`;
    text += `${"=".repeat(32)}\n`;
    text += `\n        Thank You!\n      Visit Again!\n`;

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Receipt_${inv.invoiceNumber}.txt`;
    link.click();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const inv = selectedInvoice;
  const firm = inv?.firm || firms[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Printer className="w-6 h-6" /> POS / Thermal Receipt</h1>
          <p className="text-sm text-gray-500 mt-1">Generate thermal printer compatible receipts (58mm / 80mm)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="text-sm font-medium mb-2 block">Select Invoice</label>
            <select value={selectedInvoice?.id || ""} onChange={(e) => setSelectedInvoice(invoices.find((i) => i.id === e.target.value) || null)}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select invoice...</option>
              {invoices.map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} — {i.customer.name} — {formatCurrency(i.grandTotal)}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="text-sm font-medium mb-2 block">Paper Size</label>
            <div className="flex gap-3">
              <button onClick={() => setPaperSize("58mm")} className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${paperSize === "58mm" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}>58mm (2 inch)</button>
              <button onClick={() => setPaperSize("80mm")} className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${paperSize === "80mm" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}>80mm (3 inch)</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handlePrint} disabled={!selectedInvoice} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
              <Printer className="w-5 h-5" /> Print Receipt
            </button>
            <button onClick={handleDownloadText} disabled={!selectedInvoice} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50">
              <Download className="w-5 h-5" /> Download TXT
            </button>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="flex justify-center">
          <div className={`bg-white shadow-lg border rounded-lg p-3 ${paperSize === "58mm" ? "w-[220px]" : "w-[300px]"}`} style={{ fontFamily: "'Courier New', monospace", fontSize: paperSize === "58mm" ? "9px" : "11px" }}>
            <div ref={receiptRef}>
              {inv ? (
                <>
                  <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                    <p className="font-bold text-sm">{firm?.name || "Company"}</p>
                    {firm?.address && <p>{firm.address}</p>}
                    {firm?.city && <p>{firm.city}{firm?.state ? `, ${firm.state}` : ""}</p>}
                    {firm?.phone && <p>Ph: {firm.phone}</p>}
                    {firm?.gstin && <p>GSTIN: {firm.gstin}</p>}
                  </div>

                  <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    <p><span className="font-bold">Bill:</span> {inv.invoiceNumber}</p>
                    <p><span className="font-bold">Date:</span> {formatDate(inv.date)}</p>
                    <p><span className="font-bold">To:</span> {inv.customer.name}</p>
                  </div>

                  <table className="w-full mb-2">
                    <thead className="border-b border-dashed border-gray-400">
                      <tr>
                        <td className="font-bold py-1">Item</td>
                        <td className="font-bold text-center py-1">Qty</td>
                        <td className="font-bold text-right py-1">Amt</td>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-0.5">{item.description.substring(0, paperSize === "58mm" ? 12 : 18)}</td>
                          <td className="text-center py-0.5">{item.qty}</td>
                          <td className="text-right py-0.5">{formatCurrency(item.rate * item.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-dashed border-gray-400 pt-2 space-y-0.5">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(inv.subtotal)}</span></div>
                    {inv.totalTax > 0 && <div className="flex justify-between"><span>GST:</span><span>{formatCurrency(inv.totalTax)}</span></div>}
                    <div className="flex justify-between font-bold border-t border-double border-gray-600 pt-1 mt-1 text-sm">
                      <span>TOTAL:</span><span>{formatCurrency(inv.grandTotal)}</span>
                    </div>
                  </div>

                  <div className="text-center mt-3 border-t border-dashed border-gray-400 pt-2">
                    <p className="font-bold">Thank You!</p>
                    <p>Visit Again!</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Printer className="w-8 h-8 mx-auto mb-2" />
                  <p>Select an invoice to preview receipt</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
