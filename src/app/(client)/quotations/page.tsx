"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, FilePlus, Trash2, Eye, Download, Edit2, ArrowRightCircle, Loader2, CheckCircle } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [converting, setConverting] = useState<string | null>(null);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/invoices").then((r) => r.json()).then((res) => {
      setQuotes((res.data || []).filter((i: Invoice) => i.invoiceType === "quotation" || i.invoiceType === "proforma"));
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setQuotes((p) => p.filter((q) => q.id !== id));
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status }) });
    setQuotes((p) => p.map((q) => q.id === id ? { ...q, status } : q));
  };

  const handleConvertToInvoice = async (quote: Invoice) => {
    if (!confirm(`Convert Quotation ${quote.invoiceNumber} to Tax Invoice?`)) return;
    setConverting(quote.id);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert_quotation", id: quote.id }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Invoice ${json.data.invoiceNumber} created from quotation!`);
        setQuotes((p) => p.map((q) => q.id === quote.id ? { ...q, status: "paid" as InvoiceStatus } : q));
      }
    } finally {
      setConverting(null);
    }
  };

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((q) => ({
      "Quotation #": q.invoiceNumber, "Type": q.invoiceType === "proforma" ? "Proforma" : "Quotation", "Date": q.date,
      "Customer": q.customer.name, "GSTIN": q.customer.gstin || "", "Amount": q.grandTotal, "Status": q.status.toUpperCase(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotations");
    XLSX.writeFile(wb, `Quotations_${monthFilter || "All"}.xlsx`);
  };

  const filtered = quotes.filter((q) => {
    const matchSearch = q.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || q.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchMonth = !monthFilter || q.date.startsWith(monthFilter);
    return matchSearch && matchMonth;
  });

  const totalAmount = filtered.reduce((s, q) => s + q.grandTotal, 0);
  const convertedCount = filtered.filter((q) => q.status === "paid").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quotations & Estimates</h1>
          <p className="text-sm text-gray-500 mt-1">Create quotations and convert them to invoices with one click</p>
        </div>
        <div className="flex gap-2">
          <Link href="/create-invoice?type=quotation" className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 text-sm font-medium">
            <FilePlus className="w-4 h-4" /> New Quotation
          </Link>
          <Link href="/create-invoice?type=proforma" className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium">
            <FilePlus className="w-4 h-4" /> Proforma Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Quotations</p>
          <p className="text-2xl font-bold mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Value</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Converted to Invoice</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{convertedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{filtered.length - convertedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotations..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
          <Download className="w-3.5 h-3.5" /> Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Quotation #</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{q.invoiceNumber}</td>
                  <td className="p-3 text-gray-500">{formatDate(q.date)}</td>
                  <td className="p-3 font-medium">{q.customer.name}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(q.grandTotal)}</td>
                  <td className="p-3">
                    <select value={q.status} onChange={(e) => handleStatusChange(q.id, e.target.value as InvoiceStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[q.status] || ""}`}>
                      <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Converted</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-right flex items-center justify-end gap-1">
                    {q.status !== "paid" && (
                      <button onClick={() => handleConvertToInvoice(q)} disabled={converting === q.id}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50" title="Convert to Invoice">
                        {converting === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightCircle className="w-3.5 h-3.5" />}
                        {converting === q.id ? "..." : "→ Invoice"}
                      </button>
                    )}
                    {q.status === "paid" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    <Link href={`/invoice-view?id=${q.id}`} className="p-1.5 hover:bg-gray-100 rounded inline-block"><Eye className="w-4 h-4 text-indigo-500" /></Link>
                    <Link href={`/create-invoice?edit=${q.id}`} className="p-1.5 hover:bg-blue-50 rounded inline-block"><Edit2 className="w-4 h-4 text-blue-500" /></Link>
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No quotations found. Create one and convert to invoice when approved!</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
