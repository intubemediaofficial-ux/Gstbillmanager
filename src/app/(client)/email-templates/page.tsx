"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Plus, Trash2, Edit2, Copy, X, Eye } from "lucide-react";
import type { EmailTemplate } from "@/lib/gst-types";

const TYPE_COLORS: Record<string, string> = {
  invoice: "bg-blue-100 text-blue-700", reminder: "bg-amber-100 text-amber-700",
  quotation: "bg-emerald-100 text-emerald-700", receipt: "bg-violet-100 text-violet-700",
  welcome: "bg-pink-100 text-pink-700", custom: "bg-gray-100 text-gray-700",
};

export default function EmailTemplatesPage() {
  const [items, setItems] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "", type: "custom" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/email-templates").then((r) => r.json()).then((res) => setItems(res.data || [])).finally(() => setLoading(false));
  }, []);

  const resetForm = () => setForm({ name: "", subject: "", body: "", type: "custom" });

  const handleSave = async () => {
    const action = editId ? "update" : "create";
    const res = await fetch("/api/email-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...form, ...(editId ? { id: editId } : {}) }),
    });
    const data = await res.json();
    if (data.success) {
      if (editId) setItems((p) => p.map((i) => (i.id === editId ? data.data : i)));
      else setItems((p) => [...p, data.data]);
      setShowForm(false);
      setEditId(null);
      resetForm();
    }
  };

  const handleEdit = (t: EmailTemplate) => {
    setForm({ name: t.name, subject: t.subject, body: t.body, type: t.type });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleDuplicate = (t: EmailTemplate) => {
    setForm({ name: t.name + " (Copy)", subject: t.subject, body: t.body, type: t.type });
    setEditId(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch("/api/email-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const previewTemplate = items.find((i) => i.id === previewId);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Ready-made email templates for invoices, reminders & more</p>
        </div>
        <button onClick={() => { resetForm(); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-4">Use variables: {"{customerName}, {firmName}, {invoiceNumber}, {amount}, {dueDate}, {date}, {balance}, {paymentMode}, {bankName}, {accountNumber}, {ifscCode}"}</p>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? "Edit" : "New"} Template</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="invoice">Invoice</option><option value="reminder">Reminder</option>
                <option value="quotation">Quotation</option><option value="receipt">Receipt</option>
                <option value="welcome">Welcome</option><option value="custom">Custom</option>
              </select>
              <input placeholder="Email Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Email Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" rows={10} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={!form.name || !form.subject} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Preview: {previewTemplate.name}</h2>
              <button onClick={() => setPreviewId(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <p className="text-xs text-gray-500">Subject:</p>
              <p className="font-semibold text-sm text-gray-900">{previewTemplate.subject}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Body:</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{previewTemplate.body}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border">
            <Mail className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No email templates</p>
          </div>
        ) : items.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <p className="font-semibold text-sm text-gray-900">{t.name}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[t.type]}`}>{t.type}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2 truncate">Subject: {t.subject}</p>
            <p className="text-xs text-gray-400 line-clamp-2">{t.body.slice(0, 120)}...</p>
            <div className="flex gap-1 mt-3 pt-3 border-t">
              <button onClick={() => setPreviewId(t.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye className="w-4 h-4" /></button>
              <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDuplicate(t)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Copy className="w-4 h-4" /></button>
              {!t.isDefault && <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
