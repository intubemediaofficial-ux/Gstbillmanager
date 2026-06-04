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
  partial: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function PurchaseBillsPage() {
  const [bills, setBills] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/invoices").then((r) => r.json()).then((res) => {
      setBills((res.data || []).filter((i: Invoice) => i.invoiceType === "purchase_bill"));
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase bill?")) return;
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setBills((p) => p.filter((b) => b.id !== id));
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status }) });
    setBills((p) => p.map((b) => b.id === id ? { ...b, status } : b));
  };

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((b) => ({
      "Bill #": b.invoiceNumber, "Date": b.date, "Vendor": b.customer.name, "GSTIN": b.customer.gstin || "",
      "Subtotal": b.subtotal, "CGST": b.totalCgst, "SGST": b.totalSgst, "IGST": b.totalIgst,
      "Total": b.grandTotal, "ITC Eligible": b.customer.gstin ? "Yes" : "No", "Status": b.status.toUpperCase(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Bills");
    XLSX.writeFile(wb, `Purchase_Bills_${monthFilter || "All"}.xlsx`);
  };

  const filtered = bills.filter((b) => {
    const matchSearch = b.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || b.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchMonth = !monthFilter || b.date.startsWith(monthFilter);
    return matchSearch && matchMonth;
  });

  const totalAmount = filtered.reduce((s, b) => s + b.grandTotal, 0);
  const totalITC = filtered.reduce((s, b) => s + b.totalTax, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Purchase Bills</h1>
          <p className="text-sm text-gray-500 mt-1">Track purchases & claim Input Tax Credit (ITC)</p>
        </div>
        <Link href="/create-invoice?type=purchase_bill" className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium">
          <FilePlus className="w-4 h-4" /> Add Purchase Bill
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Bills</p>
          <p className="text-2xl font-bold mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Purchase Amount</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">ITC Claimable (GST Paid)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalITC)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Paid Bills</p>
          <p className="text-2xl font-bold mt-1">{filtered.filter((b) => b.status === "paid").length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search purchase bills..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
          <Download className="w-3.5 h-3.5" /> Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Bill #</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Vendor / Supplier</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-right p-3 font-medium">GST (ITC)</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{b.invoiceNumber}</td>
                  <td className="p-3 text-gray-500">{formatDate(b.date)}</td>
                  <td className="p-3 font-medium">{b.customer.name}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(b.grandTotal)}</td>
                  <td className="p-3 text-right text-green-600 font-medium">{formatCurrency(b.totalTax)}</td>
                  <td className="p-3">
                    <select value={b.status} onChange={(e) => handleStatusChange(b.id, e.target.value as InvoiceStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[b.status] || ""}`}>
                      <option value="draft">Unpaid</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/invoice-view?id=${b.id}`} className="p-1.5 hover:bg-gray-100 rounded inline-block"><Eye className="w-4 h-4 text-indigo-500" /></Link>
                    <Link href={`/create-invoice?edit=${b.id}`} className="p-1.5 hover:bg-blue-50 rounded inline-block"><Edit2 className="w-4 h-4 text-blue-500" /></Link>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No purchase bills found. Add purchase bills to track expenses and claim ITC.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
