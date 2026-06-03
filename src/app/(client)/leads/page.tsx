"use client";

import { useState, useEffect, useRef } from "react";
import { Target, Plus, Trash2, Search, Edit2, Phone, Mail, Building2, X, ArrowRight } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string }> = {
  new: { label: "New", bg: "bg-blue-100", text: "text-blue-700" },
  contacted: { label: "Contacted", bg: "bg-cyan-100", text: "text-cyan-700" },
  interested: { label: "Interested", bg: "bg-amber-100", text: "text-amber-700" },
  negotiation: { label: "Negotiation", bg: "bg-purple-100", text: "text-purple-700" },
  won: { label: "Won", bg: "bg-emerald-100", text: "text-emerald-700" },
  lost: { label: "Lost", bg: "bg-red-100", text: "text-red-700" },
};

const SOURCE_LABELS: Record<string, string> = { website: "Website", referral: "Referral", social_media: "Social Media", cold_call: "Cold Call", walk_in: "Walk In", other: "Other" };

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", source: "other", value: "", notes: "", nextFollowUp: "" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/leads").then((r) => r.json()).then((res) => setItems(res.data || [])).finally(() => setLoading(false));
  }, []);

  const resetForm = () => setForm({ name: "", company: "", email: "", phone: "", source: "other", value: "", notes: "", nextFollowUp: "" });

  const handleSave = async () => {
    const action = editId ? "update" : "create";
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...form, ...(editId ? { id: editId } : {}) }),
    });
    const data = await res.json();
    if (data.success) {
      if (editId) setItems((p) => p.map((i) => (i.id === editId ? data.data : i)));
      else setItems((p) => [data.data, ...p]);
      setShowForm(false);
      setEditId(null);
      resetForm();
    }
  };

  const handleEdit = (lead: Lead) => {
    setForm({ name: lead.name, company: lead.company || "", email: lead.email, phone: lead.phone, source: lead.source, value: lead.value ? String(lead.value) : "", notes: lead.notes || "", nextFollowUp: lead.nextFollowUp || "" });
    setEditId(lead.id);
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, status }),
    });
    const data = await res.json();
    if (data.success) setItems((p) => p.map((i) => (i.id === id ? data.data : i)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.company || "").toLowerCase().includes(q) || i.phone.includes(q);
    const matchStatus = !filterStatus || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalValue = items.filter((i) => i.status === "won").reduce((s, i) => s + (i.value || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads & Enquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Track potential clients</p>
        </div>
        <button onClick={() => { resetForm(); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads", value: items.length, color: "blue" },
          { label: "Active", value: items.filter((i) => !["won", "lost"].includes(i.status)).length, color: "amber" },
          { label: "Won", value: items.filter((i) => i.status === "won").length, color: "emerald" },
          { label: "Won Value", value: formatCurrency(totalValue), color: "violet" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border border-${s.color}-100 shadow-sm`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? "Edit" : "Add"} Lead</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input type="number" placeholder="Estimated Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <input type="date" value={form.nextFollowUp} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">{editId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No leads yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((lead) => {
              const sc = STATUS_CONFIG[lead.status];
              return (
                <div key={lead.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900">{lead.name}</p>
                      {lead.company && <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{lead.company}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                      {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                      <span>{SOURCE_LABELS[lead.source]}</span>
                      {lead.nextFollowUp && <span className="text-orange-600">Follow-up: {formatDate(lead.nextFollowUp)}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${sc.bg} ${sc.text}`}>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  {lead.value && <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatCurrency(lead.value)}</p>}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(lead)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(lead.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
