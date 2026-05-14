"use client";

import { useState, useEffect, useRef } from "react";
import { Users, FileText, IndianRupee, TrendingUp, Calendar, UserPlus, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/gst-utils";

interface AnalyticsData {
  totalUsers: number;
  activeToday: number;
  signupsMonth: number;
  totalInvoices: number;
  todayInvoices: number;
  monthInvoices: number;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  last30Days: { date: string; invoices: number; revenue: number }[];
  last12Months: { month: string; invoices: number; revenue: number }[];
  recentSignups: { name: string; email: string; createdAt: string }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<"daily" | "monthly">("daily");

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/admin/analytics").then(r => r.json()).then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-400">Failed to load analytics</div>;

  const chartData = chartView === "daily" ? data.last30Days : data.last12Months;
  const maxInvoices = Math.max(...chartData.map(d => d.invoices), 1);
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" /> User Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track user activity, invoices, and revenue</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "Users",
            stats: [
              { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Signups Today", value: data.activeToday, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Signups This Month", value: data.signupsMonth, icon: Calendar, color: "text-violet-600", bg: "bg-violet-50" },
            ],
          },
          {
            title: "Invoices",
            stats: [
              { label: "Total Invoices", value: data.totalInvoices, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Today", value: data.todayInvoices, icon: FileText, color: "text-cyan-600", bg: "bg-cyan-50" },
              { label: "This Month", value: data.monthInvoices, icon: FileText, color: "text-pink-600", bg: "bg-pink-50" },
            ],
          },
          {
            title: "Revenue",
            stats: [
              { label: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Today", value: formatCurrency(data.todayRevenue), icon: IndianRupee, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "This Month", value: formatCurrency(data.monthRevenue), icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
            ],
          },
        ].map((group) => (
          <div key={group.title} className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{group.title}</h3>
            <div className="space-y-3">
              {group.stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Invoice Chart */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Invoice Activity</h2>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button onClick={() => setChartView("daily")}
                className={`px-3 py-1 text-xs font-medium ${chartView === "daily" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                30 Days
              </button>
              <button onClick={() => setChartView("monthly")}
                className={`px-3 py-1 text-xs font-medium ${chartView === "monthly" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                12 Months
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-1 h-40">
              {chartData.map((d, i) => {
                const label = chartView === "daily" ? ("date" in d ? (d as { date: string }).date.slice(8) : "") : ("month" in d ? (d as { month: string }).month : "");
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      {d.invoices} invoices
                    </div>
                    <div className="w-full rounded-t-sm bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${Math.max((d.invoices / maxInvoices) * 100, 2)}%`, minHeight: "2px" }} />
                    {(chartView === "monthly" || i % 5 === 0) && (
                      <span className="text-[9px] text-gray-400 mt-0.5">{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-5 border-b flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold">Revenue Trend</h2>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-1 h-40">
              {chartData.map((d, i) => {
                const label = chartView === "daily" ? ("date" in d ? (d as { date: string }).date.slice(8) : "") : ("month" in d ? (d as { month: string }).month : "");
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      {formatCurrency(d.revenue)}
                    </div>
                    <div className="w-full rounded-t-sm bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                      style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%`, minHeight: "2px" }} />
                    {(chartView === "monthly" || i % 5 === 0) && (
                      <span className="text-[9px] text-gray-400 mt-0.5">{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-violet-600" />
          <h2 className="font-semibold">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Name</th>
                <th className="text-left p-3 font-medium text-gray-600">Email</th>
                <th className="text-left p-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSignups.map((u, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{u.name}</td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3 text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                </tr>
              ))}
              {data.recentSignups.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-gray-400">No signups yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
