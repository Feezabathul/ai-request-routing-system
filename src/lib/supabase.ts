import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns the browser Supabase client using public anon key.
 * This client is safe to be used in client‑side code.
 */
export const supabaseBrowser = (() => {
  // Ensure required env vars are present at build time.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  // Create a singleton client instance.
  const client = createClient(url, anonKey);
  return client;
})();

/**
 * Returns a Supabase client with service‑role key for server‑side operations.
 * Use this only in server‑only modules (e.g., API routes, services).
 */
export const supabaseService = (() => {
  // Server‑only env vars – these should never be exposed to the client.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // URL is public but required for both.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  const client = createClient(url, serviceKey);
  return client;
})();

/**
 * Helper type to expose the underlying Supabase client interface.
 */
export type BrowserSupabaseClient = typeof supabaseBrowser;
export type ServiceSupabaseClient = typeof supabaseService;
