import { Debt, DebtPayment, UserSettings } from './types';

export const INITIAL_DEMO_SETTINGS: UserSettings = {
  monthly_extra_budget: 1500000, // Rp 1.500.000 ekstra per bulan
  preferred_strategy: 'avalanche',
  currency: 'IDR',
};

export const INITIAL_DEMO_DEBTS: Debt[] = [
  {
    id: 'demo-debt-1',
    name: 'Kartu Kredit BCA Everyday',
    category: 'credit_card',
    current_balance: 8500000,
    original_balance: 10000000,
    interest_rate: 21.0, // 1.75% per bulan = 21% APR
    interest_type: 'credit_card',
    min_payment: 850000, // 10% minimum
    due_date: 15,
    custom_priority: 1,
    notes: 'Bunga kartu kredit harian/bulanan. Prioritas utama untuk dilunasi.',
    is_paid_off: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-debt-2',
    name: 'Spaylater / GoPayLater Cicilan Laptop',
    category: 'paylater',
    current_balance: 3200000,
    original_balance: 6000000,
    interest_rate: 29.4, // ~2.45% per bulan flat
    interest_type: 'flat',
    min_payment: 620000,
    due_date: 5,
    custom_priority: 2,
    notes: 'Sisa 6 bulan cicilan flat.',
    is_paid_off: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-debt-3',
    name: 'KTA Bank Mandiri (Kredit Usaha/Renovasi)',
    category: 'kta',
    current_balance: 24000000,
    original_balance: 35000000,
    interest_rate: 11.88, // 0.99% flat per bulan = ~11.88%
    interest_type: 'flat',
    min_payment: 1750000,
    due_date: 25,
    custom_priority: 3,
    notes: 'Cicilan renovasi rumah.',
    is_paid_off: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-debt-4',
    name: 'KPR Rumah BTN',
    category: 'mortgage',
    current_balance: 185000000,
    original_balance: 220000000,
    interest_rate: 8.75, // Bunga anuitas efektif tahunan
    interest_type: 'effective',
    min_payment: 2850000,
    due_date: 10,
    custom_priority: 4,
    notes: 'Bunga floating anuitas saldo menurun.',
    is_paid_off: false,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_PAYMENTS: DebtPayment[] = [
  {
    id: 'demo-pay-1',
    debt_id: 'demo-debt-1',
    debt_name: 'Kartu Kredit BCA Everyday',
    amount: 1200000,
    payment_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    principal_amount: 1050000,
    interest_amount: 150000,
    notes: 'Pembayaran bulan lalu',
  },
  {
    id: 'demo-pay-2',
    debt_id: 'demo-debt-2',
    debt_name: 'Spaylater / GoPayLater Cicilan Laptop',
    amount: 620000,
    payment_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    principal_amount: 500000,
    interest_amount: 120000,
    notes: 'Cicilan bulan ini lunas',
  },
];
