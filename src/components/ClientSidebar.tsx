"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, Package, FilePlus, FileText, Settings, BarChart3, LogOut, Menu, X, FolderOpen, History,
  RefreshCw, Receipt, TrendingUp, UserCheck, CreditCard, CalendarDays, Target, Bell, Mail, Clock, ChevronDown, ChevronRight, Archive,
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
      { label: "Recurring Invoices", href: "/recurring-invoices", icon: RefreshCw },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Expenses", href: "/expenses", icon: Receipt },
      { label: "Profit & Loss", href: "/profit-loss", icon: TrendingUp },
      { label: "Bill Manager", href: "/bill-manager", icon: Archive },
      { label: "Aging Report", href: "/aging-report", icon: Clock },
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
    label: "CRM",
    items: [
      { label: "Leads & Enquiries", href: "/leads", icon: Target },
      { label: "Follow-up Reminders", href: "/follow-ups", icon: Bell },
      { label: "Email Templates", href: "/email-templates", icon: Mail },
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
                      {item.label}
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
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
