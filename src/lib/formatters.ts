import { DebtCategory, InterestType } from './types';

export const formatCurrencyIDR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumberIDR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseIDRInput = (input: string): number => {
  if (!input) return 0;
  // Strip non-digits
  const clean = input.replace(/[^\d]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDateIndo = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return '-';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const getCategoryLabel = (category: DebtCategory): string => {
  switch (category) {
    case 'credit_card':
      return 'Kartu Kredit';
    case 'mortgage':
      return 'KPR / Properti';
    case 'kta':
      return 'KTA (Kredit Tanpa Agunan)';
    case 'pinjol':
      return 'Pinjol / Fintech';
    case 'paylater':
      return 'Paylater';
    case 'vehicle':
      return 'KKB / Kendaraan';
    default:
      return 'Lainnya';
  }
};

export const getCategoryBadgeStyle = (category: DebtCategory): string => {
  switch (category) {
    case 'credit_card':
      return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    case 'mortgage':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    case 'kta':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'pinjol':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    case 'paylater':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
    case 'vehicle':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

export const getInterestTypeLabel = (type: InterestType): string => {
  switch (type) {
    case 'effective':
      return 'Efektif / Anuitas (Saldo Menurun)';
    case 'flat':
      return 'Bunga Flat (Pokok Tetap)';
    case 'credit_card':
      return 'Kartu Kredit (Revolving)';
  }
};
