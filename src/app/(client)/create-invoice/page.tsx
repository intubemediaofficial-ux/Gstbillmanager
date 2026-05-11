"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Building2, ArrowRight, PenTool } from "lucide-react";
import Image from "next/image";
import type { Customer, Product, InvoiceType, Firm, Signature } from "@/lib/gst-types";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("tax_invoice");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");

  // Quick mode: just enter amount, auto-calc GST
  const [quickMode, setQuickMode] = useState(true);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickDescription, setQuickDescription] = useState("");
  const [quickGstRate, setQuickGstRate] = useState(18);

  // Detailed mode items
  const [items, setItems] = useState<ItemRow[]>([{ description: "", hsn: "", qty: 1, unit: "PCS", rate: 0, gstRate: 18 }]);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/firms").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/signatures").then((r) => r.json()),
    ]).then(([fRes, cRes, pRes, sRes]) => {
      const f = fRes.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
      setSignatures(sRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const sellerState = selectedFirm?.stateCode || "";
  const buyerState = selectedCustomer?.stateCode || "";
  const interState = sellerState && buyerState ? isInterState(sellerState, buyerState) : false;

  // Quick mode calculations
  const qAmount = parseFloat(quickAmount) || 0;
  const qGst = calculateGST(qAmount, quickGstRate, interState);

  // Detailed mode calculations
  const calculated = items.map((item) => {
    const amount = item.qty * item.rate;
    const gst = calculateGST(amount, item.gstRate, interState);
    return { ...item, amount, ...gst };
  });

  const subtotal = quickMode ? qAmount : calculated.reduce((s, i) => s + i.amount, 0);
  const totalCgst = quickMode ? qGst.cgst : calculated.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = quickMode ? qGst.sgst : calculated.reduce((s, i) => s + i.sgst, 0);
  const totalIgst = quickMode ? qGst.igst : calculated.reduce((s, i) => s + i.igst, 0);
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
    if (!selectedFirm) { alert("Please select your firm"); return; }
    if (!selectedCustomer) { alert("Please select Bill To party"); return; }

    const signatureData = selectedSignature ? {
      id: selectedSignature.id,
      directorName: selectedSignature.directorName,
      imageData: selectedSignature.imageData,
    } : undefined;
    if (quickMode && !qAmount) { alert("Please enter amount"); return; }
    if (!quickMode && items.some((i) => !i.description)) { alert("Please fill all item descriptions"); return; }
    setSaving(true);

    const invoiceItems = quickMode
      ? [{
          description: quickDescription || `${MONTHS[month]} ${year} - Service`,
          hsn: selectedFirm.hsnCode || "998361",
          qty: 1,
          unit: "MON",
          rate: qAmount,
          gstRate: quickGstRate,
        }]
      : items.map((i) => ({
          description: i.description,
          hsn: i.hsn || selectedFirm.hsnCode || "",
          qty: i.qty,
          unit: i.unit,
          rate: i.rate,
          gstRate: i.gstRate,
        }));

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        invoiceType,
        date,
        dueDate,
        firm: {
          id: selectedFirm.id,
          name: selectedFirm.name,
          address: selectedFirm.address,
          city: selectedFirm.city,
          state: selectedFirm.state,
          stateCode: selectedFirm.stateCode,
          gstin: selectedFirm.gstin,
          pan: selectedFirm.pan,
          phone: selectedFirm.phone,
          email: selectedFirm.email,
          bankName: selectedFirm.bankName,
          accountNumber: selectedFirm.accountNumber,
          ifscCode: selectedFirm.ifscCode,
          branchName: selectedFirm.branchName,
          signatureText: selectedFirm.signatureText,
        },
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
          state: selectedCustomer.state,
          stateCode: selectedCustomer.stateCode,
          gstin: selectedCustomer.gstin,
        },
        items: invoiceItems,
        notes,
        terms,
        signature: signatureData,
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
        {/* Firm (From) → Customer (To) Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: My Firm */}
          <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <label className="text-sm font-semibold text-indigo-700">FROM (My Firm) *</label>
            </div>
            {firms.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-2">No firms added yet</p>
                <a href="/my-firms" className="text-indigo-600 text-sm font-medium hover:underline">+ Add Firm</a>
              </div>
            ) : (
              <select
                value={selectedFirm?.id || ""}
                onChange={(e) => setSelectedFirm(firms.find((f) => f.id === e.target.value) || null)}
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              >
                <option value="">Select your firm...</option>
                {firms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            {selectedFirm && (
              <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{selectedFirm.name}</p>
                <p>GSTIN: {selectedFirm.gstin}</p>
                <p>{selectedFirm.city}, {selectedFirm.state}</p>
              </div>
            )}
          </div>

          {/* Right: Bill To */}
          <div className="border-2 border-dashed border-orange-200 rounded-xl p-4 bg-orange-50/30">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-5 h-5 text-orange-600" />
              <label className="text-sm font-semibold text-orange-700">BILL TO (Party) *</label>
            </div>
            {customers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-2">No parties added yet</p>
                <a href="/customers" className="text-orange-600 text-sm font-medium hover:underline">+ Add Party</a>
              </div>
            ) : (
              <select
                value={selectedCustomer?.id || ""}
                onChange={(e) => setSelectedCustomer(customers.find((c) => c.id === e.target.value) || null)}
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
              >
                <option value="">Select party...</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ""}</option>)}
              </select>
            )}
            {selectedCustomer && (
              <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{selectedCustomer.name}</p>
                <p>GSTIN: {selectedCustomer.gstin}</p>
                <p>{selectedCustomer.city}, {selectedCustomer.state}</p>
                {interState && <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">Inter-State (IGST)</span>}
                {!interState && sellerState && buyerState && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Intra-State (CGST+SGST)</span>}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Type, Month, Date */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Type</label>
            <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              {Object.entries(INVOICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>

        {/* Quick Mode Toggle */}
        <div className="flex items-center gap-4 border-t pt-4">
          <button onClick={() => setQuickMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${quickMode ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            ⚡ Quick Invoice (Amount Only)
          </button>
          <button onClick={() => setQuickMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!quickMode ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            📋 Detailed (Multiple Items)
          </button>
        </div>

        {/* Quick Mode */}
        {quickMode && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-700 mb-4">Quick Invoice — Enter amount, GST auto-calculated</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={quickDescription} onChange={(e) => setQuickDescription(e.target.value)}
                  placeholder={`${MONTHS[month]} ${year} - Service`}
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (before GST) *</label>
                <input type="number" value={quickAmount} onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="56257"
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-lg font-semibold" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST Rate</label>
                <select value={quickGstRate} onChange={(e) => setQuickGstRate(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Mode */}
        {!quickMode && (
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
                      {products.length > 0 && (
                        <select onChange={(e) => selectProduct(idx, e.target.value)} value="" className="w-full px-2 py-1.5 border rounded text-sm mb-1">
                          <option value="">Pick from catalog...</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.hsn})</option>)}
                        </select>
                      )}
                      <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Item description" className="w-full px-2 py-1.5 border rounded text-sm" />
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
                          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Rate</label>
                        <input type="number" min="0" value={item.rate} onChange={(e) => updateItem(idx, "rate", parseFloat(e.target.value) || 0)}
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
                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                        <p className="text-sm font-semibold">{formatCurrency(calculated[idx]?.amount || 0)}</p>
                      </div>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 ml-2 mb-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {!interState ? (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">CGST</span><span>{formatCurrency(totalCgst)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">SGST</span><span>{formatCurrency(totalSgst)}</span></div>
                </>
              ) : (
                <div className="flex justify-between"><span className="text-gray-500">IGST</span><span>{formatCurrency(totalIgst)}</span></div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Grand Total</span><span className="text-indigo-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Selection */}
        {selectedFirm && (() => {
          const firmSigs = signatures.filter((s) => s.firmId === selectedFirm.id);
          return firmSigs.length > 0 ? (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <PenTool className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium">Director Signature</label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setSelectedSignature(null)}
                  className={`border-2 rounded-lg px-4 py-3 text-sm transition ${!selectedSignature ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                  No Signature
                </button>
                {firmSigs.map((sig) => (
                  <button key={sig.id} onClick={() => setSelectedSignature(sig)}
                    className={`border-2 rounded-lg p-3 text-center transition ${selectedSignature?.id === sig.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <Image src={sig.imageData} alt={sig.directorName} width={80} height={40} className="h-10 w-auto object-contain mx-auto" />
                    <p className="text-xs text-gray-600 mt-1">{sig.directorName}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 text-sm text-gray-400">
              No signatures uploaded for this firm. <a href="/my-firms" className="text-indigo-600 hover:underline">Upload in My Firms</a>
            </div>
          );
        })()}

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional notes..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Payment terms..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button onClick={() => router.push("/invoices")} className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
