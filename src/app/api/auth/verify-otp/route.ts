import { kv } from "@/lib/kv";
import { createSession } from "@/lib/session";
import type { User } from "@/lib/gst-types";

export async function POST(req: Request) {
  try {
    const { phone, email, otp } = await req.json();

    if (!otp || otp.length !== 6) {
      return Response.json({ error: "Enter valid 6-digit OTP" }, { status: 400 });
    }

    if (!phone && !email) {
      return Response.json({ error: "Phone or email is required" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    let user: User | undefined;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      user = users.find((u) => u.phone && u.phone.replace(/\D/g, "").slice(-10) === cleanPhone && u.active);
    } else {
      user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.active);
    }

    if (!user) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify OTP
    const otpKey = `login_otp:${user.email.toLowerCase()}`;
    const storedOtp = await kv.get(otpKey);

    if (!storedOtp) {
      return Response.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    if (String(storedOtp) !== String(otp)) {
      return Response.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // OTP verified — delete it and create session
    await kv.del(otpKey);
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

    return Response.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return Response.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
