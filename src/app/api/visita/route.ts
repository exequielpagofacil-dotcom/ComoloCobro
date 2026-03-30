import { incrementEmpresaVisitas } from "@/lib/data";
import { jsonData, jsonError } from "@/lib/http";
import { visitaInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = visitaInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonError(parsedBody.error.issues[0]?.message ?? "Empresa inválida", 400);
    }

    const totalVisits = await incrementEmpresaVisitas(parsedBody.data.empresaId);
    return jsonData({ visitas: totalVisits });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo registrar la visita", 500);
  }
}
