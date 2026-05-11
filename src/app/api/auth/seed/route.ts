import { kv } from "@/lib/kv";
import bcrypt from "bcryptjs";
import type { User } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function POST(req: Request) {
  try {
    const { secret, action, password } = await req.json();
    if (secret !== process.env.SEED_SECRET && secret !== "gst-seed-2024") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing: User[] = (await kv.get("gst_users")) || [];

    if (action === "reset") {
      const newPassword = password || process.env.GST_ADMIN_PASSWORD || "Admin@123";
      const hash = await bcrypt.hash(newPassword, 10);
      const idx = existing.findIndex((u) => u.role === "admin");
      if (idx === -1) return Response.json({ error: "Admin not found" }, { status: 404 });
      existing[idx].password = hash;
      await kv.set("gst_users", existing);
      return Response.json({ success: true, message: "Admin password reset" });
    }

    if (existing.some((u) => u.role === "admin")) {
      return Response.json({ message: "Admin already exists", count: existing.length });
    }

    const adminPassword = password || process.env.GST_ADMIN_PASSWORD || "Admin@123";
    const hash = await bcrypt.hash(adminPassword, 10);

    const admin: User = {
      id: generateId(),
      email: "shivlalbainslaofficial@gmail.com",
      name: "Admin",
      password: hash,
      role: "admin",
      phone: "",
      createdAt: new Date().toISOString(),
      active: true,
    };

    existing.push(admin);
    await kv.set("gst_users", existing);
    return Response.json({ success: true, message: "Admin created" });
  } catch {
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
