"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Plus, Trash2, Search, Download, CheckCircle, X } from "lucide-react";
import type { SalarySlip, Employee } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

export default function SalarySlipsPage() {
  const [items, setItems] = useState<SalarySlip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    employeeId: "", month: new Date().toISOString().slice(0, 7),
    basicSalary: "", hra: "", conveyance: "", medicalAllowance: "", specialAllowance: "", otherAllowances: "",
    pf: "", esi: "", professionalTax: "", tds: "", otherDeductions: "",
    paymentMode: "bank_transfer", paymentDate: new Date().toISOString().split("T")[0],
  });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    Promise.all([
      fetch("/api/salary-slips").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]).then(([sRes, eRes]) => {
      setItems(sRes.data || []);
      setEmployees(eRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSelectEmployee = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      const basic = Math.round(emp.salary * 0.5);
      const hra = Math.round(emp.salary * 0.2);
      const conv = 1600;
      const med = 1250;
      const special = emp.salary - basic - hra - conv - med;
      setForm({ ...form, employeeId: empId, basicSalary: String(basic), hra: String(hra), conveyance: String(conv), medicalAllowance: String(med), specialAllowance: String(Math.max(0, special)), pf: "", esi: "", professionalTax: "", tds: "", otherDeductions: "" });
    } else {
      setForm({ ...form, employeeId: empId });
    }
  };

  const handleCreate = async () => {
    const emp = employees.find((e) => e.id === form.employeeId);
    const res = await fetch("/api/salary-slips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create", ...form, employeeName: emp?.name || "", empCode: emp?.empId || "",
        department: emp?.department || "", designation: emp?.designation || "",
        bankName: emp?.bankName, accountNumber: emp?.accountNumber,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((p) => [data.data, ...p]);
      setShowForm(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    const res = await fetch("/api/salary-slips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status: "paid" }),
    });
    const data = await res.json();
    if (data.success) setItems((p) => p.map((i) => (i.id === id ? data.data : i)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this salary slip?")) return;
    await fetch("/api/salary-slips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const handleDownloadPDF = async (slip: SalarySlip) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const monthLabel = new Date(slip.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const fc = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const w = 190;
    let y = 15;

    // Header
    doc.setFillColor(18, 42, 78);
    doc.rect(10, 10, w, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SALARY SLIP", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(monthLabel, 105, 27, { align: "center" });
    y = 40;

    // Employee Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Details", 14, y);
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 7;
    doc.setFontSize(9);
    const details = [
      ["Name", slip.employeeName, "Emp Code", slip.empCode],
      ["Department", slip.department, "Designation", slip.designation],
      ["Payment Mode", slip.paymentMode.replace("_", " ").toUpperCase(), "Payment Date", slip.paymentDate],
      ["Bank", slip.bankName || "-", "Account", slip.accountNumber || "-"],
    ];
    for (const row of details) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(row[0] + ":", 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(row[1], 50, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(row[2] + ":", 110, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(row[3], 148, y);
      y += 6;
    }
    y += 4;

    // Earnings & Deductions side by side
    const colW = 88;
    // Earnings header
    doc.setFillColor(220, 240, 220);
    doc.rect(14, y, colW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 100, 0);
    doc.text("EARNINGS", 16, y + 5.5);
    doc.text("Amount", 14 + colW - 4, y + 5.5, { align: "right" });
    // Deductions header
    doc.setFillColor(240, 220, 220);
    doc.rect(108, y, colW, 8, "F");
    doc.setTextColor(180, 0, 0);
    doc.text("DEDUCTIONS", 110, y + 5.5);
    doc.text("Amount", 108 + colW - 4, y + 5.5, { align: "right" });
    y += 10;

    const earnings = [
      ["Basic Salary", slip.basicSalary], ["HRA", slip.hra], ["Conveyance", slip.conveyance],
      ["Medical Allowance", slip.medicalAllowance], ["Special Allowance", slip.specialAllowance], ["Other Allowances", slip.otherAllowances],
    ].filter(([, v]) => (v as number) > 0);
    const deductions = [
      ["PF", slip.pf], ["ESI", slip.esi], ["Professional Tax", slip.professionalTax],
      ["TDS", slip.tds], ["Other Deductions", slip.otherDeductions],
    ].filter(([, v]) => (v as number) > 0);

    const maxRows = Math.max(earnings.length, deductions.length);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (let i = 0; i < maxRows; i++) {
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(14, y - 1, colW, 6, "F");
        doc.rect(108, y - 1, colW, 6, "F");
      }
      doc.setTextColor(60, 60, 60);
      if (earnings[i]) {
        doc.text(earnings[i][0] as string, 16, y + 3);
        doc.text(fc(earnings[i][1] as number), 14 + colW - 4, y + 3, { align: "right" });
      }
      if (deductions[i]) {
        doc.text(deductions[i][0] as string, 110, y + 3);
        doc.text(fc(deductions[i][1] as number), 108 + colW - 4, y + 3, { align: "right" });
      }
      y += 6;
    }
    y += 2;

    // Totals
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 100, 0);
    doc.text("Gross Salary:", 16, y);
    doc.text(fc(slip.grossSalary), 14 + colW - 4, y, { align: "right" });
    doc.setTextColor(180, 0, 0);
    doc.text("Total Deductions:", 110, y);
    doc.text(fc(slip.totalDeductions), 108 + colW - 4, y, { align: "right" });
    y += 10;

    // Net Salary Box
    doc.setFillColor(18, 42, 78);
    doc.rect(14, y, w, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text("NET SALARY", 20, y + 10);
    doc.text(fc(slip.netSalary), 190, y + 10, { align: "right" });
    y += 22;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a system generated salary slip.", 105, y, { align: "center" });

    doc.save(`Salary_Slip_${slip.employeeName.replace(/\s+/g, "_")}_${slip.month}.pdf`);
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.employeeName.toLowerCase().includes(q) || i.empCode.toLowerCase().includes(q) || i.month.includes(q);
  });

  const totalPaid = items.filter((i) => i.status === "paid").reduce((s, i) => s + i.netSalary, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Slips</h1>
          <p className="text-sm text-gray-500 mt-1">Generate payslips for employees</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Generate Payslip
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Slips", value: items.length, color: "blue" },
          { label: "Paid", value: items.filter((i) => i.status === "paid").length, color: "emerald" },
          { label: "Draft", value: items.filter((i) => i.status === "draft").length, color: "amber" },
          { label: "Total Paid", value: formatCurrency(totalPaid), color: "violet" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border border-${s.color}-100 shadow-sm`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input placeholder="Search salary slips..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Generate Salary Slip</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={form.employeeId} onChange={(e) => handleSelectEmployee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Employee</option>
                {employees.filter((e) => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name} ({e.empId})</option>)}
              </select>
              <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Earnings</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Basic</label><input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">HRA</label><input type="number" value={form.hra} onChange={(e) => setForm({ ...form, hra: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">Conveyance</label><input type="number" value={form.conveyance} onChange={(e) => setForm({ ...form, conveyance: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">Medical</label><input type="number" value={form.medicalAllowance} onChange={(e) => setForm({ ...form, medicalAllowance: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">Special</label><input type="number" value={form.specialAllowance} onChange={(e) => setForm({ ...form, specialAllowance: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">Other</label><input type="number" value={form.otherAllowances} onChange={(e) => setForm({ ...form, otherAllowances: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Deductions</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">PF</label><input type="number" value={form.pf} onChange={(e) => setForm({ ...form, pf: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">ESI</label><input type="number" value={form.esi} onChange={(e) => setForm({ ...form, esi: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">Prof. Tax</label><input type="number" value={form.professionalTax} onChange={(e) => setForm({ ...form, professionalTax: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">TDS</label><input type="number" value={form.tds} onChange={(e) => setForm({ ...form, tds: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option><option value="cheque">Cheque</option><option value="upi">UPI</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!form.employeeId} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Generate</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No salary slips yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((slip) => (
              <div key={slip.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{slip.employeeName} <span className="text-xs text-gray-400">({slip.empCode})</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{slip.department} · {slip.designation} · {new Date(slip.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-gray-900">{formatCurrency(slip.netSalary)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slip.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{slip.status}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleDownloadPDF(slip)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download PDF"><Download className="w-4 h-4" /></button>
                  {slip.status === "draft" && (
                    <button onClick={() => handleMarkPaid(slip.id)} className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Mark Paid"><CheckCircle className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => handleDelete(slip.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
