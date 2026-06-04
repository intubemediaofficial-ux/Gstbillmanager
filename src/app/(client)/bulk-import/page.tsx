"use client";

import { useState, useRef } from "react";
import { Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet, Users, Package, FileText } from "lucide-react";

type ImportType = "customers" | "products" | "invoices";

interface PreviewRow {
  [key: string]: string | number;
}

export default function BulkImportPage() {
  const [importType, setImportType] = useState<ImportType>("customers");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: PreviewRow[] = XLSX.utils.sheet_to_json(ws);
    if (rows.length > 0) {
      setColumns(Object.keys(rows[0]));
      setPreview(rows.slice(0, 20));
    }
  };

  const handleDownloadSample = async () => {
    const XLSX = await import("xlsx");
    let data: Record<string, string>[] = [];
    if (importType === "customers") {
      data = [
        { "Name": "Sharma Industries", "GSTIN": "09AAACH7409R1ZZ", "PAN": "AAACH7409R", "Phone": "9876543210", "Email": "sharma@example.com", "Address": "123 MG Road", "City": "Delhi", "State": "Delhi", "State Code": "07", "Pincode": "110001" },
        { "Name": "Gupta Traders", "GSTIN": "27AABCG1234F1Z5", "PAN": "AABCG1234F", "Phone": "9876543211", "Email": "gupta@example.com", "Address": "456 Link Road", "City": "Mumbai", "State": "Maharashtra", "State Code": "27", "Pincode": "400001" },
      ];
    } else if (importType === "products") {
      data = [
        { "Name": "Web Development", "HSN/SAC": "998312", "Unit": "HRS", "Rate": "2000", "GST Rate (%)": "18", "Type": "service", "Description": "Website design services" },
        { "Name": "Laptop", "HSN/SAC": "8471", "Unit": "PCS", "Rate": "45000", "GST Rate (%)": "18", "Type": "goods", "Description": "Business laptop" },
      ];
    } else {
      data = [
        { "Customer Name": "Sharma Industries", "Date": "2026-05-01", "Item": "Web Development", "HSN": "998312", "Qty": "10", "Unit": "HRS", "Rate": "2000", "GST Rate (%)": "18" },
      ];
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, importType);
    XLSX.writeFile(wb, `Sample_${importType}.xlsx`);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    setResult(null);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const XLSX = await import("xlsx");
    const file = fileRef.current?.files?.[0];
    if (!file) { setImporting(false); return; }
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const allRows: PreviewRow[] = XLSX.utils.sheet_to_json(ws);

    if (importType === "customers") {
      for (const row of allRows) {
        try {
          const name = String(row["Name"] || row["name"] || row["Company"] || row["company"] || "").trim();
          if (!name) { failed++; errors.push(`Row missing name`); continue; }
          const res = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              name,
              gstin: String(row["GSTIN"] || row["gstin"] || ""),
              pan: String(row["PAN"] || row["pan"] || ""),
              phone: String(row["Phone"] || row["phone"] || row["Mobile"] || ""),
              email: String(row["Email"] || row["email"] || ""),
              address: String(row["Address"] || row["address"] || ""),
              city: String(row["City"] || row["city"] || ""),
              state: String(row["State"] || row["state"] || ""),
              stateCode: String(row["State Code"] || row["stateCode"] || row["state_code"] || ""),
              pincode: String(row["Pincode"] || row["pincode"] || row["PIN"] || ""),
              isGst: !!(row["GSTIN"] || row["gstin"]),
            }),
          });
          if (res.ok) success++;
          else { failed++; errors.push(`${name}: ${(await res.json()).error || "Failed"}`); }
        } catch { failed++; }
      }
    } else if (importType === "products") {
      for (const row of allRows) {
        try {
          const name = String(row["Name"] || row["name"] || row["Product"] || "").trim();
          if (!name) { failed++; continue; }
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              name,
              hsn: String(row["HSN/SAC"] || row["HSN"] || row["SAC"] || row["hsn"] || ""),
              unit: String(row["Unit"] || row["unit"] || "PCS"),
              rate: parseFloat(String(row["Rate"] || row["rate"] || row["Price"] || "0")) || 0,
              gstRate: parseFloat(String(row["GST Rate (%)"] || row["GST Rate"] || row["gst_rate"] || "18")) || 18,
              type: String(row["Type"] || row["type"] || "service") as "goods" | "service",
              description: String(row["Description"] || row["description"] || ""),
            }),
          });
          if (res.ok) success++;
          else { failed++; errors.push(`${name}: Failed`); }
        } catch { failed++; }
      }
    }

    setResult({ success, failed, errors: errors.slice(0, 10) });
    setImporting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Upload className="w-6 h-6" /> Bulk Import (Excel)</h1>
          <p className="text-sm text-gray-500 mt-1">Import customers, products, or invoices from Excel files</p>
        </div>
      </div>

      {/* Import Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {([
          { type: "customers" as ImportType, icon: Users, label: "Customers / Parties", desc: "Import customer names, GSTIN, addresses" },
          { type: "products" as ImportType, icon: Package, label: "Products / Services", desc: "Import product catalog with HSN, rates" },
          { type: "invoices" as ImportType, icon: FileText, label: "Invoices (Coming Soon)", desc: "Bulk import invoices from Excel" },
        ]).map((item) => (
          <button key={item.type} onClick={() => { setImportType(item.type); setPreview([]); setResult(null); }}
            disabled={item.type === "invoices"}
            className={`p-4 rounded-xl border-2 text-left transition ${importType === item.type ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"} ${item.type === "invoices" ? "opacity-50 cursor-not-allowed" : ""}`}>
            <item.icon className={`w-6 h-6 mb-2 ${importType === item.type ? "text-indigo-600" : "text-gray-400"}`} />
            <p className="font-semibold text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 text-sm font-medium">
            <FileSpreadsheet className="w-4 h-4" /> Upload Excel / CSV
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={handleDownloadSample} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download className="w-4 h-4" /> Download Sample Format
          </button>
          {preview.length > 0 && (
            <button onClick={handleImport} disabled={importing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
              {importing ? "Importing..." : `Import ${preview.length}+ Records`}
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-4 mb-6 ${result.failed > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.failed === 0 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
            <p className="font-semibold">{result.success} imported successfully{result.failed > 0 ? `, ${result.failed} failed` : ""}</p>
          </div>
          {result.errors.length > 0 && (
            <ul className="text-xs text-red-600 space-y-1 mt-2">{result.errors.map((e, i) => <li key={i}>- {e}</li>)}</ul>
          )}
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-sm font-medium">Preview (first {Math.min(preview.length, 20)} rows)</p>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>{columns.map((c) => <th key={c} className="text-left p-2 font-medium">{c}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-t">
                  {columns.map((c) => <td key={c} className="p-2 text-gray-600">{String(row[c] || "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
