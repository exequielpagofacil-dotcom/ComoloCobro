import type { Metadata } from "next";
import Link from "next/link";
import { EmpresaCard } from "@/components/shared/empresa-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { searchEmpresas } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Buscar",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = query ? await searchEmpresas(query, 30) : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-10 lg:px-10">
        <section className="surface-card rounded-[36px] p-8 lg:p-10">
          <SectionHeading
            eyebrow="Búsqueda"
            title="Encontrá la guía exacta sin filtros previos"
            description="Podés buscar por empresa, servicio o palabra asociada. Esta página muestra el resultado completo de la búsqueda."
          />

          <form action="/buscar" className="mt-8 flex flex-col gap-3 lg:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Ej. internet, luz, telefonía"
              className="h-14 flex-1 rounded-[22px] border border-black/8 bg-white px-5 text-base"
            />
            <button
              type="submit"
              className="rounded-[22px] bg-brand px-6 py-4 font-semibold text-white transition hover:bg-brand-dark"
            >
              Buscar
            </button>
          </form>

          {query ? (
            <p className="mt-4 text-sm text-foreground/55">
              Mostrando resultados para <span className="font-semibold text-foreground">“{query}”</span>.
            </p>
          ) : (
            <p className="mt-4 text-sm text-foreground/55">
              Escribí una empresa o servicio para listar coincidencias.
            </p>
          )}
        </section>

        {!query ? (
          <EmptyState
            title="Empezá escribiendo una búsqueda"
            description="Por ejemplo: agua, celular, cable, peaje o el nombre exacto de la empresa."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No hubo coincidencias"
            description="Todavía no existe una guía para esa búsqueda. Probá con otro nombre o una palabra relacionada."
          />
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {results.length} resultado{results.length === 1 ? "" : "s"}
              </h2>
              <Link href="/" className="text-sm font-semibold text-brand">
                Volver al inicio
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {results.map((empresa) => (
                <EmpresaCard key={empresa.id} empresa={empresa} showDescription />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
