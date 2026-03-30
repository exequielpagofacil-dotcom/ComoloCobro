import { searchEmpresas } from "@/lib/data";
import { jsonData, jsonError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (!query) {
      return jsonData([]);
    }

    const results = await searchEmpresas(query, 30);
    return jsonData(results);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo completar la búsqueda", 500);
  }
}
