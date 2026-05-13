import { kv } from "@/lib/kv";
import bcrypt from "bcryptjs";
import type { User } from "@/lib/gst-types";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return Response.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const storedOtp = await kv.get(`reset_otp:${email.toLowerCase()}`);
    if (!storedOtp || storedOtp !== otp) {
      return Response.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    users[idx].password = await bcrypt.hash(newPassword, 10);
    await kv.set("gst_users", users);
    await kv.del(`reset_otp:${email.toLowerCase()}`);

    return Response.json({ success: true, message: "Password reset successfully" });
  } catch {
    return Response.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
