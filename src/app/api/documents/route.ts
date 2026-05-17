import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import { generateId } from "@/lib/gst-utils";

export interface SavedDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  title: string;
  recipientName: string;
  firmName: string;
  templateName: string;
  formData: Record<string, string>;
  createdAt: string;
}

function key(userId: string) {
  return `gst_documents:${userId}`;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");

  if (session.role === "admin" && !adminUserId) {
    const users: { id: string; name: string; email: string }[] = (await kv.get("gst_users")) || [];
    const allDocs: SavedDocument[] = [];
    for (const user of users) {
      if (user.id === session.id) continue;
      const docs: SavedDocument[] = (await kv.get(key(user.id))) || [];
      allDocs.push(...docs);
    }
    allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Response.json({ data: allDocs });
  }

  const lookupId = (adminUserId && session.role === "admin") ? adminUserId : session.id;
  const docs: SavedDocument[] = (await kv.get(key(lookupId))) || [];
  const sorted = docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const docs: SavedDocument[] = (await kv.get(key(session.id))) || [];

  const doc: SavedDocument = {
    id: generateId(),
    userId: session.id,
    userName: session.name,
    userEmail: session.email,
    type: body.type || "",
    title: body.title || "",
    recipientName: body.recipientName || "",
    firmName: body.firmName || "",
    templateName: body.templateName || "",
    formData: body.formData || {},
    createdAt: new Date().toISOString(),
  };

  docs.push(doc);
  await kv.set(key(session.id), docs);
  return Response.json({ data: doc });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (session.role === "admin" && body.userId) {
    const docs: SavedDocument[] = (await kv.get(key(body.userId))) || [];
    await kv.set(key(body.userId), docs.filter((d) => d.id !== body.id));
    return Response.json({ ok: true });
  }

  const docs: SavedDocument[] = (await kv.get(key(session.id))) || [];
  await kv.set(key(session.id), docs.filter((d) => d.id !== body.id));
  return Response.json({ ok: true });
}
