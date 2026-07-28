import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16: request proxy (replaces middleware).
 *
 * Always protects admin surfaces when ADMIN_PASSWORD is set:
 *   /dashboard, /qr/*, /api/qr/*
 *
 * Public (never locked):
 *   /, /login, /r/* (scan redirect), /offers/*
 *
 * If ADMIN_PASSWORD is empty in production, admin routes stay locked
 * (redirect to login) so research data is never open by accident.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always public
  if (
    pathname.startsWith("/r/") ||
    pathname.startsWith("/offers/") ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isAdminPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/qr") ||
    pathname.startsWith("/api/qr");

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD?.trim();

  // Local dev convenience: no password → open admin (same as before).
  // Production: never leave admin open without a password.
  if (!password) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("need", "password");
    return NextResponse.redirect(loginUrl);
  }

  const cookie = request.cookies.get("codescan_admin")?.value;
  const expected = `ok:${password}`;

  if (cookie === expected) {
    return NextResponse.next();
  }

  // API: return 401 JSON instead of HTML redirect
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/qr/:path*",
    "/api/qr/:path*",
    "/login",
  ],
};
