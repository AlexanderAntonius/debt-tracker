'use client';

import React from 'react';
import { Debt, DebtPayment } from '../lib/types';
import { formatCurrencyIDR, formatDateIndo } from '../lib/formatters';
import { X, History, Trash2, Calendar, DollarSign } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  payments: DebtPayment[];
  onDeletePayment: (paymentId: string) => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  debt,
  payments,
  onDeletePayment,
}) => {
  if (!isOpen || !debt) return null;

  const debtPayments = payments.filter((p) => p.debt_id === debt.id);
  const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Riwayat Pembayaran
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {debt.name}
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

        {/* Total Summary */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700/60 flex justify-between items-center text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Total Dicatat: <strong>{debtPayments.length} transaksi</strong>
          </span>
          <span className="text-slate-900 dark:text-white font-bold">
            Total Terbayar: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrencyIDR(totalPaid)}</span>
          </span>
        </div>

        {/* Payment Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {debtPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada riwayat pembayaran untuk hutang ini.
            </div>
          ) : (
            debtPayments.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrencyIDR(p.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateIndo(p.payment_date)}
                    </span>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      &ldquo;{p.notes}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onDeletePayment(p.id)}
                  title="Hapus Catatan Pembayaran Ini"
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
