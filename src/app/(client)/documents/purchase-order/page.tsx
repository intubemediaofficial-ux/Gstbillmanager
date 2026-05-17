"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Printer, Share2, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Firm } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";
import { businessTemplates, formatDate } from "@/components/documents/doc-templates";

interface POItem { desc: string; qty: number; rate: number; unit: string; }

export default function PurchaseOrderPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [template, setTemplate] = useState(businessTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorGstin, setVendorGstin] = useState("");
  const [poNo, setPoNo] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [items, setItems] = useState<POItem[]>([{ desc: "", qty: 1, rate: 0, unit: "Pcs" }]);
  const [terms, setTerms] = useState("1. Payment: 30 days from delivery.\n2. Delivery as per schedule.\n3. Quality standards must be maintained.");

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
    });
  }, []);

  const addItem = () => setItems([...items, { desc: "", qty: 1, rate: 0, unit: "Pcs" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof POItem, val: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const total = items.reduce((s, i) => s + i.qty * i.rate, 0);

  const handlePDF = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(docRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`Purchase_Order_${poNo}.pdf`);
    } catch { window.print(); }
    finally { setPdfLoading(false); }
  };

  const c = template.colors;
  const companyName = selectedFirm?.name || "Your Company";
  const companyAddr = [selectedFirm?.address, selectedFirm?.city, selectedFirm?.state].filter(Boolean).join(", ");

  if (showPreview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`📋 Purchase Order ${poNo}\n🏪 ${vendorName}\n💰 ${formatCurrency(total)}\n🏢 ${companyName}`)}`, "_blank")} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"><Share2 className="w-4 h-4" /> WhatsApp</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF</button>
          </div>
        </div>
        <div ref={docRef} className="bg-white max-w-[210mm] mx-auto shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
                {companyAddr && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{companyAddr}</div>}
                {selectedFirm?.gstin && <div style={{ fontSize: "11px", opacity: 0.7 }}>GSTIN: {selectedFirm.gstin}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "2px" }}>PURCHASE ORDER</div>
                <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>#{poNo}</div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>Date: {formatDate(poDate)}</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "24px 36px", display: "flex", gap: "40px", borderBottom: `2px solid ${c.accent}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Vendor / Supplier</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{vendorName}</div>
              {vendorAddress && <div style={{ fontSize: "12px", color: "#6b7280" }}>{vendorAddress}</div>}
              {vendorGstin && <div style={{ fontSize: "11px", color: "#6b7280" }}>GSTIN: {vendorGstin}</div>}
            </div>
            {deliveryDate && (
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Delivery By</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{formatDate(deliveryDate)}</div>
                {deliveryAddress && <div style={{ fontSize: "12px", color: "#6b7280" }}>{deliveryAddress}</div>}
              </div>
            )}
          </div>
          <div style={{ padding: "0 36px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "20px" }}>
              <thead>
                <tr style={{ background: c.primary, color: "white" }}>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "5%" }}>#</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "10%" }}>Unit</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "10%" }}>Qty</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", width: "15%" }}>Rate</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", width: "15%" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb", background: idx % 2 === 0 ? "white" : "#f9fafb" }}>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{item.desc}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.unit}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.qty}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>{formatCurrency(item.rate)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(item.qty * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", margin: "16px 0", fontSize: "17px", fontWeight: 800, color: c.primary }}>Total: {formatCurrency(total)}</div>
          </div>
          {terms && <div style={{ padding: "20px 36px", borderTop: `1px solid ${c.accent}` }}><strong style={{ color: c.primary, fontSize: "12px" }}>Terms:</strong><pre style={{ fontSize: "11px", color: "#6b7280", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{terms}</pre></div>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "30px 36px" }}>
            <div style={{ borderTop: "2px solid #d1d5db", width: "180px", paddingTop: "8px", textAlign: "center" }}><p style={{ fontSize: "12px", color: "#6b7280" }}>Supplier Acknowledgement</p></div>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "180px", paddingTop: "8px", textAlign: "center" }}><p style={{ fontWeight: 700, fontSize: "13px", color: c.primary }}>For {companyName}</p><p style={{ fontSize: "11px", color: "#6b7280" }}>Authorized Signatory</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold">Purchase Order</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6 space-y-4">
          {firms.length > 0 && (
            <div className="pb-4 border-b">
              <label className="block text-sm font-semibold mb-2">Company / Firm</label>
              <select value={selectedFirm?.id || ""} onChange={e => setSelectedFirm(firms.find(f => f.id === e.target.value) || null)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Firm</option>
                {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Vendor / Supplier Name *</label><input value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Vendor name" /></div>
            <div><label className="block text-sm font-medium mb-1">PO Number</label><input value={poNo} onChange={e => setPoNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Vendor Address</label><input value={vendorAddress} onChange={e => setVendorAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Address" /></div>
            <div><label className="block text-sm font-medium mb-1">Vendor GSTIN</label><input value={vendorGstin} onChange={e => setVendorGstin(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="GSTIN" /></div>
            <div><label className="block text-sm font-medium mb-1">PO Date</label><input type="date" value={poDate} onChange={e => setPoDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Expected Delivery Date</label><input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Delivery Address</label><input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Delivery location" /></div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Items</label>
              <button onClick={addItem} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start mb-2">
                <input value={item.desc} onChange={e => updateItem(idx, "desc", e.target.value)} placeholder="Description" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="number" value={item.qty || ""} onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 0)} placeholder="Qty" className="w-16 px-2 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <select value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="w-20 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  {["Pcs", "Kg", "Ltr", "Mtr", "Box", "Set", "Pair", "Nos"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="number" value={item.rate || ""} onChange={e => updateItem(idx, "rate", parseFloat(e.target.value) || 0)} placeholder="Rate" className="w-24 px-2 py-2 border rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="text-right text-sm font-semibold mt-2">Total: {formatCurrency(total)}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Terms</label><textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
          <div className="flex justify-end"><button onClick={() => { if (!vendorName) { alert("Enter vendor name"); return; } setShowPreview(true); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Preview & Generate PDF →</button></div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Choose Template</h3>
          <div className="space-y-3">
            {businessTemplates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t)} className={`w-full text-left p-3 rounded-xl border-2 transition ${template.id === t.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})` }} />
                  <p className="font-medium text-sm">{t.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
