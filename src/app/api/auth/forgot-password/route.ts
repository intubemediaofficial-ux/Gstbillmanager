import { kv } from "@/lib/kv";
import { Resend } from "resend";
import type { User } from "@/lib/gst-types";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return Response.json({ success: true, message: "If the email exists, an OTP has been sent" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await kv.set(`reset_otp:${email.toLowerCase()}`, otp, { ex: 600 });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return Response.json({ error: "Email service not configured" }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const customFrom = process.env.RESEND_FROM_EMAIL;
    const fallbackFrom = "onboarding@resend.dev";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">GST Bill Manager</h2>
        <p>Your password reset OTP is:</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${otp}</span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    `;

    let sent = false;

    if (customFrom) {
      const { error } = await resend.emails.send({
        from: `GST Bill Manager <${customFrom}>`,
        to: email,
        subject: "Password Reset OTP - GST Bill Manager",
        html: emailHtml,
      });
      if (!error) sent = true;
    }

    if (!sent) {
      const { error } = await resend.emails.send({
        from: `GST Bill Manager <${fallbackFrom}>`,
        to: email,
        subject: "Password Reset OTP - GST Bill Manager",
        html: emailHtml,
      });
      if (error) {
        return Response.json({ error: "Failed to send OTP email" }, { status: 500 });
      }
    }

    return Response.json({ success: true, message: "OTP sent to your email" });
  } catch {
    return Response.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
