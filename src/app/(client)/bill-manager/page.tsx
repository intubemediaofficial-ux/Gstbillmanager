"use client";

import { useState, useEffect, useRef } from "react";
import { FolderOpen, Upload, Search, Trash2, Download, Filter, CheckSquare, Square, X, Plus, FileText, ShoppingCart, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

interface StoredBill {
  id: string;
  type: "sales" | "purchase" | "other";
  billNumber: string;
  partyName: string;
  amount: number;
  gstAmount: number;
  date: string;
  month: string;
  year: number;
  category: string;
  notes: string;
  fileData: string;
  fileName: string;
  fileType: string;
  createdAt: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CATEGORIES = ["general", "raw_materials", "office_supplies", "services", "utilities", "rent", "salary", "transport", "food", "other"];

export default function BillManagerPage() {
  const [bills, setBills] = useState<StoredBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formType, setFormType] = useState<"sales" | "purchase" | "other">("purchase");
  const [formBillNumber, setFormBillNumber] = useState("");
  const [formPartyName, setFormPartyName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formGstAmount, setFormGstAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState("general");
  const [formNotes, setFormNotes] = useState("");
  const [formFile, setFormFile] = useState<{ data: string; name: string; type: string } | null>(null);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/bill-storage").then((r) => r.json()).then((res) => setBills(res.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.partyName.toLowerCase().includes(q) || b.billNumber.toLowerCase().includes(q) || b.notes.toLowerCase().includes(q);
    const matchMonth = !filterMonth || b.month === filterMonth;
    const matchType = !filterType || b.type === filterType;
    return matchSearch && matchMonth && matchType;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File size must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setFormFile({ data: reader.result as string, name: file.name, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formPartyName.trim()) { alert("Party name is required"); return; }
    setSaving(true);
    const res = await fetch("/api/bill-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        type: formType,
        billNumber: formBillNumber,
        partyName: formPartyName,
        amount: parseFloat(formAmount) || 0,
        gstAmount: parseFloat(formGstAmount) || 0,
        date: formDate,
        category: formCategory,
        notes: formNotes,
        fileData: formFile?.data || "",
        fileName: formFile?.name || "",
        fileType: formFile?.type || "",
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setBills((prev) => [data.data, ...prev]);
      setShowForm(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bill?")) return;
    await fetch("/api/bill-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setBills((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleBulkDownload = () => {
    const selected = filtered.filter((b) => selectedIds.has(b.id) && b.fileData);
    if (selected.length === 0) { alert("No files to download. Select bills that have uploaded files."); return; }
    selected.forEach((b) => {
      const link = document.createElement("a");
      link.href = b.fileData;
      link.download = b.fileName || `bill_${b.billNumber || b.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const resetForm = () => {
    setFormType("purchase");
    setFormBillNumber("");
    setFormPartyName("");
    setFormAmount("");
    setFormGstAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormCategory("general");
    setFormNotes("");
    setFormFile(null);
  };

  const typeConfig = { sales: { label: "Sales", icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50" }, purchase: { label: "Purchase", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" }, other: { label: "Other", icon: FileText, color: "text-gray-600", bg: "bg-gray-50" } };

  const totalAmount = filtered.reduce((s, b) => s + b.amount + b.gstAmount, 0);
  const purchaseTotal = filtered.filter((b) => b.type === "purchase").reduce((s, b) => s + b.amount + b.gstAmount, 0);
  const salesTotal = filtered.filter((b) => b.type === "sales").reduce((s, b) => s + b.amount + b.gstAmount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Store, organize & download all your bills — sales & purchase</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm">
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-white border shadow-sm"><p className="text-xs text-gray-500">Total Bills</p><p className="text-lg font-bold">{filtered.length}</p></div>
        <div className="rounded-xl p-4 bg-white border shadow-sm"><p className="text-xs text-gray-500">Total Amount</p><p className="text-lg font-bold">{formatCurrency(totalAmount)}</p></div>
        <div className="rounded-xl p-4 bg-white border shadow-sm"><p className="text-xs text-gray-500">Purchase Bills</p><p className="text-lg font-bold text-blue-600">{formatCurrency(purchaseTotal)}</p></div>
        <div className="rounded-xl p-4 bg-white border shadow-sm"><p className="text-xs text-gray-500">Sales Bills</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(salesTotal)}</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input placeholder="Search by party name, bill number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Months</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="sales">Sales</option>
          <option value="other">Other</option>
        </select>
        {selectedIds.size > 0 && (
          <button onClick={handleBulkDownload} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Download className="w-4 h-4" /> Download {selectedIds.size} Selected
          </button>
        )}
      </div>

      {/* Select All */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <button onClick={selectAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            {selectedIds.size === filtered.length ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
            Select All ({filtered.length})
          </button>
        </div>
      )}

      {/* Bills List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No bills found</p>
            <p className="text-gray-400 text-sm mt-1">Add purchase or sales bills to organize them here</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((bill) => {
              const tc = typeConfig[bill.type];
              return (
                <div key={bill.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <button onClick={() => toggleSelect(bill.id)}>
                    {selectedIds.has(bill.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-300" />}
                  </button>
                  <div className={`p-2 rounded-lg ${tc.bg}`}>
                    <tc.icon className={`w-5 h-5 ${tc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{bill.partyName} {bill.billNumber && <span className="text-gray-400 font-normal">#{bill.billNumber}</span>}</p>
                    <p className="text-xs text-gray-500">{formatDate(bill.date)} · {bill.month} {bill.year} · {tc.label} · {bill.category}</p>
                    {bill.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{bill.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(bill.amount + bill.gstAmount)}</p>
                    {bill.gstAmount > 0 && <p className="text-xs text-gray-400">GST: {formatCurrency(bill.gstAmount)}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {bill.fileData && (
                      <a href={bill.fileData} download={bill.fileName} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Download className="w-4 h-4" /></a>
                    )}
                    {bill.fileName && <span className="text-xs text-gray-400 max-w-[80px] truncate">{bill.fileName}</span>}
                    <button onClick={() => handleDelete(bill.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">Add Bill</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bill Type</label>
                <div className="flex gap-2">
                  {(["purchase", "sales", "other"] as const).map((t) => (
                    <button key={t} onClick={() => setFormType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border ${formType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                      {t === "purchase" ? "Purchase" : t === "sales" ? "Sales" : "Other"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Party / Vendor Name *</label>
                  <input value={formPartyName} onChange={(e) => setFormPartyName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Company name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bill Number</label>
                  <input value={formBillNumber} onChange={(e) => setFormBillNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="INV-001" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST Amount</label>
                  <input type="number" value={formGstAmount} onChange={(e) => setFormGstAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Bill (PDF/Image, max 5MB)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer" onClick={() => document.getElementById("billFileInput")?.click()}>
                  {formFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">{formFile.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setFormFile(null); }} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">Click to upload bill file</p>
                    </>
                  )}
                  <input id="billFileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Bill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
