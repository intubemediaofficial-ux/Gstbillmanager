import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Expense } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: Expense[] = (await kv.get(`gst_expenses:${lookupUserId}`)) || [];
  const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_expenses:${userId}`;
    const items: Expense[] = (await kv.get(key)) || [];

    if (action === "create") {
      const amount = Number(body.amount) || 0;
      const gstAmount = Number(body.gstAmount) || 0;
      const expense: Expense = {
        id: generateId(),
        userId,
        date: body.date || new Date().toISOString().split("T")[0],
        category: body.category || "miscellaneous",
        description: body.description || "",
        amount,
        gstAmount,
        totalAmount: amount + gstAmount,
        paymentMode: body.paymentMode || "cash",
        reference: body.reference,
        vendorName: body.vendorName,
        billNumber: body.billNumber,
        notes: body.notes,
        createdAt: new Date().toISOString(),
      };
      items.push(expense);
      await kv.set(key, items);
      return Response.json({ success: true, data: expense });
    }

    if (action === "update") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const amount = Number(body.amount) || items[idx].amount;
      const gstAmount = Number(body.gstAmount) || items[idx].gstAmount;
      items[idx] = { ...items[idx], ...body, amount, gstAmount, totalAmount: amount + gstAmount };
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
