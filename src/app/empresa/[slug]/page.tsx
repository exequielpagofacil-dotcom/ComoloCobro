import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { StepCarousel } from "@/components/public/step-carousel";
import { VisitTracker } from "@/components/public/visit-tracker";
import { EmpresaCard } from "@/components/shared/empresa-card";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import { getEmpresaBySlug, getRelatedEmpresas } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import { toPlainText } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CompanyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const empresa = await getEmpresaBySlug(slug);

  if (!empresa) {
    return {
      title: "Guía no encontrada",
    };
  }

  const description = toPlainText(empresa.descripcion).slice(0, 160);
  const image = empresa.logo_url ?? empresa.pasos[0]?.imagen_url ?? undefined;

  return {
    title: `Cómo cobrar ${empresa.nombre} en PagoFácil`,
    description,
    openGraph: {
      title: `Cómo cobrar ${empresa.nombre} en PagoFácil`,
      description,
      url: `${getSiteUrl()}/empresa/${empresa.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const empresa = await getEmpresaBySlug(slug);

  if (!empresa) {
    notFound();
  }

  const relatedCompanies = await getRelatedEmpresas(empresa.categoria_id, empresa.id, 4);
  const unsupportedPayments = [
    !empresa.acepta_efectivo ? "No acepta pagos con efectivo" : null,
    !empresa.acepta_debito ? "No acepta pagos con debito" : null,
    !empresa.acepta_qr ? "No acepta pagos con QR" : null,
  ].filter((item): item is string => item !== null);

  return (
    <>
      <SiteHeader />
      <VisitTracker empresaId={empresa.id} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-10 lg:px-10">
        <section className="surface-card rounded-[36px] p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-muted">
                {empresa.logo_url ? (
                  <Image
                    src={empresa.logo_url}
                    alt={`Logo de ${empresa.nombre}`}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-[28px] object-contain"
                  />
                ) : (
                  <Building2 className="h-9 w-9 text-foreground/30" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
                  {empresa.categoria?.nombre ?? "Categoría"}
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                  {empresa.nombre}
                </h1>
                {empresa.como_se_paga.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {empresa.como_se_paga.map((metodo) => (
                      <span
                        key={metodo}
                        className="rounded-full border border-brand/15 bg-brand/10 px-3 py-1 text-sm font-medium text-brand"
                      >
                        {metodo}
                      </span>
                    ))}
                  </div>
                ) : null}
                {unsupportedPayments.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {unsupportedPayments.map((message) => (
                      <span
                        key={message}
                        className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800"
                      >
                        {message}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[26px] bg-muted px-6 py-5 text-sm text-foreground/65">
              <p className="font-semibold text-foreground">{empresa.visitas.toLocaleString("es-AR")} visitas</p>
              <p className="mt-1">Guía actualizada para uso en caja y consulta rápida.</p>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[36px] p-8 lg:p-10">
          <SectionHeading
            eyebrow="Explicación"
            title={`Cómo cobrar ${empresa.nombre}`}
            description="Texto guía renderizado en Markdown para documentar el proceso, aclaraciones y excepciones."
          />
          <div className="mt-8">
            <MarkdownContent content={empresa.descripcion} />
          </div>
        </section>

        {empresa.pasos.length > 0 ? (
          <section>
            <StepCarousel pasos={empresa.pasos} />
          </section>
        ) : null}

        {empresa.video_url ? (
          <section className="space-y-5">
            <SectionHeading
              eyebrow="Video"
              title="Refuerzo visual"
              description="Si la operación necesita una referencia adicional, el video queda embebido directamente en la guía."
            />
            <YouTubeEmbed url={empresa.video_url} />
          </section>
        ) : null}

        {relatedCompanies.length > 0 ? (
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Relacionadas"
              title={`Ver más de ${empresa.categoria?.nombre ?? "esta categoría"}`}
              description="Otras empresas del mismo grupo para seguir resolviendo cobros sin volver al inicio."
            />
            <div className="grid gap-5 lg:grid-cols-4">
              {relatedCompanies.map((relatedCompany) => (
                <EmpresaCard key={relatedCompany.id} empresa={relatedCompany} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
