"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, FileText, IndianRupee, Clock, Building2, UserCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/gst-utils";

interface ReportData {
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  totalPending: number;
  clientStats: { name: string; email: string; invoiceCount: number; revenue: number; pending: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [firmCount, setFirmCount] = useState(0);
  const [partyCount, setPartyCount] = useState(0);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/admin/reports").then((r) => r.json()),
      fetch("/api/admin/firms").then((r) => r.json()),
      fetch("/api/admin/parties").then((r) => r.json()),
    ]).then(([rRes, fRes, pRes]) => {
      setData(rRes.data || null);
      setFirmCount((fRes.data || []).length);
      setPartyCount((pRes.data || []).length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const stats = [
    { label: "Total Clients", value: data?.totalClients || 0, icon: Users, color: "bg-blue-500", href: "/admin-clients" },
    { label: "Total Firms", value: firmCount, icon: Building2, color: "bg-teal-500", href: "/admin-firms" },
    { label: "Total Parties", value: partyCount, icon: UserCheck, color: "bg-cyan-500", href: "/admin-parties" },
    { label: "Total Invoices", value: data?.totalInvoices || 0, icon: FileText, color: "bg-green-500", href: "/admin-invoices" },
    { label: "Total Revenue", value: formatCurrency(data?.totalRevenue || 0), icon: IndianRupee, color: "bg-purple-500", href: "/admin-reports" },
    { label: "Pending Amount", value: formatCurrency(data?.totalPending || 0), icon: Clock, color: "bg-orange-500", href: "/admin-invoices" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${s.color} p-2.5 rounded-lg`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Client Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Client</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-right p-3 font-medium">Invoices</th>
                <th className="text-right p-3 font-medium">Revenue</th>
                <th className="text-right p-3 font-medium">Pending</th>
              </tr>
            </thead>
            <tbody>
              {(data?.clientStats || []).map((c, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-gray-500">{c.email}</td>
                  <td className="p-3 text-right">{c.invoiceCount}</td>
                  <td className="p-3 text-right text-green-600">{formatCurrency(c.revenue)}</td>
                  <td className="p-3 text-right text-orange-600">{formatCurrency(c.pending)}</td>
                </tr>
              ))}
              {(!data?.clientStats || data.clientStats.length === 0) && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No clients yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
