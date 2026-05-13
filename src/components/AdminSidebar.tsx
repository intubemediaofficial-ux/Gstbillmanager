"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, BarChart3, LogOut,
  Building2, Package, FilePlus, Settings,
} from "lucide-react";

const adminNavItems = [
  { label: "Admin Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { label: "Client Accounts", href: "/admin-clients", icon: Users },
  { label: "All Invoices", href: "/admin-invoices", icon: FileText },
  { label: "Reports", href: "/admin-reports", icon: BarChart3 },
];

const clientNavItems = [
  { label: "My Firms", href: "/my-firms", icon: Building2 },
  { label: "Bill To (Parties)", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Create Invoice", href: "/create-invoice", icon: FilePlus },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Invoice Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-slate-900 text-white flex flex-col z-40 overflow-y-auto">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-lg font-bold">GST Bill Manager</h1>
        <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {/* Admin Pages */}
        <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Admin</p>
        {adminNavItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Client Pages Access */}
        <div className="pt-3 mt-3 border-t border-slate-700">
          <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Client Panel Access</p>
          {clientNavItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white w-full transition">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
