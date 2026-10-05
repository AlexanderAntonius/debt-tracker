'use client';

import React, { useState } from 'react';
import { Cloud, CloudOff, Info, ExternalLink, X, Database, ShieldCheck } from 'lucide-react';

interface CloudStatusBannerProps {
  isCloudConnected: boolean;
  isCloudReady?: boolean;
  userEmail?: string | null;
  onOpenSetupModal: () => void;
  onLogin?: () => void;
}

export const CloudStatusBanner: React.FC<CloudStatusBannerProps> = ({
  isCloudConnected,
  isCloudReady,
  userEmail,
  onOpenSetupModal,
  onLogin,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (isCloudConnected) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2 text-xs md:text-sm flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Cloud Terhubung (Supabase PostgreSQL):</strong> Data tersimpan aman di cloud dan tersinkronisasi multi-perangkat.
            {userEmail && <span className="ml-1 opacity-90">Masuk sebagai: <strong>{userEmail}</strong></span>}
          </span>
        </div>
      </div>
    );
  }

  if (isCloudReady) {
    return (
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-sky-500/10 border-b border-sky-300 dark:border-sky-700/60 text-sky-900 dark:text-sky-200 px-4 py-2.5 text-xs md:text-sm transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>
              <strong>Supabase siap, tapi Anda belum login:</strong> data saat ini hanya tersimpan di browser ini. Login atau daftar agar data tersimpan di cloud.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onLogin && (
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium text-xs shadow-sm transition"
              >
                Login / Daftar
              </button>
            )}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-sky-700 dark:text-sky-400 hover:text-sky-900 p-1"
              title="Sembunyikan pesan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs md:text-sm transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
          <span>
            <strong>Mode Demo & Lokal Aktif:</strong> Anda sedang menggunakan data simulasi lokal. Data akan tetap tersimpan di browser ini.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSetupModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-sm transition"
          >
            <Database className="w-3.5 h-3.5" />
            Hubungkan ke Supabase (Vercel)
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 p-1"
            title="Sembunyikan pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
