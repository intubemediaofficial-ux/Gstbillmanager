import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { FollowUpReminder } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: FollowUpReminder[] = (await kv.get(`gst_followups:${lookupUserId}`)) || [];
  const sorted = data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_followups:${userId}`;
    const items: FollowUpReminder[] = (await kv.get(key)) || [];

    if (action === "create") {
      const reminder: FollowUpReminder = {
        id: generateId(),
        userId,
        title: body.title || "",
        description: body.description,
        relatedTo: body.relatedTo || "general",
        relatedId: body.relatedId,
        relatedName: body.relatedName,
        dueDate: body.dueDate || new Date().toISOString().split("T")[0],
        dueTime: body.dueTime,
        priority: body.priority || "medium",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      items.push(reminder);
      await kv.set(key, items);
      return Response.json({ success: true, data: reminder });
    }

    if (action === "update") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      items[idx] = { ...items[idx], ...body };
      await kv.set(key, items);
      return Response.json({ success: true, data: items[idx] });
    }

    if (action === "complete") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      items[idx].status = "completed";
      await kv.set(key, items);
      return Response.json({ success: true });
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
