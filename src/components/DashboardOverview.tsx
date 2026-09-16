'use client';

import React from 'react';
import { Debt, PayoffSimulationResult } from '../lib/types';
import { formatCurrencyIDR } from '../lib/formatters';
import { 
  CreditCard, 
  Calendar, 
  Flame, 
  Award, 
  ArrowRight,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  debts: Debt[];
  totalBalance: number;
  totalMinPayment: number;
  totalMonthlyInterest: number;
  simulation: PayoffSimulationResult;
  onNavigateToTab: (tab: 'overview' | 'bills' | 'debts' | 'calculator') => void;
  onOpenAddDebt: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  debts,
  totalBalance,
  totalMinPayment,
  totalMonthlyInterest,
  simulation,
  onNavigateToTab,
  onOpenAddDebt,
}) => {
  const activeDebts = debts.filter((d) => !d.is_paid_off && d.current_balance > 0);
  const paidDebtsCount = debts.filter((d) => d.is_paid_off || d.current_balance === 0).length;

  // Calculate total original debt to show progress %
  const totalOriginal = debts.reduce((sum, d) => sum + (d.original_balance || d.current_balance), 0);
  const paidOffAmount = Math.max(0, totalOriginal - totalBalance);
  const progressPercent = totalOriginal > 0 ? Math.min(100, Math.round((paidOffAmount / totalOriginal) * 100)) : 0;

  return (
    <div className="space-y-6">
      
      {/* Welcome & Quick Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              Misi Bebas Finansial
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ringkasan Finansial & Hutang
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Pantau seluruh kewajiban bulanan, tekan akumulasi bunga pinjaman, dan percepat tanggal kebebasan finansial Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigateToTab('calculator')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
            >
              Simulasi Pelunasan
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab('bills')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10 transition"
            >
              Cek Tagihan Bulan Ini
            </button>
          </div>
        </div>

        {/* Progress Bar in Banner */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <span className="text-slate-300 font-medium">
              Progres Bebas Hutang: <strong className="text-emerald-400">{progressPercent}%</strong>
            </span>
            <span className="text-slate-400">
              Sudah lunas: <strong className="text-white">{formatCurrencyIDR(paidOffAmount)}</strong> dari {formatCurrencyIDR(totalOriginal)}
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Saldo Hutang */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Sisa Pokok
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrencyIDR(totalBalance)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dari {activeDebts.length} akun aktif ({paidDebtsCount} akun lunas)
            </p>
          </div>
        </div>

        {/* Card 2: Tagihan Wajib Bulan Ini */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tagihan Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrencyIDR(totalMinPayment)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Total cicilan minimum wajib
            </p>
          </div>
        </div>

        {/* Card 3: Perkiraan Bunga Bulan Ini */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Perkiraan Bunga/Bulan
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrencyIDR(totalMonthlyInterest)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Biaya bunga yang ditanggung bulan ini
            </p>
          </div>
        </div>

        {/* Card 4: Target Bebas Hutang */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Target Bebas Hutang
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {simulation.debtFreeDateFormatted || '-'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {simulation.totalMonths > 0 ? `Sekitar ${simulation.totalMonths} bulan lagi` : 'Bebas hutang!'}
            </p>
          </div>
        </div>

      </div>

      {/* Empty State Prompt if no debts */}
      {debts.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Belum ada hutang tercatat
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Mulai masukkan pinjaman, kartu kredit, KPR, atau paylater Anda, atau muat data contoh untuk melihat demo fitur.
          </p>
          <button
            onClick={onOpenAddDebt}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
          >
            + Tambah Hutang Sekarang
          </button>
        </div>
      )}

    </div>
  );
};
