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
      <div className="animate-spin w-8 h-8 border-4 rounded-full" style={{ borderColor: "#c9a84c", borderTopColor: "transparent" }} />
    </div>
  );

  const stats = [
    { label: "Customers", value: customers.length, icon: Users, gradient: "linear-gradient(135deg, #2a5298 0%, #1a3f6f 100%)", iconBg: "rgba(201,168,76,0.15)" },
    { label: "Invoices", value: invoices.length, icon: FileText, gradient: "linear-gradient(135deg, #122a4e 0%, #2a5298 100%)", iconBg: "rgba(201,168,76,0.15)" },
    { label: "Revenue", value: formatCurrency(paidRevenue), icon: IndianRupee, gradient: "linear-gradient(135deg, #0a1628 0%, #1a3f6f 100%)", iconBg: "rgba(201,168,76,0.15)" },
    { label: "Pending", value: formatCurrency(pendingAmount), icon: Clock, gradient: "linear-gradient(135deg, #1a3f6f 0%, #2a5298 100%)", iconBg: "rgba(201,168,76,0.15)" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0a1628" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Welcome back! Here&apos;s your business overview.</p>
        </div>
        <Link href="/create-invoice"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg"
          style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
          <FilePlus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: s.gradient }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-6 -mt-6" style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }} />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl" style={{ background: s.iconBg }}>
                <s.icon className="w-5 h-5" style={{ color: "#c9a84c" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "New Invoice", href: "/create-invoice", icon: FilePlus },
          { label: "Customers", href: "/customers", icon: Users },
          { label: "Invoices", href: "/invoices", icon: FileText },
          { label: "Reports", href: "/reports", icon: TrendingUp },
        ].map((a) => (
          <Link key={a.label} href={a.href}
            className="flex items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-300 group"
            style={{ background: "white", borderColor: "#e5e7eb" }}>
            <div className="p-2 rounded-lg transition-colors duration-300" style={{ background: "rgba(201,168,76,0.08)" }}>
              <a.icon className="w-4 h-4" style={{ color: "#c9a84c" }} />
            </div>
            <span className="text-sm font-medium" style={{ color: "#374151" }}>{a.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#c9a84c" }} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#e5e7eb" }}>
          <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "#f3f4f6", background: "linear-gradient(135deg, #0a1628 0%, #122a4e 100%)" }}>
            <TrendingUp className="w-5 h-5" style={{ color: "#c9a84c" }} />
            <h2 className="font-semibold text-white">Recent Invoices</h2>
            <Sparkles className="w-3.5 h-3.5 ml-auto" style={{ color: "#c9a84c" }} />
          </div>
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {invoices.slice(0, 5).map((inv) => (
              <Link key={inv.id} href={`/invoice-view?id=${inv.id}`} className="flex items-center justify-between p-4 transition-colors duration-200" style={{ background: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fafafa"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: "#0a1628" }}>{inv.invoiceNumber}</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>{inv.customer.name} · {formatDate(inv.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm" style={{ color: "#0a1628" }}>{formatCurrency(inv.grandTotal)}</p>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={inv.status === "paid"
                      ? { background: "rgba(34,197,94,0.1)", color: "#16a34a" }
                      : { background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))}
            {invoices.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#d1d5db" }} />
                <p className="text-sm" style={{ color: "#9ca3af" }}>No invoices yet</p>
                <Link href="/create-invoice" className="text-xs font-medium mt-1 inline-block" style={{ color: "#c9a84c" }}>Create your first invoice</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#e5e7eb" }}>
          <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "#f3f4f6", background: "linear-gradient(135deg, #0a1628 0%, #122a4e 100%)" }}>
            <Users className="w-5 h-5" style={{ color: "#c9a84c" }} />
            <h2 className="font-semibold text-white">Recent Customers</h2>
            <Sparkles className="w-3.5 h-3.5 ml-auto" style={{ color: "#c9a84c" }} />
          </div>
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #0a1628, #2a5298)", color: "#c9a84c" }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#0a1628" }}>{c.name}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{c.city}, {c.state}</p>
                  </div>
                </div>
                <p className="text-xs font-mono" style={{ color: "#9ca3af" }}>{c.gstin}</p>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "#d1d5db" }} />
                <p className="text-sm" style={{ color: "#9ca3af" }}>No customers yet</p>
                <Link href="/customers" className="text-xs font-medium mt-1 inline-block" style={{ color: "#c9a84c" }}>Add your first customer</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
