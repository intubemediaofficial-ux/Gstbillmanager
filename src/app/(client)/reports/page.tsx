"use client";

import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import type { Invoice } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/invoices").then((r) => r.json())
      .then((res) => setInvoices(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.grandTotal, 0);
  const totalPending = invoices.filter((i) => ["sent", "partial", "overdue"].includes(i.status)).reduce((s, i) => s + i.grandTotal - i.amountPaid, 0);
  const totalCgst = invoices.reduce((s, i) => s + i.totalCgst, 0);
  const totalSgst = invoices.reduce((s, i) => s + i.totalSgst, 0);
  const totalIgst = invoices.reduce((s, i) => s + i.totalIgst, 0);

  // Outstanding by customer
  const outstandingMap = new Map<string, { name: string; amount: number; count: number }>();
  invoices.filter((i) => ["sent", "partial", "overdue"].includes(i.status)).forEach((inv) => {
    const key = inv.customer.id;
    const existing = outstandingMap.get(key) || { name: inv.customer.name, amount: 0, count: 0 };
    existing.amount += inv.grandTotal - inv.amountPaid;
    existing.count += 1;
    outstandingMap.set(key, existing);
  });
  const outstanding = Array.from(outstandingMap.values()).sort((a, b) => b.amount - a.amount);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-xs" />
          <a href={`/api/tally-export?format=xml&month=${exportMonth}`} download className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> Tally XML
          </a>
          <a href={`/api/tally-export?format=csv&month=${exportMonth}`} download className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Total Revenue (Paid)</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.filter((i) => i.status === "paid").length} invoices</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Pending Amount</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.filter((i) => ["sent", "partial", "overdue"].includes(i.status)).length} invoices</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
      </div>

      {/* GST Summary */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-5 border-b"><h2 className="font-semibold">GST Summary</h2></div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Total CGST</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totalCgst)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Total SGST</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalSgst)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-500">Total IGST</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totalIgst)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b"><h2 className="font-semibold">Outstanding by Customer</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-right p-3 font-medium">Pending Invoices</th>
                <th className="text-right p-3 font-medium">Outstanding Amount</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map((o, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{o.name}</td>
                  <td className="p-3 text-right">{o.count}</td>
                  <td className="p-3 text-right text-orange-600 font-medium">{formatCurrency(o.amount)}</td>
                </tr>
              ))}
              {outstanding.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-400">No outstanding amounts</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
