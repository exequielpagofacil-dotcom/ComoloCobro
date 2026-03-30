import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from "@/lib/data";
import { requireAdminSession } from "@/lib/auth";
import { getValidationMessage, isUnauthorizedError, jsonData, jsonError } from "@/lib/http";
import { categoriaInputSchema } from "@/lib/validations";

export async function GET() {
  try {
    const categories = await getCategorias();
    return jsonData(categories);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudieron listar las categorías", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsedBody = categoriaInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(getValidationMessage(parsedBody.error), 400);
    }

    const category = await createCategoria(parsedBody.data);
    return jsonData(category, 201);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo crear la categoría", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const categoryId = body.id;

    if (typeof categoryId !== "string") {
      return jsonError("Falta el id de la categoría", 400);
    }

    const parsedBody = categoriaInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(getValidationMessage(parsedBody.error), 400);
    }

    const category = await updateCategoria(categoryId, parsedBody.data);
    return jsonData(category);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo actualizar la categoría", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();

    if (typeof body.id !== "string") {
      return jsonError("Falta el id de la categoría", 400);
    }

    await deleteCategoria(body.id);
    return jsonData({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo borrar la categoría", 500);
  }
}
