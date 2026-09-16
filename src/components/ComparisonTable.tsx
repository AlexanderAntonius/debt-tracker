'use client';

import React from 'react';
import { Debt, PayoffStrategy } from '../lib/types';
import { comparePayoffStrategies } from '../lib/debt-calculator';
import { formatCurrencyIDR } from '../lib/formatters';
import { Award, Zap, ShieldCheck, Clock, TrendingDown } from 'lucide-react';

interface ComparisonTableProps {
  debts: Debt[];
  monthlyExtraBudget: number;
  selectedStrategy: PayoffStrategy;
  onSelectStrategy: (strategy: PayoffStrategy) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  debts,
  monthlyExtraBudget,
  selectedStrategy,
  onSelectStrategy,
}) => {
  const comparison = comparePayoffStrategies(debts, monthlyExtraBudget);

  const strategies = [
    {
      id: 'minOnly',
      strategyKey: 'min' as const,
      name: 'Bayar Minimum Saja',
      description: 'Hanya membayar cicilan minimum tanpa alokasi uang ekstra.',
      result: comparison.minOnly,
      isWinnerInterest: false,
      isWinnerTime: false,
      color: 'slate',
    },
    {
      id: 'snowball',
      strategyKey: 'snowball' as PayoffStrategy,
      name: 'Debt Snowball',
      description: 'Fokus melunasi saldo terkecil lebih dulu untuk momentum psikologis.',
      result: comparison.snowball,
      isWinnerInterest: false,
      isWinnerTime: comparison.snowball.totalMonths <= comparison.avalanche.totalMonths,
      color: 'teal',
    },
    {
      id: 'avalanche',
      strategyKey: 'avalanche' as PayoffStrategy,
      name: 'Debt Avalanche',
      description: 'Fokus melunasi suku bunga tertinggi lebih dulu untuk hemat uang maksimal.',
      result: comparison.avalanche,
      isWinnerInterest: true,
      isWinnerTime: comparison.avalanche.totalMonths <= comparison.snowball.totalMonths,
      color: 'emerald',
    },
    {
      id: 'custom',
      strategyKey: 'custom' as PayoffStrategy,
      name: 'Prioritas Kustom',
      description: 'Berdasarkan urutan prioritas yang Anda atur secara manual.',
      result: comparison.custom,
      isWinnerInterest: false,
      isWinnerTime: false,
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Perbandingan Metode Pelunasan (Side-by-Side)
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Lihat perbedaan nyata tanggal lunas dan jutaan rupiah yang bisa Anda hemat dengan menambahkan alokasi ekstra bulanan sebesar{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrencyIDR(monthlyExtraBudget)}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategies.map((strat) => {
          const isSelected = selectedStrategy === strat.strategyKey;

          return (
            <div
              key={strat.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {strat.name}
                  </h4>
                  {strat.isWinnerInterest && monthlyExtraBudget > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 flex-shrink-0">
                      Paling Hemat!
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {strat.description}
                </p>

                {/* Metrics */}
                <div className="space-y-3 py-3 border-y border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Bebas Hutang</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {strat.result.debtFreeDateFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({strat.result.totalMonths} bulan)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Total Bunga Dibayar</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrencyIDR(strat.result.totalInterestPaid)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Bunga Yang Dihemat</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {strat.result.interestSavedComparedToMin > 0
                        ? `Hemat ${formatCurrencyIDR(strat.result.interestSavedComparedToMin)}`
                        : 'Patokan (Dasar)'}
                    </span>
                    {strat.result.monthsSavedComparedToMin > 0 && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        Lebih cepat {strat.result.monthsSavedComparedToMin} bulan!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selection button */}
              {strat.strategyKey !== 'min' ? (
                <button
                  onClick={() => onSelectStrategy(strat.strategyKey)}
                  className={`w-full mt-4 py-2 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {isSelected ? 'Strategi Dipilih' : 'Pilih Strategi Ini'}
                </button>
              ) : (
                <div className="w-full mt-4 py-2 text-center text-xs text-slate-400 italic">
                  Tanpa Percepatan
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
