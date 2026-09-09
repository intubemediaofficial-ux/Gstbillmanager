"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Firm } from "@/lib/gst-types";
import { brandingTemplates } from "@/components/documents/doc-templates";
import DocUploads, { useDocAssets } from "@/components/documents/DocUploads";

export default function VisitingCardPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [template, setTemplate] = useState(brandingTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const { letterhead, signature, setLetterhead, setSignature } = useDocAssets();
  const [showBack, setShowBack] = useState(false);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) {
        setSelectedFirm(f[0]);
        setAddress([f[0].address, f[0].city, f[0].state].filter(Boolean).join(", "));
        if (f[0].gstin) setGstNo(f[0].gstin);
      }
    });
  }, []);

  const selectFirm = (firm: Firm | null) => {
    setSelectedFirm(firm);
    if (firm) {
      setAddress([firm.address, firm.city, firm.state].filter(Boolean).join(", "));
      if (firm.gstin) setGstNo(firm.gstin);
    }
  };

  const handlePDF = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      await document.fonts.ready;
      const canvas = await html2canvas(docRef.current, { scale: 3, useCORS: true, logging: false, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [89, 51], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, 89, 51);
      pdf.save(`Visiting_Card_${name || "card"}.pdf`);
      fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "Visiting Card", title: `Visiting Card - ${name}`, recipientName: name, firmName: selectedFirm?.name || "", templateName: template.name, formData: { name, designation, mobile, email, website, address, gstNo, tagline } }) }).catch(() => {});
    } catch { window.print(); }
    finally { setPdfLoading(false); }
  };

  const handlePNG = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      await document.fonts.ready;
      const canvas = await html2canvas(docRef.current, { scale: 4, useCORS: true, logging: false });
      const link = document.createElement("a");
      link.download = `Visiting_Card_${name || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { /* noop */ }
    finally { setPdfLoading(false); }
  };

  const c = template.colors;
  const companyName = selectedFirm?.name || "Your Company";

  if (showPreview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div className="flex gap-2">
            <button onClick={() => setShowBack(!showBack)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">{showBack ? "Show Front" : "Show Back"}</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handlePNG} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"><Download className="w-4 h-4" /> PNG</button>
            <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF</button>
          </div>
        </div>
        <div className="flex justify-center">
          <div ref={docRef}>
            {!showBack ? (
              /* Front Card */
              <div style={{ width: "336px", height: "192px", background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, borderRadius: "12px", padding: "24px", color: "white", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: c.accent, opacity: 0.15 }} />
                <div style={{ position: "absolute", left: "-20px", bottom: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: c.accent, opacity: 0.1 }} />
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "0.5px" }}>{name || "Your Name"}</div>
                  <div style={{ fontSize: "10px", fontWeight: 500, opacity: 0.8, marginTop: "2px", letterSpacing: "2px", textTransform: "uppercase" }}>{designation || "Designation"}</div>
                </div>
                <div style={{ fontSize: "9px", opacity: 0.85, lineHeight: "1.6" }}>
                  {mobile && <div>📱 {mobile}</div>}
                  {email && <div>✉️ {email}</div>}
                  {website && <div>🌐 {website}</div>}
                  {address && <div>📍 {address}</div>}
                </div>
                <div style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "11px", fontWeight: 700, opacity: 0.6 }}>{companyName}</div>
              </div>
            ) : (
              /* Back Card */
              <div style={{ width: "336px", height: "192px", background: c.bg || "white", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", border: `2px solid ${c.primary}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})` }} />
                <div style={{ fontSize: "24px", fontWeight: 800, color: c.primary, letterSpacing: "1px" }}>{companyName}</div>
                {tagline && <div style={{ fontSize: "10px", color: c.secondary, marginTop: "4px", fontStyle: "italic" }}>{tagline}</div>}
                {gstNo && <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "12px" }}>GSTIN: {gstNo}</div>}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${c.secondary}, ${c.primary})` }} />
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-4 print:hidden">Standard business card size: 3.5" x 2" (89mm x 51mm)</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold">Visiting Card Maker</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6 space-y-4">
          {firms.length > 0 && (
            <div className="pb-4 border-b">
              <label className="block text-sm font-semibold mb-2">Company / Firm</label>
              <select value={selectedFirm?.id || ""} onChange={e => selectFirm(firms.find(f => f.id === e.target.value) || null)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Firm</option>
                {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Full Name *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Your name" /></div>
            <div><label className="block text-sm font-medium mb-1">Designation</label><input value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Director / Manager" /></div>
            <div><label className="block text-sm font-medium mb-1">Mobile</label><input value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="+91 99999 99999" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="email@company.com" /></div>
            <div><label className="block text-sm font-medium mb-1">Website</label><input value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="www.company.com" /></div>
            <div><label className="block text-sm font-medium mb-1">GST Number</label><input value={gstNo} onChange={e => setGstNo(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="GSTIN" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Company address" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Company Tagline (for back)</label><input value={tagline} onChange={e => setTagline(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Your Trusted Business Partner" /></div>
          </div>
          <div className="flex justify-end"><button onClick={() => { if (!name) { alert("Enter your name"); return; } setShowPreview(true); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Preview Card →</button></div>
        </div>
        <div>
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Choose Design</h3>
            <div className="space-y-3">
              {brandingTemplates.map(t => (
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
