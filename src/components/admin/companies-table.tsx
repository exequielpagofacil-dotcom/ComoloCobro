"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Building2, PenSquare } from "lucide-react";
import type { Empresa } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type CompaniesTableProps = {
  companies: Empresa[];
};

type ToggleResponse = {
  error?: string;
};

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(companies);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredRows = rows.filter((company) => {
    const search = deferredQuery.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      company.nombre.toLowerCase().includes(search) ||
      company.slug.toLowerCase().includes(search) ||
      (company.categoria?.nombre ?? "").toLowerCase().includes(search)
    );
  });

  async function toggleCompany(id: string, activa: boolean) {
    setLoadingId(id);

    const response = await fetch(`/api/empresas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ activa }),
    });

    const payload = (await response.json()) as ToggleResponse;

    if (!response.ok) {
      window.alert(payload.error ?? "No se pudo actualizar el estado");
      setLoadingId(null);
      return;
    }

    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, activa } : row)),
    );
    setLoadingId(null);
  }

  return (
    <div className="admin-surface rounded-[32px] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Empresas</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/65">
            Gestioná estado, visitas y acceso rápido a edición.
          </p>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar por nombre, slug o categoría"
          className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4 text-sm lg:max-w-sm"
        />
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-admin/20 px-6 py-10 text-center text-foreground/60">
          No hay empresas que coincidan con esa búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-admin/10 text-xs uppercase tracking-[0.22em] text-foreground/45">
                <th className="px-4 py-4 font-semibold">Empresa</th>
                <th className="px-4 py-4 font-semibold">Categoría</th>
                <th className="px-4 py-4 font-semibold">Visitas</th>
                <th className="px-4 py-4 font-semibold">Activa</th>
                <th className="px-4 py-4 font-semibold">Última edición</th>
                <th className="px-4 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((company) => (
                <tr key={company.id} className="border-b border-admin/8 last:border-none">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft">
                        {company.logo_url ? (
                          <Image
                            src={company.logo_url}
                            alt={company.nombre}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-2xl object-contain"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-admin" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{company.nombre}</p>
                        <p className="text-sm text-foreground/55">{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground/75">
                    {company.categoria?.nombre ?? "Sin categoría"}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground/75">
                    {company.visitas.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={loadingId === company.id}
                      onClick={() => toggleCompany(company.id, !company.activa)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        company.activa
                          ? "bg-brand/15 text-brand"
                          : "bg-foreground/10 text-foreground/55"
                      }`}
                    >
                      {loadingId === company.id ? "Guardando..." : company.activa ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground/60">
                    {formatDateTime(company.updated_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/empresas/${company.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-admin/15 px-4 py-2 text-sm font-medium text-foreground/75 transition hover:border-admin/35 hover:text-admin"
                    >
                      <PenSquare className="h-4 w-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
