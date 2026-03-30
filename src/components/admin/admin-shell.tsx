import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, FolderTree, LayoutDashboard, LogOut } from "lucide-react";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#d7efff_0%,_#e2f5ff_44%,_#eef9ff_100%)]">
      <header className="border-b border-admin/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-admin">Admin</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">¿Cómo lo cobro?</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-admin/15 px-4 py-2 text-foreground/75 transition hover:border-admin/35 hover:text-admin"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/empresas"
              className="inline-flex items-center gap-2 rounded-full border border-admin/15 px-4 py-2 text-foreground/75 transition hover:border-admin/35 hover:text-admin"
            >
              <Building2 className="h-4 w-4" />
              Empresas
            </Link>
            <Link
              href="/admin/categorias"
              className="inline-flex items-center gap-2 rounded-full border border-admin/15 px-4 py-2 text-foreground/75 transition hover:border-admin/35 hover:text-admin"
            >
              <FolderTree className="h-4 w-4" />
              Categorías
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-admin px-4 py-2 text-white transition hover:bg-brand-dark"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">{children}</main>
    </div>
  );
}
