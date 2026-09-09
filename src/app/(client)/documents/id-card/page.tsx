"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Firm } from "@/lib/gst-types";
import { brandingTemplates } from "@/components/documents/doc-templates";
import DocUploads, { useDocAssets } from "@/components/documents/DocUploads";

export default function IdCardPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [template, setTemplate] = useState(brandingTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const { letterhead, signature, setLetterhead, setSignature } = useDocAssets();
  const [showBack, setShowBack] = useState(false);

  const [empName, setEmpName] = useState("");
  const [empId, setEmpId] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [mobile, setMobile] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [validTill, setValidTill] = useState("");

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
    });
  }, []);

  const handlePNG = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(docRef.current, { scale: 4, useCORS: true, logging: false });
      const link = document.createElement("a");
      link.download = `ID_Card_${empName || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { /* noop */ }
    finally { setPdfLoading(false); }
  };

  const handlePDF = async () => {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(docRef.current, { scale: 3, useCORS: true, logging: false, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [54, 86], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, 54, 86);
      pdf.save(`ID_Card_${empName || "card"}.pdf`);
      fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "ID Card", title: `ID Card - ${empName}`, recipientName: empName, firmName: selectedFirm?.name || "", templateName: template.name, formData: { empName, empId, designation, department, mobile, bloodGroup, emergencyContact, validTill } }) }).catch(() => {});
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
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div className="flex gap-2">
            <button onClick={() => setShowBack(!showBack)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{showBack ? "Front" : "Back"}</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handlePNG} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"><Download className="w-4 h-4" /> PNG</button>
            <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">{pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF</button>
          </div>
        </div>
        <div className="flex justify-center">
          <div ref={docRef}>
            {!showBack ? (
              <div style={{ width: "204px", height: "324px", background: `linear-gradient(180deg, ${c.primary}, ${c.secondary})`, borderRadius: "12px", fontFamily: "'Inter', sans-serif", overflow: "hidden", position: "relative", color: "white" }}>
                <div style={{ padding: "16px 16px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.5px" }}>{companyName}</div>
                  <div style={{ fontSize: "8px", opacity: 0.7, marginTop: "2px" }}>{companyAddr}</div>
                </div>
                {/* Photo Placeholder */}
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", margin: "8px auto", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(255,255,255,0.4)", fontSize: "28px" }}>
                  👤
                </div>
                <div style={{ textAlign: "center", padding: "4px 16px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 800 }}>{empName || "Employee Name"}</div>
                  <div style={{ fontSize: "9px", fontWeight: 600, opacity: 0.8, letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>{designation || "Designation"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", margin: "8px 16px", borderRadius: "8px", padding: "8px 10px", fontSize: "9px" }}>
                  {empId && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ opacity: 0.7 }}>ID</span><span style={{ fontWeight: 600 }}>{empId}</span></div>}
                  {department && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ opacity: 0.7 }}>Dept</span><span style={{ fontWeight: 600 }}>{department}</span></div>}
                  {mobile && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ opacity: 0.7 }}>Mobile</span><span style={{ fontWeight: 600 }}>{mobile}</span></div>}
                  {bloodGroup && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ opacity: 0.7 }}>Blood</span><span style={{ fontWeight: 600 }}>{bloodGroup}</span></div>}
                </div>
                {validTill && <div style={{ position: "absolute", bottom: "8px", left: 0, right: 0, textAlign: "center", fontSize: "8px", opacity: 0.6 }}>Valid Till: {validTill}</div>}
              </div>
            ) : (
              <div style={{ width: "204px", height: "324px", background: "white", borderRadius: "12px", fontFamily: "'Inter', sans-serif", border: `2px solid ${c.primary}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: c.primary, textAlign: "center" }}>{companyName}</div>
                {selectedFirm?.gstin && <div style={{ fontSize: "8px", color: "#6b7280", marginTop: "4px" }}>GSTIN: {selectedFirm.gstin}</div>}
                <div style={{ width: "100%", height: "1px", background: c.primary, margin: "12px 0", opacity: 0.3 }} />
                {emergencyContact && <div style={{ fontSize: "9px", color: "#374151", textAlign: "center" }}><div style={{ fontWeight: 600, color: c.primary, marginBottom: "4px" }}>EMERGENCY CONTACT</div>{emergencyContact}</div>}
                <div style={{ fontSize: "8px", color: "#9ca3af", marginTop: "auto", textAlign: "center" }}>
                  If found, please return to:<br />{companyAddr}
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-4 print:hidden">Standard ID card size: 54mm x 86mm (CR80)</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold">ID Card Generator</h1>
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
            <div><label className="block text-sm font-medium mb-1">Employee Name *</label><input value={empName} onChange={e => setEmpName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Full name" /></div>
            <div><label className="block text-sm font-medium mb-1">Employee ID</label><input value={empId} onChange={e => setEmpId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. EMP-001" /></div>
            <div><label className="block text-sm font-medium mb-1">Designation</label><input value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Software Engineer" /></div>
            <div><label className="block text-sm font-medium mb-1">Department</label><input value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Engineering" /></div>
            <div><label className="block text-sm font-medium mb-1">Mobile</label><input value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="+91 99999 99999" /></div>
            <div><label className="block text-sm font-medium mb-1">Blood Group</label><select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option value="">Select</option>{["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Emergency Contact</label><input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Emergency phone number" /></div>
            <div><label className="block text-sm font-medium mb-1">Valid Till</label><input value={validTill} onChange={e => setValidTill(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Dec 2026" /></div>
          </div>
          <div className="flex justify-end"><button onClick={() => { if (!empName) { alert("Enter employee name"); return; } setShowPreview(true); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Preview Card →</button></div>
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
              ))}</div>
          </div>
          <DocUploads letterhead={letterhead} signature={signature} setLetterhead={setLetterhead} setSignature={setSignature} />
        </div>
      </div>
    </div>
  );
}
