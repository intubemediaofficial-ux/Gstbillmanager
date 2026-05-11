import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";
import type { User } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    if (secret !== process.env.SEED_SECRET && secret !== "gst-seed-2024") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing: User[] = (await kv.get("gst_users")) || [];
    if (existing.some((u) => u.role === "admin")) {
      return Response.json({ message: "Admin already exists", count: existing.length });
    }

    const adminPassword = process.env.GST_ADMIN_PASSWORD || "Admin@123";
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

    await kv.set("gst_users", [admin]);
    return Response.json({ success: true, message: "Admin created" });
  } catch {
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
