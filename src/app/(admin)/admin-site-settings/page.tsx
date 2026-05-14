"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Plus, Trash2, CreditCard, IndianRupee, Settings, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  recommended: boolean;
  razorpayPlanId?: string;
}

interface SiteSettings {
  pricing: PricingPlan[];
  razorpayKeyId: string;
  razorpaySecretKey: string;
  razorpayEnabled: boolean;
  paymentButtonText: string;
  subscriptionMode: boolean;
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [newFeature, setNewFeature] = useState<Record<string, string>>({});
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwMsgType, setPwMsgType] = useState<"success" | "error">("success");

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/admin/site-settings").then(r => r.json()).then(res => {
      setSettings(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed");
      setMsg("Settings saved successfully!");
      setMsgType("success");
    } catch {
      setMsg("Failed to save settings");
      setMsgType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const addPlan = () => {
    if (!settings) return;
    const plan: PricingPlan = {
      id: `plan_${Date.now()}`,
      name: "New Plan",
      price: 0,
      period: "month",
      features: [],
      recommended: false,
    };
    setSettings({ ...settings, pricing: [...settings.pricing, plan] });
  };

  const removePlan = (id: string) => {
    if (!settings) return;
    setSettings({ ...settings, pricing: settings.pricing.filter(p => p.id !== id) });
  };

  const updatePlan = (id: string, field: keyof PricingPlan, value: string | number | boolean | string[]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pricing: settings.pricing.map(p => p.id === id ? { ...p, [field]: value } : p),
    });
  };

  const addFeature = (planId: string) => {
    const text = (newFeature[planId] || "").trim();
    if (!text || !settings) return;
    const plan = settings.pricing.find(p => p.id === planId);
    if (!plan) return;
    updatePlan(planId, "features", [...plan.features, text]);
    setNewFeature({ ...newFeature, [planId]: "" });
  };

  const removeFeature = (planId: string, index: number) => {
    if (!settings) return;
    const plan = settings.pricing.find(p => p.id === planId);
    if (!plan) return;
    updatePlan(planId, "features", plan.features.filter((_, i) => i !== index));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!settings) return <div className="p-8 text-center text-gray-500">Failed to load settings</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6" /> Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pricing plans and payment gateway</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${msgType === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msgType === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg}
        </div>
      )}

      {/* Razorpay Payment Gateway */}
      <div className="bg-white rounded-xl border shadow-sm mb-6">
        <div className="p-5 border-b flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Razorpay Payment Gateway</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.razorpayEnabled}
                onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
            <span className="text-sm font-medium text-gray-700">Enable Razorpay Payments</span>
            {settings.razorpayEnabled && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">Active</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Razorpay Key ID</label>
            <div className="relative">
              <input type={showKey ? "text" : "password"}
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="rzp_live_xxxxxxxxxxxxxx" />
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Get your Key ID from <a href="https://dashboard.razorpay.com/app/website-app-settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Razorpay Dashboard → API Keys</a></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Razorpay Secret Key</label>
            <div className="relative">
              <input type={showSecret ? "text" : "password"}
                value={settings.razorpaySecretKey}
                onChange={(e) => setSettings({ ...settings, razorpaySecretKey: e.target.value })}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="rzp_secret_xxxxxxxxxxxxxx" />
              <button type="button" onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Required for subscription verification. Keep this secret!</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.subscriptionMode}
                onChange={(e) => setSettings({ ...settings, subscriptionMode: e.target.checked })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
            <span className="text-sm font-medium text-gray-700">Subscription Mode (recurring payments)</span>
            {settings.subscriptionMode && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">Active</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Button Text</label>
            <input type="text" value={settings.paymentButtonText}
              onChange={(e) => setSettings({ ...settings, paymentButtonText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buy Now" />
          </div>

          {!settings.razorpayEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              <strong>Note:</strong> Razorpay is currently disabled. Enable it and add your Key ID to accept payments on the website. You can get your API keys from <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">dashboard.razorpay.com</a>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Pricing Plans</h2>
          </div>
          <button onClick={addPlan} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>

        <div className="p-5 space-y-6">
          {settings.pricing.map((plan) => (
            <div key={plan.id} className="border rounded-xl p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{plan.name || "Unnamed Plan"}</h3>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={plan.recommended}
                      onChange={(e) => updatePlan(plan.id, "recommended", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Recommended
                  </label>
                  <button onClick={() => removePlan(plan.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name</label>
                  <input type="text" value={plan.name}
                    onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (&#8377;)</label>
                  <input type="number" value={plan.price}
                    onChange={(e) => updatePlan(plan.id, "price", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
                  <select value={plan.period}
                    onChange={(e) => updatePlan(plan.id, "period", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="month">Per Month</option>
                    <option value="year">Per Year</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="once">One Time</option>
                  </select>
                </div>
              </div>

              {/* Razorpay Plan ID (for subscriptions) */}
              {settings.subscriptionMode && settings.razorpayEnabled && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Razorpay Plan ID (for subscription)</label>
                  <input type="text" value={plan.razorpayPlanId || ""}
                    onChange={(e) => updatePlan(plan.id, "razorpayPlanId", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="plan_xxxxxxxxxxxxxx" />
                  <p className="text-[10px] text-gray-400 mt-0.5">Create plans at Razorpay Dashboard → Subscriptions → Plans</p>
                </div>
              )}

              {/* Features */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Features</label>
                <div className="space-y-1.5 mb-2">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">{f}</span>
                      <button onClick={() => removeFeature(plan.id, fi)} className="text-gray-300 hover:text-red-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newFeature[plan.id] || ""}
                    onChange={(e) => setNewFeature({ ...newFeature, [plan.id]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addFeature(plan.id)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a feature..." />
                  <button onClick={() => addFeature(plan.id)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {settings.pricing.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <IndianRupee className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No pricing plans yet. Click &quot;Add Plan&quot; to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Change Password */}
      <div className="bg-white rounded-xl border shadow-sm mt-6">
        <div className="p-5 border-b flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold">Change Admin Password</h2>
        </div>
        <div className="p-5 space-y-4">
          {pwMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${pwMsgType === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {pwMsgType === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {pwMsg}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCurrentPw ? "text" : "password"} value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password (min 6 characters)</label>
            <div className="relative">
              <input type={showNewPw ? "text" : "password"} value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password" minLength={6} />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input type={showNewPw ? "text" : "password"} value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password" />
          </div>
          <button onClick={async () => {
            setPwMsg(""); setPwMsgType("error");
            if (newPw.length < 6) { setPwMsg("New password must be at least 6 characters"); return; }
            if (newPw !== confirmPw) { setPwMsg("Passwords do not match"); return; }
            setPwSaving(true);
            try {
              const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
              });
              const data = await res.json();
              if (!res.ok) { setPwMsg(data.error || "Failed to change password"); setPwMsgType("error"); return; }
              setPwMsg("Password changed successfully!"); setPwMsgType("success");
              setCurrentPw(""); setNewPw(""); setConfirmPw("");
            } catch { setPwMsg("Failed to change password"); }
            finally { setPwSaving(false); setTimeout(() => setPwMsg(""), 5000); }
          }} disabled={pwSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition">
            <Lock className="w-4 h-4" /> {pwSaving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
