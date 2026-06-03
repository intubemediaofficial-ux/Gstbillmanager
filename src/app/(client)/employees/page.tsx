"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Plus, Trash2, Search, Edit2, Phone, Mail, Building2, X } from "lucide-react";
import type { Employee } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", empId: "", email: "", phone: "", department: "", designation: "", joiningDate: "", salary: "", bankName: "", accountNumber: "", ifscCode: "", panNumber: "", aadharNumber: "", address: "", emergencyContact: "" });
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/employees").then((r) => r.json()).then((res) => setItems(res.data || [])).finally(() => setLoading(false));
  }, []);

  const resetForm = () => setForm({ name: "", empId: "", email: "", phone: "", department: "", designation: "", joiningDate: "", salary: "", bankName: "", accountNumber: "", ifscCode: "", panNumber: "", aadharNumber: "", address: "", emergencyContact: "" });

  const handleSave = async () => {
    const action = editId ? "update" : "create";
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...form, salary: Number(form.salary), ...(editId ? { id: editId } : {}) }),
    });
    const data = await res.json();
    if (data.success) {
      if (editId) setItems((p) => p.map((i) => (i.id === editId ? data.data : i)));
      else setItems((p) => [data.data, ...p]);
      setShowForm(false);
      setEditId(null);
      resetForm();
    }
  };

  const handleEdit = (emp: Employee) => {
    setForm({ name: emp.name, empId: emp.empId, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation, joiningDate: emp.joiningDate, salary: String(emp.salary), bankName: emp.bankName || "", accountNumber: emp.accountNumber || "", ifscCode: emp.ifscCode || "", panNumber: emp.panNumber || "", aadharNumber: emp.aadharNumber || "", address: emp.address || "", emergencyContact: emp.emergencyContact || "" });
    setEditId(emp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.department.toLowerCase().includes(q) || i.designation.toLowerCase().includes(q) || i.empId.toLowerCase().includes(q);
  });

  const activeCount = items.filter((i) => i.status === "active").length;
  const totalSalary = items.filter((i) => i.status === "active").reduce((s, i) => s + i.salary, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team</p>
        </div>
        <button onClick={() => { resetForm(); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: items.length, color: "blue" },
          { label: "Active", value: activeCount, color: "emerald" },
          { label: "Monthly Payroll", value: formatCurrency(totalSalary), color: "violet" },
          { label: "Departments", value: new Set(items.map((i) => i.department)).size, color: "amber" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 bg-white border border-${s.color}-100 shadow-sm`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? "Edit" : "Add"} Employee</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Emp ID" value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Joining Date</label><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500">Monthly Salary</label><input type="number" placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="PAN Number" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Aadhar Number" value={form.aadharNumber} onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <input placeholder="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="IFSC Code" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">{editId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No employees yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((emp) => (
              <div key={emp.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{emp.name} <span className="text-xs text-gray-400">({emp.empId})</span></p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{emp.department} · {emp.designation}</span>
                    {emp.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>}
                    {emp.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm text-gray-900">{formatCurrency(emp.salary)}/mo</p>
                  <p className="text-xs text-gray-400">Joined {formatDate(emp.joiningDate)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(emp)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
