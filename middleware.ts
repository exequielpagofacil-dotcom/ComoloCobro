import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "clc_admin_token";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return redirectToLogin(request);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
