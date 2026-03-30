import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequiredEnv } from "@/lib/env";

export const AUTH_COOKIE_NAME = "clc_admin_token";

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getRequiredEnv("JWT_SECRET"));
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string) {
  return jwtVerify(token, getJwtSecret());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    await verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdminSession(): Promise<void> {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("UNAUTHORIZED");
  }
}

export function attachAdminCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
