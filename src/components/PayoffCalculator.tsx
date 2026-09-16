'use client';

import React, { useState } from 'react';
import { Debt, PayoffStrategy, UserSettings } from '../lib/types';
import { simulatePayoff, getStrategyName } from '../lib/debt-calculator';
import { formatCurrencyIDR, parseIDRInput } from '../lib/formatters';
import { ComparisonTable } from './ComparisonTable';
import { 
  Calculator, 
  TrendingDown, 
  Sparkles, 
  Layers, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface PayoffCalculatorProps {
  debts: Debt[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const PayoffCalculator: React.FC<PayoffCalculatorProps> = ({
  debts,
  settings,
  onUpdateSettings,
}) => {
  const [extraBudgetStr, setExtraBudgetStr] = useState(settings.monthly_extra_budget.toString());
  const [showAmortization, setShowAmortization] = useState(false);

  const activeDebts = debts.filter((d) => !d.is_paid_off && d.current_balance > 0);
  const extraBudget = parseIDRInput(extraBudgetStr);
  const selectedStrategy = settings.preferred_strategy;

  const handleBudgetChange = (value: number) => {
    setExtraBudgetStr(value.toString());
    onUpdateSettings({ monthly_extra_budget: value });
  };

  const handleSelectStrategy = (strategy: PayoffStrategy) => {
    onUpdateSettings({ preferred_strategy: strategy });
  };

  const currentSimulation = simulatePayoff(activeDebts, selectedStrategy, extraBudget);

  // Prepare chart data (sample every 2-3 months if long to avoid chart clutter)
  const chartData = currentSimulation.schedule.filter((_, idx) => {
    if (currentSimulation.schedule.length > 36) {
      return idx % 3 === 0 || idx === currentSimulation.schedule.length - 1;
    }
    return true;
  }).map((month) => ({
    name: month.dateStr,
    saldo: month.totalBalance,
    bunga: month.totalInterestPaid,
  }));

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Extra Budget Controls */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            Simulator & Engine Percepatan Pelunasan
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Kalkulator Strategi Bebas Hutang
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Simulasikan bagaimana alokasi uang ekstra bulanan dan metode perhitungan bunga dapat memangkas tahunan beban cicilan Anda.
          </p>
        </div>

        {/* Extra Budget Input & Slider Box */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Alokasi Uang Ekstra Bulanan (Extra Payment)
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Uang ekstra di luar cicilan minimum yang disalurkan khusus ke hutang prioritas
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={extraBudgetStr}
                onChange={(e) => {
                  setExtraBudgetStr(e.target.value);
                  const parsed = parseIDRInput(e.target.value);
                  onUpdateSettings({ monthly_extra_budget: parsed });
                }}
                className="w-44 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-sm text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-2">
            {[0, 500000, 1000000, 1500000, 2500000, 5000000].map((preset) => (
              <button
                key={preset}
                onClick={() => handleBudgetChange(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  extraBudget === preset
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset === 0 ? 'Hanya Cicilan Min' : `+ ${formatCurrencyIDR(preset)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Selection Toggle */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-3">
            Pilih Strategi Aktif:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleSelectStrategy('snowball')}
              className={`p-4 rounded-2xl border text-left transition ${
                selectedStrategy === 'snowball'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                Debt Snowball
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Saldo terkecil lebih dulu. Cocok untuk membangun motivasi & rasa puas cepat saat hutang mulai hilang satu per satu.
              </p>
            </button>

            <button
              onClick={() => handleSelectStrategy('avalanche')}
              className={`p-4 rounded-2xl border text-left transition ${
                selectedStrategy === 'avalanche'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                Debt Avalanche
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Bunga tertinggi lebih dulu. Cara paling efisien secara matematika untuk memangkas total bunga yang dibayarkan.
              </p>
            </button>

            <button
              onClick={() => handleSelectStrategy('custom')}
              className={`p-4 rounded-2xl border text-left transition ${
                selectedStrategy === 'custom'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                Prioritas Kustom
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Bebas atur urutan manual sesuai preferensi Anda sendiri di tab Daftar Hutang.
              </p>
            </button>
          </div>
        </div>

      </div>

      {/* Side-by-Side Comparison Table Component */}
      <ComparisonTable
        debts={activeDebts}
        monthlyExtraBudget={extraBudget}
        selectedStrategy={selectedStrategy}
        onSelectStrategy={handleSelectStrategy}
      />

      {/* Interactive Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Grafik Proyeksi Penurunan Saldo ({getStrategyName(selectedStrategy)})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualisasi penurunan pokok hutang hingga lunas tuntas pada {currentSimulation.debtFreeDateFormatted}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Durasi: <strong className="text-slate-900 dark:text-white">{currentSimulation.totalMonths} Bulan</strong>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrencyIDR(val), 'Sisa Saldo']}
                  labelFormatter={(lbl) => `Bulan: ${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSaldo)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Monthly Amortization Schedule Accordion */}
      {currentSimulation.schedule.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="w-full flex items-center justify-between font-bold text-slate-900 dark:text-white text-base py-1"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Jadwal Rencana Pembayaran Bulanan ({currentSimulation.schedule.length} Bulan)
            </span>
            {showAmortization ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showAmortization && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Bulan</th>
                    <th className="p-3">Total Bayar</th>
                    <th className="p-3">Pokok Terbayar</th>
                    <th className="p-3">Bunga Terbayar</th>
                    <th className="p-3">Sisa Saldo</th>
                    <th className="p-3 rounded-r-xl">Catatan Milestone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentSimulation.schedule.map((month) => (
                    <tr key={month.monthIndex} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {month.dateStr} (Bln {month.monthIndex})
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {formatCurrencyIDR(month.totalPaid)}
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrencyIDR(month.totalPrincipalPaid)}
                      </td>
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-medium">
                        {formatCurrencyIDR(month.totalInterestPaid)}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {formatCurrencyIDR(month.totalBalance)}
                      </td>
                      <td className="p-3">
                        {month.debtsPaidOffThisMonth.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            🎉 Lunas: {month.debtsPaidOffThisMonth.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
