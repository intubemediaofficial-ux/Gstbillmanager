"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Scan, Plus, Search, Camera, X, Volume2 } from "lucide-react";
import type { Product } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

export default function BarcodeScannerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedItems, setScannedItems] = useState<{ product: Product; qty: number }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "found" | "not_found">("idle");
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/products").then((r) => r.json()).then((res) => {
      setProducts(res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const findProductByBarcode = useCallback((barcode: string): Product | null => {
    const code = barcode.trim();
    return products.find((p) =>
      (p.barcode && p.barcode === code) ||
      p.hsn === code ||
      p.name.toLowerCase() === code.toLowerCase()
    ) || null;
  }, [products]);

  const addToCart = useCallback((product: Product) => {
    setScannedItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const startCamera = async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      html5QrRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.5 },
        (decodedText: string) => {
          setLastScanned(decodedText);
          const product = findProductByBarcode(decodedText);
          if (product) {
            addToCart(product);
            setScanStatus("found");
            try { new Audio("data:audio/wav;base64,UklGRl9vT19teleGZjdBIAAAABAAEARKwAAIhYAQACABAAZGF0YQoAAAAA").play(); } catch {}
          } else {
            setScanStatus("not_found");
          }
          setTimeout(() => setScanStatus("idle"), 2000);
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      alert("Camera access denied or not available. Please allow camera access.");
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    try {
      const scanner = html5QrRef.current as { stop: () => Promise<void> } | null;
      if (scanner) await scanner.stop();
    } catch {}
    html5QrRef.current = null;
    setScanning(false);
  };

  const handleManualSearch = () => {
    if (!manualBarcode.trim()) return;
    const product = findProductByBarcode(manualBarcode.trim());
    if (product) { addToCart(product); setScanStatus("found"); }
    else { setScanStatus("not_found"); alert(`No product found for: ${manualBarcode}\n\nPlease add this product first in Products page with the barcode number.`); }
    setLastScanned(manualBarcode);
    setManualBarcode("");
    setTimeout(() => setScanStatus("idle"), 2000);
  };

  const removeFromCart = (productId: string) => {
    setScannedItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setScannedItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, qty } : i));
  };

  const total = scannedItems.reduce((sum, i) => sum + i.product.rate * i.qty, 0);
  const totalGst = scannedItems.reduce((sum, i) => sum + (i.product.rate * i.qty * (i.product.gstRate || 18)) / 100, 0);

  const handleCreateInvoice = () => {
    const params = new URLSearchParams();
    params.set("barcode_items", JSON.stringify(scannedItems.map((i) => ({ name: i.product.name, hsn: i.product.hsn, qty: i.qty, rate: i.product.rate, gstRate: i.product.gstRate || 18, unit: i.product.unit || "PCS" }))));
    window.location.href = `/create-invoice?${params.toString()}`;
  };

  const filtered = searchQuery ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.hsn?.includes(searchQuery) || (p.barcode || "").includes(searchQuery)) : [];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Scan className="w-6 h-6" /> Barcode Scanner & Quick Bill</h1>
          <p className="text-sm text-gray-500 mt-1">Scan product barcodes or search to quickly add items to invoice</p>
        </div>
      </div>

      {/* Status Banner */}
      {scanStatus === "found" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm font-medium">
          <Volume2 className="w-4 h-4" /> Product found! Added to cart — {lastScanned}
        </div>
      )}
      {scanStatus === "not_found" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          No product found for barcode: {lastScanned} — Add it in Products page first with this barcode number.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner / Search Side */}
        <div className="space-y-4">
          {/* Camera Scanner */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><Camera className="w-4 h-4" /> Camera Scanner</h3>
              {scanning ? (
                <button onClick={stopCamera} className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-lg font-medium flex items-center gap-1">
                  <X className="w-3 h-3" /> Stop
                </button>
              ) : (
                <button onClick={startCamera} className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg font-medium flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Start Camera
                </button>
              )}
            </div>
            <div ref={scannerRef} id="barcode-reader" className={`${scanning ? "" : "hidden"} rounded-lg overflow-hidden mb-3`} />
            {!scanning && (
              <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed">
                <Camera className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500 font-medium">Camera बंद है</p>
                <p className="text-xs text-gray-400 mt-1">&quot;Start Camera&quot; click करो → product barcode scan करो</p>
              </div>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Supported Barcodes:</p>
              <p className="text-xs text-gray-400">EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39, QR Code, ITF</p>
            </div>
          </div>

          {/* Manual Barcode/HSN Entry */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> Manual Entry (Barcode / HSN)</h3>
            <div className="flex gap-2">
              <input value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Enter barcode number or HSN code" className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono" />
              <button onClick={handleManualSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                Find
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Product packet पर जो number लिखा है वो enter करो</p>
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Quick Product Search</h3>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products by name, HSN or barcode..."
              className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />
            {filtered.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtered.slice(0, 10).map((p) => (
                  <button key={p.id} onClick={() => { addToCart(p); setSearchQuery(""); }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-left text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">HSN: {p.hsn || "—"} {p.barcode ? `| Barcode: ${p.barcode}` : ""} | {formatCurrency(p.rate)}</p>
                    </div>
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">कैसे काम करता है?</h3>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>पहले <b>Products</b> page में products add करो + barcode number डालो</li>
              <li>Camera start करो → product का barcode scan करो</li>
              <li>Product automatic cart में add हो जाएगा</li>
              <li>&quot;Create Invoice&quot; click → Invoice ready!</li>
            </ol>
          </div>
        </div>

        {/* Cart / Scanned Items */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Scanned Items ({scannedItems.length})</h3>
          {scannedItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Scan className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No items scanned yet</p>
              <p className="text-xs mt-1">Scan a barcode or search to add items</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                {scannedItems.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">HSN: {item.product.hsn || "—"} {item.product.barcode ? `| BC: ${item.product.barcode}` : ""} | Rate: {formatCurrency(item.product.rate)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-7 h-7 rounded bg-gray-200 text-sm font-bold">−</button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="w-7 h-7 rounded bg-gray-200 text-sm font-bold">+</button>
                      <span className="text-sm font-bold w-20 text-right">{formatCurrency(item.product.rate * item.qty)}</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 ml-2"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">GST</span><span>{formatCurrency(totalGst)}</span></div>
                <div className="flex justify-between text-base font-bold"><span>Grand Total</span><span className="text-indigo-600">{formatCurrency(total + totalGst)}</span></div>
              </div>

              <button onClick={handleCreateInvoice}
                className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition text-sm">
                🧾 Create Invoice with Items ({scannedItems.length})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
