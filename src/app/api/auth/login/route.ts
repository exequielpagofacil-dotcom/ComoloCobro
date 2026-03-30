import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { attachAdminCookie, signAdminToken } from "@/lib/auth";
import { getRequiredEnv } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return jsonError(parsedBody.error.issues[0]?.message ?? "Credenciales inválidas", 400);
  }

  const validPassword = await bcrypt.compare(
    parsedBody.data.password,
    getRequiredEnv("ADMIN_PASSWORD_HASH"),
  );

  if (!validPassword) {
    return jsonError("La contraseña es incorrecta", 401);
  }

  const token = await signAdminToken();
  return attachAdminCookie(NextResponse.json({ data: { ok: true } }), token);
}
