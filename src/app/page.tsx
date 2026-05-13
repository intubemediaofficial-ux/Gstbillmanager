import Link from "next/link";
import {
  FileText,
  Building2,
  Users,
  Calculator,
  PenTool,
  Image,
  Search,
  Repeat,
  ToggleLeft,
  Shield,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  IndianRupee,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#050d1a" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(5,13,26,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)" }}>
              <FileText className="w-5 h-5" style={{ color: "#0a1628" }} />
            </div>
            <span className="text-xl font-bold text-white">GST Bill Manager</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold rounded-lg transition" style={{ color: "#c9a84c" }}>
              Login
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm font-semibold rounded-lg transition" style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a1628 0%, #122a4e 40%, #1a3f6f 70%, #2a5298 100%)" }} />
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #2a5298 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", borderColor: "rgba(201,168,76,0.3)" }}>
            <Zap className="w-4 h-4" />
            India&apos;s Simplest GST Billing Software
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Create GST Invoices<br />
            <span style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c, #c9a84c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>in Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Professional Indian GST bills in Tally format. Add your firms, select parties,
            enter amount — bill ready! With auto HSN codes, signatures, letterhead, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg"
              style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-lg font-medium transition border"
              style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}>
              See Features
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "#c9a84c" }} /> Free to use</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "#c9a84c" }} /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "#c9a84c" }} /> Indian format</span>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" fill="#050d1a"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ background: "#050d1a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border" style={{ background: "rgba(201,168,76,0.08)", color: "#c9a84c", borderColor: "rgba(201,168,76,0.2)" }}>
              <Sparkles className="w-3.5 h-3.5" /> FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need for GST Billing</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>Packed with features that make GST invoicing fast, accurate, and professional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: "My Firms", desc: "Add multiple firms with GSTIN, PAN, bank details. Switch between firms to create invoices." },
              { icon: Users, title: "Bill To (Parties)", desc: "Save all your parties/clients with their GST details. Select and bill in one click." },
              { icon: FileText, title: "Quick Invoice", desc: "Select firm, select party, enter amount — invoice ready! GST auto-calculated at 18%." },
              { icon: Calculator, title: "GST Include / Exclude", desc: "Enter amount with GST included or excluded. Auto reverse-calculation for inclusive amounts." },
              { icon: ToggleLeft, title: "GST / Non-GST Toggle", desc: "Support for both GST and Non-GST firms. Non-GST firms need only name, address, PAN." },
              { icon: Search, title: "HSN Code Library", desc: "28+ categories with auto HSN code detection. Music, IT, YouTube, Legal, Gold and more." },
              { icon: PenTool, title: "Director Signatures", desc: "Upload director signatures per firm. Select which signature to use on each invoice." },
              { icon: Image, title: "Company Letterhead", desc: "Upload your company letterhead. Invoice prints with your letterhead as background." },
              { icon: IndianRupee, title: "Tally-Style Format", desc: "Indian GST invoice format like Tally. Bordered tables, HSN summary, Amount in Words." },
              { icon: Repeat, title: "Repeat Last Bill", desc: "Same firm + same party? All settings auto-fill from last bill. Just enter new amount." },
              { icon: Shield, title: "Bill Number Check", desc: "Manual bill numbers with duplicate detection. Never create duplicate invoice numbers." },
              { icon: BarChart3, title: "Reports & Dashboard", desc: "Revenue tracking, pending payments, customer insights. All in one clean dashboard." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-6 border transition-all duration-300 group"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "rgba(201,168,76,0.1)" }}>
                  <f.icon className="w-6 h-6" style={{ color: "#c9a84c" }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20" style={{ background: "linear-gradient(180deg, #050d1a 0%, #0a1628 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>Create professional GST invoices in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Add Your Firms", desc: "Add your company details — GSTIN, PAN, bank info, director signatures, letterhead. Save once, use forever." },
              { step: "2", title: "Add Your Parties", desc: "Add your clients/customers with their GST details. Both GST and Non-GST parties supported." },
              { step: "3", title: "Create Invoice", desc: "Select firm → Select party → Enter amount → Done! GST auto-calculated, Indian format, ready to print." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #122a4e 50%, #1a3f6f 100%)" }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why GST Bill Manager?</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>Built specifically for Indian businesses. Simple, fast, and accurate.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Super Fast", desc: "Create invoice in under 30 seconds" },
              { icon: IndianRupee, title: "Indian Format", desc: "Tally-style GST bill format" },
              { icon: Shield, title: "100% Accurate", desc: "Auto GST calculation with HSN codes" },
              { icon: Star, title: "Free to Use", desc: "No hidden charges, start immediately" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-6 text-center border"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}>
                <f.icon className="w-8 h-8 mx-auto mb-3" style={{ color: "#c9a84c" }} />
                <h3 className="font-semibold text-lg mb-1 text-white">{f.title}</h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20" style={{ background: "#050d1a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple Pricing</h2>
            <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>Start free, upgrade when you need</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl p-8 text-center relative border-2"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "#c9a84c" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-5xl font-extrabold" style={{ color: "#c9a84c" }}>&#8377;0</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                {[
                  "Unlimited invoices",
                  "Multiple firms & parties",
                  "GST & Non-GST support",
                  "HSN code auto-detect",
                  "Director signatures",
                  "Company letterhead",
                  "Tally-style invoice format",
                  "Dashboard & reports",
                  "Google login",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#c9a84c" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3.5 rounded-xl font-semibold transition text-lg"
                style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #122a4e 50%, #2a5298 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at center, #c9a84c 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Simplify Your GST Billing?</h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>Join businesses across India who trust GST Bill Manager for their invoicing needs.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg"
            style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)", color: "#0a1628" }}>
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ background: "#050d1a", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a84c, #f0d78c)" }}>
                <FileText className="w-5 h-5" style={{ color: "#0a1628" }} />
              </div>
              <span className="text-lg font-bold text-white">GST Bill Manager</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <Link href="/login" className="hover:text-white transition">Login</Link>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>&copy; {new Date().getFullYear()} GST Bill Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
