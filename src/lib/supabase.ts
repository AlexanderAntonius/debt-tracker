import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  process.env.NEXT_PUBLIC_SB_URL ||
  process.env.SUPABASE_URL ||
  process.env.STORAGE_URL ||
  process.env.SB_URL ||
  '';

const defaultKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SB_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.STORAGE_ANON_KEY ||
  process.env.SB_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

let activeClient: SupabaseClient | null =
  defaultUrl && defaultKey && defaultUrl.startsWith('https://')
    ? createClient(defaultUrl, defaultKey)
    : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(activeClient);
};

export const initDynamicSupabase = (url: string, key: string): SupabaseClient => {
  activeClient = createClient(url, key);
  return activeClient;
};

export const getSupabase = (): SupabaseClient | null => {
  return activeClient;
};

export const supabase = activeClient;
