"use client";

import { useState, useEffect, useRef } from "react";
import { CreditCard, Download, Share2, QrCode, Phone, Mail, Globe, MapPin, Building2 } from "lucide-react";

interface CardData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  gstin: string;
  logoUrl: string;
  tagline: string;
  theme: string;
}

const THEMES = [
  { id: "royal", name: "Royal Blue", bg: "from-blue-900 to-blue-700", text: "white", accent: "#c9a84c" },
  { id: "dark", name: "Dark Elegant", bg: "from-gray-900 to-gray-800", text: "white", accent: "#e2b040" },
  { id: "green", name: "Fresh Green", bg: "from-emerald-800 to-emerald-600", text: "white", accent: "#fbbf24" },
  { id: "maroon", name: "Classic Maroon", bg: "from-red-900 to-red-800", text: "white", accent: "#f59e0b" },
  { id: "purple", name: "Premium Purple", bg: "from-purple-900 to-purple-700", text: "white", accent: "#a78bfa" },
  { id: "white", name: "Clean White", bg: "from-white to-gray-50", text: "gray-900", accent: "#2563eb" },
];

export default function BusinessCardPage() {
  const [card, setCard] = useState<CardData>({
    name: "", title: "", company: "", phone: "", email: "", website: "", address: "", gstin: "", logoUrl: "", tagline: "", theme: "royal",
  });
  const [firms, setFirms] = useState<{ name: string; phone: string; email: string; address: string; city: string; state: string; gstin: string; logoUrl: string }[]>([]);
  const [qrText, setQrText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/my-firms").then((r) => r.json()).then((res) => {
      const data = res.data || [];
      setFirms(data);
      if (data.length > 0) {
        const f = data[0];
        setCard((prev) => ({
          ...prev,
          company: f.name || "",
          phone: f.phone || "",
          email: f.email || "",
          address: [f.address, f.city, f.state].filter(Boolean).join(", "),
          gstin: f.gstin || "",
          logoUrl: f.logoUrl || "",
        }));
      }
    });
  }, []);

  useEffect(() => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\nORG:${card.company}\nTEL:${card.phone}\nEMAIL:${card.email}\nURL:${card.website}\nADR:;;${card.address}\nTITLE:${card.title}\nNOTE:GSTIN: ${card.gstin}\nEND:VCARD`;
    setQrText(vcard);
    // Generate QR code data URL
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(vcard, { width: 200, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
        .then((url: string) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(""));
    }).catch(() => {});
  }, [card]);

  const selectedTheme = THEMES.find((t) => t.id === card.theme) || THEMES[0];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas-pro")).default;
    await document.fonts.ready;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
    const link = document.createElement("a");
    link.download = `Business_Card_${card.name || "card"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas-pro")).default;
    await document.fonts.ready;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.share) {
        const file = new File([blob], "business-card.png", { type: "image/png" });
        await navigator.share({ title: `${card.name} - ${card.company}`, files: [file] });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(`${card.name} - ${card.company}\nPhone: ${card.phone}\nEmail: ${card.email}`)}`;
        window.open(url, "_blank");
      }
    });
  };

  const loadFirm = (idx: number) => {
    const f = firms[idx];
    if (!f) return;
    setCard((prev) => ({
      ...prev,
      company: f.name || "", phone: f.phone || "", email: f.email || "",
      address: [f.address, f.city, f.state].filter(Boolean).join(", "),
      gstin: f.gstin || "", logoUrl: f.logoUrl || "",
    }));
  };

  const isWhiteTheme = card.theme === "white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6" /> Digital Business Card</h1>
          <p className="text-sm text-gray-500 mt-1">Create and share your digital visiting card with QR code</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          {/* Firm Selector */}
          {firms.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Load from My Firms</label>
              <select onChange={(e) => loadFirm(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm">
                {firms.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
              </select>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Personal Details</h3>
            <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Your Name *" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input value={card.title} onChange={(e) => setCard({ ...card, title: e.target.value })} placeholder="Title (e.g. Owner, Director, Manager)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input value={card.tagline} onChange={(e) => setCard({ ...card, tagline: e.target.value })} placeholder="Tagline (e.g. Quality Products Since 2010)" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Company Details</h3>
            <input value={card.company} onChange={(e) => setCard({ ...card, company: e.target.value })} placeholder="Company Name *" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input value={card.phone} onChange={(e) => setCard({ ...card, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
              <input value={card.email} onChange={(e) => setCard({ ...card, email: e.target.value })} placeholder="Email" className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <input value={card.website} onChange={(e) => setCard({ ...card, website: e.target.value })} placeholder="Website (e.g. www.example.com)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input value={card.address} onChange={(e) => setCard({ ...card, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input value={card.gstin} onChange={(e) => setCard({ ...card, gstin: e.target.value })} placeholder="GSTIN (optional)" className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
          </div>

          {/* Theme Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-sm mb-3">Card Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => setCard({ ...card, theme: t.id })}
                  className={`p-3 rounded-lg text-xs font-medium border-2 transition ${card.theme === t.id ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200"}`}>
                  <div className={`w-full h-6 rounded bg-gradient-to-r ${t.bg} mb-1`} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-600">Preview</h3>
          <div ref={cardRef} className={`rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${selectedTheme.bg} p-6 max-w-md mx-auto`} style={{ aspectRatio: "1.75/1" }}>
            <div className="flex flex-col justify-between h-full">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  {card.logoUrl && <img src={card.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded mb-2" />}
                  <h2 className={`text-xl font-bold ${isWhiteTheme ? "text-gray-900" : "text-white"}`}>{card.name || "Your Name"}</h2>
                  {card.title && <p className={`text-sm ${isWhiteTheme ? "text-gray-600" : "text-white/80"}`}>{card.title}</p>}
                  <p className="text-sm font-semibold" style={{ color: selectedTheme.accent }}>{card.company || "Company Name"}</p>
                  {card.tagline && <p className={`text-xs mt-1 italic ${isWhiteTheme ? "text-gray-500" : "text-white/60"}`}>{card.tagline}</p>}
                </div>
                {/* QR Code */}
                <div className="bg-white p-1.5 rounded-lg">
                  <div className="w-16 h-16 flex items-center justify-center">
                    {qrDataUrl ? <img src={qrDataUrl} alt="QR Code" className="w-16 h-16" /> : <QrCode className="w-12 h-12 text-gray-800" />}
                  </div>
                </div>
              </div>

              {/* Bottom - Contact */}
              <div className={`space-y-1 ${isWhiteTheme ? "text-gray-600" : "text-white/90"}`}>
                <div className="w-full h-px mb-2" style={{ backgroundColor: selectedTheme.accent, opacity: 0.4 }} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {card.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" style={{ color: selectedTheme.accent }} />{card.phone}</span>}
                  {card.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" style={{ color: selectedTheme.accent }} />{card.email}</span>}
                  {card.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" style={{ color: selectedTheme.accent }} />{card.website}</span>}
                </div>
                {card.address && <p className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" style={{ color: selectedTheme.accent }} />{card.address}</p>}
                {card.gstin && <p className="text-xs flex items-center gap-1"><Building2 className="w-3 h-3 flex-shrink-0" style={{ color: selectedTheme.accent }} />GSTIN: {card.gstin}</p>}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">Card will be downloaded as high-resolution PNG image</p>

          {/* Back Side Preview */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-600">Back Side (QR Code)</h3>
            <div className={`rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${selectedTheme.bg} p-6 max-w-md mx-auto flex items-center justify-center`} style={{ aspectRatio: "1.75/1" }}>
              <div className="text-center">
                <div className="bg-white p-4 rounded-xl inline-block mb-3">
                  {qrDataUrl ? <img src={qrDataUrl} alt="QR Code" className="w-24 h-24" /> : <QrCode className="w-24 h-24 text-gray-800" />}
                </div>
                <p className={`text-sm font-semibold ${isWhiteTheme ? "text-gray-900" : "text-white"}`}>Scan to save contact</p>
                <p className="text-xs mt-1" style={{ color: selectedTheme.accent }}>{card.company || "Company Name"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
