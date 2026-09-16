import { Debt, PayoffStrategy, PayoffSimulationResult, AmortizationMonth } from './types';

/**
 * Menghitung perkiraan bunga bulanan untuk sebuah akun hutang
 */
export const calculateMonthlyInterest = (debt: Debt): number => {
  if (debt.current_balance <= 0 || debt.interest_rate <= 0) return 0;

  const monthlyRate = (debt.interest_rate / 100) / 12;

  switch (debt.interest_type) {
    case 'flat': {
      // Pada bunga flat, bunga dihitung dari pokok awal (original_balance)
      const base = debt.original_balance > 0 ? debt.original_balance : debt.current_balance;
      return Math.round(base * monthlyRate);
    }
    case 'credit_card':
    case 'effective':
    default:
      // Bunga efektif dihitung dari sisa saldo menurun
      return Math.round(debt.current_balance * monthlyRate);
  }
};

/**
 * Menghitung total tagihan minimum bulanan dan total estimasi bunga untuk seluruh hutang
 */
export const calculateMonthlySummary = (debts: Debt[]) => {
  const activeDebts = debts.filter((d) => !d.is_paid_off && d.current_balance > 0);

  const totalBalance = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const totalMinPayment = activeDebts.reduce((sum, d) => sum + d.min_payment, 0);
  const totalMonthlyInterest = activeDebts.reduce((sum, d) => sum + calculateMonthlyInterest(d), 0);

  return {
    totalBalance,
    totalMinPayment,
    totalMonthlyInterest,
    activeDebtCount: activeDebts.length,
  };
};

/**
 * Mengurutkan hutang berdasarkan strategi pelunasan
 */
export const sortDebtsByStrategy = (debts: Debt[], strategy: PayoffStrategy): Debt[] => {
  const copy = [...debts.filter((d) => !d.is_paid_off && d.current_balance > 0)];

  switch (strategy) {
    case 'snowball':
      // Saldo terkecil terlebih dahulu
      return copy.sort((a, b) => a.current_balance - b.current_balance);
    case 'avalanche':
      // Suku bunga (APR) tertinggi terlebih dahulu
      return copy.sort((a, b) => b.interest_rate - a.interest_rate);
    case 'custom':
    default:
      // Urutan prioritas kustom manual
      return copy.sort((a, b) => a.custom_priority - b.custom_priority);
  }
};

/**
 * Mensimulasikan pelunasan hutang bulan demi bulan berdasarkan strategi yang dipilih
 */
export const simulatePayoff = (
  initialDebts: Debt[],
  strategy: PayoffStrategy,
  monthlyExtraBudget: number = 0
): PayoffSimulationResult => {
  const activeDebts = initialDebts.filter((d) => !d.is_paid_off && d.current_balance > 0);

  if (activeDebts.length === 0) {
    const today = new Date();
    return {
      strategy,
      strategyName: getStrategyName(strategy),
      totalMonths: 0,
      debtFreeDate: today,
      debtFreeDateFormatted: today.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      interestSavedComparedToMin: 0,
      monthsSavedComparedToMin: 0,
      schedule: [],
    };
  }

  // Clone debts state
  interface SimDebt {
    id: string;
    name: string;
    balance: number;
    originalBalance: number;
    interestRate: number;
    interestType: string;
    minPayment: number;
    customPriority: number;
    isPaid: boolean;
  }

  let debtStates: SimDebt[] = activeDebts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.current_balance,
    originalBalance: d.original_balance || d.current_balance,
    interestRate: d.interest_rate,
    interestType: d.interest_type,
    minPayment: d.min_payment,
    customPriority: d.custom_priority,
    isPaid: false,
  }));

  const schedule: AmortizationMonth[] = [];
  let monthIndex = 0;
  let totalInterestAccumulated = 0;
  let totalAmountAccumulated = 0;
  const maxMonths = 360; // Batas aman 30 tahun

  const startDate = new Date();

  while (debtStates.some((d) => d.balance > 0) && monthIndex < maxMonths) {
    monthIndex++;

    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + monthIndex);
    const dateStr = currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

    let monthInterest = 0;
    let monthPayment = 0;
    let monthPrincipal = 0;

    const debtBalancesSnapshot: { [key: string]: number } = {};
    const debtPaymentsSnapshot: { [key: string]: number } = {};
    const paidOffThisMonth: string[] = [];

    // 1. Tambahkan bunga berjalan bulan ini ke setiap hutang yang masih aktif
    for (const debt of debtStates) {
      if (debt.balance > 0) {
        const monthlyRate = debt.interestRate / 100 / 12;
        let interest = 0;
        if (debt.interestType === 'flat') {
          interest = Math.round(debt.originalBalance * monthlyRate);
        } else {
          interest = Math.round(debt.balance * monthlyRate);
        }
        debt.balance += interest;
        monthInterest += interest;
      }
    }

    // 2. Lakukan pembayaran minimum untuk setiap hutang
    let freedUpMinPayment = 0;
    for (const debt of debtStates) {
      if (debt.balance > 0) {
        // Minimum payment can't exceed balance
        const payment = Math.min(debt.minPayment, debt.balance);
        debt.balance -= payment;
        monthPayment += payment;
        debtPaymentsSnapshot[debt.id] = (debtPaymentsSnapshot[debt.id] || 0) + payment;

        if (debt.balance <= 0) {
          debt.balance = 0;
          debt.isPaid = true;
          paidOffThisMonth.push(debt.name);
          freedUpMinPayment += debt.minPayment;
        }
      } else {
        // Hutang yang sudah lunas cicilan minimumnya dialihkan ke snowball
        freedUpMinPayment += debt.minPayment;
      }
    }

    // 3. Alokasikan Extra Budget + Snowball Rollover ke hutang prioritas utama
    let availableExtra = monthlyExtraBudget + freedUpMinPayment;

    // Urutkan hutang aktif berdasarkan strategi yang dipilih
    const priorityQueue = [...debtStates.filter((d) => d.balance > 0)];
    if (strategy === 'snowball') {
      priorityQueue.sort((a, b) => a.balance - b.balance);
    } else if (strategy === 'avalanche') {
      priorityQueue.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      priorityQueue.sort((a, b) => a.customPriority - b.customPriority);
    }

    // Alirkan uang ekstra ke prioritas teratas, jika lunas sisa ekstra lanjut ke berikutnya
    for (const targetDebt of priorityQueue) {
      if (availableExtra <= 0) break;
      if (targetDebt.balance > 0) {
        const extraToApply = Math.min(availableExtra, targetDebt.balance);
        targetDebt.balance -= extraToApply;
        monthPayment += extraToApply;
        availableExtra -= extraToApply;
        debtPaymentsSnapshot[targetDebt.id] = (debtPaymentsSnapshot[targetDebt.id] || 0) + extraToApply;

        if (targetDebt.balance <= 0) {
          targetDebt.balance = 0;
          targetDebt.isPaid = true;
          if (!paidOffThisMonth.includes(targetDebt.name)) {
            paidOffThisMonth.push(targetDebt.name);
          }
        }
      }
    }

    monthPrincipal = monthPayment - monthInterest;
    totalInterestAccumulated += monthInterest;
    totalAmountAccumulated += monthPayment;

    let totalRemainingBalance = 0;
    for (const debt of debtStates) {
      debtBalancesSnapshot[debt.id] = Math.max(0, debt.balance);
      totalRemainingBalance += Math.max(0, debt.balance);
    }

    schedule.push({
      monthIndex,
      dateStr,
      totalBalance: Math.round(totalRemainingBalance),
      totalPaid: Math.round(monthPayment),
      totalInterestPaid: Math.round(monthInterest),
      totalPrincipalPaid: Math.round(monthPrincipal),
      debtBalances: debtBalancesSnapshot,
      debtPayments: debtPaymentsSnapshot,
      debtsPaidOffThisMonth: paidOffThisMonth,
    });
  }

  const debtFreeDate = new Date(startDate);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + monthIndex);

  return {
    strategy,
    strategyName: getStrategyName(strategy),
    totalMonths: monthIndex,
    debtFreeDate,
    debtFreeDateFormatted: debtFreeDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    totalInterestPaid: Math.round(totalInterestAccumulated),
    totalAmountPaid: Math.round(totalAmountAccumulated),
    interestSavedComparedToMin: 0, // Akan dihitung dalam pembanding
    monthsSavedComparedToMin: 0,
    schedule,
  };
};

export const getStrategyName = (strategy: PayoffStrategy): string => {
  switch (strategy) {
    case 'snowball':
      return 'Debt Snowball (Saldo Terkecil Duluan)';
    case 'avalanche':
      return 'Debt Avalanche (Bunga Tertinggi Duluan)';
    case 'custom':
      return 'Prioritas Kustom (Atur Manual)';
  }
};

/**
 * Menghitung perbandingan lengkap antara:
 * 1. Minimum Payment Only (tanpa alokasi ekstra)
 * 2. Debt Snowball (dengan alokasi ekstra)
 * 3. Debt Avalanche (dengan alokasi ekstra)
 * 4. Custom Strategy (dengan alokasi ekstra)
 */
export const comparePayoffStrategies = (
  debts: Debt[],
  monthlyExtraBudget: number
) => {
  const minOnly = simulatePayoff(debts, 'snowball', 0);
  const snowball = simulatePayoff(debts, 'snowball', monthlyExtraBudget);
  const avalanche = simulatePayoff(debts, 'avalanche', monthlyExtraBudget);
  const custom = simulatePayoff(debts, 'custom', monthlyExtraBudget);

  // Hitung penghematan bunga & waktu dibanding bayar minimum
  snowball.interestSavedComparedToMin = Math.max(0, minOnly.totalInterestPaid - snowball.totalInterestPaid);
  snowball.monthsSavedComparedToMin = Math.max(0, minOnly.totalMonths - snowball.totalMonths);

  avalanche.interestSavedComparedToMin = Math.max(0, minOnly.totalInterestPaid - avalanche.totalInterestPaid);
  avalanche.monthsSavedComparedToMin = Math.max(0, minOnly.totalMonths - avalanche.totalMonths);

  custom.interestSavedComparedToMin = Math.max(0, minOnly.totalInterestPaid - custom.totalInterestPaid);
  custom.monthsSavedComparedToMin = Math.max(0, minOnly.totalMonths - custom.totalMonths);

  return {
    minOnly,
    snowball,
    avalanche,
    custom,
  };
};
