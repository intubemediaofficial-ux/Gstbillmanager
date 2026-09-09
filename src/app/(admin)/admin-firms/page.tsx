"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Pencil, Trash2, X, Building2 } from "lucide-react";
import type { Firm } from "@/lib/gst-types";

interface AdminFirm extends Firm {
  ownerName: string;
  ownerEmail: string;
  ownerId: string;
}

export default function AdminFirmsPage() {
  const [firms, setFirms] = useState<AdminFirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminFirm | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const didFetch = useRef(false);
  const fetchFirms = () => {
    setLoading(true);
    fetch("/api/admin/firms")
      .then((r) => r.json())
      .then((res) => setFirms(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchFirms();
  }, []);

  const openEdit = (f: AdminFirm) => {
    setEditing(f);
    setForm({
      name: f.name || "",
      gstin: f.gstin || "",
      pan: f.pan || "",
      address: f.address || "",
      city: f.city || "",
      state: f.state || "",
      pincode: f.pincode || "",
      phone: f.phone || "",
      email: f.email || "",
      bankName: f.bankName || "",
      accountNumber: f.accountNumber || "",
      ifscCode: f.ifscCode || "",
      branchName: f.branchName || "",
      accountHolder: f.accountHolder || "",
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/admin/firms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", userId: editing.ownerId, id: editing.id, ...form }),
    });
    setSaving(false);
    setEditing(null);
    fetchFirms();
  };

  const handleDelete = async (f: AdminFirm) => {
    if (!confirm(`Delete firm "${f.name}"?`)) return;
    await fetch("/api/admin/firms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId: f.ownerId, id: f.id }),
    });
    fetchFirms();
  };

  const filtered = firms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (f.gstin || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Client Firms</h1>
        <span className="text-sm text-gray-500">{firms.length} firms total</span>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by firm name, owner, or GSTIN..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Firm Name</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">GSTIN</th>
                <th className="text-left p-3 font-medium">Owner (Client)</th>
                <th className="text-left p-3 font-medium">State</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{f.name || "-"}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.isGst ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {f.isGst ? "GST" : "Non-GST"}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-500">{f.gstin || "-"}</td>
                  <td className="p-3">
                    <div className="font-medium">{f.ownerName}</div>
                    <div className="text-xs text-gray-400">{f.ownerEmail}</div>
                  </td>
                  <td className="p-3 text-gray-500">{f.state || "-"}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No firms found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Edit Firm — {editing.ownerName}</h2>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                ["name", "Firm Name"],
                ["gstin", "GSTIN"],
                ["pan", "PAN"],
                ["address", "Address"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "Pincode"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["accountHolder", "Account Holder Name"],
                ["bankName", "Bank Name"],
                ["accountNumber", "Account Number"],
                ["ifscCode", "IFSC Code"],
                ["branchName", "Branch Name"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="text"
                    value={form[key] || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
