import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Customer } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const key = session.role === "admin" ? "gst_customers_all" : `gst_customers:${session.id}`;
  if (session.role === "admin") {
    const users = ((await kv.get("gst_users")) || []) as { id: string }[];
    const allCustomers: Customer[] = [];
    for (const u of users) {
      const c: Customer[] = (await kv.get(`gst_customers:${u.id}`)) || [];
      allCustomers.push(...c);
    }
    return Response.json({ data: allCustomers });
  }

  const customers: Customer[] = (await kv.get(key)) || [];
  return Response.json({ data: customers });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_customers:${userId}`;
    const customers: Customer[] = (await kv.get(key)) || [];

    if (action === "create") {
      const customer: Customer = {
        id: generateId(),
        userId,
        name: body.name,
        address: body.address || "",
        city: body.city || "",
        state: body.state || "",
        stateCode: body.stateCode || "",
        pincode: body.pincode || "",
        gstin: (body.gstin || "").toUpperCase(),
        pan: (body.pan || "").toUpperCase(),
        phone: body.phone || "",
        email: body.email || "",
        createdAt: new Date().toISOString(),
      };
      customers.push(customer);
      await kv.set(key, customers);
      return Response.json({ success: true, data: customer });
    }

    if (action === "update") {
      const idx = customers.findIndex((c) => c.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      customers[idx] = { ...customers[idx], ...body, id: customers[idx].id, userId };
      if (body.gstin) customers[idx].gstin = body.gstin.toUpperCase();
      if (body.pan) customers[idx].pan = body.pan.toUpperCase();
      await kv.set(key, customers);
      return Response.json({ success: true, data: customers[idx] });
    }

    if (action === "delete") {
      const filtered = customers.filter((c) => c.id !== body.id);
      await kv.set(key, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
