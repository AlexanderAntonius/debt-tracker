'use client';

import React, { useState } from 'react';
import { Debt, DebtPayment } from '../lib/types';
import { 
  formatCurrencyIDR, 
  getCategoryLabel, 
  getCategoryBadgeStyle, 
  getInterestTypeLabel 
} from '../lib/formatters';
import { calculateMonthlyInterest } from '../lib/debt-calculator';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Check, 
  PlusCircle, 
  History,
  CreditCard,
  DollarSign,
  Calendar
} from 'lucide-react';

interface MonthlyBillTrackerProps {
  debts: Debt[];
  payments: DebtPayment[];
  onOpenPayModal: (debt: Debt) => void;
  onOpenHistoryModal: (debt: Debt) => void;
}

export const MonthlyBillTracker: React.FC<MonthlyBillTrackerProps> = ({
  debts,
  payments,
  onOpenPayModal,
  onOpenHistoryModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const today = new Date();
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  // Filter active debts
  const activeDebts = debts.filter((d) => !d.is_paid_off && d.current_balance > 0);

  // Map debts with payment status for THIS current month
  const bills = activeDebts.map((debt) => {
    const estInterest = calculateMonthlyInterest(debt);

    // Cari apakah ada pembayaran untuk debt ini di bulan dan tahun berjalan
    const paymentsThisMonth = payments.filter((p) => {
      if (p.debt_id !== debt.id) return false;
      const pDate = new Date(p.payment_date);
      return pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth;
    });

    const totalPaidThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
    const isPaidThisMonth = totalPaidThisMonth >= debt.min_payment;

    // Calculate due status
    let status: 'paid' | 'overdue' | 'due_soon' | 'pending' = 'pending';
    const daysRemaining = debt.due_date - currentDay;

    if (isPaidThisMonth) {
      status = 'paid';
    } else if (daysRemaining < 0) {
      status = 'overdue';
    } else if (daysRemaining <= 5) {
      status = 'due_soon';
    }

    return {
      debt,
      estInterest,
      totalPaidThisMonth,
      isPaidThisMonth,
      status,
      daysRemaining,
    };
  });

  // Totals for top statistics
  const totalBilled = bills.reduce((sum, b) => sum + b.debt.min_payment, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.totalPaidThisMonth, 0);
  const totalRemainingToPay = Math.max(0, totalBilled - totalPaid);
  const totalMonthlyInterest = bills.reduce((sum, b) => sum + b.estInterest, 0);

  // Filtered list
  const filteredBills = bills.filter((b) => {
    if (filter === 'unpaid') return !b.isPaidThisMonth;
    if (filter === 'paid') return b.isPaidThisMonth;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Monthly KPIs */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Tagihan Jatuh Tempo Bulan Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Periode: {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Semua ({bills.length})
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'unpaid'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Belum Lunas ({bills.filter((b) => !b.isPaidThisMonth).length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'paid'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Sudah Lunas ({bills.filter((b) => b.isPaidThisMonth).length})
            </button>
          </div>
        </div>

        {/* Monthly Progress Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Tagihan Wajib</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrencyIDR(totalBilled)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Sudah Dibayar</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrencyIDR(totalPaid)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Sisa Tagihan Bulan Ini</span>
            <span className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrencyIDR(totalRemainingToPay)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Estimasi Bunga</span>
            <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrencyIDR(totalMonthlyInterest)}
            </span>
          </div>
        </div>
      </div>

      {/* Bill Items List */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {filter === 'unpaid'
              ? 'Hebat! Semua tagihan bulan ini sudah lunas dicatat!'
              : 'Tidak ada tagihan yang sesuai dengan filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBills.map(({ debt, estInterest, totalPaidThisMonth, isPaidThisMonth, status, daysRemaining }) => (
            <div
              key={debt.id}
              className={`rounded-2xl p-5 border transition-all ${
                isPaidThisMonth
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : status === 'overdue'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm'
              }`}
            >
              {/* Top row: Title + Category + Status Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {debt.name}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(debt.category)}`}>
                      {getCategoryLabel(debt.category)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {getInterestTypeLabel(debt.interest_type)} • Suku Bunga {debt.interest_rate}% APR
                  </span>
                </div>

                {/* Status Indicator */}
                {status === 'paid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    Lunas
                  </span>
                )}
                {status === 'overdue' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-1 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Terlambat {Math.abs(daysRemaining)} hari
                  </span>
                )}
                {status === 'due_soon' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {daysRemaining === 0 ? 'Hari ini!' : `${daysRemaining} hari lagi`}
                  </span>
                )}
                {status === 'pending' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full flex-shrink-0">
                    Tgl {debt.due_date} ({daysRemaining} hari lagi)
                  </span>
                )}
              </div>

              {/* Middle row: Financial Details Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 px-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl my-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Tagihan Wajib</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatCurrencyIDR(debt.min_payment)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Perkiraan Bunga</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
                    ~{formatCurrencyIDR(estInterest)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Sisa Saldo Pokok</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrencyIDR(debt.current_balance)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Dibayar Bulan Ini</span>
                  <span className={`font-semibold ${totalPaidThisMonth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    {formatCurrencyIDR(totalPaidThisMonth)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => onOpenHistoryModal(debt)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <History className="w-3.5 h-3.5" />
                  Riwayat
                </button>

                <button
                  onClick={() => onOpenPayModal(debt)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition ${
                    isPaidThisMonth
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {isPaidThisMonth ? 'Catat Bayar Lagi' : 'Catat Pembayaran'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
