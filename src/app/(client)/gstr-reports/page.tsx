"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Download } from "lucide-react";
import { formatCurrency } from "@/lib/gst-utils";

interface B2BRow { gstin: string; partyName: string; invoiceNumber: string; date: string; taxableValue: number; cgst: number; sgst: number; igst: number; total: number; placeOfSupply: string }
interface HSNRow { hsn: string; description: string; uqc: string; totalQty: number; taxableValue: number; cgst: number; sgst: number; igst: number; total: number }
interface GSTR1Data { type: string; month: string; b2b: B2BRow[]; b2cSummary: { taxableValue: number; cgst: number; sgst: number; igst: number; total: number; count: number }; totalInvoices: number; totalTaxable: number; totalTax: number; totalValue: number }
interface GSTR3BData { type: string; month: string; outwardSupplies: { taxableValue: number; cgst: number; sgst: number; igst: number; total: number; count: number }; creditNotes: { taxableValue: number; cgst: number; sgst: number; igst: number; count: number }; debitNotes: { taxableValue: number; cgst: number; sgst: number; igst: number; count: number }; netTaxPayable: { cgst: number; sgst: number; igst: number; total: number } }
interface HSNData { type: string; month: string; items: HSNRow[] }

export default function GSTRReportsPage() {
  const [tab, setTab] = useState<"gstr1" | "gstr3b" | "hsn">("gstr1");
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [data, setData] = useState<GSTR1Data | GSTR3BData | HSNData | null>(null);
  const [loading, setLoading] = useState(false);
  const didFetch = useRef(false);

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/gstr-reports?type=${tab}&month=${month}`).then((r) => r.json())
      .then((res) => setData(res.data || null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (!didFetch.current) { didFetch.current = true; fetchReport(); } }, []);
  useEffect(() => { fetchReport(); }, [tab, month]);

  const downloadCSV = () => {
    if (!data) return;
    let csv = "";
    if (data.type === "gstr1" && "b2b" in data) {
      csv = "GSTIN,Party Name,Invoice #,Date,Taxable Value,CGST,SGST,IGST,Total,Place of Supply\n";
      data.b2b.forEach((r) => { csv += `${r.gstin},${r.partyName},${r.invoiceNumber},${r.date},${r.taxableValue},${r.cgst},${r.sgst},${r.igst},${r.total},${r.placeOfSupply}\n`; });
    } else if (data.type === "gstr3b" && "outwardSupplies" in data) {
      csv = "Category,Taxable Value,CGST,SGST,IGST,Count\n";
      csv += `Outward Supplies,${data.outwardSupplies.taxableValue},${data.outwardSupplies.cgst},${data.outwardSupplies.sgst},${data.outwardSupplies.igst},${data.outwardSupplies.count}\n`;
      csv += `Credit Notes,${data.creditNotes.taxableValue},${data.creditNotes.cgst},${data.creditNotes.sgst},${data.creditNotes.igst},${data.creditNotes.count}\n`;
      csv += `Debit Notes,${data.debitNotes.taxableValue},${data.debitNotes.cgst},${data.debitNotes.sgst},${data.debitNotes.igst},${data.debitNotes.count}\n`;
      csv += `\nNet Tax Payable,CGST: ${data.netTaxPayable.cgst},SGST: ${data.netTaxPayable.sgst},IGST: ${data.netTaxPayable.igst},Total: ${data.netTaxPayable.total}\n`;
    } else if (data.type === "hsn" && "items" in data) {
      csv = "HSN/SAC,Description,UQC,Qty,Taxable Value,CGST,SGST,IGST,Total\n";
      data.items.forEach((r) => { csv += `${r.hsn},${r.description},${r.uqc},${r.totalQty},${r.taxableValue},${r.cgst},${r.sgst},${r.igst},${r.total}\n`; });
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${data.type}_${month}.csv`; a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">GSTR Reports</h1>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([["gstr1", "GSTR-1"], ["gstr3b", "GSTR-3B"], ["hsn", "HSN Summary"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === k ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-400"><FileText className="w-8 h-8 mx-auto mb-2" /> No data for {month}</div>
      ) : (
        <>
          {/* GSTR-1 */}
          {data.type === "gstr1" && "b2b" in data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Total Invoices</p><p className="text-2xl font-bold">{data.totalInvoices}</p></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Taxable Value</p><p className="text-2xl font-bold">{formatCurrency(data.totalTaxable)}</p></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Total Tax</p><p className="text-2xl font-bold">{formatCurrency(data.totalTax)}</p></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Total Value</p><p className="text-2xl font-bold">{formatCurrency(data.totalValue)}</p></div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm">
                <div className="p-4 border-b font-semibold">B2B Invoices ({data.b2b.length})</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">GSTIN</th>
                        <th className="text-left p-3 font-medium">Party</th>
                        <th className="text-left p-3 font-medium">Invoice #</th>
                        <th className="text-right p-3 font-medium">Taxable</th>
                        <th className="text-right p-3 font-medium">CGST</th>
                        <th className="text-right p-3 font-medium">SGST</th>
                        <th className="text-right p-3 font-medium">IGST</th>
                        <th className="text-right p-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.b2b.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3 font-mono text-xs">{r.gstin}</td>
                          <td className="p-3">{r.partyName}</td>
                          <td className="p-3 font-mono text-xs">{r.invoiceNumber}</td>
                          <td className="p-3 text-right">{formatCurrency(r.taxableValue)}</td>
                          <td className="p-3 text-right">{formatCurrency(r.cgst)}</td>
                          <td className="p-3 text-right">{formatCurrency(r.sgst)}</td>
                          <td className="p-3 text-right">{formatCurrency(r.igst)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(r.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm p-4">
                <div className="font-semibold mb-2">B2C Summary ({data.b2cSummary.count} invoices)</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                  <div><span className="text-gray-500">Taxable:</span> <strong>{formatCurrency(data.b2cSummary.taxableValue)}</strong></div>
                  <div><span className="text-gray-500">CGST:</span> <strong>{formatCurrency(data.b2cSummary.cgst)}</strong></div>
                  <div><span className="text-gray-500">SGST:</span> <strong>{formatCurrency(data.b2cSummary.sgst)}</strong></div>
                  <div><span className="text-gray-500">IGST:</span> <strong>{formatCurrency(data.b2cSummary.igst)}</strong></div>
                  <div><span className="text-gray-500">Total:</span> <strong>{formatCurrency(data.b2cSummary.total)}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* GSTR-3B */}
          {data.type === "gstr3b" && "outwardSupplies" in data && (
            <div className="space-y-4">
              {[
                { label: "3.1 Outward Supplies", d: data.outwardSupplies },
                { label: "Credit Notes", d: data.creditNotes },
                { label: "Debit Notes", d: data.debitNotes },
              ].map((sec) => (
                <div key={sec.label} className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="font-semibold mb-2">{sec.label} ({sec.d.count})</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div><span className="text-gray-500">Taxable:</span> <strong>{formatCurrency(sec.d.taxableValue)}</strong></div>
                    <div><span className="text-gray-500">CGST:</span> <strong>{formatCurrency(sec.d.cgst)}</strong></div>
                    <div><span className="text-gray-500">SGST:</span> <strong>{formatCurrency(sec.d.sgst)}</strong></div>
                    <div><span className="text-gray-500">IGST:</span> <strong>{formatCurrency(sec.d.igst)}</strong></div>
                  </div>
                </div>
              ))}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="font-bold text-indigo-800 mb-2">Net Tax Payable</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-indigo-600">CGST:</span> <strong>{formatCurrency(data.netTaxPayable.cgst)}</strong></div>
                  <div><span className="text-indigo-600">SGST:</span> <strong>{formatCurrency(data.netTaxPayable.sgst)}</strong></div>
                  <div><span className="text-indigo-600">IGST:</span> <strong>{formatCurrency(data.netTaxPayable.igst)}</strong></div>
                  <div><span className="text-indigo-600">Total:</span> <strong className="text-lg">{formatCurrency(data.netTaxPayable.total)}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* HSN Summary */}
          {data.type === "hsn" && "items" in data && (
            <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">HSN/SAC</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">UQC</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Taxable</th>
                    <th className="text-right p-3 font-medium">CGST</th>
                    <th className="text-right p-3 font-medium">SGST</th>
                    <th className="text-right p-3 font-medium">IGST</th>
                    <th className="text-right p-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-mono">{r.hsn}</td>
                      <td className="p-3">{r.description}</td>
                      <td className="p-3">{r.uqc}</td>
                      <td className="p-3 text-right">{r.totalQty}</td>
                      <td className="p-3 text-right">{formatCurrency(r.taxableValue)}</td>
                      <td className="p-3 text-right">{formatCurrency(r.cgst)}</td>
                      <td className="p-3 text-right">{formatCurrency(r.sgst)}</td>
                      <td className="p-3 text-right">{formatCurrency(r.igst)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(r.total)}</td>
                    </tr>
                  ))}
                  {data.items.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-gray-400">No HSN data for {month}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
