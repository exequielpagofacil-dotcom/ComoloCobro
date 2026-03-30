import { empresaInputSchema } from "@/lib/validations";
import { getEmpresaById, setEmpresaActiva, updateEmpresa } from "@/lib/data";
import { requireAdminSession } from "@/lib/auth";
import { getValidationMessage, isUnauthorizedError, jsonData, jsonError } from "@/lib/http";

type CompanyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: CompanyRouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const company = await getEmpresaById(id);

    if (!company) {
      return jsonError("Empresa no encontrada", 404);
    }

    return jsonData(company);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo cargar la empresa", 500);
  }
}

export async function PUT(request: Request, { params }: CompanyRouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();

    if (typeof body.activa === "boolean" && Object.keys(body).length === 1) {
      await setEmpresaActiva(id, body.activa);
      return jsonData({ ok: true });
    }

    const parsedBody = empresaInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(getValidationMessage(parsedBody.error), 400);
    }

    const company = await updateEmpresa(id, parsedBody.data);
    return jsonData(company);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo actualizar la empresa", 500);
  }
}

export async function DELETE(_request: Request, { params }: CompanyRouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await setEmpresaActiva(id, false);
    return jsonData({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo desactivar la empresa", 500);
  }
}
