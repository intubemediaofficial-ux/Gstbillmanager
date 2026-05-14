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
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const stats = [
    { label: "Customers", value: customers.length, icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600", borderColor: "border-blue-100" },
    { label: "Invoices", value: invoices.length, icon: FileText, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", borderColor: "border-emerald-100" },
    { label: "Revenue", value: formatCurrency(paidRevenue), icon: IndianRupee, iconBg: "bg-violet-50", iconColor: "text-violet-600", borderColor: "border-violet-100" },
    { label: "Pending", value: formatCurrency(pendingAmount), icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600", borderColor: "border-amber-100" },
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-300">
          <FilePlus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      {/* Stats Cards — soft white cards with colored icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 bg-white border ${s.borderColor} shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "New Invoice", href: "/create-invoice", icon: FilePlus, iconColor: "text-blue-600", bg: "bg-blue-50" },
          { label: "Customers", href: "/customers", icon: Users, iconColor: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Invoices", href: "/invoices", icon: FileText, iconColor: "text-orange-600", bg: "bg-orange-50" },
          { label: "Reports", href: "/reports", icon: TrendingUp, iconColor: "text-violet-600", bg: "bg-violet-50" },
        ].map((a) => (
          <Link key={a.label} href={a.href}
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
            <div className={`p-2 rounded-lg ${a.bg}`}>
              <a.icon className={`w-4 h-4 ${a.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{a.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div className="p-4 flex items-center gap-2 border-b border-gray-100 bg-gray-50">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Recent Invoices</h2>
            <Sparkles className="w-3.5 h-3.5 ml-auto text-blue-400" />
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.slice(0, 5).map((inv) => (
              <Link key={inv.id} href={`/invoice-view?id=${inv.id}`} className="flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors duration-200">
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
                <Link href="/create-invoice" className="text-xs font-medium mt-1 inline-block text-blue-600 hover:text-blue-700">Create your first invoice</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div className="p-4 flex items-center gap-2 border-b border-gray-100 bg-gray-50">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900">Recent Customers</h2>
            <Sparkles className="w-3.5 h-3.5 ml-auto text-emerald-400" />
          </div>
          <div className="divide-y divide-gray-100">
            {customers.slice(0, 5).map((c, i) => {
              const avatarColors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-violet-500", "bg-rose-500"];
              return (
                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-emerald-50/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${avatarColors[i % avatarColors.length]}`}>
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
                <Link href="/customers" className="text-xs font-medium mt-1 inline-block text-emerald-600 hover:text-emerald-700">Add your first customer</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
