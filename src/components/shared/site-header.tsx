import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-foreground transition hover:text-brand">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#66c4ff_0%,_#a8ddff_60%,_#ffd54a_100%)] text-foreground shadow-lg shadow-brand/20">
            <CircleHelp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight">¿Cómo lo cobro?</p>
            <p className="text-sm text-foreground/55">Guías para operadores PagoFácil</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/buscar"
            className="hidden rounded-full border border-black/10 px-4 py-2 text-foreground/75 transition hover:border-brand/25 hover:text-brand md:inline-flex"
          >
            Buscar guías
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-white transition hover:bg-brand-dark"
          >
            Panel admin
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
