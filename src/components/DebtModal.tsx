'use client';

import React, { useState, useEffect } from 'react';
import { Debt, DebtCategory, InterestType } from '../lib/types';
import { formatCurrencyIDR, parseIDRInput } from '../lib/formatters';
import { X, Info, HelpCircle, Calculator, Check, RefreshCw } from 'lucide-react';

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

  // Restrukturisasi State
  const [isRestructured, setIsRestructured] = useState(false);
  const [restructuredBank, setRestructuredBank] = useState('');
  const [restructureNotes, setRestructureNotes] = useState('');

  // Helper Kalkulator Tenor Cicilan (Pinjol / Paylater / KTA)
  const [showTenorCalc, setShowTenorCalc] = useState(false);
  const [calcMonthlyInstallment, setCalcMonthlyInstallment] = useState('');
  const [calcTotalTenor, setCalcTotalTenor] = useState('');
  const [calcPaidTenor, setCalcPaidTenor] = useState('');

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
      setIsRestructured(Boolean(initialDebt.is_restructured));
      setRestructuredBank(initialDebt.restructured_bank || '');
      setRestructureNotes(initialDebt.restructure_notes || '');
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
      setIsRestructured(false);
      setRestructuredBank('');
      setRestructureNotes('');
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
      is_restructured: isRestructured,
      restructured_bank: isRestructured ? restructuredBank.trim() : undefined,
      restructure_notes: isRestructured ? restructureNotes.trim() : undefined,
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
                onChange={(e) => {
                  const newCat = e.target.value as DebtCategory;
                  setCategory(newCat);
                  // Otomatis rekomendasikan bunga & model untuk hutang baru
                  if (!initialDebt) {
                    if (newCat === 'credit_card') {
                      setInterestRateStr('21');
                      setInterestType('credit_card');
                    } else if (newCat === 'paylater') {
                      setInterestRateStr('27');
                      setInterestType('flat');
                    } else if (newCat === 'pinjol') {
                      setInterestRateStr('36');
                      setInterestType('flat');
                    } else if (newCat === 'mortgage') {
                      setInterestRateStr('7.5');
                      setInterestType('effective');
                    } else if (newCat === 'vehicle') {
                      setInterestRateStr('8');
                      setInterestType('flat');
                    } else if (newCat === 'kta') {
                      setInterestRateStr('14');
                      setInterestType('flat');
                    }
                  }
                }}
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

          {/* Quick Helper Calculator for Pinjol / Paylater */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowTenorCalc(!showTenorCalc)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
              >
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {showTenorCalc ? 'Tutup Bantuan Hitung Cicilan' : '💡 Bingung sisa & plafon? Klik untuk hitung otomatis (Pinjol/Paylater)'}
              </button>
            </div>

            {showTenorCalc && (
              <div className="space-y-3 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Masukkan info cicilan dari aplikasi Paylater/Pinjol Anda (misal: Rp 500rb/bln, 12 bulan, sudah bayar 3 kali).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Cicilan / Bulan (Rp)
                    </label>
                    <input
                      type="text"
                      placeholder="500.000"
                      value={calcMonthlyInstallment}
                      onChange={(e) => setCalcMonthlyInstallment(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Total Tenor (Bulan)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="12"
                      value={calcTotalTenor}
                      onChange={(e) => setCalcTotalTenor(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Sudah Bayar (Bulan)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="3"
                      value={calcPaidTenor}
                      onChange={(e) => setCalcPaidTenor(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                {parseIDRInput(calcMonthlyInstallment) > 0 && parseInt(calcTotalTenor, 10) > 0 && (
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Estimasi Pokok Awal / Plafon:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {formatCurrencyIDR(parseIDRInput(calcMonthlyInstallment) * (parseInt(calcTotalTenor, 10) || 0))}
                      </strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Estimasi Sisa Saldo ({Math.max(0, (parseInt(calcTotalTenor, 10) || 0) - (parseInt(calcPaidTenor, 10) || 0))} bln lagi):</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyIDR(parseIDRInput(calcMonthlyInstallment) * Math.max(0, (parseInt(calcTotalTenor, 10) || 0) - (parseInt(calcPaidTenor, 10) || 0)))}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const monthly = parseIDRInput(calcMonthlyInstallment);
                        const total = parseInt(calcTotalTenor, 10) || 0;
                        const paid = parseInt(calcPaidTenor, 10) || 0;
                        const remaining = Math.max(0, total - paid);

                        setOriginalBalanceStr((monthly * total).toString());
                        setCurrentBalanceStr((monthly * remaining).toString());
                        setMinPaymentStr(monthly.toString());
                        setShowTenorCalc(false);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Terapkan Hasil Ke Form Di Bawah
                    </button>
                  </div>
                )}
              </div>
            )}
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

              {/* Quick Preset Buttons */}
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                  💡 Rekomendasi Bunga Acuan (Indonesia):
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInterestRateStr('21');
                      setInterestType('credit_card');
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-700 dark:hover:bg-emerald-950 text-[10px] rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition"
                  >
                    💳 KK (21%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestRateStr('27');
                      setInterestType('flat');
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-700 dark:hover:bg-emerald-950 text-[10px] rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition"
                  >
                    🛍️ Paylater (27%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestRateStr('36');
                      setInterestType('flat');
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-700 dark:hover:bg-emerald-950 text-[10px] rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition"
                  >
                    ⚡ Pinjol (36%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestRateStr('7.5');
                      setInterestType('effective');
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-700 dark:hover:bg-emerald-950 text-[10px] rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition"
                  >
                    🏠 KPR (7.5%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestRateStr('8');
                      setInterestType('flat');
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-700 dark:hover:bg-emerald-950 text-[10px] rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition"
                  >
                    🚗 KKB (8%)
                  </button>
                </div>
              </div>
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

          {/* Restrukturisasi Checkbox & Details */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900 dark:text-amber-200">
              <input
                type="checkbox"
                checked={isRestructured}
                onChange={(e) => setIsRestructured(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Hutang Ini Hasil Restrukturisasi / Keringanan Bank
              </span>
            </label>

            {isRestructured && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank / Lembaga Restrukturisasi *
                  </label>
                  <input
                    type="text"
                    required={isRestructured}
                    placeholder="Contoh: Bank Mandiri, BCA, OJK"
                    value={restructuredBank}
                    onChange={(e) => setRestructuredBank(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Keringanan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Potongan bunga 50% / Tenor 24 bln"
                    value={restructureNotes}
                    onChange={(e) => setRestructureNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}
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
