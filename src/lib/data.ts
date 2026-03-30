import "server-only";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseAdminClient, createSupabasePublicServerClient } from "@/lib/supabase/server";
import type {
  Categoria,
  CategoriaInput,
  DashboardSummary,
  Empresa,
  EmpresaFormInput,
  EmpresaFormStepInput,
  MetodoCobroSugerido,
  Paso,
  SearchEmpresa,
  SearchEmpresaRow,
} from "@/lib/types";
import { normalizeLabelList, normalizeNullableString, normalizeTags, slugify } from "@/lib/utils";

const categoriaFields = "id,nombre,slug,icono,orden,created_at";
const metodoCobroFields = "id,nombre,slug,created_at";
const pasoFields = "id,empresa_id,orden,titulo,descripcion,imagen_url,created_at";
const empresaFields = `
  id,
  nombre,
  slug,
  categoria_id,
  logo_url,
  descripcion,
  como_se_paga,
  acepta_efectivo,
  acepta_debito,
  acepta_qr,
  tags,
  video_url,
  activa,
  visitas,
  created_at,
  updated_at,
  categoria:categorias(${categoriaFields})
`;
const empresaWithPasosFields = `${empresaFields},pasos(${pasoFields})`;

function ensureData<T>(data: T | null, error: { message: string } | null): T {
  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    throw new Error("No se encontraron datos");
  }

  return data;
}

function mapCategoria(raw: Record<string, unknown> | null): Categoria | null {
  if (!raw) {
    return null;
  }

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    slug: String(raw.slug),
    icono: typeof raw.icono === "string" ? raw.icono : null,
    orden: Number(raw.orden ?? 0),
    created_at: String(raw.created_at),
  };
}

function mapMetodoCobroSugerido(raw: Record<string, unknown>): MetodoCobroSugerido {
  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    slug: String(raw.slug),
    created_at: String(raw.created_at),
  };
}

function mapPaso(raw: Record<string, unknown>): Paso {
  return {
    id: String(raw.id),
    empresa_id: String(raw.empresa_id),
    orden: Number(raw.orden),
    titulo: String(raw.titulo),
    descripcion: typeof raw.descripcion === "string" ? raw.descripcion : null,
    imagen_url: typeof raw.imagen_url === "string" ? raw.imagen_url : null,
    created_at: String(raw.created_at),
  };
}

function mapEmpresa(raw: Record<string, unknown>): Empresa {
  const rawPasos = Array.isArray(raw.pasos)
    ? raw.pasos.filter((paso): paso is Record<string, unknown> => typeof paso === "object" && paso !== null)
    : [];

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    slug: String(raw.slug),
    categoria_id: String(raw.categoria_id),
    logo_url: typeof raw.logo_url === "string" ? raw.logo_url : null,
    descripcion: String(raw.descripcion ?? ""),
    como_se_paga: Array.isArray(raw.como_se_paga)
      ? raw.como_se_paga.map((item) => String(item))
      : [],
    acepta_efectivo: Boolean(raw.acepta_efectivo ?? true),
    acepta_debito: Boolean(raw.acepta_debito ?? true),
    acepta_qr: Boolean(raw.acepta_qr ?? true),
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag) => String(tag)) : [],
    video_url: typeof raw.video_url === "string" ? raw.video_url : null,
    activa: Boolean(raw.activa),
    visitas: Number(raw.visitas ?? 0),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    categoria: mapCategoria((raw.categoria as Record<string, unknown> | null) ?? null),
    pasos: rawPasos.map(mapPaso).sort((a, b) => a.orden - b.orden),
  };
}

function mapSearchEmpresa(raw: SearchEmpresaRow): SearchEmpresa {
  return {
    id: raw.id,
    nombre: raw.nombre,
    slug: raw.slug,
    categoria_id: raw.categoria_id,
    logo_url: raw.logo_url,
    descripcion: raw.descripcion,
    como_se_paga: raw.como_se_paga ?? [],
    acepta_efectivo: raw.acepta_efectivo,
    acepta_debito: raw.acepta_debito,
    acepta_qr: raw.acepta_qr,
    tags: raw.tags ?? [],
    video_url: raw.video_url,
    activa: raw.activa,
    visitas: raw.visitas,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    categoria: {
      id: raw.categoria_id,
      nombre: raw.categoria_nombre,
      slug: raw.categoria_slug,
      icono: raw.categoria_icono,
      orden: 0,
      created_at: raw.created_at,
    },
    pasos: [],
    rank: raw.rank,
  };
}

function revalidateEmpresaPaths(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/admin");
  revalidatePath("/admin/empresas");
  revalidatePath("/admin/categorias");

  if (slug) {
    revalidatePath(`/empresa/${slug}`);
  }
}

export async function getMostVisitedEmpresas(limit = 8): Promise<Empresa[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(empresaFields)
    .eq("activa", true)
    .order("visitas", { ascending: false })
    .order("nombre", { ascending: true })
    .limit(limit);

  return ensureData(data, error).map((empresa) => mapEmpresa(empresa as Record<string, unknown>));
}

export async function searchEmpresas(query: string, limit = 20): Promise<SearchEmpresa[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = createSupabasePublicServerClient();
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const { data, error } = await supabase.rpc("search_empresas", {
    search_term: trimmedQuery,
    result_limit: limit,
    result_offset: 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SearchEmpresaRow[];
  return rows.map((row) => mapSearchEmpresa(row));
}

export async function getEmpresaBySlug(slug: string): Promise<Empresa | null> {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(empresaWithPasosFields)
    .eq("slug", slug)
    .eq("activa", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapEmpresa(data as Record<string, unknown>) : null;
}

export async function getRelatedEmpresas(
  categoriaId: string,
  empresaId: string,
  limit = 4,
): Promise<Empresa[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(empresaFields)
    .eq("categoria_id", categoriaId)
    .eq("activa", true)
    .neq("id", empresaId)
    .order("visitas", { ascending: false })
    .limit(limit);

  return ensureData(data, error).map((empresa) => mapEmpresa(empresa as Record<string, unknown>));
}

export async function getCategorias(): Promise<Categoria[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("categorias")
    .select(categoriaFields)
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return ensureData(data, error).map((categoria) =>
    mapCategoria(categoria as Record<string, unknown>),
  ) as Categoria[];
}

export async function getMetodosCobroSugeridos(): Promise<MetodoCobroSugerido[]> {
  if (!hasSupabaseAdminEnv()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metodos_cobro")
    .select(metodoCobroFields)
    .order("nombre", { ascending: true });

  return ensureData(data, error).map((item) =>
    mapMetodoCobroSugerido(item as Record<string, unknown>),
  );
}

export async function getAdminDashboardSummary(): Promise<DashboardSummary> {
  if (!hasSupabaseAdminEnv()) {
    return {
      totalEmpresas: 0,
      ultimasEditadas: [],
      topVisitadas: [],
    };
  }

  const supabase = createSupabaseAdminClient();
  const [countResult, latestResult, topResult] = await Promise.all([
    supabase.from("empresas").select("id", { count: "exact", head: true }),
    supabase
      .from("empresas")
      .select(empresaFields)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("empresas")
      .select(empresaFields)
      .order("visitas", { ascending: false })
      .limit(5),
  ]);

  if (countResult.error) {
    throw new Error(countResult.error.message);
  }

  return {
    totalEmpresas: countResult.count ?? 0,
    ultimasEditadas: ensureData(latestResult.data, latestResult.error).map((empresa) =>
      mapEmpresa(empresa as Record<string, unknown>),
    ),
    topVisitadas: ensureData(topResult.data, topResult.error).map((empresa) =>
      mapEmpresa(empresa as Record<string, unknown>),
    ),
  };
}

export async function getAdminEmpresas(search?: string): Promise<Empresa[]> {
  if (!hasSupabaseAdminEnv()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("empresas")
    .select(empresaFields)
    .order("updated_at", { ascending: false });

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    query = query.or(`nombre.ilike.%${trimmedSearch}%,slug.ilike.%${trimmedSearch}%`);
  }

  const { data, error } = await query;
  return ensureData(data, error).map((empresa) => mapEmpresa(empresa as Record<string, unknown>));
}

export async function getEmpresaById(id: string): Promise<Empresa | null> {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(empresaWithPasosFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapEmpresa(data as Record<string, unknown>) : null;
}

async function syncEmpresaPasos(
  supabase: SupabaseClient,
  empresaId: string,
  pasos: EmpresaFormStepInput[],
): Promise<void> {
  const normalizedSteps = pasos.map((paso, index) => ({
    id: paso.id,
    empresa_id: empresaId,
    orden: index + 1,
    titulo: paso.titulo.trim(),
    descripcion: normalizeNullableString(paso.descripcion),
    imagen_url: normalizeNullableString(paso.imagen_url),
  }));

  const { data: existingSteps, error: existingStepsError } = await supabase
    .from("pasos")
    .select("id")
    .eq("empresa_id", empresaId);

  if (existingStepsError) {
    throw new Error(existingStepsError.message);
  }

  const existingIds = (existingSteps ?? []).map((paso) => String(paso.id));
  const incomingIds = new Set(
    normalizedSteps
      .map((paso) => paso.id)
      .filter((pasoId): pasoId is string => typeof pasoId === "string"),
  );

  const idsToDelete = existingIds.filter((id) => !incomingIds.has(id));
  if (idsToDelete.length > 0) {
    const { error } = await supabase.from("pasos").delete().in("id", idsToDelete);

    if (error) {
      throw new Error(error.message);
    }
  }

  const rowsToUpsert = normalizedSteps.filter(
    (paso): paso is typeof paso & { id: string } => typeof paso.id === "string",
  );
  if (rowsToUpsert.length > 0) {
    const { error } = await supabase.from("pasos").upsert(rowsToUpsert, {
      onConflict: "id",
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  const rowsToInsert = normalizedSteps
    .filter((paso) => typeof paso.id !== "string")
    .map((paso) => ({
      empresa_id: paso.empresa_id,
      orden: paso.orden,
      titulo: paso.titulo,
      descripcion: paso.descripcion,
      imagen_url: paso.imagen_url,
    }));
  if (rowsToInsert.length > 0) {
    const { error } = await supabase.from("pasos").insert(rowsToInsert);

    if (error) {
      throw new Error(error.message);
    }
  }
}

async function syncMetodosCobroSugeridos(
  supabase: SupabaseClient,
  metodos: string[],
): Promise<void> {
  const normalizedMethods = normalizeLabelList(metodos);

  if (normalizedMethods.length === 0) {
    return;
  }

  const rows = normalizedMethods.map((nombre) => ({
    nombre,
    slug: slugify(nombre),
  }));

  const { error } = await supabase.from("metodos_cobro").upsert(rows, {
    onConflict: "slug",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createEmpresa(input: EmpresaFormInput): Promise<Empresa> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para crear empresas");
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    nombre: input.nombre.trim(),
    slug: slugify(input.slug || input.nombre),
    categoria_id: input.categoria_id,
    logo_url: normalizeNullableString(input.logo_url),
    descripcion: input.descripcion.trim(),
    como_se_paga: normalizeLabelList(input.como_se_paga),
    acepta_efectivo: input.acepta_efectivo ?? true,
    acepta_debito: input.acepta_debito ?? true,
    acepta_qr: input.acepta_qr ?? true,
    tags: normalizeTags(input.tags),
    video_url: normalizeNullableString(input.video_url),
    activa: input.activa ?? true,
  };

  const { data, error } = await supabase
    .from("empresas")
    .insert(payload)
    .select(empresaFields)
    .single();

  const empresa = ensureData(data, error);
  await syncMetodosCobroSugeridos(supabase, input.como_se_paga);
  await syncEmpresaPasos(supabase, String(empresa.id), input.pasos);
  revalidateEmpresaPaths(String(empresa.slug));

  const reloaded = await getEmpresaById(String(empresa.id));
  if (!reloaded) {
    throw new Error("No se pudo recargar la empresa creada");
  }

  return reloaded;
}

export async function updateEmpresa(id: string, input: EmpresaFormInput): Promise<Empresa> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para editar empresas");
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    nombre: input.nombre.trim(),
    slug: slugify(input.slug || input.nombre),
    categoria_id: input.categoria_id,
    logo_url: normalizeNullableString(input.logo_url),
    descripcion: input.descripcion.trim(),
    como_se_paga: normalizeLabelList(input.como_se_paga),
    acepta_efectivo: input.acepta_efectivo ?? true,
    acepta_debito: input.acepta_debito ?? true,
    acepta_qr: input.acepta_qr ?? true,
    tags: normalizeTags(input.tags),
    video_url: normalizeNullableString(input.video_url),
    activa: input.activa ?? true,
  };

  const { data, error } = await supabase
    .from("empresas")
    .update(payload)
    .eq("id", id)
    .select(empresaFields)
    .single();

  const empresa = ensureData(data, error);
  await syncMetodosCobroSugeridos(supabase, input.como_se_paga);
  await syncEmpresaPasos(supabase, id, input.pasos);
  revalidateEmpresaPaths(String(empresa.slug));

  const reloaded = await getEmpresaById(id);
  if (!reloaded) {
    throw new Error("No se pudo recargar la empresa actualizada");
  }

  return reloaded;
}

export async function setEmpresaActiva(id: string, activa: boolean): Promise<void> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para actualizar empresas");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("empresas")
    .update({ activa })
    .eq("id", id)
    .select("slug")
    .single();

  const empresa = ensureData(data, error);
  revalidateEmpresaPaths(String(empresa.slug));
}

export async function incrementEmpresaVisitas(empresaId: string): Promise<number> {
  if (!hasSupabaseAdminEnv()) {
    return 0;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("incrementar_visitas", {
    p_empresa_id: empresaId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  return Number(data ?? 0);
}

export async function getPasosByEmpresa(empresaId: string): Promise<Paso[]> {
  if (!hasSupabaseAdminEnv()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("pasos")
    .select(pasoFields)
    .eq("empresa_id", empresaId)
    .order("orden", { ascending: true });

  return ensureData(data, error).map((paso) => mapPaso(paso as Record<string, unknown>));
}

export async function createPaso(
  empresaId: string,
  paso: Omit<EmpresaFormStepInput, "orden"> & { orden?: number },
): Promise<Paso> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para crear pasos");
  }

  const supabase = createSupabaseAdminClient();
  const { data: lastStep, error: lastStepError } = await supabase
    .from("pasos")
    .select("orden")
    .eq("empresa_id", empresaId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastStepError) {
    throw new Error(lastStepError.message);
  }

  const payload = {
    empresa_id: empresaId,
    orden: paso.orden ?? Number(lastStep?.orden ?? 0) + 1,
    titulo: paso.titulo.trim(),
    descripcion: normalizeNullableString(paso.descripcion),
    imagen_url: normalizeNullableString(paso.imagen_url),
  };

  const { data, error } = await supabase
    .from("pasos")
    .insert(payload)
    .select(pasoFields)
    .single();

  return mapPaso(ensureData(data, error) as Record<string, unknown>);
}

export async function updatePaso(id: string, paso: EmpresaFormStepInput): Promise<Paso> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para actualizar pasos");
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    orden: paso.orden,
    titulo: paso.titulo.trim(),
    descripcion: normalizeNullableString(paso.descripcion),
    imagen_url: normalizeNullableString(paso.imagen_url),
  };

  const { data, error } = await supabase
    .from("pasos")
    .update(payload)
    .eq("id", id)
    .select(pasoFields)
    .single();

  return mapPaso(ensureData(data, error) as Record<string, unknown>);
}

export async function deletePaso(id: string): Promise<void> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para borrar pasos");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("pasos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCategoria(input: CategoriaInput): Promise<Categoria> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para crear categorías");
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    nombre: input.nombre.trim(),
    slug: slugify(input.slug || input.nombre),
    icono: input.icono.trim() || "Building2",
    orden: input.orden,
  };

  const { data, error } = await supabase
    .from("categorias")
    .insert(payload)
    .select(categoriaFields)
    .single();

  revalidateEmpresaPaths();
  return mapCategoria(ensureData(data, error) as Record<string, unknown>) as Categoria;
}

export async function updateCategoria(id: string, input: CategoriaInput): Promise<Categoria> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para actualizar categorías");
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    nombre: input.nombre.trim(),
    slug: slugify(input.slug || input.nombre),
    icono: input.icono.trim() || "Building2",
    orden: input.orden,
  };

  const { data, error } = await supabase
    .from("categorias")
    .update(payload)
    .eq("id", id)
    .select(categoriaFields)
    .single();

  revalidateEmpresaPaths();
  return mapCategoria(ensureData(data, error) as Record<string, unknown>) as Categoria;
}

export async function deleteCategoria(id: string): Promise<void> {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Configurá Supabase para borrar categorías");
  }

  const supabase = createSupabaseAdminClient();
  const { count, error: countError } = await supabase
    .from("empresas")
    .select("id", { count: "exact", head: true })
    .eq("categoria_id", id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("No se puede borrar una categoría con empresas asociadas");
  }

  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateEmpresaPaths();
}
