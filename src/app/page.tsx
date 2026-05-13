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
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GST Bill Manager</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
              Login
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-indigo-100">
            <Zap className="w-4 h-4" />
            India&apos;s Simplest GST Billing Software
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Create GST Invoices<br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">in Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional Indian GST bills in Tally format. Add your firms, select parties,
            enter amount — bill ready! With auto HSN codes, signatures, letterhead, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 text-gray-600 px-6 py-3.5 rounded-xl text-lg font-medium hover:bg-gray-100 transition border border-gray-200">
              See Features
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free to use</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Indian format</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need for GST Billing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Packed with features that make GST invoicing fast, accurate, and professional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "My Firms", desc: "Add multiple firms with GSTIN, PAN, bank details. Switch between firms to create invoices.", color: "bg-blue-50 text-blue-600" },
              { icon: Users, title: "Bill To (Parties)", desc: "Save all your parties/clients with their GST details. Select and bill in one click.", color: "bg-green-50 text-green-600" },
              { icon: FileText, title: "Quick Invoice", desc: "Select firm, select party, enter amount — invoice ready! GST auto-calculated at 18%.", color: "bg-indigo-50 text-indigo-600" },
              { icon: Calculator, title: "GST Include / Exclude", desc: "Enter amount with GST included or excluded. Auto reverse-calculation for inclusive amounts.", color: "bg-amber-50 text-amber-600" },
              { icon: ToggleLeft, title: "GST / Non-GST Toggle", desc: "Support for both GST and Non-GST firms. Non-GST firms need only name, address, PAN.", color: "bg-orange-50 text-orange-600" },
              { icon: Search, title: "HSN Code Library", desc: "28+ categories with auto HSN code detection. Music, IT, YouTube, Legal, Gold and more.", color: "bg-purple-50 text-purple-600" },
              { icon: PenTool, title: "Director Signatures", desc: "Upload director signatures per firm. Select which signature to use on each invoice.", color: "bg-pink-50 text-pink-600" },
              { icon: Image, title: "Company Letterhead", desc: "Upload your company letterhead. Invoice prints with your letterhead as background.", color: "bg-teal-50 text-teal-600" },
              { icon: IndianRupee, title: "Tally-Style Format", desc: "Indian GST invoice format like Tally. Bordered tables, HSN summary, Amount in Words.", color: "bg-red-50 text-red-600" },
              { icon: Repeat, title: "Repeat Last Bill", desc: "Same firm + same party? All settings auto-fill from last bill. Just enter new amount.", color: "bg-cyan-50 text-cyan-600" },
              { icon: Shield, title: "Bill Number Check", desc: "Manual bill numbers with duplicate detection. Never create duplicate invoice numbers.", color: "bg-emerald-50 text-emerald-600" },
              { icon: BarChart3, title: "Reports & Dashboard", desc: "Revenue tracking, pending payments, customer insights. All in one clean dashboard.", color: "bg-violet-50 text-violet-600" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Create professional GST invoices in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Add Your Firms", desc: "Add your company details — GSTIN, PAN, bank info, director signatures, letterhead. Save once, use forever." },
              { step: "2", title: "Add Your Parties", desc: "Add your clients/customers with their GST details. Both GST and Non-GST parties supported." },
              { step: "3", title: "Create Invoice", desc: "Select firm → Select party → Enter amount → Done! GST auto-calculated, Indian format, ready to print." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why GST Bill Manager?</h2>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">Built specifically for Indian businesses. Simple, fast, and accurate.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Super Fast", desc: "Create invoice in under 30 seconds" },
              { icon: IndianRupee, title: "Indian Format", desc: "Tally-style GST bill format" },
              { icon: Shield, title: "100% Accurate", desc: "Auto GST calculation with HSN codes" },
              { icon: Star, title: "Free to Use", desc: "No hidden charges, start immediately" },
            ].map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-white/10">
                <f.icon className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-indigo-100">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you need</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-600 p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-5xl font-extrabold text-gray-900">₹0</span>
                <span className="text-gray-500">/month</span>
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
                  <li key={f} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ready to Simplify Your GST Billing?</h2>
          <p className="text-lg text-gray-600 mb-8">Join businesses across India who trust GST Bill Manager for their invoicing needs.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">GST Bill Manager</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <Link href="/login" className="hover:text-white transition">Login</Link>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} GST Bill Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
