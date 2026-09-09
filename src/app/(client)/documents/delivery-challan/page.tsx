"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Printer, Share2, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Firm } from "@/lib/gst-types";
import { businessTemplates, formatDate } from "@/components/documents/doc-templates";
import DocUploads, { useDocAssets } from "@/components/documents/DocUploads";

interface DCItem { desc: string; qty: number; unit: string; remarks: string; }

export default function DeliveryChallanPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [template, setTemplate] = useState(businessTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const { letterhead, signature, setLetterhead, setSignature } = useDocAssets();

  const [receiverName, setReceiverName] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [dcNo, setDcNo] = useState(`DC-${Date.now().toString().slice(-6)}`);
  const [dcDate, setDcDate] = useState(new Date().toISOString().split("T")[0]);
  const [vehicleNo, setVehicleNo] = useState("");
  const [transportMode, setTransportMode] = useState("Road");
  const [driverName, setDriverName] = useState("");
  const [items, setItems] = useState<DCItem[]>([{ desc: "", qty: 1, unit: "Pcs", remarks: "" }]);
  const [reason, setReason] = useState("Supply");

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
    });
  }, []);

  const addItem = () => setItems([...items, { desc: "", qty: 1, unit: "Pcs", remarks: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof DCItem, val: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handlePDF = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const { elementToPdf } = await import("@/lib/pdf-utils");
      await elementToPdf(docRef.current, `Delivery_Challan_${dcNo}.pdf`);
      fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "Delivery Challan", title: `Delivery Challan - ${receiverName}`, recipientName: receiverName, firmName: selectedFirm?.name || "", templateName: template.name, formData: { receiverName, receiverAddress, dcNo, dcDate, vehicleNo, transportMode, driverName, reason } }) }).catch(() => {});
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
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🚚 Delivery Challan ${dcNo}\n👤 ${receiverName}\n🚗 ${vehicleNo}\n🏢 ${companyName}`)}`, "_blank")} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"><Share2 className="w-4 h-4" /> WhatsApp</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF</button>
          </div>
        </div>
        <div ref={docRef} className="bg-white max-w-[210mm] mx-auto shadow-lg" style={{ fontFamily: "'Inter', sans-serif", position: "relative" }}>
          {letterhead && <img src={letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}
          <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
                {companyAddr && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{companyAddr}</div>}
                {selectedFirm?.gstin && <div style={{ fontSize: "11px", opacity: 0.7 }}>GSTIN: {selectedFirm.gstin}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "2px" }}>DELIVERY CHALLAN</div>
                <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>#{dcNo}</div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>Date: {formatDate(dcDate)}</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "24px 36px", display: "flex", gap: "40px", borderBottom: `2px solid ${c.accent}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Deliver To</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{receiverName}</div>
              {receiverAddress && <div style={{ fontSize: "12px", color: "#6b7280" }}>{receiverAddress}</div>}
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Transport</div>
              <div style={{ fontSize: "12px", color: "#374151" }}>Mode: {transportMode}</div>
              {vehicleNo && <div style={{ fontSize: "12px", color: "#374151" }}>Vehicle: {vehicleNo}</div>}
              {driverName && <div style={{ fontSize: "12px", color: "#374151" }}>Driver: {driverName}</div>}
              <div style={{ fontSize: "12px", color: "#374151" }}>Reason: {reason}</div>
            </div>
          </div>
          <div style={{ padding: "0 36px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "20px" }}>
              <thead>
                <tr style={{ background: c.primary, color: "white" }}>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "5%" }}>#</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Material Description</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "10%" }}>Unit</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", width: "10%" }}>Qty</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", width: "25%" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb", background: idx % 2 === 0 ? "white" : "#f9fafb" }}>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{item.desc}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.unit}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.qty}</td>
                    <td style={{ padding: "10px 12px", fontSize: "11px", color: "#6b7280" }}>{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "40px 36px" }}>
            <div style={{ borderTop: "2px solid #d1d5db", width: "180px", paddingTop: "8px", textAlign: "center" }}><p style={{ fontSize: "12px", color: "#6b7280" }}>Received By</p><p style={{ fontSize: "11px", color: "#9ca3af" }}>Name & Signature</p></div>
            <div style={{ textAlign: "center" }}>{signature && <img src={signature} alt="Signature" style={{ height: "50px", objectFit: "contain", margin: "0 auto 4px" }} />}<div style={{ borderTop: `2px solid ${c.primary}`, width: "180px", paddingTop: "8px" }}><p style={{ fontWeight: 700, fontSize: "13px", color: c.primary }}>For {companyName}</p><p style={{ fontSize: "11px", color: "#6b7280" }}>Authorized Signatory</p></div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold">Delivery Challan</h1>
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
            <div><label className="block text-sm font-medium mb-1">Receiver Name *</label><input value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Receiver name" /></div>
            <div><label className="block text-sm font-medium mb-1">Challan No.</label><input value={dcNo} onChange={e => setDcNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Delivery Address</label><input value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Address" /></div>
            <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" value={dcDate} onChange={e => setDcDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Vehicle Number</label><input value={vehicleNo} onChange={e => setVehicleNo(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. CG04XX1234" /></div>
            <div><label className="block text-sm font-medium mb-1">Transport Mode</label><select value={transportMode} onChange={e => setTransportMode(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option>Road</option><option>Rail</option><option>Air</option><option>Ship</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Driver Name</label><input value={driverName} onChange={e => setDriverName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Driver name" /></div>
            <div><label className="block text-sm font-medium mb-1">Reason</label><select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option>Supply</option><option>Job Work</option><option>Exhibition</option><option>Return</option><option>Others</option></select></div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Materials</label>
              <button onClick={addItem} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start mb-2">
                <input value={item.desc} onChange={e => updateItem(idx, "desc", e.target.value)} placeholder="Material" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="number" value={item.qty || ""} onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 0)} className="w-16 px-2 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <select value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="w-20 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  {["Pcs", "Kg", "Ltr", "Mtr", "Box", "Set"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input value={item.remarks} onChange={e => updateItem(idx, "remarks", e.target.value)} placeholder="Remarks" className="w-32 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex justify-end"><button onClick={() => { if (!receiverName) { alert("Enter receiver name"); return; } setShowPreview(true); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Preview & Generate PDF →</button></div>
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
