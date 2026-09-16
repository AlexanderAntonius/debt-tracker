export type DebtCategory =
  | 'credit_card'
  | 'mortgage'
  | 'kta'
  | 'pinjol'
  | 'paylater'
  | 'vehicle'
  | 'other';

export type InterestType = 'effective' | 'flat' | 'credit_card';

export type PayoffStrategy = 'snowball' | 'avalanche' | 'custom';

export interface Debt {
  id: string;
  user_id?: string;
  name: string;
  category: DebtCategory;
  current_balance: number;
  original_balance: number;
  interest_rate: number; // APR % (e.g. 15.5 for 15.5%/year)
  interest_type: InterestType;
  min_payment: number;
  due_date: number; // 1 - 31
  custom_priority: number;
  notes?: string;
  is_paid_off: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  debt_name?: string;
  user_id?: string;
  amount: number;
  payment_date: string; // YYYY-MM-DD
  principal_amount?: number;
  interest_amount?: number;
  notes?: string;
  created_at?: string;
}

export interface UserSettings {
  user_id?: string;
  monthly_extra_budget: number;
  preferred_strategy: PayoffStrategy;
  currency: string;
}

export interface AmortizationMonth {
  monthIndex: number;
  dateStr: string; // "Jan 2026", etc.
  totalBalance: number;
  totalPaid: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  debtBalances: { [debtId: string]: number };
  debtPayments: { [debtId: string]: number };
  debtsPaidOffThisMonth: string[];
}

export interface PayoffSimulationResult {
  strategy: PayoffStrategy;
  strategyName: string;
  totalMonths: number;
  debtFreeDate: Date;
  debtFreeDateFormatted: string;
  totalInterestPaid: number;
  totalAmountPaid: number;
  interestSavedComparedToMin: number;
  monthsSavedComparedToMin: number;
  schedule: AmortizationMonth[];
}

export interface MonthlyBillSummary {
  debtId: string;
  debtName: string;
  category: DebtCategory;
  currentBalance: number;
  minPayment: number;
  estimatedInterest: number;
  dueDate: number;
  daysRemaining: number;
  status: 'paid' | 'overdue' | 'due_soon' | 'pending';
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}
