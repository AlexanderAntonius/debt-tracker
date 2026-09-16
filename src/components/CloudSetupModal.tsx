'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, ShieldCheck, Rocket } from 'lucide-react';

interface CloudSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSetupModal: React.FC<CloudSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Panduan Hubungkan Cloud (Supabase + Vercel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sinkronisasi data cloud real-time antar laptop & HP secara permanen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm text-slate-600 dark:text-slate-300">
          
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Buat Database Gratis di Supabase
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Buka situs resmi Supabase dan buat project baru (gratis).
              </p>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Kunjungi Supabase.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Jalankan Skrip Database (SQL Schema)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Di dashboard Supabase, buka menu <strong>SQL Editor</strong> &gt; buat <strong>New Query</strong>, lalu paste isi file skema yang telah kami siapkan di repositori:
              </p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs font-mono flex items-center justify-between">
                <span>supabase/schema.sql</span>
                <span className="text-[11px] text-emerald-400">Tersedia di root folder</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Salin Kunci API Supabase
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Di dashboard Supabase, masuk ke <strong>Project Settings &gt; API</strong>, lalu dapatkan:
              </p>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code> (Project URL)</li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (Project API Anon key)</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              4
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-emerald-600" />
                Deploy ke Vercel
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Push kode ini ke repositori GitHub Anda, lalu buka <strong>vercel.com</strong> &gt; <strong>Import Project</strong>. Masukkan kedua variabel di atas pada bagian <strong>Environment Variables</strong> sebelum klik Deploy!
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                💡 <strong>Catatan:</strong> Jika Anda sedang menjalankan aplikasi ini secara lokal di komputer, cukup buat file <code>.env.local</code> di folder root dengan kedua variabel tersebut.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-slate-800/95 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
