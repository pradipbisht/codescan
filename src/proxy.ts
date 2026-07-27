import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16: `middleware` was renamed to `proxy`.
 * Optional admin lock when ADMIN_PASSWORD is set.
 * Public /r/* scans are never locked.
 */
export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

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
    pathname.startsWith("/dashboard") || pathname.startsWith("/qr");

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("codescan_admin")?.value;
  const expected = `ok:${password}`;

  if (cookie === expected) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/qr/:path*", "/login"],
};
