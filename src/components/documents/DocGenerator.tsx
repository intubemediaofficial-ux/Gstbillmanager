"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Download, Printer, Share2, Loader2, Upload, Image, PenTool, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Firm } from "@/lib/gst-types";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "select" | "number";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  half?: boolean;
}

export interface TemplateDef {
  id: string;
  name: string;
  colors: { primary: string; secondary: string; accent: string; bg: string };
}

export interface DocAssets {
  letterhead: string | null;
  signature: string | null;
}

interface DocGeneratorProps {
  title: string;
  fields: FieldDef[];
  templates: TemplateDef[];
  renderDoc: (data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) => React.ReactNode;
}

const STORAGE_KEY_LETTERHEAD = "doc_letterhead";
const STORAGE_KEY_SIGNATURE = "doc_signature";

export default function DocGenerator({ title, fields, templates, renderDoc }: DocGeneratorProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [letterhead, setLetterhead] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const letterheadRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
    });
    try {
      const savedLH = localStorage.getItem(STORAGE_KEY_LETTERHEAD);
      const savedSig = localStorage.getItem(STORAGE_KEY_SIGNATURE);
      if (savedLH) setLetterhead(savedLH);
      if (savedSig) setSignature(savedSig);
    } catch { /* noop */ }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "letterhead" | "signature") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === "letterhead") {
        setLetterhead(dataUrl);
        try { localStorage.setItem(STORAGE_KEY_LETTERHEAD, dataUrl); } catch { /* noop */ }
      } else {
        setSignature(dataUrl);
        try { localStorage.setItem(STORAGE_KEY_SIGNATURE, dataUrl); } catch { /* noop */ }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeFile = (type: "letterhead" | "signature") => {
    if (type === "letterhead") {
      setLetterhead(null);
      try { localStorage.removeItem(STORAGE_KEY_LETTERHEAD); } catch { /* noop */ }
    } else {
      setSignature(null);
      try { localStorage.removeItem(STORAGE_KEY_SIGNATURE); } catch { /* noop */ }
    }
  };

  const set = (name: string, value: string) => setForm(prev => ({ ...prev, [name]: value }));

  const handlePreview = () => {
    const missing = fields.filter(f => f.required && !form[f.name]);
    if (missing.length > 0) {
      alert(`Please fill: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    setShowPreview(true);
  };

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
      pdf.save(`${title.replace(/\s+/g, "_")}_${form[fields[0]?.name] || "document"}.pdf`);
    } catch { window.print(); }
    finally { setPdfLoading(false); }
  };

  const handleWhatsApp = () => {
    const name = form[fields[0]?.name] || "";
    const text = `📄 *${title}*\n👤 ${name}\n🏢 ${selectedFirm?.name || ""}\n\nGenerated via GST Bill Manager`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePrint = () => window.print();

  const assets: DocAssets = { letterhead, signature };

  if (showPreview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Form
          </button>
          <div className="flex gap-2">
            <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              <Share2 className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
        <div ref={docRef} className="bg-white max-w-[210mm] mx-auto shadow-lg print:shadow-none">
          {renderDoc(form, selectedTemplate, selectedFirm, assets)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          {/* Firm Selection */}
          {firms.length > 0 && (
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company / Firm</label>
              <select
                value={selectedFirm?.id || ""}
                onChange={(e) => setSelectedFirm(firms.find(f => f.id === e.target.value) || null)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Firm</option>
                {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.name} className={f.half === false ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={form[f.name] || ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                ) : f.type === "select" ? (
                  <select
                    value={form[f.name] || ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select...</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    value={form[f.name] || ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handlePreview} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
              Preview & Generate PDF →
            </button>
          </div>
        </div>

        {/* Template Selection + Uploads */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Choose Template</h3>
            <div className="space-y-3">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition ${
                    selectedTemplate.id === t.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})` }} />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">Professional design</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Letterhead Upload */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-indigo-500" /> Company Letterhead
            </h3>
            <p className="text-xs text-gray-400 mb-3">Upload your company letterhead — it will be used as background on the document (A4 size recommended)</p>
            {letterhead ? (
              <div className="relative">
                <img src={letterhead} alt="Letterhead" className="w-full rounded-lg border object-contain max-h-32" />
                <button onClick={() => removeFile("letterhead")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs text-green-600 mt-2 font-medium">Letterhead uploaded — will appear on document</p>
              </div>
            ) : (
              <button onClick={() => letterheadRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition">
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-sm text-gray-500">Click to upload letterhead</p>
                <p className="text-xs text-gray-400">PNG, JPG (A4 size)</p>
              </button>
            )}
            <input ref={letterheadRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "letterhead")} />
          </div>

          {/* Signature Upload */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-violet-500" /> Signature
            </h3>
            <p className="text-xs text-gray-400 mb-3">Upload signature — it will appear on all documents automatically</p>
            {signature ? (
              <div className="relative">
                <img src={signature} alt="Signature" className="h-16 rounded border object-contain bg-white p-1" />
                <button onClick={() => removeFile("signature")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs text-green-600 mt-2 font-medium">Signature uploaded — will appear on all documents</p>
              </div>
            ) : (
              <button onClick={() => signatureRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-violet-400 hover:bg-violet-50/50 transition">
                <PenTool className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-sm text-gray-500">Click to upload signature</p>
                <p className="text-xs text-gray-400">PNG with transparent background recommended</p>
              </button>
            )}
            <input ref={signatureRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "signature")} />
          </div>
        </div>
      </div>
    </div>
  );
}
