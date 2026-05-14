"use client";

import { useState, useEffect, useRef } from "react";
import { Package, Plus, Trash2, Edit2, ArrowDown, ArrowUp, AlertTriangle, X, Search } from "lucide-react";
import type { InventoryItem } from "@/lib/gst-types";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showMove, setShowMove] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ name: "", hsn: "", unit: "PCS", currentStock: 0, lowStockAlert: 5, purchasePrice: 0, sellingPrice: 0 });
  const [moveForm, setMoveForm] = useState({ type: "in" as "in" | "out", qty: 1, note: "" });

  const didFetch = useRef(false);
  const load = () => {
    setLoading(true);
    fetch("/api/inventory").then((r) => r.json()).then((res) => {
      if (res.data) { setItems(res.data.items); setLowStock(res.data.lowStock); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (didFetch.current) return; didFetch.current = true; load(); }, []);

  const handleSave = async () => {
    if (!form.name) return;
    const item = { id: editItem?.id || crypto.randomUUID(), ...form };
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsert_item", item }),
    });
    setShowForm(false); setEditItem(null);
    setForm({ name: "", hsn: "", unit: "PCS", currentStock: 0, lowStockAlert: 5, purchasePrice: 0, sellingPrice: 0 });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_item", id }),
    });
    load();
  };

  const handleMove = async () => {
    if (!showMove || moveForm.qty <= 0) return;
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stock_move", itemId: showMove.id, ...moveForm }),
    });
    setShowMove(null); setMoveForm({ type: "in", qty: 1, note: "" });
    load();
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.hsn.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory / Stock</h1>
        <button onClick={() => { setEditItem(null); setForm({ name: "", hsn: "", unit: "PCS", currentStock: 0, lowStockAlert: 5, purchasePrice: 0, sellingPrice: 0 }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
            <AlertTriangle className="w-4 h-4" /> Low Stock Alert ({lowStock.length} items)
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="px-3 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-800">
                {i.name}: {i.currentStock} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Search items..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Item Name</th>
                <th className="text-left p-3 font-medium">HSN</th>
                <th className="text-left p-3 font-medium">Unit</th>
                <th className="text-right p-3 font-medium">Stock</th>
                <th className="text-right p-3 font-medium">Purchase ₹</th>
                <th className="text-right p-3 font-medium">Selling ₹</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{item.hsn || "-"}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className={`p-3 text-right font-bold ${item.currentStock <= item.lowStockAlert ? "text-red-600" : "text-gray-900"}`}>
                    {item.currentStock}
                    {item.currentStock <= item.lowStockAlert && <AlertTriangle className="inline w-3.5 h-3.5 ml-1 text-amber-500" />}
                  </td>
                  <td className="p-3 text-right">₹{item.purchasePrice.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-right">₹{item.sellingPrice.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setShowMove(item)} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Stock In">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setShowMove(item); setMoveForm({ type: "out", qty: 1, note: "" }); }} className="p-1.5 hover:bg-orange-50 rounded text-orange-600" title="Stock Out">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditItem(item); setForm({ name: item.name, hsn: item.hsn, unit: item.unit, currentStock: item.currentStock, lowStockAlert: item.lowStockAlert, purchasePrice: item.purchasePrice, sellingPrice: item.sellingPrice }); setShowForm(true); }} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2" /> No inventory items yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editItem ? "Edit Item" : "Add Item"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">HSN/SAC</label>
                  <input value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {["PCS", "NOS", "KG", "GM", "LTR", "ML", "MTR", "CM", "BOX", "BAG", "SET", "DOZ", "QTL", "TON", "UNT"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Stock</label>
                  <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
                  <input type="number" value={form.lowStockAlert} onChange={(e) => setForm({ ...form, lowStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Price ₹</label>
                  <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selling Price ₹</label>
                  <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button onClick={handleSave} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                {editItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Move Modal */}
      {showMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Stock {moveForm.type === "in" ? "In" : "Out"}: {showMove.name}</h2>
              <button onClick={() => setShowMove(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button onClick={() => setMoveForm({ ...moveForm, type: "in" })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 ${moveForm.type === "in" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>
                  <ArrowDown className="inline w-4 h-4 mr-1" /> Stock In
                </button>
                <button onClick={() => setMoveForm({ ...moveForm, type: "out" })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 ${moveForm.type === "out" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500"}`}>
                  <ArrowUp className="inline w-4 h-4 mr-1" /> Stock Out
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" min={1} value={moveForm.qty} onChange={(e) => setMoveForm({ ...moveForm, qty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <input value={moveForm.note} onChange={(e) => setMoveForm({ ...moveForm, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Purchase from supplier..." />
              </div>
              <p className="text-xs text-gray-500">Current stock: <strong>{showMove.currentStock} {showMove.unit}</strong></p>
              <button onClick={handleMove}
                className={`w-full py-2.5 rounded-lg font-medium text-sm text-white ${moveForm.type === "in" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}>
                {moveForm.type === "in" ? "Add Stock" : "Remove Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
