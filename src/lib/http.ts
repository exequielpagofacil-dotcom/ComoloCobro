import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getValidationMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos";
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}
