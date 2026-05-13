import { kv } from "@/lib/kv";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import type { User } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return Response.json({ error: "Email already registered. Please login." }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const user: User = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hash,
      role: "client",
      phone: phone || "",
      createdAt: new Date().toISOString(),
      active: true,
    };

    users.push(user);
    await kv.set("gst_users", users);

    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

    return Response.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
