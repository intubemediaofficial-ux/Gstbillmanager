"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Users, IndianRupee, FilePlus, Clock, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import type { Customer, Invoice } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function ClientDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ])
      .then(([cRes, iRes]) => {
        setCustomers(cRes.data || []);
        setInvoices(iRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const paidRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.grandTotal, 0);
  const pendingAmount = invoices
    .filter((i) => ["sent", "partial", "overdue", "draft"].includes(i.status))
    .reduce((s, i) => s + i.grandTotal - i.amountPaid, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
    </div>
  );

  const stats = [
    { label: "Customers", value: customers.length, icon: Users, gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)", lightBg: "#eef9ff" },
    { label: "Invoices", value: invoices.length, icon: FileText, gradient: "linear-gradient(135deg, #f59e0b, #f97316)", lightBg: "#fff7ed" },
    { label: "Revenue", value: formatCurrency(paidRevenue), icon: IndianRupee, gradient: "linear-gradient(135deg, #10b981, #14b8a6)", lightBg: "#ecfdf5" },
    { label: "Pending", value: formatCurrency(pendingAmount), icon: Clock, gradient: "linear-gradient(135deg, #ef4444, #f97316)", lightBg: "#fef2f2" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm mt-1 text-gray-500">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <Link href="/create-invoice"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
          <FilePlus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" style={{ background: s.gradient }}>
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 -mr-8 -mt-8" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-white/20">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "New Invoice", href: "/create-invoice", icon: FilePlus, iconColor: "#0ea5e9", bg: "#eef9ff" },
          { label: "Customers", href: "/customers", icon: Users, iconColor: "#10b981", bg: "#ecfdf5" },
          { label: "Invoices", href: "/invoices", icon: FileText, iconColor: "#f97316", bg: "#fff7ed" },
          { label: "Reports", href: "/reports", icon: TrendingUp, iconColor: "#8b5cf6", bg: "#ede9fe" },
        ].map((a) => (
          <Link key={a.label} href={a.href}
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
            <div className="p-2 rounded-lg" style={{ background: a.bg }}>
              <a.icon className="w-4 h-4" style={{ color: a.iconColor }} />
            </div>
            <span className="text-sm font-medium text-gray-700">{a.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: a.iconColor }} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div className="p-4 flex items-center gap-2 text-white" style={{ background: "linear-gradient(135deg, #1e3a5f, #0ea5e9)" }}>
            <TrendingUp className="w-5 h-5" />
            <h2 className="font-bold">Recent Invoices</h2>
            <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-300" />
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.slice(0, 5).map((inv) => (
              <Link key={inv.id} href={`/invoice-view?id=${inv.id}`} className="flex items-center justify-between p-4 hover:bg-cyan-50/50 transition-colors duration-200">
                <div>
                  <p className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-400">{inv.customer.name} · {formatDate(inv.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">{formatCurrency(inv.grandTotal)}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${inv.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))}
            {invoices.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No invoices yet</p>
                <Link href="/create-invoice" className="text-xs font-medium mt-1 inline-block text-cyan-600 hover:text-cyan-700">Create your first invoice</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div className="p-4 flex items-center gap-2 text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
            <Users className="w-5 h-5" />
            <h2 className="font-bold">Recent Customers</h2>
            <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-100" />
          </div>
          <div className="divide-y divide-gray-100">
            {customers.slice(0, 5).map((c, i) => {
              const avatarColors = ["#0ea5e9", "#10b981", "#f97316", "#8b5cf6", "#ef4444"];
              return (
                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-orange-50/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.city}, {c.state}</p>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-gray-400">{c.gstin}</p>
                </div>
              );
            })}
            {customers.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No customers yet</p>
                <Link href="/customers" className="text-xs font-medium mt-1 inline-block text-orange-600 hover:text-orange-700">Add your first customer</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
