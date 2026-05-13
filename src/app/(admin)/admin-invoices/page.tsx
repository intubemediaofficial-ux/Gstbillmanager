"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Trash2, Eye, Download } from "lucide-react";
import type { Invoice } from "@/lib/gst-types";
import { INVOICE_TYPE_LABELS } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

interface AdminInvoice extends Invoice {
  clientName: string;
  clientEmail: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  overdue: "bg-orange-100 text-orange-700",
};

const statusOptions = ["draft", "sent", "paid", "partial", "overdue", "cancelled"];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const didFetch = useRef(false);
  const fetchInvoices = () => {
    setLoading(true);
    fetch("/api/admin/invoices")
      .then((r) => r.json())
      .then((res) => setInvoices(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchInvoices();
  }, []);

  const handleDelete = async (inv: AdminInvoice) => {
    if (!confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId: inv.userId, id: inv.id }),
    });
    fetchInvoices();
  };

  const handleStatusChange = async (inv: AdminInvoice, newStatus: string) => {
    await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", userId: inv.userId, id: inv.id, status: newStatus }),
    });
    fetchInvoices();
  };

  const handleView = (inv: AdminInvoice) => {
    window.open(`/invoice-view?id=${inv.id}&userId=${inv.userId}`, "_blank");
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Client Invoices</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, customer, or client..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
                <th className="text-left p-3 font-medium">Client (User)</th>
                <th className="text-left p-3 font-medium">Customer (Bill To)</th>
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
                  <td className="p-3 text-gray-500">{INVOICE_TYPE_LABELS[inv.invoiceType]}</td>
                  <td className="p-3">
                    <div className="font-medium">{inv.clientName}</div>
                    <div className="text-xs text-gray-400">{inv.clientEmail}</div>
                  </td>
                  <td className="p-3">{inv.customer.name}</td>
                  <td className="p-3 text-gray-500">{formatDate(inv.date)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[inv.status] || ""}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleView(inv)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="View Invoice">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleView(inv)} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Download/Print">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(inv)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
