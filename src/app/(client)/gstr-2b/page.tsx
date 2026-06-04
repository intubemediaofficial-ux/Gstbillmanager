"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Upload, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Invoice } from "@/lib/gst-types";
import { formatCurrency } from "@/lib/gst-utils";

interface GSTR2BEntry {
  gstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  totalTax: number;
}

type MatchStatus = "matched" | "mismatch" | "missing_in_books" | "missing_in_gstr";

interface ReconcileRow {
  gstin: string;
  supplierName: string;
  invoiceNumber: string;
  gstrAmount?: number;
  booksAmount?: number;
  gstrTax?: number;
  booksTax?: number;
  status: MatchStatus;
  diff: number;
}

export default function GSTR2BPage() {
  const [purchaseBills, setPurchaseBills] = useState<Invoice[]>([]);
  const [gstrData, setGstrData] = useState<GSTR2BEntry[]>([]);
  const [reconciled, setReconciled] = useState<ReconcileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploaded, setUploaded] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetch("/api/invoices").then((r) => r.json()).then((res) => {
      setPurchaseBills((res.data || []).filter((i: Invoice) => i.invoiceType === "purchase_bill"));
    }).finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws);

    const entries: GSTR2BEntry[] = rows.map((row) => {
      const gstin = row["GSTIN of Supplier"] || row["GSTIN"] || row["gstin"] || "";
      const name = row["Trade/Legal Name"] || row["Supplier Name"] || row["supplier_name"] || "";
      const invNo = row["Invoice Number"] || row["Invoice No"] || row["invoice_number"] || "";
      const invDate = row["Invoice Date"] || row["invoice_date"] || "";
      const taxable = parseFloat(row["Taxable Value"] || row["taxable_value"] || "0") || 0;
      const igst = parseFloat(row["Integrated Tax"] || row["IGST"] || row["igst"] || "0") || 0;
      const cgst = parseFloat(row["Central Tax"] || row["CGST"] || row["cgst"] || "0") || 0;
      const sgst = parseFloat(row["State/UT Tax"] || row["SGST"] || row["sgst"] || "0") || 0;
      return { gstin, supplierName: name, invoiceNumber: invNo, invoiceDate: invDate, taxableValue: taxable, igst, cgst, sgst, totalTax: igst + cgst + sgst };
    }).filter((e) => e.gstin || e.invoiceNumber);

    setGstrData(entries);
    setUploaded(true);
    reconcile(entries);
  };

  const reconcile = (gstrEntries: GSTR2BEntry[]) => {
    const rows: ReconcileRow[] = [];
    const matchedBillIds = new Set<string>();

    for (const gstr of gstrEntries) {
      const match = purchaseBills.find((b) =>
        (b.customer.gstin === gstr.gstin || b.invoiceNumber.toLowerCase() === gstr.invoiceNumber.toLowerCase())
      );
      if (match) {
        matchedBillIds.add(match.id);
        const diff = Math.abs(match.grandTotal - (gstr.taxableValue + gstr.totalTax));
        rows.push({
          gstin: gstr.gstin,
          supplierName: gstr.supplierName || match.customer.name,
          invoiceNumber: gstr.invoiceNumber,
          gstrAmount: gstr.taxableValue + gstr.totalTax,
          booksAmount: match.grandTotal,
          gstrTax: gstr.totalTax,
          booksTax: match.totalTax,
          status: diff < 1 ? "matched" : "mismatch",
          diff,
        });
      } else {
        rows.push({
          gstin: gstr.gstin,
          supplierName: gstr.supplierName,
          invoiceNumber: gstr.invoiceNumber,
          gstrAmount: gstr.taxableValue + gstr.totalTax,
          gstrTax: gstr.totalTax,
          status: "missing_in_books",
          diff: gstr.taxableValue + gstr.totalTax,
        });
      }
    }

    for (const bill of purchaseBills) {
      if (!matchedBillIds.has(bill.id)) {
        rows.push({
          gstin: bill.customer.gstin || "",
          supplierName: bill.customer.name,
          invoiceNumber: bill.invoiceNumber,
          booksAmount: bill.grandTotal,
          booksTax: bill.totalTax,
          status: "missing_in_gstr",
          diff: bill.grandTotal,
        });
      }
    }

    setReconciled(rows);
  };

  const matched = reconciled.filter((r) => r.status === "matched");
  const mismatched = reconciled.filter((r) => r.status === "mismatch");
  const missingBooks = reconciled.filter((r) => r.status === "missing_in_books");
  const missingGstr = reconciled.filter((r) => r.status === "missing_in_gstr");

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = reconciled.map((r) => ({
      "GSTIN": r.gstin, "Supplier": r.supplierName, "Invoice #": r.invoiceNumber,
      "GSTR-2B Amount": r.gstrAmount || "", "Books Amount": r.booksAmount || "",
      "GSTR-2B Tax": r.gstrTax || "", "Books Tax": r.booksTax || "",
      "Status": r.status === "matched" ? "Matched" : r.status === "mismatch" ? "Mismatch" : r.status === "missing_in_books" ? "Missing in Books" : "Missing in GSTR-2B",
      "Difference": r.diff,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reconciliation");
    XLSX.writeFile(wb, `GSTR2B_Reconciliation_${period}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> GSTR-2B Reconciliation</h1>
          <p className="text-sm text-gray-500 mt-1">Compare purchase bills with GSTR-2B data to verify ITC claims</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="font-semibold mb-3">Step 1: Upload GSTR-2B Data (Excel/CSV)</h3>
        <p className="text-sm text-gray-500 mb-4">Download GSTR-2B from GST portal → Save as Excel → Upload here</p>
        <div className="flex flex-wrap items-center gap-4">
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 text-sm font-medium">
            <Upload className="w-4 h-4" /> Upload GSTR-2B Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
          </label>
          {uploaded && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {gstrData.length} entries loaded</span>}
        </div>
      </div>

      {/* Summary Cards */}
      {uploaded && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-xs text-green-700 font-medium">Matched</p>
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">{matched.length}</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <p className="text-xs text-amber-700 font-medium">Amount Mismatch</p>
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-1">{mismatched.length}</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-xs text-red-700 font-medium">Missing in Books</p>
              </div>
              <p className="text-2xl font-bold text-red-700 mt-1">{missingBooks.length}</p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Missing in GSTR-2B</p>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">{missingGstr.length}</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
              <Download className="w-3.5 h-3.5" /> Download Report
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Supplier</th>
                  <th className="text-left p-3 font-medium">GSTIN</th>
                  <th className="text-left p-3 font-medium">Invoice #</th>
                  <th className="text-right p-3 font-medium">GSTR-2B Amt</th>
                  <th className="text-right p-3 font-medium">Books Amt</th>
                  <th className="text-right p-3 font-medium">Difference</th>
                </tr>
              </thead>
              <tbody>
                {reconciled.map((r, i) => (
                  <tr key={i} className={`border-t ${r.status === "matched" ? "bg-green-50/50" : r.status === "mismatch" ? "bg-amber-50/50" : r.status === "missing_in_books" ? "bg-red-50/50" : "bg-blue-50/50"}`}>
                    <td className="p-3">
                      {r.status === "matched" && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Matched</span>}
                      {r.status === "mismatch" && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Mismatch</span>}
                      {r.status === "missing_in_books" && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Not in Books</span>}
                      {r.status === "missing_in_gstr" && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Not in GSTR</span>}
                    </td>
                    <td className="p-3 font-medium">{r.supplierName}</td>
                    <td className="p-3 text-xs text-gray-500 font-mono">{r.gstin}</td>
                    <td className="p-3 font-mono text-xs">{r.invoiceNumber}</td>
                    <td className="p-3 text-right">{r.gstrAmount !== undefined ? formatCurrency(r.gstrAmount) : "—"}</td>
                    <td className="p-3 text-right">{r.booksAmount !== undefined ? formatCurrency(r.booksAmount) : "—"}</td>
                    <td className="p-3 text-right font-medium">{r.diff > 0 ? <span className="text-red-600">{formatCurrency(r.diff)}</span> : <span className="text-green-600">0</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!uploaded && !loading && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">Upload GSTR-2B data to start reconciliation</p>
          <p className="text-xs text-gray-400">Your purchase bills ({purchaseBills.length}) will be matched against GSTR-2B entries</p>
        </div>
      )}
    </div>
  );
}
