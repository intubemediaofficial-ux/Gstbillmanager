"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Shield, Zap, FileText } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
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

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_auth_failed") setError("Google login failed. Please try again.");
    else if (err === "google_not_configured") setError("Google login is not configured yet.");
    else if (err === "google_token_failed") setError("Google authentication error.");
    else if (err === "account_disabled") setError("Your account has been disabled.");
  }, [searchParams]);

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

  const inputStyle = "w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white/80 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white transition-all duration-300 shadow-sm";
  const inputStylePw = "w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-white/80 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white transition-all duration-300 shadow-sm";

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)" }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-30 animate-pulse" style={{ background: "radial-gradient(circle, #ffecd2 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-25 animate-pulse" style={{ background: "radial-gradient(circle, #a18cd1 0%, transparent 70%)", animationDelay: "1s" }} />
        <div className="absolute top-[30%] left-[50%] w-[350px] h-[350px] rounded-full opacity-20 animate-pulse" style={{ background: "radial-gradient(circle, #fbc2eb 0%, transparent 70%)", animationDelay: "2s" }} />
        <div className="absolute top-[60%] right-[30%] w-[200px] h-[200px] rounded-full opacity-20 animate-pulse" style={{ background: "radial-gradient(circle, #a1c4fd 0%, transparent 70%)", animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 shadow-2xl" style={{ background: "linear-gradient(135deg, #fff 0%, #f0f0ff 100%)" }}>
            <FileText className="w-10 h-10 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">GST Bill Manager</h1>
          <p className="mt-2 text-base text-white/70">
            {mode === "login" ? "Welcome back! Sign in to continue" : "Create your free account"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 space-y-5 shadow-2xl border border-white/20" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
          {/* Mode Toggle */}
          <div className="flex rounded-xl p-1 bg-white/10">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "login" ? "bg-white text-violet-700 shadow-lg" : "text-white/60 hover:text-white"}`}>
              Login
            </button>
            <button onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "signup" ? "bg-white text-violet-700 shadow-lg" : "text-white/60 hover:text-white"}`}>
              Sign Up
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium bg-red-500/20 text-white border border-red-400/30">{error}</div>
          )}

          {/* Google Login */}
          <button onClick={handleGoogle} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm bg-white/90 hover:bg-white text-gray-700 shadow-sm border border-white/60">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-xs uppercase tracking-wider text-white/40">or</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Login Form */}
          {mode === "login" && resetMode === "none" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-white/80">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle} placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-white/80">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputStylePw} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => { setResetMode("email"); setError(""); setResetMsg(""); }}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors">Forgot Password?</button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-white/80">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className={inputStyle} placeholder="Your full name" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-white/80">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle} placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-white/80">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className={inputStyle} placeholder="9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-white/80">Password * (min 6 characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputStylePw} placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Forgot Password Flow */}
          {resetMode !== "none" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => { setResetMode("none"); setResetMsg(""); setError(""); }} className="text-sm text-white/50 hover:text-white transition-colors">&larr; Back to Login</button>
              </div>
              <h3 className="font-bold text-white text-lg">Reset Password</h3>

              {resetMsg && <div className="px-4 py-2 rounded-xl text-sm bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">{resetMsg}</div>}

              {resetMode === "email" && (
                <>
                  <p className="text-sm text-white/50">Enter your registered email. We will send an OTP to reset your password.</p>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className={inputStyle} placeholder="your@email.com" />
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
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-50 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}

              {resetMode === "otp" && (
                <>
                  <p className="text-sm text-white/50">Enter the 6-digit OTP sent to <strong className="text-white">{resetEmail}</strong></p>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest font-mono bg-white/80 border border-white/60 text-violet-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white transition-all duration-300 shadow-sm"
                    placeholder="000000" maxLength={6} />
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-white/80">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                      <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className={inputStylePw} placeholder="Min 6 characters" minLength={6} />
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
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-50 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </>
              )}

              {resetMode === "done" && (
                <button onClick={() => { setResetMode("none"); setEmail(resetEmail); setPassword(""); setError(""); setResetMsg(""); }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  Go to Login
                </button>
              )}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/50">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-300" /> Secure</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-300" /> Fast</span>
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-sky-300" /> Free</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)" }}><div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
