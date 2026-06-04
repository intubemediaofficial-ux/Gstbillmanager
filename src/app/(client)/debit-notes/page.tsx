"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, FilePlus, Trash2, Eye, Download, Edit2 } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DebitNotesPage() {
  const [notes, setNotes] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/invoices").then((r) => r.json()).then((res) => {
      setNotes((res.data || []).filter((i: Invoice) => i.invoiceType === "debit_note"));
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this debit note?")) return;
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setNotes((p) => p.filter((n) => n.id !== id));
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status }) });
    setNotes((p) => p.map((n) => n.id === id ? { ...n, status } : n));
  };

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((n) => ({
      "Debit Note #": n.invoiceNumber, "Date": n.date, "Customer": n.customer.name, "GSTIN": n.customer.gstin || "",
      "Original Invoice": n.referenceInvoiceNumber || "", "Amount": n.grandTotal, "Reason": n.notes || "", "Status": n.status.toUpperCase(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 16 }, { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 30 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Debit Notes");
    XLSX.writeFile(wb, `Debit_Notes_${monthFilter || "All"}.xlsx`);
  };

  const filtered = notes.filter((n) => {
    const matchSearch = n.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || n.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchMonth = !monthFilter || n.date.startsWith(monthFilter);
    return matchSearch && matchMonth;
  });

  const totalAmount = filtered.reduce((s, n) => s + n.grandTotal, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Debit Notes</h1>
          <p className="text-sm text-gray-500 mt-1">Issue debit notes for additional charges or price increases</p>
        </div>
        <Link href="/create-invoice?type=debit_note" className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 text-sm font-medium">
          <FilePlus className="w-4 h-4" /> Create Debit Note
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Debit Notes</p>
          <p className="text-2xl font-bold mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Linked Invoices</p>
          <p className="text-2xl font-bold mt-1">{filtered.filter((n) => n.referenceInvoiceNumber).length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search debit notes..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
          <Download className="w-3.5 h-3.5" /> Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Debit Note #</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Original Invoice</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{n.invoiceNumber}</td>
                  <td className="p-3 text-gray-500">{formatDate(n.date)}</td>
                  <td className="p-3 font-medium">{n.customer.name}</td>
                  <td className="p-3 text-gray-500 text-xs">{n.referenceInvoiceNumber || "—"}</td>
                  <td className="p-3 text-right font-medium text-amber-600">{formatCurrency(n.grandTotal)}</td>
                  <td className="p-3">
                    <select value={n.status} onChange={(e) => handleStatusChange(n.id, e.target.value as InvoiceStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[n.status] || ""}`}>
                      <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Adjusted</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/invoice-view?id=${n.id}`} className="p-1.5 hover:bg-gray-100 rounded inline-block"><Eye className="w-4 h-4 text-indigo-500" /></Link>
                    <Link href={`/create-invoice?edit=${n.id}`} className="p-1.5 hover:bg-blue-50 rounded inline-block"><Edit2 className="w-4 h-4 text-blue-500" /></Link>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No debit notes found. Create one for additional charges.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
