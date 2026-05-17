"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Trash2, Calendar, Building2, User, Search, Filter, ArrowLeft } from "lucide-react";

interface SavedDoc {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  title: string;
  recipientName: string;
  firmName: string;
  templateName: string;
  formData: Record<string, string>;
  createdAt: string;
}

const DOC_TYPE_COLORS: Record<string, string> = {
  "Offer Letter": "bg-blue-100 text-blue-700",
  "Joining Letter": "bg-indigo-100 text-indigo-700",
  "Appointment Letter": "bg-violet-100 text-violet-700",
  "Experience Letter": "bg-purple-100 text-purple-700",
  "Relieving Letter": "bg-fuchsia-100 text-fuchsia-700",
  "Quotation": "bg-emerald-100 text-emerald-700",
  "Payment Receipt": "bg-green-100 text-green-700",
  "Purchase Order": "bg-teal-100 text-teal-700",
  "Delivery Challan": "bg-cyan-100 text-cyan-700",
  "Visiting Card": "bg-amber-100 text-amber-700",
  "Letterhead": "bg-orange-100 text-orange-700",
  "ID Card": "bg-yellow-100 text-yellow-700",
  "Service Agreement": "bg-rose-100 text-rose-700",
  "NOC Letter": "bg-pink-100 text-pink-700",
  "Authorization Letter": "bg-red-100 text-red-700",
};

export default function DocumentHistoryPage() {
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/documents")
      .then((r) => r.json())
      .then((res) => setDocs(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document from history?")) return;
    await fetch("/api/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const types = [...new Set(docs.map((d) => d.type))].sort();

  const filtered = docs.filter((d) => {
    if (typeFilter && d.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.recipientName.toLowerCase().includes(q) ||
        d.firmName.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Document History</h1>
          <p className="text-sm text-gray-500 mt-1">All documents you have generated</p>
        </div>
        <Link href="/documents" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          <FileText className="w-4 h-4" /> Create New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Documents</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{docs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Document Types</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{types.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {docs.filter((d) => new Date(d.createdAt).getMonth() === new Date().getMonth() && new Date(d.createdAt).getFullYear() === new Date().getFullYear()).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Today</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {docs.filter((d) => new Date(d.createdAt).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white">
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No documents yet</h3>
          <p className="text-sm text-gray-400 mt-1">Documents you generate will appear here automatically</p>
          <Link href="/documents" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Create Document
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Document</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Recipient</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Firm</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Template</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="font-medium text-gray-800 truncate max-w-[200px]">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${DOC_TYPE_COLORS[doc.type] || "bg-gray-100 text-gray-700"}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {doc.recipientName || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {doc.firmName || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{doc.templateName || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
