import { notFound } from "next/navigation";
import { CompanyForm } from "@/components/admin/company-form";
import { getCategorias, getEmpresaById, getMetodosCobroSugeridos } from "@/lib/data";

export const dynamic = "force-dynamic";

type EditCompanyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const { id } = await params;
  const [categories, paymentMethodSuggestions, company] = await Promise.all([
    getCategorias(),
    getMetodosCobroSugeridos(),
    getEmpresaById(id),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="admin-surface rounded-[36px] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-admin">Editar empresa</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">{company.nombre}</h2>
      </section>

      <CompanyForm
        categories={categories}
        paymentMethodSuggestions={paymentMethodSuggestions}
        initialCompany={company}
      />
    </div>
  );
}
