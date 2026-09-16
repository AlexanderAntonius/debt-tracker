'use client';

import React, { useState, useEffect } from 'react';
import { Debt } from '../lib/types';
import { formatCurrencyIDR, parseIDRInput } from '../lib/formatters';
import { calculateMonthlyInterest } from '../lib/debt-calculator';
import { X, Check, DollarSign, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onRecordPayment: (debtId: string, amount: number, paymentDate: string, notes?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
  onRecordPayment,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (debt) {
      setAmountStr(debt.min_payment.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('Cicilan bulanan rutin');
    }
  }, [debt, isOpen]);

  if (!isOpen || !debt) return null;

  const estInterest = calculateMonthlyInterest(debt);
  const amount = parseIDRInput(amountStr);
  const estPrincipal = Math.max(0, amount - estInterest);
  const newBalance = Math.max(0, debt.current_balance - amount);
  const willPayOff = amount >= debt.current_balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('Masukkan nominal pembayaran yang valid.');
      return;
    }

    if (willPayOff) {
      // Trigger confetti celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
    }

    onRecordPayment(debt.id, amount, paymentDate, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-base font-bold">Catat Pembayaran Cicilan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Debt Card */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {debt.name}
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span>Sisa Saldo Saat Ini:</span>
              <strong className="text-slate-800 dark:text-slate-200">{formatCurrencyIDR(debt.current_balance)}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Tagihan Minimum:</span>
              <strong className="text-amber-600 dark:text-amber-400">{formatCurrencyIDR(debt.min_payment)}</strong>
            </div>
          </div>

          {/* Nominal Pembayaran */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nominal yang Dibayar (Rp) *
              </label>
              {willPayOff && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  Lunas Sepenuhnya!
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            
            {/* Quick buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmountStr(debt.min_payment.toString())}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition"
              >
                Sesuai Min ({formatCurrencyIDR(debt.min_payment)})
              </button>
              <button
                type="button"
                onClick={() => setAmountStr(debt.current_balance.toString())}
                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition"
              >
                Lunasi Semua ({formatCurrencyIDR(debt.current_balance)})
              </button>
            </div>
          </div>

          {/* Breakdown Preview */}
          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Porsi Pengurangan Pokok:</span>
              <strong className="text-emerald-700 dark:text-emerald-300">{formatCurrencyIDR(estPrincipal)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Estimasi Porsi Bunga:</span>
              <strong className="text-rose-600 dark:text-rose-400">~{formatCurrencyIDR(estInterest)}</strong>
            </div>
            <div className="border-t border-emerald-200/60 dark:border-emerald-800/60 pt-1.5 flex justify-between font-bold">
              <span className="text-slate-700 dark:text-slate-300">Estimasi Sisa Saldo:</span>
              <span className="text-slate-900 dark:text-white">{formatCurrencyIDR(newBalance)}</span>
            </div>
          </div>

          {/* Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan (Metode / Bank)
              </label>
              <input
                type="text"
                placeholder="cth. Mandiri Livin"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Konfirmasi Bayar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
