import { CategoriesManager } from "@/components/admin/categories-manager";
import { getCategorias } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategorias();

  return (
    <div className="space-y-6">
      <section className="admin-surface rounded-[36px] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-admin">Categorías</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Organización visual y de navegación
        </h2>
      </section>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
