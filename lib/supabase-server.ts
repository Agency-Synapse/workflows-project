import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase pour les API routes côté serveur
 * Utilise la service_role_key pour bypasser RLS
 */
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante");
  }

  if (!supabaseServiceKey) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY manquante, utilisation de l'anon key");
    // Fallback sur l'anon key si service key pas disponible
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY manquante");
    }
    return createClient(supabaseUrl, anonKey);
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
