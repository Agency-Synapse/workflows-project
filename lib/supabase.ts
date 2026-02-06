import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  // Lecture des variables depuis le .env.local
  // Note: Next.js injecte ces variables au build time dans le code client
  const url = "https://genbzwagezbczhnfcguo.supabase.co";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmJ6d2FnZXpiY3pobmZjZ3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTc0NzQsImV4cCI6MjA4NTg5MzQ3NH0.b0Ligrar60DpYlHQibNXdNWgUpgJbE-EL837NTyYR_A";

  console.log("✅ Création du client Supabase...");

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });

  return cachedClient;
}
