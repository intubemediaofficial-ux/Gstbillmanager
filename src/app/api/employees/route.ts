import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Employee } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: Employee[] = (await kv.get(`gst_employees:${lookupUserId}`)) || [];
  const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_employees:${userId}`;
    const items: Employee[] = (await kv.get(key)) || [];

    if (action === "create") {
      const emp: Employee = {
        id: generateId(),
        userId,
        name: body.name || "",
        empId: body.empId || `EMP${String(items.length + 1).padStart(4, "0")}`,
        email: body.email || "",
        phone: body.phone || "",
        department: body.department || "",
        designation: body.designation || "",
        joiningDate: body.joiningDate || new Date().toISOString().split("T")[0],
        salary: Number(body.salary) || 0,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        panNumber: body.panNumber,
        aadharNumber: body.aadharNumber,
        address: body.address,
        emergencyContact: body.emergencyContact,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      items.push(emp);
      await kv.set(key, items);
      return Response.json({ success: true, data: emp });
    }

    if (action === "update") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      items[idx] = { ...items[idx], ...body, salary: Number(body.salary) || items[idx].salary };
      await kv.set(key, items);
      return Response.json({ success: true, data: items[idx] });
    }

    if (action === "delete") {
      const filtered = items.filter((i) => i.id !== body.id);
      await kv.set(key, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
