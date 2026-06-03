import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { AttendanceRecord } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const month = searchParams.get("month"); // "2026-05"
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: AttendanceRecord[] = (await kv.get(`gst_attendance:${lookupUserId}`)) || [];
  const filtered = month ? data.filter((a) => a.date.startsWith(month)) : data;
  const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_attendance:${userId}`;
    const items: AttendanceRecord[] = (await kv.get(key)) || [];

    if (action === "mark") {
      const existing = items.findIndex(
        (a) => a.employeeId === body.employeeId && a.date === body.date
      );
      if (existing !== -1) {
        items[existing].status = body.status || "present";
        items[existing].checkIn = body.checkIn;
        items[existing].checkOut = body.checkOut;
        items[existing].notes = body.notes;
      } else {
        items.push({
          id: generateId(),
          userId,
          employeeId: body.employeeId || "",
          employeeName: body.employeeName || "",
          date: body.date || new Date().toISOString().split("T")[0],
          status: body.status || "present",
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          notes: body.notes,
        });
      }
      await kv.set(key, items);
      return Response.json({ success: true });
    }

    if (action === "bulk_mark") {
      const records = body.records || [];
      for (const rec of records) {
        const existing = items.findIndex(
          (a) => a.employeeId === rec.employeeId && a.date === rec.date
        );
        if (existing !== -1) {
          items[existing].status = rec.status || "present";
        } else {
          items.push({
            id: generateId(),
            userId,
            employeeId: rec.employeeId,
            employeeName: rec.employeeName,
            date: rec.date,
            status: rec.status || "present",
          });
        }
      }
      await kv.set(key, items);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
