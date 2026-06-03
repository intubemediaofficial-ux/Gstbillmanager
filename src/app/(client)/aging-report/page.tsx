"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle, IndianRupee, Users, Calendar } from "lucide-react";
import type { Invoice } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function AgingReportPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/invoices").then((r) => r.json()).then((res) => setInvoices(res.data || [])).finally(() => setLoading(false));
  }, []);

  const unpaid = invoices.filter((i) => ["sent", "partial", "overdue", "draft"].includes(i.status));

  const getAgeDays = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getAgeBucket = (days: number) => {
    if (days <= 30) return "0-30 days";
    if (days <= 60) return "31-60 days";
    if (days <= 90) return "61-90 days";
    return "90+ days";
  };

  const buckets = ["0-30 days", "31-60 days", "61-90 days", "90+ days"];
  const bucketData = buckets.map((bucket) => {
    const items = unpaid.filter((inv) => getAgeBucket(getAgeDays(inv.dueDate || inv.date)) === bucket);
    const total = items.reduce((s, i) => s + i.grandTotal - i.amountPaid, 0);
    return { bucket, items, total, count: items.length };
  });

  const totalPending = unpaid.reduce((s, i) => s + i.grandTotal - i.amountPaid, 0);

  const customerAging = Object.values(
    unpaid.reduce((acc, inv) => {
      const name = inv.customer.name;
      if (!acc[name]) acc[name] = { name, total: 0, count: 0, oldest: inv.dueDate || inv.date };
      acc[name].total += inv.grandTotal - inv.amountPaid;
      acc[name].count += 1;
      if ((inv.dueDate || inv.date) < acc[name].oldest) acc[name].oldest = inv.dueDate || inv.date;
      return acc;
    }, {} as Record<string, { name: string; total: number; count: number; oldest: string }>)
  ).sort((a, b) => b.total - a.total);

  const BUCKET_COLORS = ["bg-emerald-500", "bg-amber-500", "bg-orange-500", "bg-red-500"];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aging Report</h1>
        <p className="text-sm text-gray-500 mt-1">Track pending payments by age</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-white border border-red-100 shadow-sm">
          <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Total Pending</span></div>
          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Unpaid Invoices</span></div>
          <p className="text-lg font-bold text-gray-900 mt-1">{unpaid.length}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">Customers</span></div>
          <p className="text-lg font-bold text-gray-900 mt-1">{customerAging.length}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /><span className="text-xs text-gray-500">Over 90 Days</span></div>
          <p className="text-lg font-bold text-orange-600 mt-1">{formatCurrency(bucketData[3].total)}</p>
        </div>
      </div>

      {/* Age Buckets Visual */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {bucketData.map((b, i) => {
          const pct = totalPending > 0 ? ((b.total / totalPending) * 100).toFixed(0) : "0";
          return (
            <div key={b.bucket} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${BUCKET_COLORS[i]}`} />
                <p className="text-xs font-semibold text-gray-700">{b.bucket}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(b.total)}</p>
              <p className="text-xs text-gray-400">{b.count} invoices · {pct}%</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${BUCKET_COLORS[i]} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer-wise Aging */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Customer-wise Aging</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {customerAging.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No pending payments</div>
            ) : customerAging.map((c) => (
              <div key={c.name} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.count} invoices · Since {formatDate(c.oldest)}</p>
                </div>
                <p className="font-bold text-sm text-red-600">{formatCurrency(c.total)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed List */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-gray-900">Pending Invoices</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {unpaid.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">All invoices are paid!</div>
            ) : unpaid.sort((a, b) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime()).map((inv) => {
              const days = getAgeDays(inv.dueDate || inv.date);
              const balance = inv.grandTotal - inv.amountPaid;
              return (
                <div key={inv.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">{inv.customer.name} · {formatDate(inv.dueDate || inv.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">{formatCurrency(balance)}</p>
                    <span className={`text-xs font-medium ${days > 90 ? "text-red-600" : days > 60 ? "text-orange-600" : days > 30 ? "text-amber-600" : "text-gray-500"}`}>
                      {days} days
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
