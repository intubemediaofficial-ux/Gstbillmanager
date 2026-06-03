"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, IndianRupee, BarChart3, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import type { Invoice, Expense } from "@/lib/gst-types";
import { EXPENSE_CATEGORIES } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

export default function ProfitLossPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
    ]).then(([iRes, eRes]) => {
      setInvoices(iRes.data || []);
      setExpenses(eRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filterByPeriod = (date: string) => {
    if (period === "all") return true;
    const d = new Date(date);
    if (period === "today") return d.toISOString().split("T")[0] === now.toISOString().split("T")[0];
    if (period === "week") { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "quarter") { const q = new Date(now); q.setMonth(q.getMonth() - 3); return d >= q; }
    if (period === "year") return d.getFullYear() === now.getFullYear();
    return true;
  };

  const filteredInvoices = invoices.filter((i) => i.status === "paid" && filterByPeriod(i.date));
  const filteredExpenses = expenses.filter((e) => filterByPeriod(e.date));

  const totalIncome = filteredInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.totalAmount, 0);
  const profit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : "0";

  const taxCollected = filteredInvoices.reduce((s, i) => s + i.totalTax, 0);
  const gstOnExpenses = filteredExpenses.reduce((s, e) => s + e.gstAmount, 0);

  const expenseByCategory = Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => {
    const total = filteredExpenses.filter((e) => e.category === key).reduce((s, e) => s + e.totalAmount, 0);
    return { key, label, total };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const monthlyData: { month: string; income: number; expense: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const year = now.getFullYear();
    const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
    const income = invoices.filter((i) => i.status === "paid" && i.date.startsWith(monthStr)).reduce((s, i) => s + i.grandTotal, 0);
    const expense = expenses.filter((e) => e.date.startsWith(monthStr)).reduce((s, e) => s + e.totalAmount, 0);
    if (income > 0 || expense > 0) monthlyData.push({ month: monthStr, income, expense });
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss</h1>
          <p className="text-sm text-gray-500 mt-1">Income vs Expenses analysis</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-5 bg-white border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-gray-500">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-1">{filteredInvoices.length} paid invoices</p>
        </div>
        <div className="rounded-xl p-5 bg-white border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">{filteredExpenses.length} entries</p>
        </div>
        <div className={`rounded-xl p-5 bg-white border ${profit >= 0 ? "border-emerald-100" : "border-red-100"} shadow-sm`}>
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className={`w-5 h-5 ${profit >= 0 ? "text-emerald-500" : "text-red-500"}`} />
            <span className="text-sm text-gray-500">Net {profit >= 0 ? "Profit" : "Loss"}</span>
          </div>
          <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(Math.abs(profit))}</p>
          <p className="text-xs text-gray-400 mt-1">{profitMargin}% margin</p>
        </div>
        <div className="rounded-xl p-5 bg-white border border-violet-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            <span className="text-sm text-gray-500">GST Summary</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">Collected: {formatCurrency(taxCollected)}</p>
          <p className="text-sm font-semibold text-gray-900">Input: {formatCurrency(gstOnExpenses)}</p>
          <p className="text-xs text-violet-600 mt-1 font-bold">Net GST: {formatCurrency(taxCollected - gstOnExpenses)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Monthly Breakdown</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {monthlyData.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No data yet</div>
            ) : monthlyData.map((m) => {
              const mProfit = m.income - m.expense;
              return (
                <div key={m.month} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{new Date(m.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-emerald-600 flex items-center gap-1"><ArrowUp className="w-3 h-3" />{formatCurrency(m.income)}</span>
                      <span className="text-red-600 flex items-center gap-1"><ArrowDown className="w-3 h-3" />{formatCurrency(m.expense)}</span>
                    </div>
                  </div>
                  <div className={`text-right font-bold text-sm ${mProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {mProfit >= 0 ? "+" : ""}{formatCurrency(mProfit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense by Category */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-gray-900">Expenses by Category</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {expenseByCategory.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No expenses recorded</div>
            ) : expenseByCategory.map((cat) => {
              const pct = totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(1) : "0";
              return (
                <div key={cat.key} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(cat.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
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
