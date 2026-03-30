"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import type { Empresa, SearchEmpresa } from "@/lib/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { EmptyState } from "@/components/shared/empty-state";
import { EmpresaCard } from "@/components/shared/empresa-card";
import { SearchInput } from "@/components/shared/search-input";

type HomeSearchProps = {
  featured: Empresa[];
};

type SearchResponse = {
  data?: SearchEmpresa[];
  error?: string;
};

export function HomeSearch({ featured }: HomeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEmpresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as SearchResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "No se pudo completar la busqueda");
        }

        setResults(payload.data ?? []);
      } catch (searchError) {
        if (controller.signal.aborted) {
          return;
        }

        setResults([]);
        setError(
          searchError instanceof Error ? searchError.message : "Ocurrio un error al buscar resultados.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void runSearch();

    return () => controller.abort();
  }, [debouncedQuery]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[40px] border border-brand/20 bg-[linear-gradient(135deg,_#cfeeff_0%,_#ddf4ff_38%,_#edf9ff_68%,_#fff7bf_100%)] px-8 py-8 text-foreground lg:px-14 lg:py-10">
        <div className="absolute -left-12 top-0 h-52 w-52 rounded-full bg-brand/35 blur-3xl" />
        <div className="absolute right-0 top-4 h-40 w-40 rounded-full bg-sun/35 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/75 px-4 py-2 text-sm font-semibold text-foreground/85">
            <Sparkles className="h-4 w-4 text-sun" />
            Guias listas para usar en mostrador
          </span>

          <h1 className="max-w-[860px] text-4xl font-bold leading-[0.94] tracking-tight text-foreground lg:text-5xl">
            Encontra en segundos como cobrar cualquier servicio.
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-foreground/72">
            Busca una empresa y accede a una guia clara con explicacion, imagenes paso a paso y video
            opcional.
          </p>

          <div className="mt-4 w-full max-w-[820px]">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Ej. Personal, Aysa, telepeaje, internet..."
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-foreground/65">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
              <Search className="h-4 w-4 text-brand" />
              Busqueda en tiempo real
            </span>
            <Link
              href={query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar"}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-dark"
            >
              Ir a resultados completos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!hasQuery ? (
            <div className="mt-8 w-full border-t border-brand/12 pt-6">
              <div className="mb-5 text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
                  Mas buscados
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  Empresas que mas consultan los operadores
                </h2>
              </div>

              {featured.length === 0 ? (
                <div className="surface-card rounded-[28px] px-6 py-8 text-center">
                  <p className="text-lg font-semibold text-foreground">Todavia no hay empresas cargadas</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/65">
                    Cuando agregues empresas desde el panel admin, apareceran aca ordenadas por visitas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-4">
                  {featured.map((empresa) => (
                    <EmpresaCard key={empresa.id} empresa={empresa} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {hasQuery ? (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Resultados</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Coincidencias para &quot;{debouncedQuery}&quot;
              </h2>
            </div>
            {loading ? <p className="text-sm text-foreground/55">Buscando...</p> : null}
          </div>

          {error ? (
            <EmptyState title="No pudimos completar la busqueda" description={error} />
          ) : results.length === 0 && !loading ? (
            <EmptyState
              title="No encontramos esa empresa todavia"
              description="Proba con otro nombre, una marca relacionada o revisa la ortografia."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {results.map((empresa) => (
                <EmpresaCard key={empresa.id} empresa={empresa} showDescription />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
