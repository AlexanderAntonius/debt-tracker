'use client';

import React from 'react';
import { Debt } from '../lib/types';
import { 
  formatCurrencyIDR, 
  getCategoryLabel, 
  getCategoryBadgeStyle, 
  getInterestTypeLabel 
} from '../lib/formatters';
import { calculateMonthlyInterest } from '../lib/debt-calculator';
import { 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle,
  FileText
} from 'lucide-react';

interface DebtListProps {
  debts: Debt[];
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  onTogglePaidOff: (debtId: string) => void;
  onMovePriority: (debtId: string, direction: 'up' | 'down') => void;
  onOpenAddDebt: () => void;
}

export const DebtList: React.FC<DebtListProps> = ({
  debts,
  onEditDebt,
  onDeleteDebt,
  onTogglePaidOff,
  onMovePriority,
  onOpenAddDebt,
}) => {
  const activeDebts = debts.filter((d) => !d.is_paid_off && d.current_balance > 0);
  const paidOffDebts = debts.filter((d) => d.is_paid_off || d.current_balance === 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kelola Daftar Hutang & Pinjaman
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Total {debts.length} akun terdaftar ({activeDebts.length} aktif, {paidOffDebts.length} lunas)
          </p>
        </div>

        <button
          onClick={onOpenAddDebt}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Hutang Baru
        </button>
      </div>

      {/* Active Debts Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Hutang Aktif ({activeDebts.length})
        </h3>

        {activeDebts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800 text-slate-500">
            Tidak ada hutang aktif. Semua telah lunas atau belum ada data.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeDebts.map((debt, index) => {
              const estInterest = calculateMonthlyInterest(debt);

              return (
                <div
                  key={debt.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left info */}
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {debt.name}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(debt.category)}`}>
                        {getCategoryLabel(debt.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>{getInterestTypeLabel(debt.interest_type)}</span>
                      <span>•</span>
                      <span>Suku Bunga: <strong className="text-slate-700 dark:text-slate-300">{debt.interest_rate}% APR</strong></span>
                      <span>•</span>
                      <span>Jatuh Tempo: <strong className="text-slate-700 dark:text-slate-300">Tgl {debt.due_date}</strong></span>
                    </div>

                    {debt.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1 rounded-lg">
                        &ldquo;{debt.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Middle financial metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center md:text-right border-t md:border-t-0 border-slate-100 dark:border-slate-700/60 pt-3 md:pt-0">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Sisa Pokok</span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {formatCurrencyIDR(debt.current_balance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Cicilan Min</span>
                      <span className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrencyIDR(debt.min_payment)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Bunga/Bln</span>
                      <span className="text-sm sm:text-base font-semibold text-rose-600 dark:text-rose-400">
                        ~{formatCurrencyIDR(estInterest)}
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center justify-end gap-1.5 border-t md:border-t-0 border-slate-100 dark:border-slate-700/60 pt-3 md:pt-0">
                    {/* Custom Priority Reordering */}
                    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700/60 rounded-lg p-0.5 mr-1">
                      <button
                        onClick={() => onMovePriority(debt.id, 'up')}
                        disabled={index === 0}
                        title="Naikkan Prioritas"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMovePriority(debt.id, 'down')}
                        disabled={index === activeDebts.length - 1}
                        title="Turunkan Prioritas"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onTogglePaidOff(debt.id)}
                      title="Tandai Sudah Lunas Sepenuhnya"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditDebt(debt)}
                      title="Edit Hutang"
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDebt(debt.id)}
                      title="Hapus Hutang"
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid Off Debts Section */}
      {paidOffDebts.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Hutang Yang Sudah Lunas ({paidOffDebts.length})
          </h3>

          <div className="grid grid-cols-1 gap-2.5 opacity-80">
            {paidOffDebts.map((debt) => (
              <div
                key={debt.id}
                className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 line-through text-sm">
                    {debt.name}
                  </h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Lunas • Awal: {formatCurrencyIDR(debt.original_balance || debt.current_balance)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onTogglePaidOff(debt.id)}
                    title="Kembalikan ke status aktif"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Aktifkan Lagi
                  </button>
                  <button
                    onClick={() => onDeleteDebt(debt.id)}
                    title="Hapus Permanen"
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
