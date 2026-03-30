"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

type LoginResponse = {
  error?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const payload = (await response.json()) as LoginResponse;

    if (!response.ok) {
      setError(payload.error ?? "No se pudo iniciar sesión");
      return;
    }

    startTransition(() => {
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-surface mx-auto w-full max-w-md rounded-[32px] p-8">
      <div className="mb-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-soft text-admin">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ingresar al panel</h1>
        <p className="mt-3 text-base leading-7 text-foreground/65">
          Usá la contraseña de administrador configurada en las variables de entorno.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-14 w-full rounded-2xl border border-admin/15 bg-white px-4 text-base"
            placeholder="Ingresá la contraseña"
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-admin text-base font-semibold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? "Ingresando..." : "Entrar al panel"}
        </button>
      </div>
    </form>
  );
}
