import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const isValidUrl = (v?: string): v is string =>
  Boolean(v) && v!.startsWith('https://') && v !== 'https://your-project-ref.supabase.co';

const isValidKey = (v?: string): v is string =>
  Boolean(v) && v!.length > 20 && v !== 'your-anon-key-here';

export async function GET() {
  const env = process.env;

  // Kandidat URL dari berbagai format yang mungkin di-inject Vercel (urutan = prioritas).
  // Hanya nilai valid pertama yang dipakai.
  const urlCandidates = [
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_URL,
    env.NEXT_PUBLIC_STORAGE_SUPABASE_URL,
    env.STORAGE_SUPABASE_URL,
    env.NEXT_PUBLIC_STORAGE_URL,
    env.NEXT_PUBLIC_SB_URL,
    env.STORAGE_URL,
    env.SB_URL,
  ];

  // Kandidat key publik saja (anon / publishable). Service role / secret TIDAK PERNAH dikirim ke browser.
  const keyCandidates = [
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    env.SUPABASE_ANON_KEY,
    env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY,
    env.STORAGE_SUPABASE_ANON_KEY,
    env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY,
    env.STORAGE_SUPABASE_PUBLISHABLE_KEY,
    env.NEXT_PUBLIC_STORAGE_ANON_KEY,
    env.NEXT_PUBLIC_SB_ANON_KEY,
    env.STORAGE_ANON_KEY,
    env.SB_ANON_KEY,
  ];

  const supabaseUrl = urlCandidates.find(isValidUrl) || '';
  const supabaseAnonKey = keyCandidates.find(isValidKey) || '';

  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  // Ambil nama-nama env keys yang terkait database untuk memudahkan pencocokan
  const detectedKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes('SUPABASE') ||
      k.includes('STORAGE') ||
      k.includes('POSTGRES') ||
      k.includes('NEXT_PUBLIC') ||
      k.includes('URL') ||
      k.includes('KEY')
  );

  return NextResponse.json({
    isConfigured,
    supabaseUrl: isConfigured ? supabaseUrl : null,
    supabaseAnonKey: isConfigured ? supabaseAnonKey : null,
    detectedKeys,
  });
}
