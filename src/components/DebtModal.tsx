'use client';

import React, { useState, useEffect } from 'react';
import { Debt, DebtCategory, InterestType } from '../lib/types';
import { formatCurrencyIDR, parseIDRInput } from '../lib/formatters';
import { X, Info, HelpCircle } from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Omit<Debt, 'id' | 'is_paid_off'> & { id?: string }) => void;
  initialDebt?: Debt | null;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDebt,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DebtCategory>('credit_card');
  const [currentBalanceStr, setCurrentBalanceStr] = useState('');
  const [originalBalanceStr, setOriginalBalanceStr] = useState('');
  const [interestRateStr, setInterestRateStr] = useState('');
  const [interestType, setInterestType] = useState<InterestType>('effective');
  const [minPaymentStr, setMinPaymentStr] = useState('');
  const [dueDate, setDueDate] = useState<number>(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialDebt) {
      setName(initialDebt.name);
      setCategory(initialDebt.category);
      setCurrentBalanceStr(initialDebt.current_balance.toString());
      setOriginalBalanceStr((initialDebt.original_balance || initialDebt.current_balance).toString());
      setInterestRateStr(initialDebt.interest_rate.toString());
      setInterestType(initialDebt.interest_type);
      setMinPaymentStr(initialDebt.min_payment.toString());
      setDueDate(initialDebt.due_date || 1);
      setNotes(initialDebt.notes || '');
    } else {
      // Default new
      setName('');
      setCategory('credit_card');
      setCurrentBalanceStr('');
      setOriginalBalanceStr('');
      setInterestRateStr('15');
      setInterestType('effective');
      setMinPaymentStr('');
      setDueDate(10);
      setNotes('');
    }
  }, [initialDebt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentBalance = parseIDRInput(currentBalanceStr);
    let originalBalance = parseIDRInput(originalBalanceStr);
    if (!originalBalance || originalBalance < currentBalance) {
      originalBalance = currentBalance;
    }

    const interestRate = parseFloat(interestRateStr) || 0;
    const minPayment = parseIDRInput(minPaymentStr) || Math.max(50000, Math.round(currentBalance * 0.05));

    if (!name.trim()) {
      alert('Silakan masukkan nama hutang/pinjaman.');
      return;
    }

    if (currentBalance <= 0) {
      alert('Sisa saldo pokok harus lebih dari 0.');
      return;
    }

    onSave({
      id: initialDebt?.id,
      name: name.trim(),
      category,
      current_balance: currentBalance,
      original_balance: originalBalance,
      interest_rate: interestRate,
      interest_type: interestType,
      min_payment: minPayment,
      due_date: Number(dueDate) || 1,
      custom_priority: initialDebt?.custom_priority || 0,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialDebt ? 'Edit Data Hutang' : 'Tambah Hutang Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nama Hutang */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Hutang / Pinjaman *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kartu Kredit BCA, KPR Mandiri, Spaylater"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Kategori & Tanggal Jatuh Tempo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DebtCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="credit_card">Kartu Kredit</option>
                <option value="mortgage">KPR / Properti</option>
                <option value="kta">KTA / Bank</option>
                <option value="pinjol">Pinjol / Fintech</option>
                <option value="paylater">Paylater</option>
                <option value="vehicle">KKB / Kendaraan</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tgl Jatuh Tempo (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDate}
                onChange={(e) => setDueDate(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Saldo Saat Ini & Saldo Awal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sisa Saldo Pokok (Rp) *
              </label>
              <input
                type="text"
                required
                placeholder="10.000.000"
                value={currentBalanceStr}
                onChange={(e) => setCurrentBalanceStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {formatCurrencyIDR(parseIDRInput(currentBalanceStr))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plafon / Pokok Awal (Rp)
              </label>
              <input
                type="text"
                placeholder="Opsional jika flat"
                value={originalBalanceStr}
                onChange={(e) => setOriginalBalanceStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {formatCurrencyIDR(parseIDRInput(originalBalanceStr))}
              </span>
            </div>
          </div>

          {/* Model Bunga */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Model Perhitungan Bunga *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInterestType('effective')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                  interestType === 'effective'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Efektif / Anuitas
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">KPR, Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setInterestType('flat')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                  interestType === 'flat'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Bunga Flat
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">Pinjol, KTA</span>
              </button>
              <button
                type="button"
                onClick={() => setInterestType('credit_card')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                  interestType === 'credit_card'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Kartu Kredit
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">Revolving</span>
              </button>
            </div>
            
            {/* Explanatory text */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {interestType === 'flat' && 'Bunga dihitung tetap berdasarkan plafon pokok awal (bukan saldo sisa).'}
              {interestType === 'effective' && 'Bunga dihitung dari sisa saldo pokok berjalan yang berkurang setiap bulan.'}
              {interestType === 'credit_card' && 'Bunga dihitung bulanan atas sisa tagihan berjalan kartu kredit.'}
            </p>
          </div>

          {/* Suku Bunga APR & Cicilan Minimum */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Suku Bunga (% / Tahun)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="15.0"
                value={interestRateStr}
                onChange={(e) => setInterestRateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {(parseFloat(interestRateStr) / 12 || 0).toFixed(2)}% per bulan
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cicilan Minimum / Bln *
              </label>
              <input
                type="text"
                required
                placeholder="500.000"
                value={minPaymentStr}
                onChange={(e) => setMinPaymentStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {formatCurrencyIDR(parseIDRInput(minPaymentStr))}
              </span>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: No kontrak, catatan bank, tujuan pinjaman"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
            >
              Simpan Hutang
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
