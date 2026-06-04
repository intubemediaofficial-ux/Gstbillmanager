"use client";

import { useState, useEffect, useRef } from "react";
import { Receipt, Plus, Trash2, Search, Filter, TrendingDown, Calendar, IndianRupee } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/gst-types";
import { EXPENSE_CATEGORIES } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

const PAYMENT_MODES: Record<string, string> = { cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer", card: "Card", cheque: "Cheque" };

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], category: "miscellaneous" as ExpenseCategory, customCategory: "", description: "", amount: "", gstAmount: "0", paymentMode: "cash", vendorName: "", billNumber: "", notes: "" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/expenses").then((r) => r.json()).then((res) => setItems(res.data || [])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, amount: Number(form.amount), gstAmount: Number(form.gstAmount), customCategory: form.category === "custom" ? form.customCategory : "" }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((p) => [data.data, ...p]);
      setShowForm(false);
      setForm({ date: new Date().toISOString().split("T")[0], category: "miscellaneous", customCategory: "", description: "", amount: "", gstAmount: "0", paymentMode: "cash", vendorName: "", billNumber: "", notes: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.description.toLowerCase().includes(q) || (i.vendorName || "").toLowerCase().includes(q);
    const matchCat = !filterCat || i.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalExpenses = filtered.reduce((s, i) => s + i.totalAmount, 0);
  const thisMonth = filtered.filter((i) => i.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, i) => s + i.totalAmount, 0);
  const today = new Date().toISOString().split("T")[0];
  const todayTotal = filtered.filter((i) => i.date === today).reduce((s, i) => s + i.totalAmount, 0);

  const CAT_COLORS: Record<string, string> = {
    rent: "bg-blue-100 text-blue-700", salary: "bg-violet-100 text-violet-700", utilities: "bg-amber-100 text-amber-700",
    office_supplies: "bg-emerald-100 text-emerald-700", travel: "bg-orange-100 text-orange-700", marketing: "bg-pink-100 text-pink-700",
    insurance: "bg-cyan-100 text-cyan-700", maintenance: "bg-red-100 text-red-700", internet_phone: "bg-indigo-100 text-indigo-700",
    professional_fees: "bg-purple-100 text-purple-700", raw_materials: "bg-lime-100 text-lime-700", transport: "bg-teal-100 text-teal-700",
    food: "bg-yellow-100 text-yellow-700", entertainment: "bg-rose-100 text-rose-700", miscellaneous: "bg-gray-100 text-gray-700",
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track your business expenses</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "red" },
          { label: "This Month", value: formatCurrency(thisMonth), icon: Calendar, color: "blue" },
          { label: "Today", value: formatCurrency(todayTotal), icon: IndianRupee, color: "emerald" },
          { label: "Entries", value: filtered.length, icon: Receipt, color: "violet" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border border-${s.color}-100 shadow-sm`}>
            <div className="flex items-center gap-2">
              <s.icon className={`w-4 h-4 text-${s.color}-500`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="pl-9 pr-8 py-2 border rounded-lg text-sm appearance-none">
            <option value="">All Categories</option>
            {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add Expense</h2>
            <div className="space-y-3">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {form.category === "custom" && (
                <input placeholder="Type custom category (e.g. Singer, DJ, Studio, Shooting, Dancer...)" value={form.customCategory} onChange={(e) => setForm({ ...form, customCategory: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm border-blue-300 bg-blue-50" />
              )}
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" placeholder="GST Amount" value={form.gstAmount} onChange={(e) => setForm({ ...form, gstAmount: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {Object.entries(PAYMENT_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input placeholder="Vendor Name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Bill Number" value={form.billNumber} onChange={(e) => setForm({ ...form, billNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!form.description || !form.amount} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No expenses recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold">Mode</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(exp.date)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[exp.category] || "bg-gray-100 text-gray-700"}`}>{exp.category === "custom" && exp.customCategory ? exp.customCategory : EXPENSE_CATEGORIES[exp.category]}</span></td>
                    <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">{exp.description}</td>
                    <td className="px-4 py-3 text-gray-500">{exp.vendorName || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{PAYMENT_MODES[exp.paymentMode]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(exp.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
