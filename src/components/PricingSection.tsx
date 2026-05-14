"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  recommended: boolean;
}

interface SiteSettings {
  pricing: PricingPlan[];
  razorpayKeyId: string;
  razorpayEnabled: boolean;
  paymentButtonText: string;
}

export default function PricingSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  const plans = settings?.pricing || [];
  const razorpayEnabled = settings?.razorpayEnabled && settings?.razorpayKeyId;
  const buttonText = settings?.paymentButtonText || "Get Started";

  const handlePayment = (plan: PricingPlan) => {
    if (plan.price === 0 || !razorpayEnabled || !settings?.razorpayKeyId) {
      window.location.href = "/login";
      return;
    }

    const options = {
      key: settings.razorpayKeyId,
      amount: plan.price * 100,
      currency: "INR",
      name: "GST Bill Manager",
      description: `${plan.name} - ${plan.period}`,
      handler: function () {
        alert("Payment successful! Your plan has been activated.");
        window.location.href = "/login";
      },
      prefill: {},
      theme: { color: "#0ea5e9" },
    };

    const win = window as unknown as { Razorpay?: new (opts: typeof options) => { open: () => void } };
    if (win.Razorpay) {
      const rzp = new win.Razorpay(options);
      rzp.open();
    } else {
      alert("Payment gateway is loading. Please try again.");
    }
  };

  const periodLabels: Record<string, string> = {
    month: "/month",
    year: "/year",
    lifetime: " lifetime",
    once: " one-time",
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      {razorpayEnabled && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
          <p className="text-lg text-gray-500">Start free, upgrade when you need</p>
        </div>

        <div className={`mx-auto ${plans.length === 1 ? "max-w-lg" : plans.length === 2 ? "max-w-3xl" : "max-w-5xl"} grid grid-cols-1 ${plans.length > 1 ? "md:grid-cols-" + Math.min(plans.length, 3) : ""} gap-6`}>
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl shadow-xl p-8 text-center relative ${plan.recommended ? "border-2 border-cyan-500" : "border border-gray-200"}`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white shadow-md" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-5xl font-extrabold text-cyan-600">&#8377;{plan.price}</span>
                <span className="text-gray-400">{periodLabels[plan.period] || `/${plan.period}`}</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.price > 0 && razorpayEnabled ? (
                <button onClick={() => handlePayment(plan)}
                  className="block w-full py-3.5 rounded-xl font-bold text-white transition text-lg shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                  {buttonText}
                </button>
              ) : (
                <Link href="/login"
                  className="block w-full py-3.5 rounded-xl font-bold text-white transition text-lg shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                  {plan.price === 0 ? "Get Started Free" : buttonText}
                </Link>
              )}
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-cyan-500 p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white shadow-md" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-5xl font-extrabold text-cyan-600">&#8377;0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                {["Unlimited invoices", "Multiple firms & parties", "GST & Non-GST support", "HSN code auto-detect", "Director signatures", "Company letterhead", "Tally-style invoice format", "Dashboard & reports", "Google login"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3.5 rounded-xl font-bold text-white transition text-lg shadow-lg hover:shadow-xl hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
