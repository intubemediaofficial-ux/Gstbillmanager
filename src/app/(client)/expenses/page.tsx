"use client";

import { useState, useEffect, useRef } from "react";
import { Receipt, Plus, Trash2, Search, Filter, TrendingDown, Calendar, IndianRupee, Download, Upload, ChevronDown, ChevronRight } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/gst-types";
import { EXPENSE_CATEGORIES } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

const PAYMENT_MODES: Record<string, string> = { cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer", card: "Card", cheque: "Cheque" };

const getCatLabel = (exp: Expense) => exp.category === "custom" && exp.customCategory ? exp.customCategory : EXPENSE_CATEGORIES[exp.category];

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "category">("list");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], category: "custom" as ExpenseCategory, customCategory: "", description: "", amount: "", gstAmount: "0", paymentMode: "cash", vendorName: "", billNumber: "", notes: "" });
  const [showSuggestions, setShowSuggestions] = useState(false);
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
      setForm({ date: new Date().toISOString().split("T")[0], category: "custom", customCategory: "", description: "", amount: "", gstAmount: "0", paymentMode: "cash", vendorName: "", billNumber: "", notes: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.description.toLowerCase().includes(q) || (i.vendorName || "").toLowerCase().includes(q) || getCatLabel(i).toLowerCase().includes(q);
    const matchCat = !filterCat || i.category === filterCat || (filterCat === "custom" && i.category === "custom") || (filterCat.startsWith("custom:") && i.category === "custom" && i.customCategory === filterCat.slice(7));
    const matchMonth = !filterMonth || i.date.startsWith(filterMonth);
    return matchSearch && matchCat && matchMonth;
  });

  const totalExpenses = filtered.reduce((s, i) => s + i.totalAmount, 0);
  const filterMonthLabel = filterMonth || new Date().toISOString().slice(0, 7);
  const monthExpenses = items.filter((i) => i.date.startsWith(filterMonthLabel)).reduce((s, i) => s + i.totalAmount, 0);
  const today = new Date().toISOString().split("T")[0];
  const todayTotal = items.filter((i) => i.date === today).reduce((s, i) => s + i.totalAmount, 0);

  // Category-wise grouping
  const categoryGroups = new Map<string, { label: string; total: number; items: Expense[] }>();
  for (const exp of filtered) {
    const key = exp.category === "custom" && exp.customCategory ? `custom:${exp.customCategory}` : exp.category;
    const label = getCatLabel(exp);
    const group = categoryGroups.get(key) || { label, total: 0, items: [] };
    group.total += exp.totalAmount;
    group.items.push(exp);
    categoryGroups.set(key, group);
  }
  const sortedGroups = Array.from(categoryGroups.entries()).sort((a, b) => b[1].total - a[1].total);

  // Get unique custom categories for filter dropdown + auto-suggest
  const customCats = new Set<string>();
  items.forEach((i) => { if (i.category === "custom" && i.customCategory) customCats.add(i.customCategory); });
  const customCatList = Array.from(customCats).sort();
  const suggestions = form.customCategory.trim() ? customCatList.filter((c) => c.toLowerCase().includes(form.customCategory.toLowerCase()) && c.toLowerCase() !== form.customCategory.toLowerCase()) : [];

  const toggleCat = (key: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Excel download
  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((exp) => ({
      "Date": exp.date,
      "Category": getCatLabel(exp),
      "Description": exp.description,
      "Vendor": exp.vendorName || "",
      "Payment Mode": PAYMENT_MODES[exp.paymentMode] || exp.paymentMode,
      "Amount": exp.amount,
      "GST": exp.gstAmount,
      "Total": exp.totalAmount,
      "Bill No.": exp.billNumber || "",
      "Notes": exp.notes || "",
    }));

    // Add category summary at bottom
    data.push({} as typeof data[0]);
    data.push({ "Date": "--- CATEGORY SUMMARY ---", "Category": "", "Description": "", "Vendor": "", "Payment Mode": "", "Amount": 0, "GST": 0, "Total": 0, "Bill No.": "", "Notes": "" });
    for (const [, group] of sortedGroups) {
      data.push({ "Date": "", "Category": group.label, "Description": `${group.items.length} entries`, "Vendor": "", "Payment Mode": "", "Amount": 0, "GST": 0, "Total": group.total, "Bill No.": "", "Notes": "" });
    }
    data.push({ "Date": "", "Category": "GRAND TOTAL", "Description": `${filtered.length} entries`, "Vendor": "", "Payment Mode": "", "Amount": 0, "GST": 0, "Total": totalExpenses, "Bill No.": "", "Notes": "" });

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    const monthStr = filterMonth || "All";
    XLSX.writeFile(wb, `Expenses_${monthStr}.xlsx`);
  };

  // Excel Upload
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const XLSX = await import("xlsx");
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);
    let added = 0;
    for (const row of rows) {
      const date = String(row["Date"] || row["date"] || new Date().toISOString().split("T")[0]);
      const cat = String(row["Category"] || row["category"] || "");
      const desc = String(row["Description"] || row["description"] || "");
      const amt = Number(row["Amount"] || row["amount"] || 0);
      const gst = Number(row["GST"] || row["gst"] || row["GST Amount"] || 0);
      const vendor = String(row["Vendor"] || row["vendor"] || "");
      const mode = String(row["Payment Mode"] || row["payment_mode"] || "cash");
      const billNo = String(row["Bill No."] || row["bill_number"] || "");
      const notes = String(row["Notes"] || row["notes"] || "");
      if (!amt || desc.startsWith("---")) continue;
      const knownCats = Object.keys(EXPENSE_CATEGORIES);
      const isKnown = knownCats.includes(cat.toLowerCase().replace(/[^a-z_]/g, "_"));
      const res = await fetch("/api/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", date, category: isKnown ? cat.toLowerCase().replace(/[^a-z_]/g, "_") : "custom", customCategory: isKnown ? "" : cat, description: desc, amount: amt, gstAmount: gst, paymentMode: mode.toLowerCase().replace(/ /g, "_"), vendorName: vendor, billNumber: billNo, notes }),
      });
      const data = await res.json();
      if (data.success) { setItems((p) => [data.data, ...p]); added++; }
    }
    alert(`${added} expenses imported from Excel!`);
    e.target.value = "";
  };

  const CAT_COLORS: Record<string, string> = {
    rent: "bg-blue-100 text-blue-700", salary: "bg-violet-100 text-violet-700", utilities: "bg-amber-100 text-amber-700",
    office_supplies: "bg-emerald-100 text-emerald-700", travel: "bg-orange-100 text-orange-700", marketing: "bg-pink-100 text-pink-700",
    insurance: "bg-cyan-100 text-cyan-700", maintenance: "bg-red-100 text-red-700", internet_phone: "bg-indigo-100 text-indigo-700",
    professional_fees: "bg-purple-100 text-purple-700", raw_materials: "bg-lime-100 text-lime-700", transport: "bg-teal-100 text-teal-700",
    food: "bg-yellow-100 text-yellow-700", entertainment: "bg-rose-100 text-rose-700", miscellaneous: "bg-gray-100 text-gray-700",
    custom: "bg-sky-100 text-sky-700",
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track your business expenses</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Excel
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUploadExcel} />
          </label>
          <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
            <Download className="w-4 h-4" /> Download Excel
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total (Filtered)", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "text-red-600", border: "border-red-100" },
          { label: "This Month", value: formatCurrency(monthExpenses), icon: Calendar, color: "text-blue-600", border: "border-blue-100" },
          { label: "Today", value: formatCurrency(todayTotal), icon: IndianRupee, color: "text-emerald-600", border: "border-emerald-100" },
          { label: "Entries", value: String(filtered.length), icon: Receipt, color: "text-violet-600", border: "border-violet-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border ${s.border} shadow-sm`}>
            <div className="flex items-center gap-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`text-lg font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="pl-9 pr-8 py-2 border rounded-lg text-sm appearance-none">
            <option value="">All Categories</option>
            {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            {customCatList.map((c) => <option key={`custom:${c}`} value={`custom:${c}`}>{c}</option>)}
          </select>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>List</button>
          <button onClick={() => setViewMode("category")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === "category" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>By Category</button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add Expense</h2>
            <div className="space-y-3">
              {/* Custom category input FIRST with auto-suggest */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">What is this expense for? (Type manually)</label>
                <input placeholder="e.g. Singer Payment, DJ Booking, Shooting, Studio, Dancer..." value={form.customCategory}
                  onChange={(e) => { setForm({ ...form, customCategory: e.target.value, category: e.target.value ? "custom" : form.category }); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm bg-blue-50 placeholder-blue-300 font-medium" />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button key={s} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setForm({ ...form, customCategory: s, category: "custom" }); setShowSuggestions(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b last:border-b-0">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-center text-xs text-gray-400">— or select from list —</div>
              <select value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value as ExpenseCategory, customCategory: e.target.value === "custom" ? form.customCategory : "" }); }} className="w-full px-3 py-2 border rounded-lg text-sm">
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="any" placeholder="Amount (exact)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" step="any" placeholder="GST Amount" value={form.gstAmount} onChange={(e) => setForm({ ...form, gstAmount: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              {form.amount && <p className="text-xs text-gray-500">Total: <span className="font-bold text-gray-900">{formatCurrency(Number(form.amount) + Number(form.gstAmount || 0))}</span></p>}
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {Object.entries(PAYMENT_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input placeholder="Vendor / Person Name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Bill Number" value={form.billNumber} onChange={(e) => setForm({ ...form, billNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!form.amount || (!form.description && !form.customCategory)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Category View */}
      {viewMode === "category" && (
        <div className="space-y-4 mb-6">
          {sortedGroups.map(([key, group]) => (
            <div key={key} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <button onClick={() => toggleCat(key)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {collapsedCats.has(key) ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CAT_COLORS[key.startsWith("custom:") ? "custom" : key] || "bg-sky-100 text-sky-700"}`}>{group.label}</span>
                  <span className="text-xs text-gray-400">{group.items.length} entries</span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(group.total)}</span>
              </button>
              {!collapsedCats.has(key) && (
                <div className="border-t">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Vendor</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Mode</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold">Amount</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {group.items.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-600 text-xs">{formatDate(exp.date)}</td>
                          <td className="px-4 py-2 text-gray-900 font-medium text-xs max-w-[200px] truncate">{exp.description}</td>
                          <td className="px-4 py-2 text-gray-500 text-xs">{exp.vendorName || "-"}</td>
                          <td className="px-4 py-2 text-gray-500 text-xs">{PAYMENT_MODES[exp.paymentMode]}</td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900 text-xs">{formatCurrency(exp.totalAmount)}</td>
                          <td className="px-4 py-2"><button onClick={() => handleDelete(exp.id)} className="p-1 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {sortedGroups.length === 0 && (
            <div className="bg-white rounded-2xl border p-12 text-center">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No expenses recorded</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
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
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[exp.category] || "bg-sky-100 text-sky-700"}`}>{getCatLabel(exp)}</span></td>
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
      )}
    </div>
  );
}
