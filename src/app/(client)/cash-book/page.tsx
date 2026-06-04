"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Plus, ArrowUpCircle, ArrowDownCircle, Download, Trash2, Calendar, IndianRupee } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

interface CashEntry {
  id: string;
  date: string;
  type: "in" | "out";
  description: string;
  amount: number;
  reference?: string;
  category?: string;
  createdAt: string;
}

export default function CashBookPage() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], type: "in" as "in" | "out", description: "", amount: "", reference: "", category: "" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/cash-book").then((r) => r.json()).then((res) => setEntries(res.data || [])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/cash-book", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, amount: Number(form.amount) }),
    });
    const data = await res.json();
    if (data.success) {
      setEntries((p) => [data.data, ...p]);
      setShowForm(false);
      setForm({ date: new Date().toISOString().split("T")[0], type: "in", description: "", amount: "", reference: "", category: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch("/api/cash-book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setEntries((p) => p.filter((e) => e.id !== id));
  };

  const filtered = entries.filter((e) => e.date.startsWith(filterMonth)).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  const totalIn = filtered.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = filtered.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);

  // Calculate running balance with opening balance from previous months
  const previousEntries = entries.filter((e) => e.date < filterMonth + "-01");
  const openingBalance = previousEntries.reduce((s, e) => s + (e.type === "in" ? e.amount : -e.amount), 0);
  const closingBalance = openingBalance + totalIn - totalOut;

  // Day-wise grouping
  const dayGroups = new Map<string, CashEntry[]>();
  for (const e of filtered) {
    const group = dayGroups.get(e.date) || [];
    group.push(e);
    dayGroups.set(e.date, group);
  }

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const rows: Record<string, string | number>[] = [];
    let runBal = openingBalance;
    rows.push({ "Date": "", "Type": "", "Description": "Opening Balance", "Reference": "", "Cash In": 0, "Cash Out": 0, "Balance": openingBalance });
    for (const e of filtered) {
      runBal += e.type === "in" ? e.amount : -e.amount;
      rows.push({
        "Date": e.date, "Type": e.type === "in" ? "Cash In" : "Cash Out",
        "Description": e.description, "Reference": e.reference || "",
        "Cash In": e.type === "in" ? e.amount : 0,
        "Cash Out": e.type === "out" ? e.amount : 0,
        "Balance": runBal,
      });
    }
    rows.push({ "Date": "", "Type": "", "Description": "Closing Balance", "Reference": "", "Cash In": totalIn, "Cash Out": totalOut, "Balance": closingBalance });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Book");
    XLSX.writeFile(wb, `CashBook_${filterMonth}.xlsx`);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Daily Cash Book (रोज़नामचा)</h1>
          <p className="text-sm text-gray-500 mt-1">Track daily cash inflow & outflow</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Opening Balance</p>
          <p className={`text-lg font-bold mt-1 ${openingBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatCurrency(openingBalance)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
          <p className="text-xs text-gray-500 flex items-center gap-1"><ArrowUpCircle className="w-3 h-3 text-green-500" /> Total Cash In</p>
          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(totalIn)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
          <p className="text-xs text-gray-500 flex items-center gap-1"><ArrowDownCircle className="w-3 h-3 text-red-500" /> Total Cash Out</p>
          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(totalOut)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Closing Balance</p>
          <p className={`text-lg font-bold mt-1 ${closingBalance >= 0 ? "text-indigo-600" : "text-red-600"}`}>{formatCurrency(closingBalance)}</p>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex gap-3 mb-4">
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Cash Entry</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, type: "in" })}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${form.type === "in" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <ArrowUpCircle className="w-4 h-4" /> Cash In (आमद)
                </button>
                <button onClick={() => setForm({ ...form, type: "out" })}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${form.type === "out" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <ArrowDownCircle className="w-4 h-4" /> Cash Out (खर्चा)
                </button>
              </div>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Description (e.g. Customer payment, Rent paid...)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="number" step="any" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Reference / Bill No. (optional)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Category (optional - e.g. Sales, Rent, Salary)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!form.amount || !form.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Day-wise Entries */}
      <div className="space-y-4">
        {Array.from(dayGroups.entries()).map(([date, dayEntries]) => {
          const dayIn = dayEntries.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
          const dayOut = dayEntries.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
          return (
            <div key={date} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-sm">{formatDate(date)}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600 font-bold">In: {formatCurrency(dayIn)}</span>
                  <span className="text-red-600 font-bold">Out: {formatCurrency(dayOut)}</span>
                  <span className={`font-bold ${dayIn - dayOut >= 0 ? "text-blue-600" : "text-red-600"}`}>Net: {formatCurrency(dayIn - dayOut)}</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {dayEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 w-8">
                        {e.type === "in" ? <ArrowUpCircle className="w-5 h-5 text-green-500" /> : <ArrowDownCircle className="w-5 h-5 text-red-500" />}
                      </td>
                      <td className="px-2 py-2.5 font-medium">{e.description}</td>
                      <td className="px-2 py-2.5 text-xs text-gray-400">{e.reference || ""}</td>
                      <td className="px-2 py-2.5 text-xs text-gray-400">{e.category || ""}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${e.type === "in" ? "text-green-600" : "text-red-600"}`}>
                        {e.type === "in" ? "+" : "−"}{formatCurrency(e.amount)}
                      </td>
                      <td className="px-2 py-2.5 text-center w-10">
                        <button onClick={() => handleDelete(e.id)} className="p-1 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No cash entries for this month</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;Add Entry&quot; to start tracking</p>
          </div>
        )}
      </div>
    </div>
  );
}
