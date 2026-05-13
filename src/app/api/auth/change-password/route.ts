import { kv } from "@/lib/kv";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import type { User } from "@/lib/gst-types";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return Response.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx === -1) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (users[idx].password) {
      if (!currentPassword) {
        return Response.json({ error: "Current password is required" }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, users[idx].password);
      if (!valid) {
        return Response.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    users[idx].password = await bcrypt.hash(newPassword, 10);
    await kv.set("gst_users", users);

    return Response.json({ success: true, message: "Password changed successfully" });
  } catch {
    return Response.json({ error: "Failed to change password" }, { status: 500 });
  }
}
