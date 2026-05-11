import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import type { User } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users: User[] = (await kv.get("gst_users")) || [];
  const clients = users
    .filter((u) => u.role === "client")
    .map(({ password: _, ...rest }) => { void _; return rest; });

  return Response.json({ data: clients });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const users: User[] = (await kv.get("gst_users")) || [];

    if (action === "create") {
      const { email, name, phone, password } = body;
      if (!email || !name || !password) {
        return Response.json({ error: "Email, name, and password are required" }, { status: 400 });
      }
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return Response.json({ error: "Email already exists" }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: generateId(),
        email,
        name,
        password: hash,
        role: "client",
        phone: phone || "",
        createdAt: new Date().toISOString(),
        active: true,
      };
      users.push(newUser);
      await kv.set("gst_users", users);
      const { password: _pw, ...safe } = newUser;
      void _pw;
      return Response.json({ success: true, data: safe });
    }

    if (action === "update") {
      const { id, email, name, phone, password, active } = body;
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) return Response.json({ error: "Client not found" }, { status: 404 });

      if (email) users[idx].email = email;
      if (name) users[idx].name = name;
      if (phone !== undefined) users[idx].phone = phone;
      if (active !== undefined) users[idx].active = active;
      if (password) users[idx].password = await bcrypt.hash(password, 10);

      await kv.set("gst_users", users);
      const { password: _pw2, ...safe } = users[idx];
      void _pw2;
      return Response.json({ success: true, data: safe });
    }

    if (action === "delete") {
      const { id } = body;
      const filtered = users.filter((u) => u.id !== id || u.role === "admin");
      await kv.set("gst_users", filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
