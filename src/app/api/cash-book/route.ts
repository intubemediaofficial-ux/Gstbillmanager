import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import { generateId } from "@/lib/gst-utils";

interface CashEntry {
  id: string;
  userId: string;
  date: string;
  type: "in" | "out";
  description: string;
  amount: number;
  reference?: string;
  category?: string;
  createdAt: string;
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const key = `gst_cashbook:${session.id}`;
  const entries: CashEntry[] = (await kv.get(key)) || [];
  return Response.json({ data: entries });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const key = `gst_cashbook:${session.id}`;
    const entries: CashEntry[] = (await kv.get(key)) || [];

    if (action === "create") {
      const entry: CashEntry = {
        id: generateId(),
        userId: session.id,
        date: body.date || new Date().toISOString().split("T")[0],
        type: body.type || "in",
        description: body.description || "",
        amount: Number(body.amount) || 0,
        reference: body.reference || "",
        category: body.category || "",
        createdAt: new Date().toISOString(),
      };
      entries.push(entry);
      await kv.set(key, entries);
      return Response.json({ success: true, data: entry });
    }

    if (action === "delete") {
      const filtered = entries.filter((e) => e.id !== body.id);
      await kv.set(key, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
