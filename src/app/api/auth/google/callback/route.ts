import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { createSession } from "@/lib/session";
import type { User } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gst-bill-menager.vercel.app";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/login?error=google_not_configured`);
    }

    const redirectUri = `${appUrl}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser: GoogleUserInfo = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=google_no_email`);
    }

    const users: User[] = (await kv.get("gst_users")) || [];
    let user = users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());

    if (!user) {
      user = {
        id: generateId(),
        email: googleUser.email.toLowerCase(),
        name: googleUser.name || googleUser.email.split("@")[0],
        password: "",
        role: "client",
        phone: "",
        createdAt: new Date().toISOString(),
        active: true,
      };
      users.push(user);
      await kv.set("gst_users", users);
    }

    if (!user.active) {
      return NextResponse.redirect(`${appUrl}/login?error=account_disabled`);
    }

    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

    if (user.role === "admin") {
      return NextResponse.redirect(`${appUrl}/admin-dashboard`);
    }
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }
}
