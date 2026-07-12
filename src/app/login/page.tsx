"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Shield, Zap, FileText } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState<"none" | "email" | "otp" | "done">("none");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  // Phone OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpMethod, setOtpMethod] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_auth_failed") setError("Google login failed. Please try again.");
    else if (err === "google_not_configured") setError("Google login is not configured yet.");
    else if (err === "google_token_failed") setError("Google authentication error.");
    else if (err === "account_disabled") setError("Your account has been disabled.");
  }, [searchParams]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      if (data.user.role === "admin") router.push("/admin-dashboard");
      else router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const handleSendOtp = async () => {
    setError("");
    const payload = loginMethod === "phone"
      ? { phone, type: "phone" }
      : { email, type: "email" };

    if (loginMethod === "phone" && (!phone || phone.replace(/\D/g, "").length < 10)) {
      setError("Enter valid 10-digit mobile number");
      return;
    }
    if (loginMethod === "email" && !email) {
      setError("Enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP"); return; }
      setOtpSent(true);
      setOtpMethod(data.method);
      setMaskedEmail(data.maskedEmail || "");
      setCountdown(60);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (phoneOtp.length !== 6) { setError("Enter 6-digit OTP"); return; }

    setLoading(true);
    try {
      const payload = loginMethod === "phone"
        ? { phone, otp: phoneOtp }
        : { email, otp: phoneOtp };
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "OTP verification failed"); return; }
      if (data.user.role === "admin") router.push("/admin-dashboard");
      else router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 50%, #06b6d4 100%)" }}>
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />
        <div className="absolute top-[50%] left-[60%] w-[250px] h-[250px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }} />

        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm mb-8 shadow-2xl border border-white/20">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">GST Bill Manager</h2>
          <p className="text-xl text-white/70 mb-8 leading-relaxed">India&apos;s simplest GST billing software.<br/>Create professional invoices in seconds.</p>

          <div className="space-y-4 text-left max-w-xs mx-auto">
            {[
              { icon: Zap, text: "Create invoice in 30 seconds", color: "#fbbf24" },
              { icon: Shield, text: "100% GST compliant & secure", color: "#34d399" },
              { icon: FileText, text: "Tally-style Indian format", color: "#fb923c" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                  <f.icon className="w-4 h-4" style={{ color: f.color }} />
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GST Bill Manager</h1>
          </div>

          <div className="lg:block hidden mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{mode === "login" ? "Welcome back!" : "Create your account"}</h1>
            <p className="text-gray-500 mt-1 text-sm">{mode === "login" ? "Sign in to manage your GST invoices" : "Start creating professional invoices for free"}</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-xl p-1 mb-6 bg-gray-200">
            <button onClick={() => { setMode("login"); setError(""); setOtpSent(false); setPhoneOtp(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Login
            </button>
            <button onClick={() => { setMode("signup"); setError(""); setOtpSent(false); setPhoneOtp(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Sign Up
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200 mb-4">{error}</div>
          )}

          {/* Google Login */}
          <button onClick={handleGoogle} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs uppercase tracking-wider text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login Form */}
          {mode === "login" && resetMode === "none" && (
            <>
              {/* Login Method Toggle */}
              <div className="flex rounded-lg p-0.5 mb-4 bg-gray-100 border">
                <button onClick={() => { setLoginMethod("email"); setError(""); setOtpSent(false); setPhoneOtp(""); }}
                  className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${loginMethod === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                  <Mail className="w-3.5 h-3.5" /> Email + Password
                </button>
                <button onClick={() => { setLoginMethod("phone"); setError(""); setOtpSent(false); setPhoneOtp(""); }}
                  className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${loginMethod === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                  <Phone className="w-3.5 h-3.5" /> Mobile + OTP
                </button>
              </div>

              {/* Email + Password Login */}
              {loginMethod === "email" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                        className="w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                    {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => { setResetMode("email"); setError(""); setResetMsg(""); }}
                      className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors">Forgot Password?</button>
                  </div>
                </form>
              )}

              {/* Phone + OTP Login */}
              {loginMethod === "phone" && !otpSent && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">+91</div>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full pl-[4.5rem] pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        placeholder="9876543210" maxLength={10} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">OTP will be sent to your registered email</p>
                  </div>
                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                    {loading ? "Sending OTP..." : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              )}

              {/* OTP Verification */}
              {loginMethod === "phone" && otpSent && (
                <div className="space-y-4">
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-cyan-800 font-medium">
                      {otpMethod === "sms" ? "OTP sent via SMS" : `OTP sent to ${maskedEmail}`}
                    </p>
                    <p className="text-xs text-cyan-600 mt-1">Enter 6-digit OTP to login</p>
                  </div>
                  <div>
                    <input type="text" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full px-4 py-3.5 rounded-xl text-center text-2xl tracking-[0.5em] font-mono bg-white border border-gray-200 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      placeholder="000000" maxLength={6} autoFocus />
                  </div>
                  <button onClick={handleVerifyOtp} disabled={loading || phoneOtp.length !== 6}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                    {loading ? "Verifying..." : <><span>Verify & Login</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <div className="flex items-center justify-between">
                    <button onClick={() => { setOtpSent(false); setPhoneOtp(""); setError(""); }}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Change Number</button>
                    {countdown > 0 ? (
                      <span className="text-sm text-gray-400">Resend in {countdown}s</span>
                    ) : (
                      <button onClick={handleSendOtp} disabled={loading}
                        className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors">Resend OTP</button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Your full name" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">+91</div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full pl-[4.5rem] pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="9876543210" required maxLength={10} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password * (min 6 characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Forgot Password Flow */}
          {resetMode !== "none" && (
            <div className="space-y-4">
              <button onClick={() => { setResetMode("none"); setResetMsg(""); setError(""); }} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">&larr; Back to Login</button>
              <h3 className="font-bold text-gray-900 text-lg">Reset Password</h3>
              {resetMsg && <div className="px-4 py-2 rounded-xl text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">{resetMsg}</div>}

              {resetMode === "email" && (
                <>
                  <p className="text-sm text-gray-500">Enter your registered email. We will send an OTP.</p>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com" />
                  </div>
                  <button onClick={async () => {
                    setError(""); setResetMsg("");
                    if (!resetEmail) { setError("Email is required"); return; }
                    setLoading(true);
                    const res = await fetch("/api/auth/forgot-password", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: resetEmail }),
                    });
                    const data = await res.json();
                    setLoading(false);
                    if (!res.ok) { setError(data.error || "Failed to send OTP"); return; }
                    setResetMsg("OTP sent to your email!");
                    setResetMode("otp");
                  }} disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 shadow-lg transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}

              {resetMode === "otp" && (
                <>
                  <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to <strong className="text-gray-900">{resetEmail}</strong></p>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest font-mono bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="000000" maxLength={6} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        placeholder="Min 6 characters" minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button onClick={async () => {
                    setError(""); setResetMsg("");
                    if (otp.length !== 6) { setError("Enter 6-digit OTP"); return; }
                    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
                    setLoading(true);
                    const res = await fetch("/api/auth/reset-password", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: resetEmail, otp, newPassword }),
                    });
                    const data = await res.json();
                    setLoading(false);
                    if (!res.ok) { setError(data.error || "Failed to reset password"); return; }
                    setResetMsg("Password reset successfully! You can now login.");
                    setResetMode("done");
                  }} disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 shadow-lg transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </>
              )}

              {resetMode === "done" && (
                <button onClick={() => { setResetMode("none"); setEmail(resetEmail); setPassword(""); setError(""); setResetMsg(""); }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                  Go to Login
                </button>
              )}
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Fast</span>
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-cyan-500" /> Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
