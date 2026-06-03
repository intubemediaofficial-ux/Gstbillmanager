"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Plus, Trash2, Check, Clock, AlertTriangle, X, Filter } from "lucide-react";
import type { FollowUpReminder } from "@/lib/gst-types";
import { formatDate } from "@/lib/gst-utils";

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  low: { label: "Low", bg: "bg-gray-100", text: "text-gray-600" },
  medium: { label: "Medium", bg: "bg-blue-100", text: "text-blue-700" },
  high: { label: "High", bg: "bg-orange-100", text: "text-orange-700" },
  urgent: { label: "Urgent", bg: "bg-red-100", text: "text-red-700" },
};

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUpReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [form, setForm] = useState({ title: "", description: "", relatedTo: "general", relatedName: "", dueDate: new Date().toISOString().split("T")[0], dueTime: "", priority: "medium" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/follow-ups").then((r) => r.json()).then((res) => setItems(res.data || [])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((p) => [...p, data.data].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setShowForm(false);
      setForm({ title: "", description: "", relatedTo: "general", relatedName: "", dueDate: new Date().toISOString().split("T")[0], dueTime: "", priority: "medium" });
    }
  };

  const handleComplete = async (id: string) => {
    const res = await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", id }),
    });
    if ((await res.json()).success) setItems((p) => p.map((i) => (i.id === id ? { ...i, status: "completed" as const } : i)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    await fetch("/api/follow-ups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = items.filter((i) => {
    if (filterStatus === "pending") return i.status === "pending";
    if (filterStatus === "completed") return i.status === "completed";
    if (filterStatus === "overdue") return i.status === "pending" && i.dueDate < today;
    return true;
  });

  const overdueCount = items.filter((i) => i.status === "pending" && i.dueDate < today).length;
  const todayCount = items.filter((i) => i.status === "pending" && i.dueDate === today).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-up Reminders</h1>
          <p className="text-sm text-gray-500 mt-1">Never miss a follow-up</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: items.length, color: "blue" },
          { label: "Today", value: todayCount, color: "emerald" },
          { label: "Overdue", value: overdueCount, color: "red" },
          { label: "Completed", value: items.filter((i) => i.status === "completed").length, color: "violet" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border border-${s.color}-100 shadow-sm`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "pending", label: "Pending" },
          { key: "overdue", label: "Overdue" },
          { key: "completed", label: "Completed" },
          { key: "all", label: "All" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === tab.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Reminder</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.relatedTo} onChange={(e) => setForm({ ...form, relatedTo: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="general">General</option>
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                  <option value="invoice">Invoice</option>
                </select>
                <input placeholder="Related Name" value={form.relatedName} onChange={(e) => setForm({ ...form, relatedName: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="time" value={form.dueTime} onChange={(e) => setForm({ ...form, dueTime: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!form.title} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No reminders</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((item) => {
              const isOverdue = item.status === "pending" && item.dueDate < today;
              const pc = PRIORITY_CONFIG[item.priority];
              return (
                <div key={item.id} className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition ${item.status === "completed" ? "opacity-60" : ""}`}>
                  <button onClick={() => item.status === "pending" && handleComplete(item.id)} disabled={item.status === "completed"}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${item.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-blue-500"}`}>
                    {item.status === "completed" && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${item.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-semibold" : ""}`}>
                        {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {formatDate(item.dueDate)} {item.dueTime || ""}
                      </span>
                      {item.relatedName && <span>{item.relatedTo}: {item.relatedName}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc.bg} ${pc.text} flex-shrink-0`}>{pc.label}</span>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
