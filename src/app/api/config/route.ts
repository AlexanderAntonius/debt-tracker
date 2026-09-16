import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Ambil URL dari berbagai kemungkinan format yang di-inject Vercel
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_SB_URL ||
    process.env.SUPABASE_URL ||
    process.env.STORAGE_URL ||
    process.env.SB_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    '';

  // Ambil Key dari berbagai kemungkinan format
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_STORAGE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SB_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.STORAGE_ANON_KEY ||
    process.env.SB_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.STORAGE_SERVICE_ROLE_KEY ||
    '';

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseUrl.startsWith('https://')
  );

  return NextResponse.json({
    isConfigured,
    supabaseUrl: isConfigured ? supabaseUrl : null,
    supabaseAnonKey: isConfigured ? supabaseAnonKey : null,
  });
}
