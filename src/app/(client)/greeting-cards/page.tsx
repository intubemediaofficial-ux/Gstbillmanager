"use client";

import { useState, useEffect, useRef } from "react";
import { Image, Download, Share2, Palette } from "lucide-react";
import type { Firm } from "@/lib/gst-types";

const FESTIVALS = [
  { id: "diwali", name: "Diwali", emoji: "🪔", bg: "from-amber-500 to-orange-600", text: "Happy Diwali!", sub: "May this festival of lights bring joy, wealth and happiness to you and your family." },
  { id: "holi", name: "Holi", emoji: "🎨", bg: "from-pink-500 to-purple-600", text: "Happy Holi!", sub: "Wishing you a colorful and joyful celebration!" },
  { id: "eid", name: "Eid", emoji: "🌙", bg: "from-emerald-600 to-teal-700", text: "Eid Mubarak!", sub: "May this blessed occasion bring peace, happiness and prosperity to you." },
  { id: "newyear", name: "New Year", emoji: "🎉", bg: "from-blue-600 to-indigo-700", text: "Happy New Year!", sub: "Wishing you a prosperous and successful year ahead!" },
  { id: "christmas", name: "Christmas", emoji: "🎄", bg: "from-red-600 to-green-700", text: "Merry Christmas!", sub: "May your Christmas be filled with joy, love and happiness." },
  { id: "independence", name: "Independence Day", emoji: "🇮🇳", bg: "from-orange-500 via-white to-green-600", text: "Happy Independence Day!", sub: "Jai Hind! Proud to be Indian." },
  { id: "republic", name: "Republic Day", emoji: "🇮🇳", bg: "from-orange-600 to-green-700", text: "Happy Republic Day!", sub: "Celebrating the spirit of our great nation." },
  { id: "raksha", name: "Raksha Bandhan", emoji: "🧵", bg: "from-pink-500 to-rose-600", text: "Happy Raksha Bandhan!", sub: "Celebrating the beautiful bond of love and protection." },
  { id: "ganesh", name: "Ganesh Chaturthi", emoji: "🐘", bg: "from-orange-500 to-red-600", text: "Ganpati Bappa Morya!", sub: "May Lord Ganesha bless you with wisdom and prosperity." },
  { id: "navratri", name: "Navratri", emoji: "🔱", bg: "from-red-500 to-orange-600", text: "Happy Navratri!", sub: "May Goddess Durga bless you with strength and prosperity." },
  { id: "makar", name: "Makar Sankranti", emoji: "🪁", bg: "from-sky-500 to-blue-600", text: "Happy Makar Sankranti!", sub: "May this harvest festival bring abundance and joy." },
  { id: "thankyou", name: "Thank You", emoji: "🙏", bg: "from-indigo-500 to-purple-600", text: "Thank You!", sub: "We truly value your association and support." },
];

export default function GreetingCardsPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [selectedFestival, setSelectedFestival] = useState(FESTIVALS[0]);
  const [customMessage, setCustomMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/firms").then((r) => r.json()).then((res) => {
      const f = res.data || [];
      setFirms(f);
      if (f.length > 0) setSelectedFirm(f[0]);
    });
  }, []);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const colors: Record<string, [string, string]> = {
      "from-amber-500 to-orange-600": ["#f59e0b", "#ea580c"],
      "from-pink-500 to-purple-600": ["#ec4899", "#9333ea"],
      "from-emerald-600 to-teal-700": ["#059669", "#0f766e"],
      "from-blue-600 to-indigo-700": ["#2563eb", "#4338ca"],
      "from-red-600 to-green-700": ["#dc2626", "#15803d"],
      "from-orange-500 via-white to-green-600": ["#f97316", "#16a34a"],
      "from-orange-600 to-green-700": ["#ea580c", "#15803d"],
      "from-pink-500 to-rose-600": ["#ec4899", "#e11d48"],
      "from-orange-500 to-red-600": ["#f97316", "#dc2626"],
      "from-red-500 to-orange-600": ["#ef4444", "#ea580c"],
      "from-sky-500 to-blue-600": ["#0ea5e9", "#2563eb"],
      "from-indigo-500 to-purple-600": ["#6366f1", "#9333ea"],
    };
    const [c1, c2] = colors[selectedFestival.bg] || ["#6366f1", "#9333ea"];
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative pattern
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1080, Math.random() * 1080, Math.random() * 100 + 20, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Emoji
    ctx.font = "120px serif";
    ctx.textAlign = "center";
    ctx.fillText(selectedFestival.emoji, 540, 300);

    // Main text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(selectedFestival.text, 540, 450);

    // Sub text
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const subLines = wrapText(ctx, customMessage || selectedFestival.sub, 900);
    subLines.forEach((line, i) => {
      ctx.fillText(line, 540, 520 + i * 40);
    });

    // Company info at bottom
    if (selectedFirm) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 880, 1080, 200);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(selectedFirm.name, 540, 940);
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`${selectedFirm.address || ""} ${selectedFirm.city || ""}`.trim(), 540, 980);
      if (selectedFirm.phone) ctx.fillText(`📞 ${selectedFirm.phone}`, 540, 1015);
      if (selectedFirm.gstin) {
        ctx.font = "18px sans-serif";
        ctx.fillText(`GSTIN: ${selectedFirm.gstin}`, 540, 1050);
      }
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else currentLine = testLine;
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  useEffect(() => { generateCard(); }, [selectedFestival, selectedFirm, customMessage]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${selectedFestival.name}_${selectedFirm?.name || "Company"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleWhatsAppShare = () => {
    const text = `${selectedFestival.text}\n\n${customMessage || selectedFestival.sub}\n\nFrom: ${selectedFirm?.name || ""}\n${selectedFirm?.phone ? `📞 ${selectedFirm.phone}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Image className="w-6 h-6" /> Greeting Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Create festival greetings with your company logo & share on WhatsApp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          {/* Firm Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="text-sm font-medium mb-2 block">Your Company</label>
            <select value={selectedFirm?.id || ""} onChange={(e) => setSelectedFirm(firms.find((f) => f.id === e.target.value) || null)}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              {firms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* Festival Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2"><Palette className="w-4 h-4" /> Select Festival</label>
            <div className="grid grid-cols-3 gap-2">
              {FESTIVALS.map((f) => (
                <button key={f.id} onClick={() => setSelectedFestival(f)}
                  className={`p-2 rounded-lg border-2 text-center transition text-xs ${selectedFestival.id === f.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <span className="text-lg block">{f.emoji}</span>
                  <span className="font-medium">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="text-sm font-medium mb-2 block">Custom Message (optional)</label>
            <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={selectedFestival.sub} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              <Download className="w-5 h-5" /> Download Image
            </button>
            <button onClick={handleWhatsAppShare} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              <Share2 className="w-5 h-5" /> Share WhatsApp
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm font-medium mb-3">Preview</p>
          <canvas ref={canvasRef} className="w-full rounded-lg shadow-md" style={{ maxWidth: 500 }} />
        </div>
      </div>
    </div>
  );
}
