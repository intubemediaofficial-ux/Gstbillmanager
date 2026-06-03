import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { RecurringInvoice } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: RecurringInvoice[] = (await kv.get(`gst_recurring:${lookupUserId}`)) || [];
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
    const key = `gst_recurring:${userId}`;
    const items: RecurringInvoice[] = (await kv.get(key)) || [];

    if (action === "create") {
      const rec: RecurringInvoice = {
        id: generateId(),
        userId,
        name: body.name || "",
        frequency: body.frequency || "monthly",
        nextDueDate: body.nextDueDate || new Date().toISOString().split("T")[0],
        customerId: body.customerId || "",
        customerName: body.customerName || "",
        firmId: body.firmId,
        firmName: body.firmName,
        invoiceType: body.invoiceType || "tax_invoice",
        items: body.items || [],
        notes: body.notes || "",
        terms: body.terms || "",
        gstMode: body.gstMode || "exclude",
        isActive: true,
        totalGenerated: 0,
        createdAt: new Date().toISOString(),
      };
      items.push(rec);
      await kv.set(key, items);
      return Response.json({ success: true, data: rec });
    }

    if (action === "toggle") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      items[idx].isActive = !items[idx].isActive;
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
