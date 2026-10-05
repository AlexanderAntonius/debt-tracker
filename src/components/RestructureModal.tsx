'use client';

import React, { useState, useEffect } from 'react';
import { Debt, DebtCategory, InterestType } from '../lib/types';
import { formatCurrencyIDR, parseIDRInput } from '../lib/formatters';
import { X, RefreshCw, CheckCircle2, Building2 } from 'lucide-react';

interface RestructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  onExecuteRestructure: (
    selectedDebtIds: string[],
    newDebtData: Omit<Debt, 'id' | 'is_paid_off'>
  ) => void;
}

export const RestructureModal: React.FC<RestructureModalProps> = ({
  isOpen,
  onClose,
  debts,
  onExecuteRestructure,
}) => {
  const activeDebts = debts.filter((d) => !d.is_paid_off && d.current_balance > 0);

  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([]);
  const [bankName, setBankName] = useState('Bank Mandiri');
  const [newDebtName, setNewDebtName] = useState('Pinjaman Restrukturisasi Bank Mandiri');
  const [category, setCategory] = useState<DebtCategory>('kta');
  const [newBalanceStr, setNewBalanceStr] = useState('');
  const [interestRateStr, setInterestRateStr] = useState('10');
  const [interestType, setInterestType] = useState<InterestType>('flat');
  const [newMinPaymentStr, setNewMinPaymentStr] = useState('');
  const [dueDate, setDueDate] = useState<number>(10);
  const [notes, setNotes] = useState('Restrukturisasi penggabungan hutang');

  // Select all active debts by default when modal opens
  useEffect(() => {
    if (isOpen) {
      const allActiveIds = activeDebts.map((d) => d.id);
      setSelectedDebtIds(allActiveIds);
      
      const totalBal = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
      setNewBalanceStr(totalBal.toString());
      
      const totalMin = activeDebts.reduce((sum, d) => sum + d.min_payment, 0);
      setNewMinPaymentStr(Math.round(totalMin * 0.7).toString()); // Estimasi hemat 30%
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelectDebt = (id: string) => {
    let updated: string[];
    if (selectedDebtIds.includes(id)) {
      updated = selectedDebtIds.filter((i) => i !== id);
    } else {
      updated = [...selectedDebtIds, id];
    }
    setSelectedDebtIds(updated);
    recalcCombined(updated);
  };

  const recalcCombined = (ids: string[]) => {
    const selected = activeDebts.filter((d) => ids.includes(d.id));
    const totalBal = selected.reduce((sum, d) => sum + d.current_balance, 0);
    setNewBalanceStr(totalBal.toString());
  };

  const selectedDebts = activeDebts.filter((d) => selectedDebtIds.includes(d.id));
  const combinedCurrentBalance = selectedDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const combinedOldMinPayment = selectedDebts.reduce((sum, d) => sum + d.min_payment, 0);

  const newBalance = parseIDRInput(newBalanceStr) || combinedCurrentBalance;
  const newMinPayment = parseIDRInput(newMinPaymentStr);
  const monthlySavings = combinedOldMinPayment - newMinPayment;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDebtIds.length === 0) {
      alert('Silakan pilih minimal 1 hutang yang ingin direstrukturisasi.');
      return;
    }

    if (!bankName.trim()) {
      alert('Silakan masukkan nama Bank / Lembaga Restrukturisasi.');
      return;
    }

    if (newBalance <= 0) {
      alert('Nominal pinjaman baru harus lebih dari 0.');
      return;
    }

    onExecuteRestructure(selectedDebtIds, {
      name: newDebtName.trim() || `Restrukturisasi ${bankName}`,
      category,
      current_balance: newBalance,
      original_balance: newBalance,
      interest_rate: parseFloat(interestRateStr) || 0,
      interest_type: interestType,
      min_payment: newMinPayment || Math.round(newBalance * 0.05),
      due_date: Number(dueDate) || 10,
      custom_priority: 0,
      notes: notes.trim(),
      is_restructured: true,
      restructured_bank: bankName.trim(),
      restructure_notes: `Menggabungkan ${selectedDebts.length} pinjaman`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Program Restrukturisasi & Konsolidasi Hutang
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gabungkan beberapa hutang menjadi 1 pinjaman baru dengan bunga/cicilan lebih ringan
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Langkah 1: Pilih Hutang Yang Akan Direstrukturisasi */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Pilih Hutang Yang Akan Digabungkan ({selectedDebtIds.length} terpilih)
            </label>
            
            {activeDebts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Tidak ada hutang aktif untuk direstrukturisasi.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {activeDebts.map((d) => {
                  const isChecked = selectedDebtIds.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      onClick={() => toggleSelectDebt(d.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                            {d.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Cicilan: {formatCurrencyIDR(d.min_payment)}/bln
                          </span>
                        </div>
                      </div>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        {formatCurrencyIDR(d.current_balance)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ringkasan Gabungan */}
          <div className="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Total Sisa Pokok Gabungan:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrencyIDR(combinedCurrentBalance)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Cicilan Lama / Bulan:</span>
              <strong className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {formatCurrencyIDR(combinedOldMinPayment)}
              </strong>
            </div>
          </div>

          {/* Langkah 2: Detail Pinjaman Restrukturisasi Baru */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2. Syarat & Pinjaman Restrukturisasi Baru
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank / Lembaga Penyedia *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bank Mandiri, BCA, BRI, OJK"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      if (!newDebtName || newDebtName.startsWith('Pinjaman Restrukturisasi')) {
                        setNewDebtName(`Pinjaman Restrukturisasi ${e.target.value}`);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Catatan Pinjaman Baru *
                </label>
                <input
                  type="text"
                  required
                  placeholder="KTA Restrukturisasi Mandiri"
                  value={newDebtName}
                  onChange={(e) => setNewDebtName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Pinjaman Restrukturisasi (Rp) *
                </label>
                <input
                  type="text"
                  required
                  value={newBalanceStr}
                  onChange={(e) => setNewBalanceStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {formatCurrencyIDR(newBalance)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cicilan Baru / Bulan (Rp) *
                </label>
                <input
                  type="text"
                  required
                  value={newMinPaymentStr}
                  onChange={(e) => setNewMinPaymentStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {formatCurrencyIDR(newMinPayment)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Suku Bunga Baru (% / Tahun)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="10.0"
                  value={interestRateStr}
                  onChange={(e) => setInterestRateStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Jatuh Tempo Baru
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDate}
                  onChange={(e) => setDueDate(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Live Analysis / Comparison Box */}
          {newMinPayment > 0 && combinedOldMinPayment > 0 && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                    {monthlySavings > 0
                      ? `Estimasi Penghematan Arus Kas: ${formatCurrencyIDR(monthlySavings)} / Bulan!`
                      : 'Cicilan Baru Terpasang'}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Cicilan bulanan berkurang dari {formatCurrencyIDR(combinedOldMinPayment)} menjadi {formatCurrencyIDR(newMinPayment)}.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Eksekusi Restrukturisasi & Gabung Pinjaman
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
