"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image, PenTool, X, FileText, Download, Trash2 } from "lucide-react";
import { fileToDataUrl } from "@/lib/image-utils";

const STORAGE_KEY_LETTERHEAD = "doc_letterhead";
const STORAGE_KEY_SIGNATURE = "doc_signature";

export default function AdminDocumentSettingsPage() {
  const [letterhead, setLetterhead] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const lhRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const lh = localStorage.getItem(STORAGE_KEY_LETTERHEAD);
      const sig = localStorage.getItem(STORAGE_KEY_SIGNATURE);
      if (lh) setLetterhead(lh);
      if (sig) setSignature(sig);
    } catch { /* noop */ }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "letterhead" | "signature") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: url } = await fileToDataUrl(file, type === "letterhead" ? { maxDim: 1600, quality: 0.85 } : { maxDim: 800, quality: 0.9, format: "png" });
    if (type === "letterhead") {
      setLetterhead(url);
      try { localStorage.setItem(STORAGE_KEY_LETTERHEAD, url); } catch { /* noop */ }
    } else {
      setSignature(url);
      try { localStorage.setItem(STORAGE_KEY_SIGNATURE, url); } catch { /* noop */ }
    }
    e.target.value = "";
  };

  const remove = (type: "letterhead" | "signature") => {
    if (type === "letterhead") {
      setLetterhead(null);
      try { localStorage.removeItem(STORAGE_KEY_LETTERHEAD); } catch { /* noop */ }
    } else {
      setSignature(null);
      try { localStorage.removeItem(STORAGE_KEY_SIGNATURE); } catch { /* noop */ }
    }
  };

  const handleDownload = (dataUrl: string, name: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = name;
    link.click();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Settings</h1>
          <p className="text-sm text-gray-500">Manage company letterhead and signature for all documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Letterhead */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Image className="w-5 h-5 text-indigo-500" /> Company Letterhead
          </h3>
          <p className="text-sm text-gray-500 mb-4">This image appears as a watermark background on all generated documents (A4 size recommended)</p>

          {letterhead ? (
            <div>
              <div className="relative border rounded-xl overflow-hidden bg-gray-50 p-4">
                <img src={letterhead} alt="Letterhead" className="w-full object-contain max-h-64 rounded-lg" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleDownload(letterhead, "letterhead.png")} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={() => lhRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                  <Upload className="w-4 h-4" /> Replace
                </button>
                <button onClick={() => remove("letterhead")} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
              <p className="text-xs text-green-600 mt-3 font-medium">Letterhead is active — showing on all documents</p>
            </div>
          ) : (
            <button onClick={() => lhRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-12 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-500">Click to upload company letterhead</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG — A4 size (210 x 297 mm)</p>
            </button>
          )}
          <input ref={lhRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, "letterhead")} />
        </div>

        {/* Signature */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-violet-500" /> Director / Authorized Signature
          </h3>
          <p className="text-sm text-gray-500 mb-4">This signature auto-populates in all document signature areas</p>

          {signature ? (
            <div>
              <div className="relative border rounded-xl overflow-hidden bg-white p-6 flex justify-center">
                <img src={signature} alt="Signature" className="h-24 object-contain" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleDownload(signature, "signature.png")} className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-lg text-sm font-medium hover:bg-violet-100">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={() => sigRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                  <Upload className="w-4 h-4" /> Replace
                </button>
                <button onClick={() => remove("signature")} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
              <p className="text-xs text-green-600 mt-3 font-medium">Signature is active — auto-added to all documents</p>
            </div>
          ) : (
            <button onClick={() => sigRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-12 text-center hover:border-violet-400 hover:bg-violet-50/50 transition cursor-pointer">
              <PenTool className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-500">Click to upload signature</p>
              <p className="text-xs text-gray-400 mt-1">PNG with transparent background recommended</p>
            </button>
          )}
          <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, "signature")} />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h3>
        <p className="text-sm text-gray-500 mb-4">Preview how letterhead and signature appear on a document</p>
        <div className="border rounded-xl overflow-hidden max-w-[210mm] mx-auto" style={{ minHeight: "200px", position: "relative", background: "#ffffff" }}>
          {letterhead && <img src={letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}
          <div style={{ padding: "40px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", padding: "20px", borderRadius: "8px", color: "white", marginBottom: "20px" }}>
              <div style={{ fontSize: "22px", fontWeight: 800 }}>Your Company Name</div>
              <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>Company Address, City, State</div>
            </div>
            <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#374151" }}>
              <p>This is a preview of how your letterhead appears as a watermark background and your signature appears in the signature area of the document.</p>
              <p style={{ marginTop: "12px" }}>All 15+ document types (Offer Letter, Quotation, Payment Receipt, etc.) will use these uploaded assets automatically.</p>
            </div>
            <div style={{ marginTop: "60px" }}>
              {signature && <img src={signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
              <div style={{ borderTop: "2px solid #4f46e5", width: "200px", paddingTop: "8px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: "#4f46e5" }}>Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <p className="text-sm text-blue-800 font-medium">How it works:</p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Letterhead appears as a subtle watermark (15% opacity) behind all document content</li>
          <li>Signature auto-populates in every document&apos;s signature area</li>
          <li>Both persist across page navigations and sessions (stored locally)</li>
          <li>Clients can also upload from any document&apos;s template section</li>
        </ul>
      </div>
    </div>
  );
}
