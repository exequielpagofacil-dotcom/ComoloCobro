import Link from "next/link";
import { Plus } from "lucide-react";
import { CompaniesTable } from "@/components/admin/companies-table";
import { getAdminEmpresas } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const companies = await getAdminEmpresas();

  return (
    <div className="space-y-6">
      <section className="admin-surface flex flex-col gap-5 rounded-[36px] p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-admin">Empresas</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
            Listado general y edición rápida
          </h2>
        </div>

        <Link
          href="/admin/empresas/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-admin px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Crear empresa
        </Link>
      </section>

      <CompaniesTable companies={companies} />
    </div>
  );
}
