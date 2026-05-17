"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Image, PenTool, X } from "lucide-react";

const STORAGE_KEY_LETTERHEAD = "doc_letterhead";
const STORAGE_KEY_SIGNATURE = "doc_signature";

export function useDocAssets() {
  const [letterhead, setLetterhead] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    try {
      const lh = localStorage.getItem(STORAGE_KEY_LETTERHEAD);
      const sig = localStorage.getItem(STORAGE_KEY_SIGNATURE);
      if (lh) setLetterhead(lh);
      if (sig) setSignature(sig);
    } catch { /* noop */ }
  }, []);

  const setAndSaveLetterhead = (v: string | null) => {
    setLetterhead(v);
    try { if (v) localStorage.setItem(STORAGE_KEY_LETTERHEAD, v); else localStorage.removeItem(STORAGE_KEY_LETTERHEAD); } catch { /* noop */ }
  };

  const setAndSaveSignature = (v: string | null) => {
    setSignature(v);
    try { if (v) localStorage.setItem(STORAGE_KEY_SIGNATURE, v); else localStorage.removeItem(STORAGE_KEY_SIGNATURE); } catch { /* noop */ }
  };

  return { letterhead, signature, setLetterhead: setAndSaveLetterhead, setSignature: setAndSaveSignature };
}

interface Props {
  letterhead: string | null;
  signature: string | null;
  setLetterhead: (v: string | null) => void;
  setSignature: (v: string | null) => void;
}

export default function DocUploads({ letterhead, signature, setLetterhead, setSignature }: Props) {
  const lhRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "lh" | "sig") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      type === "lh" ? setLetterhead(url) : setSignature(url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      {/* Letterhead Upload */}
      <div className="bg-white rounded-xl border p-6 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Image className="w-4 h-4 text-indigo-500" /> Company Letterhead
        </h3>
        <p className="text-xs text-gray-400 mb-3">Upload company letterhead — used as document background</p>
        {letterhead ? (
          <div className="relative">
            <img src={letterhead} alt="Letterhead" className="w-full rounded-lg border object-contain max-h-32" />
            <button onClick={() => setLetterhead(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-3 h-3" /></button>
            <p className="text-xs text-green-600 mt-2 font-medium">Letterhead uploaded</p>
          </div>
        ) : (
          <button onClick={() => lhRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition">
            <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">Click to upload letterhead</p>
            <p className="text-xs text-gray-400">PNG, JPG (A4 size)</p>
          </button>
        )}
        <input ref={lhRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, "lh")} />
      </div>

      {/* Signature Upload */}
      <div className="bg-white rounded-xl border p-6 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-violet-500" /> Signature
        </h3>
        <p className="text-xs text-gray-400 mb-3">Upload signature — appears on all documents</p>
        {signature ? (
          <div className="relative">
            <img src={signature} alt="Signature" className="h-16 rounded border object-contain bg-white p-1" />
            <button onClick={() => setSignature(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-3 h-3" /></button>
            <p className="text-xs text-green-600 mt-2 font-medium">Signature uploaded</p>
          </div>
        ) : (
          <button onClick={() => sigRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-violet-400 hover:bg-violet-50/50 transition">
            <PenTool className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">Click to upload signature</p>
            <p className="text-xs text-gray-400">PNG with transparent background</p>
          </button>
        )}
        <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, "sig")} />
      </div>
    </>
  );
}
