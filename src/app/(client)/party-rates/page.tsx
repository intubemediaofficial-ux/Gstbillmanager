"use client";

import { useState, useEffect, useRef } from "react";
import { Tag, Save, Loader2, Download, Trash2 } from "lucide-react";
import type { Customer, Product } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

interface PartyRate {
  customerId: string;
  productId: string;
  specialRate: number;
}

export default function PartyRatesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rates, setRates] = useState<PartyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [specialRate, setSpecialRate] = useState("");

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([cRes, pRes, sRes]) => {
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
      setRates(sRes.data?.partyRates || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!selectedCustomer || !selectedProduct || !specialRate) return;
    setSaving(true);
    const newRate: PartyRate = { customerId: selectedCustomer, productId: selectedProduct, specialRate: parseFloat(specialRate) };
    const updated = [...rates.filter((r) => !(r.customerId === selectedCustomer && r.productId === selectedProduct)), newRate];
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partyRates: updated }) });
    setRates(updated);
    setSpecialRate("");
    setSaving(false);
  };

  const handleDelete = async (customerId: string, productId: string) => {
    const updated = rates.filter((r) => !(r.customerId === customerId && r.productId === productId));
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partyRates: updated }) });
    setRates(updated);
  };

  const handleExcelDownload = async () => {
    const XLSX = await import("xlsx");
    const data = rates.map((r) => {
      const c = customers.find((x) => x.id === r.customerId);
      const p = products.find((x) => x.id === r.productId);
      return { "Customer": c?.name || r.customerId, "Product": p?.name || r.productId, "Default Rate": p?.rate || 0, "Special Rate": r.specialRate, "Discount": p ? formatCurrency(p.rate - r.specialRate) : "" };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Party Rates");
    XLSX.writeFile(wb, "Party_Wise_Rates.xlsx");
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6" /> Party-wise Item Rates</h1>
          <p className="text-sm text-gray-500 mt-1">Set special rates for specific customers — auto-applied when creating invoices</p>
        </div>
        {rates.length > 0 && (
          <button onClick={handleExcelDownload} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
        )}
      </div>

      {/* Add Rate Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="font-semibold mb-4">Add Special Rate</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); const p = products.find((x) => x.id === e.target.value); if (p) setSpecialRate(String(p.rate)); }}
            className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Select Product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.rate)})</option>)}
          </select>
          <input type="number" placeholder="Special Rate" value={specialRate} onChange={(e) => setSpecialRate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleAdd} disabled={saving || !selectedCustomer || !selectedProduct || !specialRate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      {/* Rates Table */}
      {rates.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Product/Service</th>
                <th className="text-right p-3 font-medium">Default Rate</th>
                <th className="text-right p-3 font-medium">Special Rate</th>
                <th className="text-right p-3 font-medium">Discount</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => {
                const c = customers.find((x) => x.id === r.customerId);
                const p = products.find((x) => x.id === r.productId);
                const defaultRate = p?.rate || 0;
                const discount = defaultRate - r.specialRate;
                return (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-medium">{c?.name || r.customerId}</td>
                    <td className="p-3">{p?.name || r.productId}</td>
                    <td className="p-3 text-right text-gray-500">{formatCurrency(defaultRate)}</td>
                    <td className="p-3 text-right font-bold text-indigo-600">{formatCurrency(r.specialRate)}</td>
                    <td className="p-3 text-right">
                      {discount > 0 ? <span className="text-green-600">-{formatCurrency(discount)}</span> : discount < 0 ? <span className="text-red-600">+{formatCurrency(Math.abs(discount))}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDelete(r.customerId, r.productId)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No special rates set yet</p>
          <p className="text-xs mt-1">Add special rates above — they&apos;ll auto-apply when creating invoices for that customer</p>
        </div>
      )}
    </div>
  );
}
