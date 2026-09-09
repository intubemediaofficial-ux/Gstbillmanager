"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Printer, Share2, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Firm } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";
import { businessTemplates, formatDate } from "@/components/documents/doc-templates";
import type { TemplateDef } from "@/components/documents/DocGenerator";
import DocUploads, { useDocAssets } from "@/components/documents/DocUploads";

interface QItem { desc: string; qty: number; rate: number; gst: number; }

export default function QuotationPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [template, setTemplate] = useState(businessTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const { letterhead, signature, setLetterhead, setSignature } = useDocAssets();

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGstin, setClientGstin] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [validTill, setValidTill] = useState("");
  const [quoteNo, setQuoteNo] = useState(`QT-${Date.now().toString().slice(-6)}`);
  const [items, setItems] = useState<QItem[]>([{ desc: "", qty: 1, rate: 0, gst: 18 }]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("1. Payment within 30 days of invoice.\n2. Prices valid for 15 days.\n3. GST as applicable.");

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
    });
  }, []);

  const addItem = () => setItems([...items, { desc: "", qty: 1, rate: 0, gst: 18 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof QItem, val: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const totalTax = items.reduce((s, i) => s + (i.qty * i.rate * i.gst / 100), 0);
  const grandTotal = subtotal + totalTax - discount;

  const handlePDF = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const { elementToPdf } = await import("@/lib/pdf-utils");
      await elementToPdf(docRef.current, `Quotation_${quoteNo}.pdf`);
      fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "Quotation", title: `Quotation - ${clientName}`, recipientName: clientName, firmName: selectedFirm?.name || "", templateName: template.name, formData: { clientName, clientAddress, clientGstin, quoteDate, validTill, quoteNo, notes, terms, grandTotal: String(grandTotal) } }) }).catch(() => {});
    } catch { window.print(); }
    finally { setPdfLoading(false); }
  };

  const handlePreview = () => {
    if (!clientName) { alert("Please enter client name"); return; }
    if (items.some(i => !i.desc)) { alert("Please fill all item descriptions"); return; }
    setShowPreview(true);
  };

  const c = template.colors;
  const companyName = selectedFirm?.name || "Your Company";
  const companyAddr = [selectedFirm?.address, selectedFirm?.city, selectedFirm?.state].filter(Boolean).join(", ");

  if (showPreview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`📋 Quotation ${quoteNo}\n👤 ${clientName}\n💰 ${formatCurrency(grandTotal)}\n🏢 ${companyName}`)}`, "_blank")} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"><Share2 className="w-4 h-4" /> WhatsApp</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
            </button>
          </div>
        </div>
        <div ref={docRef} className="bg-white max-w-[210mm] mx-auto shadow-lg print:shadow-none" style={{ fontFamily: "'Inter', sans-serif", position: "relative" }}>
          {letterhead && <img src={letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}
          <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
                {companyAddr && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{companyAddr}</div>}
                {selectedFirm?.gstin && <div style={{ fontSize: "11px", opacity: 0.7 }}>GSTIN: {selectedFirm.gstin}</div>}
              </div>
              <div style={{ textAlign: "right", fontSize: "11px", opacity: 0.9 }}>
                <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "2px" }}>QUOTATION</div>
                <div style={{ marginTop: "4px" }}>#{quoteNo}</div>
                <div>Date: {formatDate(quoteDate)}</div>
                {validTill && <div>Valid Till: {formatDate(validTill)}</div>}
              </div>
            </div>
          </div>

          <div style={{ padding: "24px 36px", display: "flex", gap: "40px", borderBottom: `2px solid ${c.accent}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>Quotation To</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{clientName}</div>
              {clientAddress && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{clientAddress}</div>}
              {clientGstin && <div style={{ fontSize: "11px", color: "#6b7280" }}>GSTIN: {clientGstin}</div>}
            </div>
          </div>

          <div style={{ padding: "0 36px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "20px" }}>
              <thead>
                <tr style={{ background: c.primary, color: "white" }}>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "5%" }}>#</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "8%" }}>Qty</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", width: "14%" }}>Rate</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "8%" }}>GST%</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", width: "14%" }}>Tax</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", width: "16%" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const amt = item.qty * item.rate;
                  const tax = amt * item.gst / 100;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb", background: idx % 2 === 0 ? "white" : "#f9fafb" }}>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>{item.desc}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.qty}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>{formatCurrency(item.rate)}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.gst}%</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>{formatCurrency(tax)}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(amt + tax)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <table style={{ fontSize: "13px", minWidth: "250px" }}>
                <tbody>
                  <tr><td style={{ padding: "6px 16px", color: "#6b7280" }}>Subtotal</td><td style={{ padding: "6px 16px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(subtotal)}</td></tr>
                  <tr><td style={{ padding: "6px 16px", color: "#6b7280" }}>Tax</td><td style={{ padding: "6px 16px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(totalTax)}</td></tr>
                  {discount > 0 && <tr><td style={{ padding: "6px 16px", color: "#6b7280" }}>Discount</td><td style={{ padding: "6px 16px", textAlign: "right", fontWeight: 600, color: "#ef4444" }}>-{formatCurrency(discount)}</td></tr>}
                  <tr style={{ borderTop: `2px solid ${c.primary}` }}>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: c.primary, fontSize: "15px" }}>Grand Total</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 800, fontSize: "17px", color: c.primary }}>{formatCurrency(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ padding: "24px 36px", borderTop: `1px solid ${c.accent}`, marginTop: "20px" }}>
            {notes && <div style={{ marginBottom: "12px" }}><strong style={{ color: c.primary, fontSize: "12px" }}>Notes:</strong><p style={{ fontSize: "12px", color: "#6b7280" }}>{notes}</p></div>}
            {terms && <div><strong style={{ color: c.primary, fontSize: "12px" }}>Terms & Conditions:</strong><pre style={{ fontSize: "11px", color: "#6b7280", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{terms}</pre></div>}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 36px" }}>
            <div style={{ textAlign: "center" }}>
              {signature && <img src={signature} alt="Signature" style={{ height: "50px", objectFit: "contain", margin: "0 auto 4px" }} />}
              <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: c.primary }}>For {companyName}</p>
                <p style={{ fontSize: "11px", color: "#6b7280" }}>Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold">Quotation / Estimate</h1>
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
            <div><label className="block text-sm font-medium mb-1">Client Name *</label><input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="Client / Company name" /></div>
            <div><label className="block text-sm font-medium mb-1">Quote No.</label><input value={quoteNo} onChange={e => setQuoteNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Client Address</label><input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="Address" /></div>
            <div><label className="block text-sm font-medium mb-1">Client GSTIN</label><input value={clientGstin} onChange={e => setClientGstin(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="GSTIN" /></div>
            <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Valid Till</label><input type="date" value={validTill} onChange={e => setValidTill(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Discount (₹)</label><input type="number" value={discount || ""} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" /></div>
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
                <input type="number" value={item.rate || ""} onChange={e => updateItem(idx, "rate", parseFloat(e.target.value) || 0)} placeholder="Rate" className="w-24 px-2 py-2 border rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <select value={item.gst} onChange={e => updateItem(idx, "gst", parseInt(e.target.value))} className="w-20 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                </select>
                <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="text-right text-sm font-semibold mt-2 text-gray-700">Total: {formatCurrency(grandTotal)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Any notes..." /></div>
            <div><label className="block text-sm font-medium mb-1">Terms & Conditions</label><textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handlePreview} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Preview & Generate PDF →</button>
          </div>
        </div>

        <div>
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
          <DocUploads letterhead={letterhead} signature={signature} setLetterhead={setLetterhead} setSignature={setSignature} />
        </div>
      </div>
    </div>
  );
}
