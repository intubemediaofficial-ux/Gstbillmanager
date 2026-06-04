"use client";

import { useState, useRef, useEffect } from "react";
import { Scan, Plus, Search, Camera, X } from "lucide-react";
import type { Product } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

export default function BarcodeScannerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedItems, setScannedItems] = useState<{ product: Product; qty: number }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/products").then((r) => r.json()).then((res) => {
      setProducts(res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setScanning(true);
    } catch {
      alert("Camera access denied. Please allow camera access for barcode scanning.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const findProductByBarcode = (barcode: string): Product | null => {
    return products.find((p) => p.hsn === barcode || p.name.toLowerCase().includes(barcode.toLowerCase())) || null;
  };

  const handleManualSearch = () => {
    if (!manualBarcode.trim()) return;
    const product = findProductByBarcode(manualBarcode.trim());
    if (product) addToCart(product);
    else alert(`No product found for barcode/HSN: ${manualBarcode}`);
    setManualBarcode("");
  };

  const addToCart = (product: Product) => {
    setScannedItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
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

  const filtered = searchQuery ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.hsn?.includes(searchQuery)) : [];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Scan className="w-6 h-6" /> Barcode Scanner & Quick Bill</h1>
          <p className="text-sm text-gray-500 mt-1">Scan product barcodes or search by HSN to quickly add items to invoice</p>
        </div>
      </div>

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
            {scanning && (
              <div className="relative bg-black rounded-lg overflow-hidden mb-3">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-24 border-2 border-green-400 rounded-lg" />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">Point camera at barcode. Alternatively, use manual entry below.</p>
          </div>

          {/* Manual Barcode/HSN Entry */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> Manual Entry (HSN/Barcode)</h3>
            <div className="flex gap-2">
              <input value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Enter HSN code or barcode number" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={handleManualSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                Find
              </button>
            </div>
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Quick Product Search</h3>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products by name or HSN..."
              className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />
            {filtered.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtered.slice(0, 10).map((p) => (
                  <button key={p.id} onClick={() => { addToCart(p); setSearchQuery(""); }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-left text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">HSN: {p.hsn || "—"} | {formatCurrency(p.rate)}</p>
                    </div>
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </button>
                ))}
              </div>
            )}
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
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">HSN: {item.product.hsn || "—"} | Rate: {formatCurrency(item.product.rate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Grand Total</span><span className="text-indigo-600">{formatCurrency(total + totalGst)}</span></div>
              </div>

              <button onClick={handleCreateInvoice}
                className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                Create Invoice with These Items
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
