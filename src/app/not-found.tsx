import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
        No encontramos esa guía.
      </h1>
      <p className="mt-4 text-lg leading-8 text-foreground/65">
        Puede que la empresa todavía no exista, esté inactiva o el enlace sea incorrecto.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
