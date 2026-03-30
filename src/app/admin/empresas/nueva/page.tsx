import { CompanyForm } from "@/components/admin/company-form";
import { getCategorias, getMetodosCobroSugeridos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const [categories, paymentMethodSuggestions] = await Promise.all([
    getCategorias(),
    getMetodosCobroSugeridos(),
  ]);

  return (
    <div className="space-y-6">
      <section className="admin-surface rounded-[36px] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-admin">Nueva empresa</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Crear una guía nueva
        </h2>
      </section>

      <CompanyForm categories={categories} paymentMethodSuggestions={paymentMethodSuggestions} />
    </div>
  );
}
