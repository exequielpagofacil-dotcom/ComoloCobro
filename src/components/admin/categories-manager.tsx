"use client";

import { useState, useTransition } from "react";
import { FolderTree, Trash2 } from "lucide-react";
import type { Categoria } from "@/lib/types";

type CategoriesManagerProps = {
  initialCategories: Categoria[];
};

type CategoryResponse = {
  data?: Categoria;
  error?: string;
};

type DeleteResponse = {
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

function buildInitialFormState(categories: Categoria[]) {
  return {
    nombre: "",
    icono: "Building2",
    orden: getNextCategoryOrder(categories),
  };
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(() => sortCategories(initialCategories));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => buildInitialFormState(initialCategories));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const method = editingId ? "PUT" : "POST";
    const response = await fetch("/api/categorias", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingId,
        nombre: form.nombre,
        icono: form.icono,
        orden: form.orden,
      }),
    });

    const payload = (await response.json()) as CategoryResponse;

    if (!response.ok || !payload.data) {
      setError(payload.error ?? "No se pudo guardar la categoria");
      return;
    }

    const nextCategories = editingId
      ? sortCategories(
          categories.map((category) => (category.id === editingId ? payload.data ?? category : category)),
        )
      : sortCategories([...categories, payload.data]);

    startTransition(() => {
      setCategories(nextCategories);
      setEditingId(null);
      setForm(buildInitialFormState(nextCategories));
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Quieres borrar esta categoria?")) {
      return;
    }

    setError(null);
    const response = await fetch("/api/categorias", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const payload = (await response.json()) as DeleteResponse;

    if (!response.ok) {
      setError(payload.error ?? "No se pudo borrar la categoria");
      return;
    }

    const nextCategories = categories.filter((category) => category.id !== id);
    setCategories(nextCategories);

    if (!editingId) {
      setForm(buildInitialFormState(nextCategories));
    }
  }

  function startEditing(category: Categoria) {
    setEditingId(category.id);
    setForm({
      nombre: category.nombre,
      icono: category.icono ?? "Building2",
      orden: category.orden,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(buildInitialFormState(categories));
    setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={handleSubmit} className="admin-surface rounded-[32px] p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-admin">Categoria</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {editingId ? "Editar categoria" : "Crear categoria"}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Nombre</label>
            <input
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
              className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
              placeholder="Servicios publicos"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Orden</label>
            <div className="flex h-12 items-center rounded-2xl border border-admin/15 bg-slate-50 px-4 text-sm font-semibold text-foreground/65">
              {form.orden}
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl bg-admin px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              {editingId ? "Guardar cambios" : "Crear categoria"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-admin/15 px-5 py-3 font-semibold text-foreground/75"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <div className="admin-surface rounded-[32px] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft text-admin">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Categorias cargadas</h2>
            <p className="text-sm text-foreground/65">
              No se pueden borrar si tienen empresas asociadas.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-[24px] border border-admin/10 bg-white px-5 py-4"
            >
              <div>
                <p className="font-semibold text-foreground">{category.nombre}</p>
                <p className="mt-1 text-sm text-foreground/55">Orden {category.orden}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => startEditing(category)}
                  className="rounded-full border border-admin/15 px-4 py-2 text-sm font-medium text-foreground/75 transition hover:border-admin/35 hover:text-admin"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-admin/20 px-6 py-10 text-center text-foreground/60">
              Todavia no hay categorias cargadas.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
