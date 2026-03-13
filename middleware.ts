import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;
    const refresh = request.cookies.get("refresh_token")?.value;
    if (!token && refresh) {
      return NextResponse.next();
    }
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
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
