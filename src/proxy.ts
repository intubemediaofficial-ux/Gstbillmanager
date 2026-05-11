import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const publicRoutes = ["/login"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (publicRoutes.includes(path)) {
    const session = req.cookies.get("session")?.value;
    const payload = await decrypt(session);
    if (payload) {
      const dest = payload.role === "admin" ? "/admin-dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.nextUrl));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin-") || path.startsWith("/dashboard") || path.startsWith("/invoices") ||
      path.startsWith("/create-invoice") || path.startsWith("/customers") || path.startsWith("/products") ||
      path.startsWith("/reports") || path.startsWith("/settings") || path.startsWith("/invoice-view") ||
      path.startsWith("/my-firms")) {
    const session = req.cookies.get("session")?.value;
    const payload = await decrypt(session);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (path.startsWith("/admin-") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    if (!path.startsWith("/admin-") && payload.role === "admin" && !path.startsWith("/api")) {
      // Admin accessing client routes — allow, they might want to preview
    }
  }

  if (path === "/") {
    const session = req.cookies.get("session")?.value;
    const payload = await decrypt(session);
    if (payload) {
      const dest = payload.role === "admin" ? "/admin-dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.nextUrl));
    }
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$).*)"],
};
