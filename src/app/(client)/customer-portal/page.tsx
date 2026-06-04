"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Copy, CheckCircle, ExternalLink, Share2 } from "lucide-react";
import type { Customer, Invoice } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function CustomerPortalPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [copied, setCopied] = useState(false);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([cRes, iRes]) => {
      const c = cRes.data || [];
      setCustomers(c);
      setInvoices(iRes.data || []);
      if (c.length > 0) setSelectedCustomer(c[0]);
    }).finally(() => setLoading(false));
  }, []);

  const customerInvoices = selectedCustomer ? invoices.filter((i) => i.customer.id === selectedCustomer.id) : [];
  const totalSales = customerInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalPaid = customerInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.grandTotal, 0);
  const balance = totalSales - totalPaid;

  const portalUrl = selectedCustomer ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify?customer=${selectedCustomer.id}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!selectedCustomer) return;
    const text = `Dear ${selectedCustomer.name},\n\nYou can view your account statement and invoices here:\n${portalUrl}\n\nTotal Outstanding: ${formatCurrency(balance)}\n\nThank you!`;
    window.open(`https://wa.me/${selectedCustomer.phone || ""}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6" /> Customer Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Share a link with customers so they can view their invoices and balance online</p>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="text-sm font-medium mb-2 block">Select Customer</label>
        <select value={selectedCustomer?.id || ""} onChange={(e) => setSelectedCustomer(customers.find((c) => c.id === e.target.value) || null)}
          className="w-full px-3 py-2 border rounded-lg text-sm">
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ""}</option>)}
        </select>
      </div>

      {selectedCustomer && (
        <>
          {/* Portal Link */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 mb-6">
            <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Customer Portal Link</h3>
            <div className="flex items-center gap-2 mb-3">
              <input value={portalUrl} readOnly className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white font-mono" />
              <button onClick={handleCopyLink} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button onClick={handleWhatsAppShare} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              <Share2 className="w-4 h-4" /> Share via WhatsApp
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-500 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalSales)}</p>
              <p className="text-xs text-gray-400 mt-1">{customerInvoices.length} invoices</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-500 font-medium">Amount Received</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-500 font-medium">Balance Due</p>
              <p className={`text-2xl font-bold mt-1 ${balance > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(balance)}</p>
            </div>
          </div>

          {/* Invoice List Preview */}
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold">Invoices for {selectedCustomer.name}</h3>
              <p className="text-xs text-gray-400 mt-1">This is what the customer will see on their portal</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Invoice #</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="p-3 text-gray-500">{formatDate(inv.date)}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(inv.grandTotal)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "paid" ? "bg-green-100 text-green-700" : inv.status === "sent" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {customerInvoices.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400">No invoices for this customer yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
