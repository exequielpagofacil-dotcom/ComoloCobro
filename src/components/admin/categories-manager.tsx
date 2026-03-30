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

const initialFormState = {
  nombre: "",
  icono: "Building2",
  orden: 0,
};

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);
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
        orden: Number(form.orden),
      }),
    });

    const payload = (await response.json()) as CategoryResponse;

    if (!response.ok || !payload.data) {
      setError(payload.error ?? "No se pudo guardar la categoría");
      return;
    }

    startTransition(() => {
      setCategories((currentCategories) => {
        if (editingId) {
          return currentCategories
            .map((category) => (category.id === editingId ? payload.data ?? category : category))
            .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
        }

        return [...currentCategories, payload.data!].sort(
          (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre),
        );
      });
      setEditingId(null);
      setForm(initialFormState);
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Querés borrar esta categoría?")) {
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
      setError(payload.error ?? "No se pudo borrar la categoría");
      return;
    }

    setCategories((currentCategories) => currentCategories.filter((category) => category.id !== id));
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
    setForm(initialFormState);
    setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={handleSubmit} className="admin-surface rounded-[32px] p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-admin">Categoría</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {editingId ? "Editar categoría" : "Crear categoría"}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Nombre</label>
            <input
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
              className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
              placeholder="Servicios públicos"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Ícono Lucide</label>
            <input
              value={form.icono}
              onChange={(event) => setForm((current) => ({ ...current, icono: event.target.value }))}
              className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
              placeholder="Building2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Orden</label>
            <input
              type="number"
              value={form.orden}
              onChange={(event) =>
                setForm((current) => ({ ...current, orden: Number(event.target.value) }))
              }
              className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl bg-admin px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              {editingId ? "Guardar cambios" : "Crear categoría"}
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Categorías cargadas</h2>
            <p className="text-sm text-foreground/65">No se pueden borrar si tienen empresas asociadas.</p>
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
                <p className="mt-1 text-sm text-foreground/55">
                  {category.icono ?? "Building2"} · orden {category.orden}
                </p>
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
              Todavía no hay categorías cargadas.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
