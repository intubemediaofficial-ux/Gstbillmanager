"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import type { Customer, Product, InvoiceType, BusinessSettings } from "@/lib/gst-types";
import { INVOICE_TYPE_LABELS, GST_RATES, UNITS } from "@/lib/gst-types";
import { calculateGST, isInterState, formatCurrency } from "@/lib/gst-utils";

interface ItemRow {
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [invoiceType, setInvoiceType] = useState<InvoiceType>("tax_invoice");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ description: "", hsn: "", qty: 1, unit: "PCS", rate: 0, gstRate: 18 }]);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([cRes, pRes, sRes]) => {
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
      const s = sRes.data;
      setSettings(s);
      if (s?.termsAndConditions) setTerms(s.termsAndConditions);
    }).finally(() => setLoading(false));
  }, []);

  const sellerState = settings?.stateCode || "";
  const buyerState = selectedCustomer?.stateCode || "";
  const interState = sellerState && buyerState ? isInterState(sellerState, buyerState) : false;

  const calculated = items.map((item) => {
    const amount = item.qty * item.rate;
    const gst = calculateGST(amount, item.gstRate, interState);
    return { ...item, amount, ...gst };
  });

  const subtotal = calculated.reduce((s, i) => s + i.amount, 0);
  const totalCgst = calculated.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = calculated.reduce((s, i) => s + i.sgst, 0);
  const totalIgst = calculated.reduce((s, i) => s + i.igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = subtotal + totalTax;

  const addItem = () => setItems([...items, { description: "", hsn: "", qty: 1, unit: "PCS", rate: 0, gstRate: 18 }]);
  const removeItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const selectProduct = (idx: number, productId: string) => {
    const p = products.find((pr) => pr.id === productId);
    if (p) {
      setItems(items.map((item, i) =>
        i === idx ? { ...item, description: p.name, hsn: p.hsn, rate: p.rate, unit: p.unit, gstRate: p.gstRate } : item
      ));
    }
  };

  const handleSave = async () => {
    if (!selectedCustomer) { alert("Please select a customer"); return; }
    if (items.some((i) => !i.description)) { alert("Please fill all item descriptions"); return; }
    setSaving(true);

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        invoiceType,
        date,
        dueDate,
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
          state: selectedCustomer.state,
          stateCode: selectedCustomer.stateCode,
          gstin: selectedCustomer.gstin,
        },
        items: items.map((i) => ({
          description: i.description,
          hsn: i.hsn,
          qty: i.qty,
          unit: i.unit,
          rate: i.rate,
          gstRate: i.gstRate,
        })),
        notes,
        terms,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (data.success) {
      router.push(`/invoice-view?id=${data.data.id}`);
    } else {
      alert(data.error || "Failed to create invoice");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        {/* Invoice Type & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Type</label>
            <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {Object.entries(INVOICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer *</label>
          <select
            value={selectedCustomer?.id || ""}
            onChange={(e) => setSelectedCustomer(customers.find((c) => c.id === e.target.value) || null)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ""}</option>)}
          </select>
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.pincode}
              {interState && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">Inter-State (IGST)</span>}
              {!interState && sellerState && buyerState && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Intra-State (CGST+SGST)</span>}
            </div>
          )}
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Items</label>
            <button onClick={addItem} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Item / Product</label>
                    <div className="space-y-1">
                      {products.length > 0 && (
                        <select onChange={(e) => selectProduct(idx, e.target.value)} value="" className="w-full px-2 py-1.5 border rounded text-sm">
                          <option value="">Pick from catalog...</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.hsn})</option>)}
                        </select>
                      )}
                      <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Item description" className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">HSN</label>
                    <input value={item.hsn} onChange={(e) => updateItem(idx, "hsn", e.target.value)}
                      className="w-full px-2 py-1.5 border rounded text-sm font-mono" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Qty</label>
                      <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Unit</label>
                      <select value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-sm">
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Rate</label>
                      <input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(idx, "rate", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">GST %</label>
                    <select value={item.gstRate} onChange={(e) => updateItem(idx, "gstRate", parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded text-sm">
                      {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount</label>
                      <p className="font-medium text-sm">{formatCurrency(calculated[idx]?.amount || 0)}</p>
                    </div>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {!interState ? (
              <>
                <div className="flex justify-between"><span className="text-gray-500">CGST</span><span>{formatCurrency(totalCgst)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">SGST</span><span>{formatCurrency(totalSgst)}</span></div>
              </>
            ) : (
              <div className="flex justify-between"><span className="text-gray-500">IGST</span><span>{formatCurrency(totalIgst)}</span></div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold text-base">
              <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
