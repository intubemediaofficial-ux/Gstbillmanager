"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Users, IndianRupee, FilePlus, Clock, TrendingUp, ArrowUpRight, Sparkles, Package, Truck, BarChart3, Bell, AlertTriangle, Receipt, UserCheck, Target, CreditCard, CalendarDays, FolderOpen, RefreshCw, Mail } from "lucide-react";
import type { Customer, Invoice, InventoryItem, Expense, Employee, Lead, FollowUpReminder } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function ClientDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [pendingReminders, setPendingReminders] = useState<{ id: string; invoiceNumber: string; customerName: string; balance: number; dueDate: string }[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/inventory").then((r) => r.json()).catch(() => ({ data: { lowStock: [] } })),
      fetch("/api/payment-reminders").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/expenses").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/employees").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/leads").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/follow-ups").then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([cRes, iRes, invRes, remRes, expRes, empRes, leadRes, fuRes]) => {
        setCustomers(cRes.data || []);
        setInvoices(iRes.data || []);
        setLowStockItems(invRes.data?.lowStock || []);
        setPendingReminders(remRes.data || []);
        setExpenses(expRes.data || []);
        setEmployees(empRes.data || []);
        setLeads(leadRes.data || []);
        setFollowUps(fuRes.data || []);
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

      {/* Alerts */}
      {(lowStockItems.length > 0 || pendingReminders.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {lowStockItems.length > 0 && (
            <Link href="/inventory" className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:shadow-md transition-all">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">{lowStockItems.length} Low Stock Items</p>
                <p className="text-xs text-amber-600">{lowStockItems.slice(0, 3).map((i) => i.name).join(", ")}</p>
              </div>
            </Link>
          )}
          {pendingReminders.length > 0 && (
            <Link href="/invoices" className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:shadow-md transition-all">
              <Bell className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">{pendingReminders.length} Pending Payments</p>
                <p className="text-xs text-red-600">{formatCurrency(pendingReminders.reduce((s, r) => s + r.balance, 0))} outstanding</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "New Invoice", href: "/create-invoice", icon: FilePlus, iconColor: "text-blue-600", bg: "bg-blue-50" },
          { label: "Expenses", href: "/expenses", icon: Receipt, iconColor: "text-red-600", bg: "bg-red-50" },
          { label: "Employees", href: "/employees", icon: UserCheck, iconColor: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Leads", href: "/leads", icon: Target, iconColor: "text-violet-600", bg: "bg-violet-50" },
          { label: "Follow-ups", href: "/follow-ups", icon: Bell, iconColor: "text-orange-600", bg: "bg-orange-50" },
          { label: "Documents", href: "/documents", icon: FolderOpen, iconColor: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Recurring", href: "/recurring-invoices", icon: RefreshCw, iconColor: "text-pink-600", bg: "bg-pink-50" },
          { label: "P&L Report", href: "/profit-loss", icon: TrendingUp, iconColor: "text-indigo-600", bg: "bg-indigo-50" },
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

      {/* Income vs Expense Chart (Visual) */}
      {(() => {
        const months: string[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(d.toISOString().slice(0, 7));
        }
        const monthLabels = months.map((m) => { const d = new Date(m + "-01"); return d.toLocaleString("default", { month: "short" }); });
        const incomeByMonth = months.map((m) => invoices.filter((inv) => inv.status === "paid" && inv.date.startsWith(m)).reduce((s, inv) => s + inv.grandTotal, 0));
        const expenseByMonth = months.map((m) => expenses.filter((exp) => exp.date.startsWith(m)).reduce((s, exp) => s + exp.totalAmount, 0));
        const maxVal = Math.max(...incomeByMonth, ...expenseByMonth, 1);
        const totalIncome6m = incomeByMonth.reduce((a, b) => a + b, 0);
        const totalExpense6m = expenseByMonth.reduce((a, b) => a + b, 0);
        const profit6m = totalIncome6m - totalExpense6m;
        return (
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600" /> Income vs Expense (6 Months)</h2>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Income</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Expense</span>
              </div>
            </div>
            {/* Bar Chart */}
            <div className="flex items-end gap-2 h-48 mb-3">
              {months.map((_, idx) => (
                <div key={idx} className="flex-1 flex gap-1 items-end h-full">
                  <div className="flex-1 bg-emerald-500 rounded-t-md transition-all" style={{ height: `${Math.max((incomeByMonth[idx] / maxVal) * 100, 2)}%` }} title={`Income: ${formatCurrency(incomeByMonth[idx])}`} />
                  <div className="flex-1 bg-red-400 rounded-t-md transition-all" style={{ height: `${Math.max((expenseByMonth[idx] / maxVal) * 100, 2)}%` }} title={`Expense: ${formatCurrency(expenseByMonth[idx])}`} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              {monthLabels.map((label, idx) => (
                <div key={idx} className="flex-1 text-center text-xs text-gray-500">{label}</div>
              ))}
            </div>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t">
              <div className="text-center"><p className="text-xs text-gray-500">Total Income</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome6m)}</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Total Expense</p><p className="text-lg font-bold text-red-500">{formatCurrency(totalExpense6m)}</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Net Profit</p><p className={`text-lg font-bold ${profit6m >= 0 ? "text-indigo-600" : "text-red-600"}`}>{formatCurrency(profit6m)}</p></div>
            </div>
          </div>
        );
      })()}

      {/* New Feature Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/expenses" className="rounded-xl p-4 bg-white border border-red-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Total Expenses</span></div>
          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(expenses.reduce((s, e) => s + e.totalAmount, 0))}</p>
        </Link>
        <Link href="/employees" className="rounded-xl p-4 bg-white border border-emerald-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-500">Active Employees</span></div>
          <p className="text-lg font-bold text-emerald-600 mt-1">{employees.filter((e) => e.status === "active").length}</p>
        </Link>
        <Link href="/leads" className="rounded-xl p-4 bg-white border border-violet-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2"><Target className="w-4 h-4 text-violet-500" /><span className="text-xs text-gray-500">Active Leads</span></div>
          <p className="text-lg font-bold text-violet-600 mt-1">{leads.filter((l) => !["won", "lost"].includes(l.status)).length}</p>
        </Link>
        <Link href="/follow-ups" className="rounded-xl p-4 bg-white border border-orange-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /><span className="text-xs text-gray-500">Pending Reminders</span></div>
          <p className="text-lg font-bold text-orange-600 mt-1">{followUps.filter((f) => f.status === "pending").length}</p>
        </Link>
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
