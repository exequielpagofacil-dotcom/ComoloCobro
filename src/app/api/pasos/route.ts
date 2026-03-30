import { z } from "zod";
import { createPaso, deletePaso, getPasosByEmpresa, updatePaso } from "@/lib/data";
import { requireAdminSession } from "@/lib/auth";
import { getValidationMessage, isUnauthorizedError, jsonData, jsonError } from "@/lib/http";
import { pasoInputSchema } from "@/lib/validations";

const createStepSchema = z.object({
  empresaId: z.string().uuid("Empresa inválida"),
  orden: z.number().int().positive().optional(),
  titulo: z.string().min(1, "Ingresá un título"),
  descripcion: z.string().nullable().optional(),
  imagen_url: z.string().url().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get("empresaId");

    if (!empresaId) {
      return jsonError("Falta empresaId", 400);
    }

    const steps = await getPasosByEmpresa(empresaId);
    return jsonData(steps);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudieron listar los pasos", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsedBody = createStepSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(getValidationMessage(parsedBody.error), 400);
    }

    const stepPayload =
      typeof parsedBody.data.orden === "number"
        ? {
            orden: parsedBody.data.orden,
            titulo: parsedBody.data.titulo,
            descripcion: parsedBody.data.descripcion ?? null,
            imagen_url: parsedBody.data.imagen_url ?? null,
          }
        : {
            titulo: parsedBody.data.titulo,
            descripcion: parsedBody.data.descripcion ?? null,
            imagen_url: parsedBody.data.imagen_url ?? null,
          };

    const step = await createPaso(parsedBody.data.empresaId, stepPayload);

    return jsonData(step, 201);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo crear el paso", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();

    if (typeof body.id !== "string") {
      return jsonError("Falta el id del paso", 400);
    }

    const parsedBody = pasoInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(getValidationMessage(parsedBody.error), 400);
    }

    const step = await updatePaso(body.id, parsedBody.data);
    return jsonData(step);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo actualizar el paso", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();

    if (typeof body.id !== "string") {
      return jsonError("Falta el id del paso", 400);
    }

    await deletePaso(body.id);
    return jsonData({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo borrar el paso", 500);
  }
}
