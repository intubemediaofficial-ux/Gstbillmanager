"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Check, X as XIcon, Clock, Users, Upload, Download, CheckCheck } from "lucide-react";
import type { AttendanceRecord, Employee } from "@/lib/gst-types";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  present: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Present" },
  absent: { bg: "bg-red-100", text: "text-red-700", label: "Absent" },
  half_day: { bg: "bg-amber-100", text: "text-amber-700", label: "Half Day" },
  leave: { bg: "bg-blue-100", text: "text-blue-700", label: "Leave" },
  holiday: { bg: "bg-purple-100", text: "text-purple-700", label: "Holiday" },
};

type DetectedColumn = { header: string; index: number; mappedTo: string };

interface ParsedRow {
  [key: string]: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const didFetch = useRef(false);

  // Excel upload states
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [detectedCols, setDetectedCols] = useState<DetectedColumn[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ total: number; matched: number } | null>(null);

  const fetchData = async (m: string) => {
    const [aRes, eRes] = await Promise.all([
      fetch(`/api/attendance?month=${m}`).then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]);
    setRecords(aRes.data || []);
    setEmployees((eRes.data || []).filter((e: Employee) => e.status === "active"));
    setLoading(false);
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchData(month);
  }, []);

  const handleMonthChange = (m: string) => {
    setMonth(m);
    setLoading(true);
    fetchData(m);
  };

  const markAttendance = async (empId: string, empName: string, status: string) => {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark", employeeId: empId, employeeName: empName, date: selectedDate, status }),
    });
    const existing = records.findIndex((r) => r.employeeId === empId && r.date === selectedDate);
    if (existing !== -1) {
      setRecords((p) => p.map((r, i) => i === existing ? { ...r, status: status as AttendanceRecord["status"] } : r));
    } else {
      setRecords((p) => [...p, { id: "", userId: "", employeeId: empId, employeeName: empName, date: selectedDate, status: status as AttendanceRecord["status"] }]);
    }
  };

  const getStatus = (empId: string, date: string) => {
    const rec = records.find((r) => r.employeeId === empId && r.date === date);
    return rec?.status || null;
  };

  // Mark All Present
  const handleMarkAllPresent = async () => {
    const unmarked = employees.filter((e) => !getStatus(e.id, selectedDate));
    if (unmarked.length === 0 && !confirm("All employees already marked. Re-mark all as Present?")) return;
    const toMark = unmarked.length > 0 ? unmarked : employees;
    const recs = toMark.map((e) => ({ employeeId: e.id, employeeName: e.name, date: selectedDate, status: "present" }));
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_mark", records: recs }),
    });
    const newRecords = [...records];
    for (const r of recs) {
      const idx = newRecords.findIndex((nr) => nr.employeeId === r.employeeId && nr.date === r.date);
      if (idx !== -1) {
        newRecords[idx] = { ...newRecords[idx], status: "present" };
      } else {
        newRecords.push({ id: "", userId: "", employeeId: r.employeeId, employeeName: r.employeeName, date: r.date, status: "present" });
      }
    }
    setRecords(newRecords);
  };

  // Auto-detect column mapping
  const autoDetectColumns = (hdrs: string[]): DetectedColumn[] => {
    const namePatterns = /^(name|employee.?name|staff.?name|emp.?name|full.?name|worker|कर्मचारी|नाम)/i;
    const idPatterns = /^(emp.?id|employee.?id|id|code|emp.?code|staff.?id|कोड)/i;
    const datePatterns = /^(date|attendance.?date|day|दिनांक|तारीख)/i;
    const statusPatterns = /^(status|attendance|present|absent|स्थिति|हाजिरी|उपस्थिति)/i;
    const inTimePatterns = /^(in.?time|check.?in|login|punch.?in|entry|आगमन)/i;
    const outTimePatterns = /^(out.?time|check.?out|logout|punch.?out|exit|प्रस्थान)/i;

    const cols: DetectedColumn[] = hdrs.map((h, i) => {
      const trimmed = h.trim();
      let mappedTo = "ignore";
      if (namePatterns.test(trimmed)) mappedTo = "name";
      else if (idPatterns.test(trimmed)) mappedTo = "empId";
      else if (datePatterns.test(trimmed)) mappedTo = "date";
      else if (statusPatterns.test(trimmed)) mappedTo = "status";
      else if (inTimePatterns.test(trimmed)) mappedTo = "inTime";
      else if (outTimePatterns.test(trimmed)) mappedTo = "outTime";
      return { header: trimmed, index: i, mappedTo };
    });

    // If no status column found but has in/out time, we'll derive status from time
    const hasStatus = cols.some((c) => c.mappedTo === "status");
    const hasTime = cols.some((c) => c.mappedTo === "inTime" || c.mappedTo === "outTime");

    // Smart fallback: if only 2 columns and one looks like name, other like date
    if (!cols.some((c) => c.mappedTo === "name")) {
      // Try to find a column with text data that could be names
      for (const col of cols) {
        if (col.mappedTo === "ignore" && !datePatterns.test(col.header) && !statusPatterns.test(col.header)) {
          col.mappedTo = "name";
          break;
        }
      }
    }

    return cols;
  };

  // Parse Excel file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImportResult(null);

    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { header: 1, raw: false });

      if (jsonData.length < 2) {
        alert("Excel file is empty or has no data rows");
        setUploading(false);
        return;
      }

      // First row is headers
      const rawHeaders = (jsonData[0] as unknown as string[]).map((h) => String(h || "").trim());
      const rows: ParsedRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as unknown as string[];
        if (!row || row.every((c) => !c)) continue; // skip empty rows
        const obj: ParsedRow = {};
        rawHeaders.forEach((h, idx) => {
          obj[h] = String(row[idx] || "").trim();
        });
        rows.push(obj);
      }

      setHeaders(rawHeaders);
      setParsedData(rows);
      setDetectedCols(autoDetectColumns(rawHeaders));
      setShowUpload(true);
    } catch (err) {
      alert("Error reading file. Please upload a valid Excel (.xlsx, .xls) or CSV file.");
    }
    setUploading(false);
    e.target.value = "";
  };

  // Update column mapping
  const updateMapping = (index: number, newMapping: string) => {
    setDetectedCols((prev) => prev.map((c) => c.index === index ? { ...c, mappedTo: newMapping } : c));
  };

  // Parse status from text
  const parseStatus = (val: string): AttendanceRecord["status"] => {
    const v = val.toLowerCase().trim();
    if (v === "p" || v === "present" || v === "1" || v === "yes" || v === "y") return "present";
    if (v === "a" || v === "absent" || v === "0" || v === "no" || v === "n") return "absent";
    if (v === "h" || v === "hd" || v === "half" || v === "half day" || v === "half_day" || v === "0.5") return "half_day";
    if (v === "l" || v === "leave" || v === "cl" || v === "sl" || v === "el" || v === "pl") return "leave";
    if (v === "ho" || v === "holiday" || v === "off") return "holiday";
    return "present"; // default
  };

  // Parse date from various formats
  const parseDate = (val: string): string => {
    if (!val) return selectedDate;
    // Try ISO format first (2026-05-01)
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = val.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    // MM/DD/YYYY
    const mdy = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
    // Excel serial number
    const num = Number(val);
    if (num > 40000 && num < 60000) {
      const d = new Date((num - 25569) * 86400 * 1000);
      return d.toISOString().split("T")[0];
    }
    // Try native parse
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return selectedDate;
  };

  // Match employee from name/id
  const matchEmployee = (name: string, empId: string): Employee | undefined => {
    const nl = name.toLowerCase().trim();
    const il = empId.toLowerCase().trim();
    // Try exact ID match first
    if (il) {
      const byId = employees.find((e) => e.empId.toLowerCase() === il || e.id.toLowerCase() === il);
      if (byId) return byId;
    }
    // Try exact name match
    if (nl) {
      const byName = employees.find((e) => e.name.toLowerCase() === nl);
      if (byName) return byName;
    }
    // Try partial name match
    if (nl) {
      const partial = employees.find((e) => e.name.toLowerCase().includes(nl) || nl.includes(e.name.toLowerCase()));
      if (partial) return partial;
    }
    return undefined;
  };

  // Import attendance from parsed data
  const handleImport = async () => {
    const nameCol = detectedCols.find((c) => c.mappedTo === "name");
    const idCol = detectedCols.find((c) => c.mappedTo === "empId");
    const dateCol = detectedCols.find((c) => c.mappedTo === "date");
    const statusCol = detectedCols.find((c) => c.mappedTo === "status");
    const inTimeCol = detectedCols.find((c) => c.mappedTo === "inTime");

    if (!nameCol && !idCol) {
      alert("Please map at least a Name or Employee ID column!");
      return;
    }

    const bulkRecords: { employeeId: string; employeeName: string; date: string; status: string }[] = [];
    let matchedCount = 0;

    for (const row of parsedData) {
      const name = nameCol ? row[nameCol.header] || "" : "";
      const empId = idCol ? row[idCol.header] || "" : "";
      const dateStr = dateCol ? row[dateCol.header] || "" : "";
      const statusStr = statusCol ? row[statusCol.header] || "" : "";
      const inTime = inTimeCol ? row[inTimeCol.header] || "" : "";

      const emp = matchEmployee(name, empId);
      if (!emp) continue;
      matchedCount++;

      const date = parseDate(dateStr);
      let status: string;
      if (statusStr) {
        status = parseStatus(statusStr);
      } else if (inTime) {
        status = "present";
      } else {
        status = "present";
      }

      bulkRecords.push({ employeeId: emp.id, employeeName: emp.name, date, status });
    }

    if (bulkRecords.length === 0) {
      alert("No matching employees found. Make sure employee names/IDs in Excel match your employee list.");
      return;
    }

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_mark", records: bulkRecords }),
    });

    // Update local state
    const newRecords = [...records];
    for (const r of bulkRecords) {
      const idx = newRecords.findIndex((nr) => nr.employeeId === r.employeeId && nr.date === r.date);
      if (idx !== -1) {
        newRecords[idx] = { ...newRecords[idx], status: r.status as AttendanceRecord["status"] };
      } else {
        newRecords.push({ id: "", userId: "", employeeId: r.employeeId, employeeName: r.employeeName, date: r.date, status: r.status as AttendanceRecord["status"] });
      }
    }
    setRecords(newRecords);
    setImportResult({ total: parsedData.length, matched: matchedCount });
  };

  // Download sample Excel
  const handleDownloadSample = async () => {
    const XLSX = await import("xlsx");
    const sampleData = [
      ["Emp ID", "Name", "Date", "Status", "In Time", "Out Time"],
      ["EMP001", "Rajesh Kumar", selectedDate, "Present", "09:00", "18:00"],
      ["EMP002", "Amit Singh", selectedDate, "Absent", "", ""],
      ["EMP003", "Priya Sharma", selectedDate, "Half Day", "09:00", "13:00"],
      ["EMP004", "Suresh Verma", selectedDate, "Leave", "", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws["!cols"] = [{ wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_Sample_Format.xlsx`);
  };

  const todayRecords = records.filter((r) => r.date === selectedDate);
  const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "half_day").length;
  const absentToday = todayRecords.filter((r) => r.status === "absent").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Track employee attendance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={handleMarkAllPresent} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition">
          <CheckCheck className="w-4 h-4" /> Mark All Present
        </button>
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition cursor-pointer">
          <Upload className="w-4 h-4" /> Upload Excel
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
        </label>
        <button onClick={handleDownloadSample} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
          <Download className="w-4 h-4" /> Sample Format
        </button>
      </div>

      {/* Upload Preview Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Excel Upload — Column Mapping</h2>
              <button onClick={() => { setShowUpload(false); setParsedData([]); setImportResult(null); }}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>

            {importResult ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete!</h3>
                <p className="text-sm text-gray-600">
                  {importResult.matched} out of {importResult.total} rows matched with employees
                </p>
                {importResult.total > importResult.matched && (
                  <p className="text-xs text-amber-600 mt-2">
                    {importResult.total - importResult.matched} rows could not be matched — check employee names/IDs
                  </p>
                )}
                <button onClick={() => { setShowUpload(false); setParsedData([]); setImportResult(null); }} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Auto-detected columns from your file. Verify or change the mapping below:
                </p>

                {/* Column mapping */}
                <div className="space-y-2 mb-4">
                  {detectedCols.map((col) => (
                    <div key={col.index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                      <span className="text-sm font-medium text-gray-700 w-32 truncate" title={col.header}>{col.header}</span>
                      <span className="text-gray-400">→</span>
                      <select
                        value={col.mappedTo}
                        onChange={(e) => updateMapping(col.index, e.target.value)}
                        className={`flex-1 px-3 py-1.5 border rounded-lg text-sm ${col.mappedTo !== "ignore" ? "border-blue-300 bg-blue-50" : ""}`}
                      >
                        <option value="ignore">— Skip —</option>
                        <option value="name">Employee Name</option>
                        <option value="empId">Employee ID / Code</option>
                        <option value="date">Date</option>
                        <option value="status">Status (P/A/L/HD)</option>
                        <option value="inTime">In Time</option>
                        <option value="outTime">Out Time</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="border rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
                    Preview — first {Math.min(5, parsedData.length)} of {parsedData.length} rows
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          {headers.map((h) => <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 border-b">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {headers.map((h) => <td key={h} className="px-3 py-1.5 border-b text-gray-700">{row[h]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setShowUpload(false); setParsedData([]); }} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                  <button onClick={handleImport} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                    Import {parsedData.length} Rows
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-white border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Total Employees</span></div>
          <p className="text-lg font-bold text-gray-900 mt-1">{employees.length}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-500">Present Today</span></div>
          <p className="text-lg font-bold text-emerald-600 mt-1">{presentToday}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-red-100 shadow-sm">
          <div className="flex items-center gap-2"><XIcon className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Absent Today</span></div>
          <p className="text-lg font-bold text-red-600 mt-1">{absentToday}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">Not Marked</span></div>
          <p className="text-lg font-bold text-amber-600 mt-1">{employees.length - todayRecords.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">Mark Attendance — {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
        </div>
        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No active employees</p>
            <p className="text-xs text-gray-400 mt-1">Add employees first</p>
          </div>
        ) : (
          <div className="divide-y">
            {employees.map((emp) => {
              const currentStatus = getStatus(emp.id, selectedDate);
              return (
                <div key={emp.id} className="p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.department} · {emp.empId}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
                    {Object.entries(STATUS_COLORS).map(([key, val]) => (
                      <button key={key} onClick={() => markAttendance(emp.id, emp.name, key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${currentStatus === key ? `${val.bg} ${val.text} ring-2 ring-offset-1 ring-current` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
