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
  ClipboardList,
  Truck,
  QrCode,
  Bell,
  Download,
  Share2,
  Save,
  Package,
  FolderOpen,
  CreditCard,
  UserCheck,
  Lock,
  Globe,
  Smartphone,
  Mail,
  TrendingUp,
  Eye,
  Briefcase,
  Award,
  BookOpen,
  Layers,
} from "lucide-react";
import PricingSection from "@/components/PricingSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">GST Bill Manager</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-cyan-600 transition">Features</a>
            <a href="#documents" className="hover:text-cyan-600 transition">Documents</a>
            <a href="#how-it-works" className="hover:text-cyan-600 transition">How It Works</a>
            <a href="#pricing" className="hover:text-cyan-600 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 rounded-lg transition">
              Login
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 40%, #06b6d4 70%, #10b981 100%)" }}>
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] left-[55%] w-[350px] h-[350px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/25">
            <Zap className="w-4 h-4 text-amber-300" />
            India&apos;s #1 All-In-One Business Management Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            GST Invoices + 15 Documents<br />
            <span className="text-amber-300">One Platform</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            Professional GST billing, barcode scanner, digital business card, daily cash book, income charts,
            HR letters, inventory, GSTR reports, 13 languages, WhatsApp share, PDF download — complete business solution for India!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition shadow-xl hover:shadow-2xl hover:scale-105 text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 text-white px-6 py-4 rounded-xl text-lg font-medium hover:bg-white/10 transition border-2 border-white/30 backdrop-blur-sm">
              See All Features
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/80 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">40+</p>
              <p className="text-sm">Features</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">15</p>
              <p className="text-sm">Document Types</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10</p>
              <p className="text-sm">Invoice Types</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">4</p>
              <p className="text-sm">Templates Each</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-300" /> Free to use</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-300" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-300" /> Indian GST format</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-300" /> WhatsApp + PDF</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-300" /> 13 Languages</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-300" /> Barcode Scanner</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 bg-cyan-50 text-cyan-700 border border-cyan-100">
              <Sparkles className="w-3.5 h-3.5" /> 40+ FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Complete GST & Business Management</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">From GST invoicing to HR letters, inventory to GSTR reports — everything a business needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[
              { icon: Search, title: "GSTIN Auto-Fill", desc: "Enter GST number — State, PAN auto-fill instantly. No manual typing.", bg: "#ecfdf5", iconColor: "#10b981" },
              { icon: FileText, title: "10 Invoice Types", desc: "Tax Invoice, Credit/Debit Note, Quotation, Proforma, Delivery Challan, Purchase Bill, Payment Receipt, Export Invoice.", bg: "#fff7ed", iconColor: "#f97316" },
              { icon: FolderOpen, title: "15 Document Types", desc: "HR Letters, Quotation, Purchase Order, Visiting Card, ID Card, Letterhead, NOC, Agreement & more.", bg: "#eef2ff", iconColor: "#6366f1" },
              { icon: Building2, title: "My Firms", desc: "Add multiple firms with GSTIN, PAN, bank details, letterhead, signature. Switch between firms.", bg: "#eef9ff", iconColor: "#0ea5e9" },
              { icon: Users, title: "Customers / Parties", desc: "Save all parties with GST details. GST & Non-GST both supported. Auto-save forms.", bg: "#f0fdfa", iconColor: "#0d9488" },
              { icon: Package, title: "Products & Services", desc: "Product catalog with HSN/SAC codes, GST rates, units. Auto-detect from name.", bg: "#fef9c3", iconColor: "#ca8a04" },
              { icon: ClipboardList, title: "Inventory Management", desc: "Stock in/out, purchase & selling price, low stock alerts. Full stock tracking.", bg: "#fef3c7", iconColor: "#d97706" },
              { icon: Truck, title: "E-Way Bill", desc: "Generate E-Way Bills from invoices. Vehicle, transporter, distance tracking.", bg: "#fce7f3", iconColor: "#ec4899" },
              { icon: BarChart3, title: "GSTR Reports", desc: "GSTR-1, GSTR-3B, HSN Summary. CSV/Excel export for direct filing.", bg: "#ede9fe", iconColor: "#8b5cf6" },
              { icon: Bell, title: "Payment Reminders", desc: "WhatsApp reminders for pending payments. Track paid/unpaid/partial.", bg: "#fef2f2", iconColor: "#ef4444" },
              { icon: Share2, title: "WhatsApp Share", desc: "Share invoices on WhatsApp with formatted bold text, emojis & link.", bg: "#dcfce7", iconColor: "#16a34a" },
              { icon: Download, title: "PDF Download", desc: "High-quality A4 PDF. Professional layout with letterhead & signature.", bg: "#e0f2fe", iconColor: "#0284c7" },
              { icon: QrCode, title: "E-Invoice QR Code", desc: "Auto QR code on tax invoices for e-invoice compliance.", bg: "#eef2ff", iconColor: "#6366f1" },
              { icon: Layers, title: "Tally Export", desc: "Export in Tally-compatible XML & CSV format. Easy import.", bg: "#f0fdfa", iconColor: "#0d9488" },
              { icon: Calculator, title: "GST Include / Exclude", desc: "Amount with GST included or excluded. Auto reverse-calculation.", bg: "#fef3c7", iconColor: "#d97706" },
              { icon: Save, title: "Auto-Save Forms", desc: "All forms auto-save while typing. Navigate away — data stays.", bg: "#ecfdf5", iconColor: "#10b981" },
              { icon: PenTool, title: "Signature Upload", desc: "Upload signature — auto-populates on all documents & invoices.", bg: "#fef2f2", iconColor: "#ef4444" },
              { icon: Image, title: "Company Letterhead", desc: "Upload letterhead — appears as watermark background on all PDFs.", bg: "#e0f2fe", iconColor: "#0284c7" },
              { icon: IndianRupee, title: "Tally-Style Format", desc: "Indian format with bordered tables, HSN summary, Amount in Words.", bg: "#dcfce7", iconColor: "#16a34a" },
              { icon: Repeat, title: "Repeat Last Bill", desc: "Same party? Auto-fill from last bill. Just enter new amount.", bg: "#fef9c3", iconColor: "#ca8a04" },
              { icon: ToggleLeft, title: "GST / Non-GST", desc: "Support both GST and Non-GST firms and parties.", bg: "#fce7f3", iconColor: "#ec4899" },
              { icon: Shield, title: "Admin Panel", desc: "Full admin access — view, edit, delete all data. Analytics dashboard.", bg: "#ede9fe", iconColor: "#8b5cf6" },
              { icon: TrendingUp, title: "User Analytics", desc: "Total users, invoices, revenue. Daily + monthly charts. Recent signups.", bg: "#fff7ed", iconColor: "#f97316" },
              { icon: CreditCard, title: "Razorpay Subscription", desc: "Integrated payment system. Pricing plans with Razorpay gateway.", bg: "#eef9ff", iconColor: "#0ea5e9" },
              { icon: UserCheck, title: "Google OAuth", desc: "One-click Google login. Email/password signup also supported.", bg: "#ecfdf5", iconColor: "#10b981" },
              { icon: Lock, title: "OTP Password Reset", desc: "Forgot password? OTP sent to email. Secure reset flow.", bg: "#fef2f2", iconColor: "#ef4444" },
              { icon: Mail, title: "Email Notifications", desc: "Professional emails from noreply@gstbillmanager.com via Resend.", bg: "#e0f2fe", iconColor: "#0284c7" },
              { icon: Smartphone, title: "Mobile Responsive", desc: "Hamburger menu, responsive grids. Works on phone, tablet, desktop.", bg: "#fce7f3", iconColor: "#ec4899" },
              { icon: Eye, title: "Barcode Scanner", desc: "Scan product barcodes via camera (EAN-13, UPC, QR). Auto-add to cart → instant invoice.", bg: "#ecfdf5", iconColor: "#10b981" },
              { icon: CreditCard, title: "Digital Business Card", desc: "Create visiting card with logo, QR code, contact info. 6 themes. Download PNG or WhatsApp share.", bg: "#eef2ff", iconColor: "#6366f1" },
              { icon: BookOpen, title: "Daily Cash Book", desc: "रोज़नामचा — Track daily cash in/out. Opening & closing balance. Day-wise grouping. Excel export.", bg: "#fff7ed", iconColor: "#f97316" },
              { icon: BarChart3, title: "Income vs Expense Chart", desc: "6-month bar chart on dashboard. Total income, expense, net profit at a glance.", bg: "#ede9fe", iconColor: "#8b5cf6" },
              { icon: Globe, title: "13 Languages", desc: "English, Hindi, Bengali, Gujarati, Marathi, Tamil, Telugu, Kannada, Malayalam, Punjabi, Urdu, Odia, Assamese.", bg: "#f0fdfa", iconColor: "#0d9488" },
              { icon: Star, title: "POS Receipt", desc: "Thermal printer receipt (58mm/80mm). Quick billing for retail shops.", bg: "#fef9c3", iconColor: "#ca8a04" },
              { icon: Globe, title: "Customer Portal", desc: "Share link — customer views their invoices, payments & balance online.", bg: "#e0f2fe", iconColor: "#0284c7" },
              { icon: Award, title: "Credit / Debit Notes", desc: "GST-compliant return & extra charge notes. Linked to original invoice.", bg: "#fef2f2", iconColor: "#ef4444" },
              { icon: Users, title: "Party Ledger (खाता बही)", desc: "Complete account book per customer. Sales, payments, balance tracking.", bg: "#dcfce7", iconColor: "#16a34a" },
              { icon: IndianRupee, title: "Purchase Bills", desc: "Track purchases. Input Tax Credit ready. Vendor management.", bg: "#fef3c7", iconColor: "#d97706" },
              { icon: Star, title: "Greeting Cards", desc: "Diwali, Holi, Eid cards with company logo & name. WhatsApp share.", bg: "#fce7f3", iconColor: "#ec4899" },
              { icon: Briefcase, title: "Salary Slips & HR", desc: "Employee management, salary slips, attendance tracking. Complete HR module.", bg: "#eef9ff", iconColor: "#0ea5e9" },
              { icon: TrendingUp, title: "Profit & Loss Report", desc: "Monthly P&L with income, expenses, GST breakdown. Category-wise analysis.", bg: "#fff7ed", iconColor: "#f97316" },
              { icon: Download, title: "Bulk Import/Export", desc: "Excel import/export for Products, Customers, Invoices. Bulk operations.", bg: "#ecfdf5", iconColor: "#10b981" },
              { icon: FileText, title: "PDF to Word Export", desc: "Download any invoice as Word document (.doc). Auto-converts PDF layout to editable Word format.", bg: "#eef2ff", iconColor: "#6366f1" },
              { icon: Repeat, title: "Recurring Invoices", desc: "Set monthly/weekly auto-invoices. Never forget to bill again.", bg: "#fef9c3", iconColor: "#ca8a04" },
              { icon: ClipboardList, title: "GSTR-2B Reconciliation", desc: "Match purchase records with government portal data. Auto-reconcile.", bg: "#ede9fe", iconColor: "#8b5cf6" },
              { icon: IndianRupee, title: "UPI Payment Link", desc: "Add Pay Now button on invoices. Customer pays via UPI/Razorpay instantly.", bg: "#dcfce7", iconColor: "#16a34a" },
              { icon: Smartphone, title: "PWA — Install as App", desc: "Install on mobile home screen like an app. Works offline. Play Store ready.", bg: "#fce7f3", iconColor: "#ec4899" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group bg-white hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: f.bg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.iconColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Module Section */}
      <section id="documents" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 bg-indigo-50 text-indigo-700 border border-indigo-100">
              <FolderOpen className="w-3.5 h-3.5" /> DOCUMENTS MODULE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">15 Professional Document Types</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">HR letters, business documents, branding materials, legal papers — each with 4 stunning templates, PDF download, print & WhatsApp share.</p>
          </div>

          {/* Document Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* HR Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#eef2ff" }}>
                  <Briefcase className="w-5 h-5" style={{ color: "#6366f1" }} />
                </div>
                <h3 className="font-bold text-gray-900">HR Documents</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" /> Offer Letter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" /> Joining Letter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" /> Appointment Letter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" /> Experience Letter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" /> Relieving Letter</li>
              </ul>
            </div>

            {/* Business Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
                  <FileText className="w-5 h-5" style={{ color: "#f97316" }} />
                </div>
                <h3 className="font-bold text-gray-900">Business Documents</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" /> Quotation / Estimate</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" /> Payment Receipt</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" /> Purchase Order</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" /> Delivery Challan</li>
              </ul>
            </div>

            {/* Branding Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#ecfdf5" }}>
                  <Award className="w-5 h-5" style={{ color: "#10b981" }} />
                </div>
                <h3 className="font-bold text-gray-900">Branding</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Visiting Card Maker</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Letterhead Generator</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> ID Card Generator</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-xs">Front + Back designs</span></li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-xs">PNG + PDF download</span></li>
              </ul>
            </div>

            {/* Legal Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fef2f2" }}>
                  <BookOpen className="w-5 h-5" style={{ color: "#ef4444" }} />
                </div>
                <h3 className="font-bold text-gray-900">Legal Documents</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500 shrink-0" /> Service Agreement</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500 shrink-0" /> NOC Letter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500 shrink-0" /> Authorization Letter</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-xs">Terms & conditions blocks</span></li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-xs">Digital signature area</span></li>
              </ul>
            </div>
          </div>

          {/* Document Features */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Every Document Includes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Layers, label: "4 Templates", color: "#6366f1" },
                { icon: Download, label: "PDF Download", color: "#0284c7" },
                { icon: Share2, label: "WhatsApp Share", color: "#16a34a" },
                { icon: Image, label: "Letterhead BG", color: "#f97316" },
                { icon: PenTool, label: "Auto Signature", color: "#ef4444" },
                { icon: Building2, label: "Firm Auto-Fill", color: "#0ea5e9" },
              ].map((f) => (
                <div key={f.label} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <f.icon className="w-6 h-6 mx-auto mb-2" style={{ color: f.color }} />
                  <p className="text-sm font-medium text-gray-700">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Invoice Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">10 Invoice Types</h2>
            <p className="text-lg text-gray-500">Every type of GST invoice your business needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              "Tax Invoice", "Bill of Supply", "Credit Note", "Debit Note", "Proforma Invoice",
              "Quotation", "Delivery Challan", "Purchase Bill", "Payment Receipt", "Export Invoice",
            ].map((type) => (
              <div key={type} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                <FileText className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
                <p className="text-sm font-semibold text-gray-800">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-500">From GSTIN to professional PDF in under 30 seconds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Add Your Firms", desc: "Add company details — GSTIN, PAN, bank info, signatures, letterhead. Save once, use forever.", gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
              { step: "2", title: "Add Parties", desc: "Add clients with GST details. Both GST and Non-GST parties. Auto-save forms.", gradient: "linear-gradient(135deg, #f59e0b, #f97316)" },
              { step: "3", title: "Create Invoice", desc: "Select firm → party → amount → Done! GST auto-calculated, Indian format, ready to print.", gradient: "linear-gradient(135deg, #10b981, #14b8a6)" },
              { step: "4", title: "Share & Download", desc: "PDF download, WhatsApp share, print — all in one click. Professional quality.", gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-lg"
                  style={{ background: s.gradient }}>
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin & Management Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powerful Admin Panel</h2>
            <p className="text-lg text-gray-500">Complete control over all clients, data, and settings</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Users, title: "Client Management", desc: "View, edit, delete all client accounts. Monitor activity." },
              { icon: FileText, title: "All Invoices", desc: "Access every invoice from every client. Edit or delete." },
              { icon: Building2, title: "All Firms & Parties", desc: "Manage all firms and parties across clients." },
              { icon: ClipboardList, title: "Inventory Overview", desc: "See all inventory items, manage stock for any client." },
              { icon: Truck, title: "E-Way Bill Control", desc: "View, cancel, delete E-Way Bills for all clients." },
              { icon: BarChart3, title: "GSTR Reports", desc: "Aggregate GSTR-1, 3B, HSN reports across all clients." },
              { icon: TrendingUp, title: "Analytics Dashboard", desc: "Total users, invoices, revenue. Daily/monthly charts." },
              { icon: Eye, title: "Document Settings", desc: "Manage letterhead and signature uploads for documents." },
              { icon: CreditCard, title: "Subscription & Razorpay", desc: "Pricing plans, Razorpay gateway, subscription management." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:shadow-lg transition bg-white">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#eef2ff" }}>
                  <f.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 50%, #10b981 100%)" }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why GST Bill Manager?</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Complete business platform — invoicing, documents, inventory, reports, and more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Super Fast", desc: "Invoice ready in 30 seconds", color: "text-amber-300" },
              { icon: FolderOpen, title: "30+ Features", desc: "Invoice, Documents, Inventory, GSTR", color: "text-emerald-300" },
              { icon: Shield, title: "100% Accurate", desc: "Auto GST calculation + HSN codes", color: "text-cyan-200" },
              { icon: Star, title: "Free to Start", desc: "No credit card required", color: "text-orange-300" },
              { icon: Globe, title: "Works Everywhere", desc: "Phone, tablet, desktop — responsive", color: "text-blue-300" },
              { icon: Lock, title: "Secure Login", desc: "Google OAuth + OTP password reset", color: "text-violet-300" },
              { icon: Share2, title: "Share Instantly", desc: "WhatsApp, Email, PDF, Print", color: "text-green-300" },
              { icon: Layers, title: "15 Doc Templates", desc: "Professional designs, 4 per document", color: "text-pink-300" },
            ].map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/15 hover:bg-white/20 transition-all duration-300">
                <f.icon className={`w-8 h-8 mx-auto mb-3 ${f.color}`} />
                <h3 className="font-semibold text-lg mb-1 text-white">{f.title}</h3>
                <p className="text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — dynamic from admin settings */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">Ready to Simplify Your Business?</h2>
          <p className="text-lg text-white/80 mb-8">GST invoices, HR letters, visiting cards, quotations, inventory, GSTR reports — all from one platform. Join Indian businesses who trust GST Bill Manager.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/90 transition shadow-xl hover:shadow-2xl hover:scale-105">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white">GST Bill Manager</span>
              </div>
              <p className="text-sm leading-relaxed">All-in-one GST billing & business document platform for Indian businesses.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">GST Billing</h4>
              <ul className="space-y-2 text-sm">
                <li>Tax Invoice</li>
                <li>Credit / Debit Note</li>
                <li>Proforma Invoice</li>
                <li>Quotation / Estimate</li>
                <li>Delivery Challan</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Documents</h4>
              <ul className="space-y-2 text-sm">
                <li>Offer / Joining Letter</li>
                <li>Experience / Relieving Letter</li>
                <li>Visiting Card & ID Card</li>
                <li>Service Agreement</li>
                <li>NOC & Authorization</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Management</h4>
              <ul className="space-y-2 text-sm">
                <li>Inventory & Stock</li>
                <li>E-Way Bills</li>
                <li>GSTR Reports</li>
                <li>Tally Export</li>
                <li>Admin Panel</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} GST Bill Manager. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#documents" className="hover:text-white transition">Documents</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <Link href="/login" className="hover:text-white transition">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
