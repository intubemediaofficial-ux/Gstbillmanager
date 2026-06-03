import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Lead } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: Lead[] = (await kv.get(`gst_leads:${lookupUserId}`)) || [];
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
    const key = `gst_leads:${userId}`;
    const items: Lead[] = (await kv.get(key)) || [];

    if (action === "create") {
      const lead: Lead = {
        id: generateId(),
        userId,
        name: body.name || "",
        company: body.company,
        email: body.email || "",
        phone: body.phone || "",
        source: body.source || "other",
        status: "new",
        value: body.value ? Number(body.value) : undefined,
        notes: body.notes,
        nextFollowUp: body.nextFollowUp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(lead);
      await kv.set(key, items);
      return Response.json({ success: true, data: lead });
    }

    if (action === "update") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() };
      if (body.value !== undefined) items[idx].value = Number(body.value);
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
