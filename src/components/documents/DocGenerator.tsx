"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Download, Printer, Share2, Mail, Loader2 } from "lucide-react";
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

interface DocGeneratorProps {
  title: string;
  fields: FieldDef[];
  templates: TemplateDef[];
  renderDoc: (data: Record<string, string>, template: TemplateDef, firm: Firm | null) => React.ReactNode;
}

export default function DocGenerator({ title, fields, templates, renderDoc }: DocGeneratorProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/firms").then(r => r.json()).then(res => {
      const f = res.data || [];
      setFirms(f);
      if (f.length === 1) setSelectedFirm(f[0]);
    });
  }, []);

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
          {renderDoc(form, selectedTemplate, selectedFirm)}
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

        {/* Template Selection */}
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
      </div>
    </div>
  );
}
