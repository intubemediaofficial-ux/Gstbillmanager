"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import type { Product } from "@/lib/gst-types";
import { UNITS, GST_RATES } from "@/lib/gst-types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", hsn: "", unit: "PCS", rate: "", gstRate: "18", type: "goods" as "goods" | "service", description: "" });

  const fetchRef = useRef(0);
  const fetchProducts = () => {
    const id = ++fetchRef.current;
    setLoading(true);
    fetch("/api/products").then((r) => r.json())
      .then((res) => { if (fetchRef.current === id) setProducts(res.data || []); })
      .finally(() => { if (fetchRef.current === id) setLoading(false); });
  };

  const didMount = useRef(false);
  useEffect(() => { if (didMount.current) return; didMount.current = true; fetchProducts(); }, []);

  const handleSave = async () => {
    const payload = {
      action: editing ? "update" : "create",
      ...(editing ? { id: editing.id } : {}),
      name: form.name, hsn: form.hsn, unit: form.unit,
      rate: parseFloat(form.rate) || 0, gstRate: parseInt(form.gstRate),
      type: form.type, description: form.description,
    };
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", hsn: "", unit: "PCS", rate: "", gstRate: "18", type: "goods", description: "" });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchProducts();
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, hsn: p.hsn, unit: p.unit, rate: String(p.rate), gstRate: String(p.gstRate), type: p.type, description: p.description || "" });
    setShowForm(true);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.hsn.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products & Services</h1>
        <button onClick={() => { setEditing(null); setForm({ name: "", hsn: "", unit: "PCS", rate: "", gstRate: "18", type: "goods", description: "" }); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or HSN..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">HSN</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Unit</th>
                <th className="text-right p-3 font-medium">Rate</th>
                <th className="text-right p-3 font-medium">GST %</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 font-mono text-xs text-gray-600">{p.hsn || "-"}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.type === "goods" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{p.type}</span></td>
                  <td className="p-3 text-gray-500">{p.unit}</td>
                  <td className="p-3 text-right">{p.rate.toFixed(2)}</td>
                  <td className="p-3 text-right">{p.gstRate}%</td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4 text-blue-500" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">HSN Code</label>
                  <input value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "goods" | "service" })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="goods">Goods</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rate</label>
                  <input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST %</label>
                  <select value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
