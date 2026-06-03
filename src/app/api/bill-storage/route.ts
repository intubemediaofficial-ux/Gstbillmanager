import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import { generateId } from "@/lib/gst-utils";

interface StoredBill {
  id: string;
  userId: string;
  type: "sales" | "purchase" | "other";
  billNumber: string;
  partyName: string;
  amount: number;
  gstAmount: number;
  date: string;
  month: string;
  year: number;
  category: string;
  notes: string;
  fileData: string;
  fileName: string;
  fileType: string;
  createdAt: string;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const key = `gst_bill_storage:${lookupUserId}`;
  const bills: StoredBill[] = (await kv.get(key)) || [];
  const sorted = bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_bill_storage:${userId}`;
    const bills: StoredBill[] = (await kv.get(key)) || [];

    if (action === "create") {
      const dateStr = body.date || new Date().toISOString().split("T")[0];
      const d = new Date(dateStr);
      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

      const bill: StoredBill = {
        id: generateId(),
        userId,
        type: body.type || "purchase",
        billNumber: body.billNumber || "",
        partyName: body.partyName || "",
        amount: body.amount || 0,
        gstAmount: body.gstAmount || 0,
        date: dateStr,
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        category: body.category || "general",
        notes: body.notes || "",
        fileData: body.fileData || "",
        fileName: body.fileName || "",
        fileType: body.fileType || "",
        createdAt: new Date().toISOString(),
      };

      bills.push(bill);
      await kv.set(key, bills);
      return Response.json({ success: true, data: bill });
    }

    if (action === "delete") {
      const idx = bills.findIndex((b) => b.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      bills.splice(idx, 1);
      await kv.set(key, bills);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
