import { createEmpresa, getAdminEmpresas, getMostVisitedEmpresas, searchEmpresas } from "@/lib/data";
import { isAdminAuthenticated, requireAdminSession } from "@/lib/auth";
import { getValidationMessage, isUnauthorizedError, jsonData, jsonError } from "@/lib/http";
import { empresaInputSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const limit = Number(searchParams.get("limit") ?? "20");
    const authenticated = await isAdminAuthenticated();

    if (authenticated) {
      const companies = await getAdminEmpresas(query);
      return jsonData(companies);
    }

    if (query) {
      const results = await searchEmpresas(query, Number.isFinite(limit) ? limit : 20);
      return jsonData(results);
    }

    const companies = await getMostVisitedEmpresas(Number.isFinite(limit) ? limit : 20);
    return jsonData(companies);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudieron listar las empresas", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsedBody = empresaInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(getValidationMessage(parsedBody.error), 400);
    }

    const company = await createEmpresa(parsedBody.data);
    return jsonData(company, 201);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo crear la empresa", 500);
  }
}
