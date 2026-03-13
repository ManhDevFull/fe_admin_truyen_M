import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const session = request.cookies.get("admin_session")?.value;
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/comics/:path*",
    "/chapters/:path*",
    "/analytics/:path*",
    "/traffic/:path*",
    "/ads/:path*",
    "/rewards/:path*",
    "/support/:path*",
    "/settings/:path*",
    "/logs/:path*",
    "/genres/:path*"
  ]
};
