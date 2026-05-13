"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Eye, EyeOff, Lock } from "lucide-react";
import type { BusinessSettings } from "@/lib/gst-types";
import { INDIAN_STATES } from "@/lib/gst-types";

const defaultSettings: BusinessSettings = {
  companyName: "", address: "", city: "", state: "", stateCode: "", pincode: "",
  gstin: "", pan: "", phone: "", email: "", invoicePrefix: "INV/2024-25/",
  lastInvoiceNumber: 0, bankName: "", accountNumber: "", ifscCode: "", branchName: "",
  termsAndConditions: "", signatureText: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/settings").then((r) => r.json())
      .then((res) => setForm(res.data || defaultSettings))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGstinChange = (val: string) => {
    const upper = val.toUpperCase();
    setForm((f) => {
      const n = { ...f, gstin: upper };
      if (upper.length >= 2) {
        const sc = upper.substring(0, 2);
        if (INDIAN_STATES[sc]) { n.stateCode = sc; n.state = INDIAN_STATES[sc]; }
      }
      if (upper.length >= 12) n.pan = upper.substring(2, 12);
      return n;
    });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>

      <div className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GSTIN</label>
              <input value={form.gstin} onChange={(e) => handleGstinChange(e.target.value)} maxLength={15}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <select value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value, state: INDIAN_STATES[e.target.value] || "" })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  {Object.entries(INDIAN_STATES).map(([c, n]) => <option key={c} value={c}>{c} - {n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PAN</label>
                <input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-sm font-medium mb-1">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium mb-1">Pincode</label>
                <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Invoice Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Invoice Prefix</label>
              <input value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="INV/2024-25/" /></div>
            <div><label className="block text-sm font-medium mb-1">Last Invoice Number</label>
              <input type="number" value={form.lastInvoiceNumber} onChange={(e) => setForm({ ...form, lastInvoiceNumber: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Bank Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">Bank Name</label>
                <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium mb-1">Branch</label>
                <input value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">Account Number</label>
                <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium mb-1">IFSC Code</label>
                <input value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" /></div>
            </div>
          </div>
        </div>

        {/* Terms & Signature */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Terms & Signature</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Terms & Conditions</label>
              <textarea value={form.termsAndConditions} onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })} rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium mb-1">Signature Text</label>
              <input value={form.signatureText} onChange={(e) => setForm({ ...form, signatureText: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Authorized Signatory Name" /></div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h2>
          {pwError && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-3">{pwError}</div>}
          {pwMessage && <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm mb-3">{pwMessage}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <div className="relative">
                <input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password (min 6 characters)</label>
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter new password" minLength={6} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type={showNewPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Confirm new password" />
            </div>
            <button onClick={async () => {
              setPwError(""); setPwMessage("");
              if (newPassword.length < 6) { setPwError("New password must be at least 6 characters"); return; }
              if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return; }
              setPwSaving(true);
              const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
              });
              const data = await res.json();
              setPwSaving(false);
              if (!res.ok) { setPwError(data.error || "Failed to change password"); return; }
              setPwMessage("Password changed successfully!");
              setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
              setTimeout(() => setPwMessage(""), 3000);
            }} disabled={pwSaving}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50">
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">Settings saved!</span>}
        </div>
      </div>
    </div>
  );
}
