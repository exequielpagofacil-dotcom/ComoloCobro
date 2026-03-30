import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/auth";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { isUnauthorizedError, jsonData, jsonError } from "@/lib/http";
import { sanitizeFileName } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    if (!hasSupabaseAdminEnv()) {
      return jsonError("Configurá Supabase para habilitar uploads", 500);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "uploads");

    if (!(file instanceof File)) {
      return jsonError("No se recibió ningún archivo", 400);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const safeFolder = sanitizeFileName(folder) || "uploads";
    const filePath = `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.storage.from("media").upload(filePath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      return jsonError(error.message, 500);
    }

    const { data } = supabase.storage.from("media").getPublicUrl(filePath);
    return jsonData({ url: data.publicUrl, path: filePath }, 201);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return jsonError("No autorizado", 401);
    }

    return jsonError(error instanceof Error ? error.message : "No se pudo subir el archivo", 500);
  }
}
