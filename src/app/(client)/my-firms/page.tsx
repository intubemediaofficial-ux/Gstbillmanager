"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import type { Firm } from "@/lib/gst-types";
import { INDIAN_STATES } from "@/lib/gst-types";

const emptyFirm = {
  name: "", address: "", city: "", state: "", stateCode: "", pincode: "",
  gstin: "", pan: "", phone: "", email: "",
  bankName: "", accountNumber: "", ifscCode: "", branchName: "",
  hsnCode: "", signatureText: "",
};

export default function MyFirmsPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFirm);

  const didMount = useRef(false);
  const load = async () => {
    const res = await fetch("/api/firms");
    const d = await res.json();
    if (d.data) setFirms(d.data);
  };

  useEffect(() => { if (didMount.current) return; didMount.current = true; load(); }, []);

  const handleGstin = (gstin: string) => {
    const updates: Partial<typeof form> = { gstin };
    if (gstin.length >= 2) {
      const code = gstin.substring(0, 2);
      if (INDIAN_STATES[code]) {
        updates.stateCode = code;
        updates.state = INDIAN_STATES[code];
      }
    }
    if (gstin.length >= 12) {
      updates.pan = gstin.substring(2, 12);
    }
    setForm((p) => ({ ...p, ...updates }));
  };

  const handleSave = async () => {
    if (!form.name || !form.gstin) return alert("Firm name and GSTIN are required");
    const action = editId ? "update" : "create";
    const res = await fetch("/api/firms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: editId, ...form }),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm(emptyFirm);
      load();
    }
  };

  const handleEdit = (f: Firm) => {
    setEditId(f.id);
    setForm({
      name: f.name, address: f.address, city: f.city, state: f.state,
      stateCode: f.stateCode, pincode: f.pincode, gstin: f.gstin, pan: f.pan,
      phone: f.phone, email: f.email, bankName: f.bankName,
      accountNumber: f.accountNumber, ifscCode: f.ifscCode, branchName: f.branchName,
      hsnCode: f.hsnCode, signatureText: f.signatureText,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this firm?")) return;
    await fetch("/api/firms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Firms</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyFirm); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Firm
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editId ? "Edit Firm" : "Add New Firm"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyFirm); }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name *</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bainsla Music" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
              <input value={form.gstin} onChange={(e) => handleGstin(e.target.value.toUpperCase())}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="29ABCDE1234F1Z5" maxLength={15} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN (auto)</label>
              <input value={form.pan} readOnly className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State (auto)</label>
              <input value={form.state} readOnly className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Jaipur" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="302001" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Full address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="firm@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default HSN Code</label>
              <input value={form.hsnCode} onChange={(e) => setForm((p) => ({ ...p, hsnCode: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="998361" />
            </div>
            <div className="md:col-span-3 border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm" placeholder="Bank Name" />
                <input value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm" placeholder="Account Number" />
                <input value={form.ifscCode} onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm" placeholder="IFSC Code" />
                <input value={form.branchName} onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm" placeholder="Branch Name" />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Signatory</label>
              <input value={form.signatureText} onChange={(e) => setForm((p) => ({ ...p, signatureText: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Name of authorized signatory" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyFirm); }}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {firms.map((f) => (
          <div key={f.id} className="bg-white rounded-xl shadow p-5 border hover:border-indigo-300 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <p className="text-sm text-gray-500">{f.gstin}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(f)} className="text-gray-400 hover:text-indigo-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(f.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              {f.address && <p>{f.address}, {f.city}</p>}
              <p>{f.state} ({f.stateCode}) {f.pincode && `- ${f.pincode}`}</p>
              {f.phone && <p>Ph: {f.phone}</p>}
              {f.hsnCode && <p>HSN: {f.hsnCode}</p>}
            </div>
          </div>
        ))}
        {firms.length === 0 && !showForm && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            No firms added yet. Click &quot;Add Firm&quot; to add your companies.
          </div>
        )}
      </div>
    </div>
  );
}
