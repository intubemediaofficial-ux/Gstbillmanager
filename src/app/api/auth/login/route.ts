import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import type { User } from "@/lib/gst-types";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.active);

    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

    return Response.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
