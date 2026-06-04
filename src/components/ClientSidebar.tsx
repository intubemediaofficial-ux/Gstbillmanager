"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getLanguage, t } from "@/lib/i18n";
import {
  LayoutDashboard, Building2, Users, Package, FilePlus, FileText, Settings, BarChart3, LogOut, Menu, X, FolderOpen, History,
  RefreshCw, Receipt, TrendingUp, UserCheck, CreditCard, CalendarDays, Target, Bell, Mail, Clock, ChevronDown, ChevronRight, Archive,
  FileDown, FileUp, BookOpen, ShoppingCart, ClipboardList, IndianRupee, Upload, Image, Tag, Scan, Globe, Printer,
} from "lucide-react";

const navSections = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Firms", href: "/my-firms", icon: Building2 },
      { label: "Bill To (Parties)", href: "/customers", icon: Users },
      { label: "Products", href: "/products", icon: Package },
    ],
  },
  {
    label: "Invoicing",
    items: [
      { label: "Create Invoice", href: "/create-invoice", icon: FilePlus },
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Quotations", href: "/quotations", icon: ClipboardList },
      { label: "Credit Notes", href: "/credit-notes", icon: FileDown },
      { label: "Debit Notes", href: "/debit-notes", icon: FileUp },
      { label: "Purchase Bills", href: "/purchase-bills", icon: ShoppingCart },
      { label: "Recurring Invoices", href: "/recurring-invoices", icon: RefreshCw },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Party Ledger (खाता)", href: "/party-ledger", icon: IndianRupee },
      { label: "Expenses", href: "/expenses", icon: Receipt },
      { label: "Profit & Loss", href: "/profit-loss", icon: TrendingUp },
      { label: "Bill Manager", href: "/bill-manager", icon: Archive },
      { label: "Aging Report", href: "/aging-report", icon: Clock },
      { label: "Party Rates", href: "/party-rates", icon: Tag },
      { label: "Bulk Import", href: "/bulk-import", icon: Upload },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "HR & Payroll",
    items: [
      { label: "Employees", href: "/employees", icon: UserCheck },
      { label: "Salary Slips", href: "/salary-slips", icon: CreditCard },
      { label: "Attendance", href: "/attendance", icon: CalendarDays },
    ],
  },
  {
    label: "GST Reports",
    items: [
      { label: "GSTR Reports", href: "/gstr-reports", icon: BarChart3 },
      { label: "GSTR-2B Reconciliation", href: "/gstr-2b", icon: BookOpen },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Leads & Enquiries", href: "/leads", icon: Target },
      { label: "Follow-up Reminders", href: "/follow-ups", icon: Bell },
      { label: "Email Templates", href: "/email-templates", icon: Mail },
      { label: "Greeting Cards", href: "/greeting-cards", icon: Image },
      { label: "Customer Portal", href: "/customer-portal", icon: Globe },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Documents", href: "/documents", icon: FolderOpen },
      { label: "Document History", href: "/document-history", icon: History },
    ],
  },
  {
    label: "POS & Tools",
    items: [
      { label: "Barcode Scanner", href: "/barcode-scanner", icon: Scan },
      { label: "POS Receipt", href: "/pos-receipt", icon: Printer },
      { label: "Business Card", href: "/business-card", icon: CreditCard },
      { label: "Cash Book", href: "/cash-book", icon: BookOpen },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [lang, setLang] = useState(getLanguage());
  useEffect(() => {
    const handler = () => setLang(getLanguage());
    window.addEventListener("languagechange", handler);
    return () => window.removeEventListener("languagechange", handler);
  }, []);
  const i = (key: string, fallback: string) => t(key, lang) !== key ? t(key, lang) : fallback;

  const hrefToKey: Record<string, string> = {
    "/dashboard": "nav.dashboard", "/my-firms": "nav.my_firms", "/customers": "nav.customers", "/products": "nav.products",
    "/create-invoice": "nav.create_invoice", "/invoices": "nav.invoices", "/quotations": "nav.quotations",
    "/credit-notes": "nav.credit_notes", "/debit-notes": "nav.debit_notes", "/purchase-bills": "nav.purchase_bills",
    "/recurring-invoices": "nav.recurring_invoices", "/party-ledger": "nav.party_ledger", "/expenses": "nav.expenses",
    "/profit-loss": "nav.profit_loss", "/bill-manager": "nav.bill_manager", "/aging-report": "nav.aging_report",
    "/party-rates": "nav.party_rates", "/bulk-import": "nav.bulk_import", "/reports": "nav.reports",
    "/employees": "nav.employees", "/salary-slips": "nav.salary_slips", "/attendance": "nav.attendance",
    "/gstr-reports": "nav.gstr_reports", "/gstr-2b": "nav.gstr_2b", "/leads": "nav.leads",
    "/follow-ups": "nav.follow_ups", "/email-templates": "nav.email_templates", "/greeting-cards": "nav.greeting_cards",
    "/documents": "nav.documents", "/document-history": "nav.document_history", "/settings": "nav.settings",
    "/inventory": "nav.inventory", "/eway-bills": "nav.eway_bills",
    "/barcode-scanner": "nav.barcode_scanner", "/pos-receipt": "nav.pos_receipt", "/customer-portal": "nav.customer_portal",
    "/business-card": "nav.business_card", "/cash-book": "nav.cash_book",
  };
  const navLabel = (href: string, fallback: string) => { const k = hrefToKey[href]; return k ? i(k, fallback) : fallback; };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const toggleSection = (label: string) => {
    setCollapsed((p) => ({ ...p, [label]: !p[label] }));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-slate-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-[250px] bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}>
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">GST Bill Manager</h1>
            <p className="text-xs text-slate-400 mt-0.5">Client Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
          {navSections.map((section) => {
            const isCollapsed = collapsed[section.label];
            return (
              <div key={section.label}>
                <button onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold hover:text-slate-300 transition">
                  <span>{section.label}</span>
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {!isCollapsed && section.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {navLabel(item.href, item.label)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white w-full transition"
          >
            <LogOut className="w-5 h-5" />
            {i("common.logout", "Logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
