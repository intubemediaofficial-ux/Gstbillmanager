"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Users, IndianRupee, FilePlus, Clock, TrendingUp } from "lucide-react";
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const stats = [
    { label: "Customers", value: customers.length, icon: Users, color: "bg-blue-500" },
    { label: "Invoices", value: invoices.length, icon: FileText, color: "bg-green-500" },
    { label: "Revenue", value: formatCurrency(paidRevenue), icon: IndianRupee, color: "bg-purple-500" },
    { label: "Pending", value: formatCurrency(pendingAmount), icon: Clock, color: "bg-orange-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/create-invoice" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <FilePlus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className={`${s.color} p-2.5 rounded-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold">Recent Invoices</h2>
          </div>
          <div className="divide-y">
            {invoices.slice(0, 5).map((inv) => (
              <Link key={inv.id} href={`/invoice-view?id=${inv.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.customer.name} · {formatDate(inv.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(inv.grandTotal)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))}
            {invoices.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">No invoices yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold">Recent Customers</h2>
          </div>
          <div className="divide-y">
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.city}, {c.state}</p>
                </div>
                <p className="text-xs font-mono text-gray-500">{c.gstin}</p>
              </div>
            ))}
            {customers.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">No customers yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
