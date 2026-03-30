import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";

function createSupabaseClient(key: string): SupabaseClient {
  return createClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createSupabasePublicServerClient(): SupabaseClient {
  return createSupabaseClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function createSupabaseAdminClient(): SupabaseClient {
  return createSupabaseClient(getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
