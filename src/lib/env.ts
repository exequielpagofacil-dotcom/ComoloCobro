export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function hasSupabasePublicEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(url && anonKey && !url.includes("example.supabase.co") && anonKey !== "public-anon-key");
}

export function hasSupabaseAdminEnv(): boolean {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return hasSupabasePublicEnv() && Boolean(serviceRoleKey && serviceRoleKey !== "service-role-key");
}
