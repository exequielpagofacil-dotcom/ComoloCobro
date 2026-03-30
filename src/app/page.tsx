import { HomeSearch } from "@/components/public/home-search";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getMostVisitedEmpresas } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredCompanies = await getMostVisitedEmpresas(8);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 lg:px-10 lg:py-12">
        <HomeSearch featured={featuredCompanies} />
      </main>
      <SiteFooter />
    </>
  );
}
