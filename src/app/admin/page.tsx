import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, Eye } from "lucide-react";
import { getAdminDashboardSummary } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();

  return (
    <div className="space-y-6">
      <section className="admin-surface rounded-[36px] p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-admin">Dashboard</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
              Estado general del contenido
            </h2>
          </div>

          <Link
            href="/admin/empresas/nueva"
            className="inline-flex items-center gap-2 rounded-full bg-admin px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
          >
            Crear empresa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="admin-surface rounded-[30px] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft text-admin">
            <BarChart3 className="h-5 w-5" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-admin">Total empresas</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-foreground">
            {summary.totalEmpresas.toLocaleString("es-AR")}
          </p>
        </article>

        <article className="admin-surface rounded-[30px] p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft text-admin">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">Últimas 5 editadas</h3>
              <p className="text-sm text-foreground/65">Ordenadas por actualización más reciente.</p>
            </div>
          </div>

          <div className="space-y-3">
            {summary.ultimasEditadas.map((empresa) => (
              <div
                key={empresa.id}
                className="flex items-center justify-between rounded-[22px] border border-admin/10 bg-white px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{empresa.nombre}</p>
                  <p className="text-sm text-foreground/55">{formatDateTime(empresa.updated_at)}</p>
                </div>
                <Link href={`/admin/empresas/${empresa.id}`} className="text-sm font-semibold text-admin">
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-surface rounded-[36px] p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft text-admin">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Top 5 más visitadas</h3>
            <p className="text-sm text-foreground/65">Sirve para priorizar mantenimiento de contenido.</p>
          </div>
        </div>

        <div className="space-y-3">
          {summary.topVisitadas.map((empresa) => (
            <div
              key={empresa.id}
              className="flex items-center justify-between rounded-[22px] border border-admin/10 bg-white px-5 py-4"
            >
              <div>
                <p className="font-semibold text-foreground">{empresa.nombre}</p>
                <p className="text-sm text-foreground/55">
                  {empresa.categoria?.nombre ?? "Sin categoría"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {empresa.visitas.toLocaleString("es-AR")} visitas
                </p>
                <Link href={`/admin/empresas/${empresa.id}`} className="text-sm font-semibold text-admin">
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
