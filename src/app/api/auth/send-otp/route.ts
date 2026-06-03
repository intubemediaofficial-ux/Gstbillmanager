import { kv } from "@/lib/kv";
import { Resend } from "resend";
import type { User } from "@/lib/gst-types";

export async function POST(req: Request) {
  try {
    const { phone, email, type } = await req.json();

    // type = "phone" or "email"
    if (!phone && !email) {
      return Response.json({ error: "Phone or email is required" }, { status: 400 });
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    let user: User | undefined;
    let targetEmail = "";

    if (type === "phone" || phone) {
      // Find user by phone number
      const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
      if (cleanPhone.length !== 10) {
        return Response.json({ error: "Enter valid 10-digit mobile number" }, { status: 400 });
      }
      user = users.find((u) => u.phone && u.phone.replace(/\D/g, "").slice(-10) === cleanPhone && u.active);
      if (!user) {
        return Response.json({ error: "No account found with this mobile number. Please sign up first." }, { status: 404 });
      }
      targetEmail = user.email;
    } else {
      // Find user by email
      user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.active);
      if (!user) {
        return Response.json({ error: "No account found with this email. Please sign up first." }, { status: 404 });
      }
      targetEmail = user.email;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `login_otp:${targetEmail.toLowerCase()}`;
    await kv.set(otpKey, otp, { ex: 300 }); // 5 minutes expiry

    // Try SMS first if configured and phone login
    const smsApiKey = process.env.FAST2SMS_API_KEY;
    if ((type === "phone" || phone) && smsApiKey) {
      try {
        const cleanPhone = (phone || user.phone || "").replace(/\D/g, "").slice(-10);
        const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": smsApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "otp",
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });
        const smsData = await smsRes.json();
        if (smsData.return) {
          return Response.json({
            success: true,
            method: "sms",
            message: `OTP sent to ******${cleanPhone.slice(-4)}`,
            maskedEmail: null,
          });
        }
      } catch {
        // SMS failed, fall through to email
      }
    }

    // Send OTP via email
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return Response.json({ error: "Email service not configured" }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const customFrom = process.env.RESEND_FROM_EMAIL;
    const fallbackFrom = "onboarding@resend.dev";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0ea5e9;">GST Bill Manager</h2>
        <p>Your login OTP is:</p>
        <div style="background: #F0F9FF; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; border: 1px solid #BAE6FD;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0c4a6e;">${otp}</span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <p style="color: #9CA3AF; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    let sent = false;
    if (customFrom) {
      const { error } = await resend.emails.send({
        from: `GST Bill Manager <${customFrom}>`,
        to: targetEmail,
        subject: "Login OTP - GST Bill Manager",
        html: emailHtml,
      });
      if (!error) sent = true;
    }

    if (!sent) {
      const { error } = await resend.emails.send({
        from: `GST Bill Manager <${fallbackFrom}>`,
        to: targetEmail,
        subject: "Login OTP - GST Bill Manager",
        html: emailHtml,
      });
      if (error) {
        return Response.json({ error: "Failed to send OTP" }, { status: 500 });
      }
    }

    // Mask email for privacy
    const parts = targetEmail.split("@");
    const maskedEmail = parts[0].slice(0, 2) + "***@" + parts[1];

    return Response.json({
      success: true,
      method: "email",
      message: `OTP sent to ${maskedEmail}`,
      maskedEmail,
    });
  } catch {
    return Response.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
