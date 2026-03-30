import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import type { Empresa, SearchEmpresa } from "@/lib/types";
import { truncateText } from "@/lib/utils";

type EmpresaCardProps = {
  empresa: Empresa | SearchEmpresa;
  showDescription?: boolean;
};

export function EmpresaCard({ empresa, showDescription = false }: EmpresaCardProps) {
  return (
    <Link
      href={`/empresa/${empresa.slug}`}
      className="surface-card group flex h-full flex-col rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:border-brand/20"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-muted">
          {empresa.logo_url ? (
            <Image
              src={empresa.logo_url}
              alt={`Logo de ${empresa.nombre}`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-[20px] object-contain"
            />
          ) : (
            <Building2 className="h-7 w-7 text-foreground/35" />
          )}
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          {empresa.categoria?.nombre ?? "Sin categoría"}
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{empresa.nombre}</h3>
        {showDescription ? (
          <p className="mt-3 text-sm leading-6 text-foreground/70">
            {truncateText(empresa.descripcion, 170)}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-black/6 pt-4 text-sm font-medium text-foreground/55">
        <span>{empresa.visitas.toLocaleString("es-AR")} búsquedas</span>
        <span className="inline-flex items-center gap-1 text-brand">
          Ver guía
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
