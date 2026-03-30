"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { StepEditor, type EditableStep } from "@/components/admin/step-editor";
import { TagsInput } from "@/components/admin/tags-input";
import type { ApiResponse, Categoria, Empresa, MetodoCobroSugerido } from "@/lib/types";
import { slugify } from "@/lib/utils";

type CompanyFormProps = {
  categories: Categoria[];
  paymentMethodSuggestions: MetodoCobroSugerido[];
  initialCompany?: Empresa | null;
};

type UploadResponse = {
  data?: {
    url: string;
  };
  error?: string;
};

function mapCompanySteps(company?: Empresa | null): EditableStep[] {
  if (!company || company.pasos.length === 0) {
    return [];
  }

  return company.pasos.map((step) => ({
    clientId: step.id,
    id: step.id,
    titulo: step.titulo,
    descripcion: step.descripcion ?? "",
    imagen_url: step.imagen_url,
    uploading: false,
  }));
}

export function CompanyForm({
  categories,
  paymentMethodSuggestions,
  initialCompany,
}: CompanyFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialCompany));
  const [steps, setSteps] = useState<EditableStep[]>(mapCompanySteps(initialCompany));
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({
    nombre: initialCompany?.nombre ?? "",
    slug: initialCompany?.slug ?? "",
    categoria_id: initialCompany?.categoria_id ?? categories[0]?.id ?? "",
    logo_url: initialCompany?.logo_url ?? "",
    descripcion: initialCompany?.descripcion ?? "",
    como_se_paga: initialCompany?.como_se_paga ?? [],
    acepta_efectivo: initialCompany?.acepta_efectivo ?? true,
    acepta_debito: initialCompany?.acepta_debito ?? true,
    acepta_qr: initialCompany?.acepta_qr ?? true,
    video_url: initialCompany?.video_url ?? "",
    activa: initialCompany?.activa ?? true,
    tags: initialCompany?.tags ?? [],
  });

  async function uploadLogo(file: File) {
    setUploadingLogo(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "logos");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as UploadResponse;

    if (!response.ok || !payload.data?.url) {
      setUploadingLogo(false);
      setError(payload.error ?? "No se pudo subir el logo");
      return;
    }

    setForm((currentForm) => ({ ...currentForm, logo_url: payload.data?.url ?? "" }));
    setUploadingLogo(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      nombre: form.nombre,
      slug: form.slug,
      categoria_id: form.categoria_id,
      logo_url: form.logo_url || null,
      descripcion: form.descripcion,
      como_se_paga: form.como_se_paga,
      acepta_efectivo: form.acepta_efectivo,
      acepta_debito: form.acepta_debito,
      acepta_qr: form.acepta_qr,
      video_url: form.video_url || null,
      activa: form.activa,
      tags: form.tags,
      pasos: steps.map((step, index) => ({
        id: step.id,
        orden: index + 1,
        titulo: step.titulo,
        descripcion: step.descripcion || null,
        imagen_url: step.imagen_url || null,
      })),
    };

    const response = await fetch(
      initialCompany ? `/api/empresas/${initialCompany.id}` : "/api/empresas",
      {
        method: initialCompany ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const responsePayload = (await response.json()) as ApiResponse<Empresa>;

    if (!response.ok) {
      setError(responsePayload.error ?? "No se pudo guardar la empresa");
      return;
    }

    startTransition(() => {
      router.push("/admin/empresas");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-admin">Empresa</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {initialCompany ? "Editar empresa" : "Nueva empresa"}
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">Nombre</label>
              <input
                value={form.nombre}
                onChange={(event) => {
                  const nombre = event.target.value;

                  setForm((currentForm) => ({
                    ...currentForm,
                    nombre,
                    slug: slugEdited ? currentForm.slug : slugify(nombre),
                  }));
                }}
                className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
                placeholder="Ej. Edesur"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Slug</label>
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setForm((currentForm) => ({ ...currentForm, slug: slugify(event.target.value) }));
                }}
                className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
                placeholder="edesur"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Categoría</label>
              <select
                value={form.categoria_id}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, categoria_id: event.target.value }))
                }
                className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">Descripción en Markdown</label>
              <textarea
                value={form.descripcion}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, descripcion: event.target.value }))
                }
                rows={8}
                className="w-full rounded-2xl border border-admin/15 bg-white px-4 py-3"
                placeholder="Explicá cómo procesar el cobro con pasos y aclaraciones."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Video URL</label>
              <input
                value={form.video_url}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, video_url: event.target.value }))
                }
                className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-admin/15 bg-white px-4 py-3 text-sm font-medium text-foreground/75">
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(event) =>
                    setForm((currentForm) => ({ ...currentForm, activa: event.target.checked }))
                  }
                />
                Empresa activa
              </label>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">Como se paga</label>
              <TagsInput
                tags={form.como_se_paga}
                onChange={(como_se_paga) =>
                  setForm((currentForm) => ({ ...currentForm, como_se_paga }))
                }
                placeholder="Ej. Con barra, Con codigo, Con documento"
                preserveCase
                suggestions={paymentMethodSuggestions.map((item) => item.nombre)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Medios aceptados
              </label>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-admin/15 bg-white p-4">
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Pago con efectivo
                  </label>
                  <select
                    value={form.acepta_efectivo ? "si" : "no"}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        acepta_efectivo: event.target.value === "si",
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-admin/15 bg-white px-3"
                  >
                    <option value="si">Si</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-admin/15 bg-white p-4">
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Pago con debito
                  </label>
                  <select
                    value={form.acepta_debito ? "si" : "no"}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        acepta_debito: event.target.value === "si",
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-admin/15 bg-white px-3"
                  >
                    <option value="si">Si</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-admin/15 bg-white p-4">
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Pago con QR
                  </label>
                  <select
                    value={form.acepta_qr ? "si" : "no"}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        acepta_qr: event.target.value === "si",
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-admin/15 bg-white px-3"
                  >
                    <option value="si">Si</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">Tags</label>
              <TagsInput
                tags={form.tags}
                onChange={(tags) => setForm((currentForm) => ({ ...currentForm, tags }))}
              />
            </div>
          </div>
        </div>

        <aside className="admin-surface rounded-[32px] p-6">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Logo</h3>
          <p className="mt-2 text-sm leading-6 text-foreground/65">
            Se guarda en el bucket público <code>media</code> de Supabase Storage.
          </p>

          <div className="mt-5 overflow-hidden rounded-[28px] bg-admin-soft">
            {form.logo_url ? (
              <div className="relative aspect-square">
                <Image
                  src={form.logo_url}
                  alt={form.nombre || "Logo de empresa"}
                  fill
                  className="object-contain p-5"
                  sizes="320px"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm font-medium text-admin/75">
                Sin logo cargado
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-admin/15 bg-white px-4 py-3 font-semibold text-foreground/75 transition hover:border-admin/35 hover:text-admin"
            >
              <ImagePlus className="h-4 w-4" />
              {uploadingLogo ? "Subiendo logo..." : "Subir logo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                void uploadLogo(file);
                event.currentTarget.value = "";
              }}
            />

            <input
              value={form.logo_url}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, logo_url: event.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4 text-sm"
              placeholder="URL pública del logo"
            />
          </div>
        </aside>
      </div>

      <div className="admin-surface rounded-[32px] p-6">
        <StepEditor steps={steps} onChange={setSteps} />
      </div>

      {categories.length === 0 ? (
        <div className="rounded-[24px] border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
          Necesitás al menos una categoría antes de guardar una empresa. Podés crearla en{" "}
          <Link href="/admin/categorias" className="font-semibold underline">
            /admin/categorias
          </Link>
          .
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending || categories.length === 0}
          className="rounded-2xl bg-admin px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Guardando..." : "Guardar empresa"}
        </button>
        <Link
          href="/admin/empresas"
          className="rounded-2xl border border-admin/15 bg-white px-6 py-3 font-semibold text-foreground/75"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
