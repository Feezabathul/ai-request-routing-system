import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase configuration for browser and server use.
 *
 * Configure these values in your local environment file (.env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * You can find these values in your Supabase dashboard under:
 * Project Settings > API
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const isBrowserClientConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const isServiceClientConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (process.env.NODE_ENV === 'development') {
  if (!isBrowserClientConfigured) {
    console.warn(
      'Supabase browser client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    );
  }
  if (!isServiceClientConfigured) {
    console.warn(
      'Supabase service client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.',
    );
  }
}

const browserClient: SupabaseClient | null = isBrowserClientConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const serviceClient: SupabaseClient | null = isServiceClientConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export const supabase = browserClient;
export const supabaseBrowser = browserClient;
export const supabaseService = serviceClient;

export type BrowserSupabaseClient = SupabaseClient | null;
export type ServiceSupabaseClient = SupabaseClient | null;
