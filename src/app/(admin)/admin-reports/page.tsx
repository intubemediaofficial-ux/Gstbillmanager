"use client";

import { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/gst-utils";

interface ReportData {
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  totalPending: number;
  clientStats: { name: string; email: string; invoiceCount: number; revenue: number; pending: number }[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((res) => setData(res.data || null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.totalRevenue || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Pending Amount</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(data?.totalPending || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{data?.totalInvoices || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Revenue by Client</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Client</th>
                <th className="text-right p-3 font-medium">Invoices</th>
                <th className="text-right p-3 font-medium">Revenue</th>
                <th className="text-right p-3 font-medium">Pending</th>
                <th className="text-right p-3 font-medium">Contribution %</th>
              </tr>
            </thead>
            <tbody>
              {(data?.clientStats || []).map((c, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.email}</div>
                  </td>
                  <td className="p-3 text-right">{c.invoiceCount}</td>
                  <td className="p-3 text-right text-green-600 font-medium">{formatCurrency(c.revenue)}</td>
                  <td className="p-3 text-right text-orange-600">{formatCurrency(c.pending)}</td>
                  <td className="p-3 text-right">
                    {data?.totalRevenue ? ((c.revenue / data.totalRevenue) * 100).toFixed(1) + "%" : "0%"}
                  </td>
                </tr>
              ))}
              {(!data?.clientStats || data.clientStats.length === 0) && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
