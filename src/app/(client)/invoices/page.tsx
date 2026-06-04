"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, FilePlus, Trash2, Eye, MessageCircle, Edit2, Download } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/gst-types";
import { INVOICE_TYPE_LABELS } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  overdue: "bg-orange-100 text-orange-700",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");

  const fetchRef = useRef(0);
  const fetchInvoices = () => {
    const id = ++fetchRef.current;
    setLoading(true);
    fetch("/api/invoices").then((r) => r.json())
      .then((res) => { if (fetchRef.current === id) setInvoices(res.data || []); })
      .finally(() => { if (fetchRef.current === id) setLoading(false); });
  };

  const didMount = useRef(false);
  useEffect(() => { if (didMount.current) return; didMount.current = true; fetchInvoices(); }, []);

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    fetchInvoices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchInvoices();
  };

  const sendReminder = async (invoiceId: string) => {
    const res = await fetch("/api/payment-reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_whatsapp", invoiceId }),
    });
    const json = await res.json();
    if (json.whatsappUrl) window.open(json.whatsappUrl, "_blank");
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchMonth = !monthFilter || inv.date.startsWith(monthFilter);
    return matchSearch && matchStatus && matchMonth;
  });

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((inv) => ({
      "Invoice #": inv.invoiceNumber,
      "Type": INVOICE_TYPE_LABELS[inv.invoiceType],
      "Customer": inv.customer.name,
      "GSTIN": inv.customer.gstin || "",
      "Date": inv.date,
      "Subtotal": inv.subtotal,
      "CGST": inv.totalCgst,
      "SGST": inv.totalSgst,
      "IGST": inv.totalIgst,
      "Grand Total": inv.grandTotal,
      "Status": inv.status.toUpperCase(),
      "Amount Paid": inv.amountPaid || 0,
      "Balance": inv.grandTotal - (inv.amountPaid || 0),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, `Invoices_${monthFilter || "All"}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/create-invoice" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <FilePlus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
          <Download className="w-3.5 h-3.5" /> Download Excel
        </button>
        <a href={`/api/tally-export?format=csv&month=${monthFilter}`} download className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium">
          <Download className="w-3.5 h-3.5" /> CSV
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Invoice #</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{inv.invoiceNumber}</td>
                  <td className="p-3 text-gray-500 text-xs">{INVOICE_TYPE_LABELS[inv.invoiceType]}</td>
                  <td className="p-3 font-medium">{inv.customer.name}</td>
                  <td className="p-3 text-gray-500">{formatDate(inv.date)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[inv.status] || ""}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/invoice-view?id=${inv.id}`} className="p-1.5 hover:bg-gray-100 rounded inline-block" title="View"><Eye className="w-4 h-4 text-indigo-500" /></Link>
                    <Link href={`/create-invoice?edit=${inv.id}`} className="p-1.5 hover:bg-blue-50 rounded inline-block" title="Edit"><Edit2 className="w-4 h-4 text-blue-500" /></Link>
                    {["sent", "partial", "overdue"].includes(inv.status) && (
                      <button onClick={() => sendReminder(inv.id)} className="p-1.5 hover:bg-green-50 rounded" title="WhatsApp Reminder"><MessageCircle className="w-4 h-4 text-green-600" /></button>
                    )}
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No invoices found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
