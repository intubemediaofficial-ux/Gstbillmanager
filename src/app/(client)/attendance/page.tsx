"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Check, X as XIcon, Clock, Coffee, Users } from "lucide-react";
import type { AttendanceRecord, Employee } from "@/lib/gst-types";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  present: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Present" },
  absent: { bg: "bg-red-100", text: "text-red-700", label: "Absent" },
  half_day: { bg: "bg-amber-100", text: "text-amber-700", label: "Half Day" },
  leave: { bg: "bg-blue-100", text: "text-blue-700", label: "Leave" },
  holiday: { bg: "bg-purple-100", text: "text-purple-700", label: "Holiday" },
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const didFetch = useRef(false);

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

  const todayRecords = records.filter((r) => r.date === selectedDate);
  const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "half_day").length;
  const absentToday = todayRecords.filter((r) => r.status === "absent").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Track employee attendance</p>
        </div>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>

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
                  <div className="flex gap-1.5 flex-shrink-0">
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
