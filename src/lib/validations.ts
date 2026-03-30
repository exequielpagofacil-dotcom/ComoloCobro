import { z } from "zod";
import { normalizeLabelList, normalizeTags, slugify } from "@/lib/utils";

const nullableUrl = z
  .union([z.string().url(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" && value.length > 0 ? value : null));

const nullableText = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  });

export const loginSchema = z.object({
  password: z.string().min(1, "Ingresa la contrasena"),
});

export const pasoInputSchema = z.object({
  id: z.string().uuid().optional(),
  orden: z.number().int().min(1),
  titulo: z.string().min(1, "El paso necesita un titulo"),
  descripcion: nullableText,
  imagen_url: nullableUrl,
});

export const empresaInputSchema = z
  .object({
    nombre: z.string().min(2, "Ingresa un nombre"),
    slug: z.string().min(2).optional(),
    categoria_id: z.string().uuid("Selecciona una categoria valida"),
    logo_url: nullableUrl,
    descripcion: z.string().min(10, "La descripcion es demasiado corta"),
    como_se_paga: z.array(z.string()).default([]),
    acepta_efectivo: z.boolean().default(true),
    acepta_debito: z.boolean().default(true),
    acepta_qr: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    video_url: nullableUrl,
    activa: z.boolean().default(true),
    pasos: z.array(pasoInputSchema).default([]),
  })
  .transform((value) => ({
    ...value,
    slug: slugify(value.slug ?? value.nombre),
    como_se_paga: normalizeLabelList(value.como_se_paga),
    tags: normalizeTags(value.tags),
    pasos: value.pasos.map((paso, index) => ({
      ...paso,
      orden: index + 1,
    })),
  }));

export const categoriaInputSchema = z
  .object({
    nombre: z.string().min(2, "Ingresa un nombre"),
    slug: z.string().min(2).optional(),
    icono: z.string().min(1, "Ingresa un icono"),
    orden: z.coerce.number().int().default(0),
  })
  .transform((value) => ({
    ...value,
    slug: slugify(value.slug ?? value.nombre),
  }));

export const visitaInputSchema = z.object({
  empresaId: z.string().uuid("Empresa invalida"),
});
