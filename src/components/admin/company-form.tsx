"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, PlusCircle, X } from "lucide-react";
import { CategoryCombobox } from "@/components/admin/category-combobox";
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

function sortCategories(categories: Categoria[]): Categoria[] {
  return [...categories].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
}

function getNextCategoryOrder(categories: Categoria[]): number {
  if (categories.length === 0) {
    return 0;
  }

  return Math.max(...categories.map((category) => category.orden), 0) + 1;
}

function buildCategoryDraft(categories: Categoria[]) {
  return {
    nombre: "",
    icono: "Building2",
    orden: getNextCategoryOrder(categories),
  };
}

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
  const [companyCategories, setCompanyCategories] = useState(() => sortCategories(categories));
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialCompany));
  const [steps, setSteps] = useState<EditableStep[]>(mapCompanySteps(initialCompany));
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState(() => buildCategoryDraft(categories));
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

  async function handleCreateCategory() {
    if (creatingCategory) {
      return;
    }

    setCategoryError(null);
    setCreatingCategory(true);

    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryDraft),
      });

      const payload = (await response.json()) as ApiResponse<Categoria>;

      if (!response.ok || !payload.data) {
        setCategoryError(payload.error ?? "No se pudo crear la categoria");
        return;
      }

      const nextCategories = sortCategories([...companyCategories, payload.data]);

      setCompanyCategories(nextCategories);
      setForm((currentForm) => ({ ...currentForm, categoria_id: payload.data?.id ?? "" }));
      setCategoryDraft(buildCategoryDraft(nextCategories));
      setShowCategoryCreator(false);
    } catch (creationError) {
      setCategoryError(
        creationError instanceof Error ? creationError.message : "No se pudo crear la categoria",
      );
    } finally {
      setCreatingCategory(false);
    }
  }

  function openCategoryCreator() {
    setCategoryError(null);
    setCategoryDraft(buildCategoryDraft(companyCategories));
    setShowCategoryCreator(true);
  }

  function closeCategoryCreator() {
    setShowCategoryCreator(false);
    setCategoryError(null);
    setCategoryDraft(buildCategoryDraft(companyCategories));
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
              <label className="mb-2 block text-sm font-semibold text-foreground">Categoria</label>
              <CategoryCombobox
                categories={companyCategories}
                selectedCategoryId={form.categoria_id}
                onSelectCategory={(categoria_id) =>
                  setForm((currentForm) => ({ ...currentForm, categoria_id }))
                }
                onCreateCategory={openCategoryCreator}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Descripcion en Markdown
              </label>
              <textarea
                value={form.descripcion}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, descripcion: event.target.value }))
                }
                rows={8}
                className="w-full rounded-2xl border border-admin/15 bg-white px-4 py-3"
                placeholder="Explica como procesar el cobro con pasos y aclaraciones."
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
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Como se paga
              </label>
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
            Se guarda en el bucket publico <code>media</code> de Supabase Storage.
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
              placeholder="URL publica del logo"
            />
          </div>
        </aside>
      </div>

      <div className="admin-surface rounded-[32px] p-6">
        <StepEditor steps={steps} onChange={setSteps} />
      </div>

      {companyCategories.length === 0 ? (
        <div className="rounded-[24px] border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
          Necesitas al menos una categoria antes de guardar una empresa. Podes crearla desde el
          selector o en{" "}
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
          disabled={isPending || companyCategories.length === 0}
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

      {showCategoryCreator ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-category-title"
            className="admin-surface w-full max-w-xl rounded-[32px] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-admin">
                  Nueva categoria
                </p>
                <h3
                  id="new-category-title"
                  className="mt-2 text-2xl font-bold tracking-tight text-foreground"
                >
                  Crear categoria desde aqui
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  Se guarda al instante y queda seleccionada para esta empresa.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCategoryCreator}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-admin/15 bg-white text-foreground/70 transition hover:border-admin/35 hover:text-admin"
                aria-label="Cerrar modal de categoria"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_160px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Nombre</label>
                <input
                  value={categoryDraft.nombre}
                  onChange={(event) =>
                    setCategoryDraft((currentDraft) => ({
                      ...currentDraft,
                      nombre: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") {
                      return;
                    }

                    event.preventDefault();
                    void handleCreateCategory();
                  }}
                  className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
                  placeholder="Nombre"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Orden</label>
                <div className="flex h-12 items-center rounded-2xl border border-admin/15 bg-slate-50 px-4 text-sm font-semibold text-foreground/65">
                  {categoryDraft.orden}
                </div>
              </div>
            </div>

            {categoryError ? (
              <p className="mt-4 text-sm font-medium text-red-600">{categoryError}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleCreateCategory()}
                disabled={creatingCategory}
                className="inline-flex items-center gap-2 rounded-2xl bg-admin px-5 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                <PlusCircle className="h-4 w-4" />
                {creatingCategory ? "Creando..." : "Crear y usar"}
              </button>
              <button
                type="button"
                onClick={closeCategoryCreator}
                className="rounded-2xl border border-admin/15 bg-white px-5 py-3 font-semibold text-foreground/75"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
