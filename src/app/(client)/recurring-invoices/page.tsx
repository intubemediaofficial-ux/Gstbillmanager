"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, User } from "lucide-react";
import type { RecurringInvoice, Customer } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

const FREQ_LABELS: Record<string, string> = { weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", half_yearly: "Half Yearly", yearly: "Yearly" };

export default function RecurringInvoicesPage() {
  const [items, setItems] = useState<RecurringInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", frequency: "monthly", nextDueDate: "", customerId: "", customerName: "", firmName: "", notes: "", terms: "" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/recurring-invoices").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
    ]).then(([rRes, cRes]) => {
      setItems(rRes.data || []);
      setCustomers(cRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const cust = customers.find((c) => c.id === form.customerId);
    const res = await fetch("/api/recurring-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, customerName: cust?.name || form.customerName }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((p) => [data.data, ...p]);
      setShowForm(false);
      setForm({ name: "", frequency: "monthly", nextDueDate: "", customerId: "", customerName: "", firmName: "", notes: "", terms: "" });
    }
  };

  const handleToggle = async (id: string) => {
    const res = await fetch("/api/recurring-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id }),
    });
    const data = await res.json();
    if (data.success) setItems((p) => p.map((i) => (i.id === id ? data.data : i)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recurring invoice?")) return;
    await fetch("/api/recurring-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-generate invoices on schedule</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> New Recurring
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: items.length, color: "blue" },
          { label: "Active", value: items.filter((i) => i.isActive).length, color: "emerald" },
          { label: "Paused", value: items.filter((i) => !i.isActive).length, color: "amber" },
          { label: "Generated", value: items.reduce((s, i) => s + i.totalGenerated, 0), color: "violet" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border border-${s.color}-100 shadow-sm`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">New Recurring Invoice</h2>
            <div className="space-y-3">
              <input placeholder="Name (e.g., Monthly Rent)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!form.name || !form.customerId} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No recurring invoices yet</p>
            <p className="text-xs text-gray-400 mt-1">Create one to auto-generate invoices</p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <button onClick={() => handleToggle(item.id)} className="flex-shrink-0">
                  {item.isActive ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.customerName}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{FREQ_LABELS[item.frequency]}</span>
                    <span>Next: {item.nextDueDate || "Not set"}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{item.totalGenerated} generated</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {item.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
