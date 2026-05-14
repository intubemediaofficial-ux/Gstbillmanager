"use client";

import { useState, useEffect, useRef } from "react";
import { Truck, Plus, Trash2, X, Ban } from "lucide-react";
import type { EWayBill, Invoice } from "@/lib/gst-types";
import { INDIAN_STATES } from "@/lib/gst-types";
import { formatDate, formatCurrency } from "@/lib/gst-utils";

export default function EWayBillsPage() {
  const [bills, setBills] = useState<EWayBill[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    invoiceId: "", transporterName: "", transporterId: "", vehicleNumber: "",
    vehicleType: "regular" as "regular" | "over_dimensional",
    transportMode: "road" as "road" | "rail" | "air" | "ship",
    distance: 0, fromState: "", toState: "",
  });

  const didFetch = useRef(false);
  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/eway-bill").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([eRes, iRes]) => {
      setBills(eRes.data || []);
      setInvoices(iRes.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (didFetch.current) return; didFetch.current = true; load(); }, []);

  const selectedInvoice = invoices.find((i) => i.id === form.invoiceId);

  const handleCreate = async () => {
    const inv = invoices.find((i) => i.id === form.invoiceId);
    await fetch("/api/eway-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, invoiceNumber: inv?.invoiceNumber || "" }),
    });
    setShowForm(false);
    setForm({ invoiceId: "", transporterName: "", transporterId: "", vehicleNumber: "", vehicleType: "regular", transportMode: "road", distance: 0, fromState: "", toState: "" });
    load();
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this E-Way Bill?")) return;
    await fetch("/api/eway-bill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", id }) });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this E-Way Bill?")) return;
    await fetch("/api/eway-bill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    load();
  };

  const statusColors: Record<string, string> = { active: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700", expired: "bg-gray-100 text-gray-700" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">E-Way Bills</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Generate E-Way Bill
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Invoice #</th>
                <th className="text-left p-3 font-medium">Transport</th>
                <th className="text-left p-3 font-medium">Vehicle</th>
                <th className="text-left p-3 font-medium">Route</th>
                <th className="text-right p-3 font-medium">Distance</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{b.invoiceNumber || "-"}</td>
                  <td className="p-3">
                    <div className="font-medium">{b.transporterName || "-"}</div>
                    <div className="text-xs text-gray-400">{b.transportMode}</div>
                  </td>
                  <td className="p-3 font-mono">{b.vehicleNumber || "-"}</td>
                  <td className="p-3 text-xs">{b.fromState} → {b.toState}</td>
                  <td className="p-3 text-right">{b.distance} km</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || ""}`}>{b.status}</span></td>
                  <td className="p-3 text-xs text-gray-500">{formatDate(b.createdAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "active" && (
                        <button onClick={() => handleCancel(b.id)} className="p-1.5 hover:bg-orange-50 rounded text-orange-600" title="Cancel"><Ban className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">
                  <Truck className="w-8 h-8 mx-auto mb-2" /> No E-Way Bills yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create E-Way Bill Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generate E-Way Bill</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Invoice</label>
                <select value={form.invoiceId} onChange={(e) => {
                  const inv = invoices.find((i) => i.id === e.target.value);
                  setForm({ ...form, invoiceId: e.target.value, fromState: inv?.firm?.state || "", toState: inv?.customer.state || "" });
                }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Choose invoice...</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.customer.name} - {formatCurrency(inv.grandTotal)}</option>
                  ))}
                </select>
              </div>
              {selectedInvoice && <p className="text-xs text-gray-500">Invoice: {selectedInvoice.invoiceNumber} | {selectedInvoice.customer.name} | {formatCurrency(selectedInvoice.grandTotal)}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Transporter Name</label>
                  <input value={form.transporterName} onChange={(e) => setForm({ ...form, transporterName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transporter ID (GSTIN)</label>
                  <input value={form.transporterId} onChange={(e) => setForm({ ...form, transporterId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono" maxLength={15} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                  <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="MH12AB1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transport Mode</label>
                  <select value={form.transportMode} onChange={(e) => setForm({ ...form, transportMode: e.target.value as typeof form.transportMode })}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="road">Road</option>
                    <option value="rail">Rail</option>
                    <option value="air">Air</option>
                    <option value="ship">Ship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">From State</label>
                  <select value={form.fromState} onChange={(e) => setForm({ ...form, fromState: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select</option>
                    {Object.entries(INDIAN_STATES).map(([c, n]) => <option key={c} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To State</label>
                  <select value={form.toState} onChange={(e) => setForm({ ...form, toState: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select</option>
                    {Object.entries(INDIAN_STATES).map(([c, n]) => <option key={c} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distance (km)</label>
                <input type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <button onClick={handleCreate}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                Generate E-Way Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
