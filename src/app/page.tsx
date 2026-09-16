'use client';

import React, { useState, useEffect } from 'react';
import { Debt, DebtPayment, UserSettings } from '@/lib/types';
import { 
  INITIAL_DEMO_DEBTS, 
  INITIAL_DEMO_PAYMENTS, 
  INITIAL_DEMO_SETTINGS 
} from '@/lib/demo-data';
import { calculateMonthlySummary, simulatePayoff } from '@/lib/debt-calculator';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { CloudStatusBanner } from '@/components/CloudStatusBanner';
import { DashboardOverview } from '@/components/DashboardOverview';
import { MonthlyBillTracker } from '@/components/MonthlyBillTracker';
import { DebtList } from '@/components/DebtList';
import { PayoffCalculator } from '@/components/PayoffCalculator';
import { DebtModal } from '@/components/DebtModal';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentHistoryModal } from '@/components/PaymentHistoryModal';
import { CloudSetupModal } from '@/components/CloudSetupModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'debts' | 'calculator'>('overview');

  // Core State
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEMO_DEBTS);
  const [payments, setPayments] = useState<DebtPayment[]>(INITIAL_DEMO_PAYMENTS);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_DEMO_SETTINGS);

  // Auth & Cloud State
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Modals
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedDebtForHistory, setSelectedDebtForHistory] = useState<Debt | null>(null);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // 1. Initial Load: Check Supabase session & local storage
  useEffect(() => {
    const cloudAvailable = isSupabaseConfigured();
    setIsCloud(cloudAvailable);

    if (cloudAvailable && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUserEmail(session.user.email || null);
          setUserId(session.user.id);
          loadCloudData(session.user.id);
        } else {
          loadLocalStorageData();
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email || null);
          setUserId(session.user.id);
          loadCloudData(session.user.id);
        } else {
          setUserEmail(null);
          setUserId(null);
          loadLocalStorageData();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      loadLocalStorageData();
    }
  }, []);

  // Load from LocalStorage
  const loadLocalStorageData = () => {
    try {
      const savedDebts = localStorage.getItem('bebashutang_debts');
      const savedPayments = localStorage.getItem('bebashutang_payments');
      const savedSettings = localStorage.getItem('bebashutang_settings');

      if (savedDebts) setDebts(JSON.parse(savedDebts));
      if (savedPayments) setPayments(JSON.parse(savedPayments));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  };

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!userId) {
      try {
        localStorage.setItem('bebashutang_debts', JSON.stringify(debts));
        localStorage.setItem('bebashutang_payments', JSON.stringify(payments));
        localStorage.setItem('bebashutang_settings', JSON.stringify(settings));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }
  }, [debts, payments, settings, userId]);

  // Load from Supabase Cloud
  const loadCloudData = async (uid: string) => {
    const client = supabase;
    if (!client) return;
    try {
      const { data: debtsData, error: debtsErr } = await client
        .from('debts')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });

      if (!debtsErr && debtsData && debtsData.length > 0) {
        setDebts(debtsData as Debt[]);
      } else if (debtsData && debtsData.length === 0) {
        // First time cloud user: initialize with demo data
        await Promise.all(
          INITIAL_DEMO_DEBTS.map((d) =>
            client.from('debts').insert({
              ...d,
              id: undefined,
              user_id: uid,
            })
          )
        );
        loadCloudData(uid);
        return;
      }

      const { data: paymentsData } = await client
        .from('debt_payments')
        .select('*')
        .eq('user_id', uid)
        .order('payment_date', { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData as DebtPayment[]);
      }

      const { data: settingsData } = await client
        .from('user_settings')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (settingsData) {
        setSettings({
          user_id: uid,
          monthly_extra_budget: Number(settingsData.monthly_extra_budget) || 0,
          preferred_strategy: settingsData.preferred_strategy || 'snowball',
          currency: settingsData.currency || 'IDR',
        });
      }
    } catch (err) {
      console.error('Error loading cloud data', err);
    }
  };

  // Handlers for Debts
  const handleSaveDebt = async (debtData: Omit<Debt, 'id' | 'is_paid_off'> & { id?: string }) => {
    if (debtData.id) {
      // Edit existing
      const updated = debts.map((d) =>
        d.id === debtData.id ? { ...d, ...debtData } : d
      );
      setDebts(updated);

      if (userId && supabase) {
        await supabase
          .from('debts')
          .update({
            name: debtData.name,
            category: debtData.category,
            current_balance: debtData.current_balance,
            original_balance: debtData.original_balance,
            interest_rate: debtData.interest_rate,
            interest_type: debtData.interest_type,
            min_payment: debtData.min_payment,
            due_date: debtData.due_date,
            notes: debtData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', debtData.id);
      }
    } else {
      // Add new
      const newDebt: Debt = {
        ...debtData,
        id: `debt-${Date.now()}`,
        is_paid_off: false,
        custom_priority: debts.length + 1,
        created_at: new Date().toISOString(),
      };
      setDebts([...debts, newDebt]);

      if (userId && supabase) {
        const { data } = await supabase.from('debts').insert({
          user_id: userId,
          name: debtData.name,
          category: debtData.category,
          current_balance: debtData.current_balance,
          original_balance: debtData.original_balance,
          interest_rate: debtData.interest_rate,
          interest_type: debtData.interest_type,
          min_payment: debtData.min_payment,
          due_date: debtData.due_date,
          custom_priority: debts.length + 1,
          notes: debtData.notes,
        }).select().single();

        if (data) {
          setDebts((prev) => prev.map((d) => (d.id === newDebt.id ? (data as Debt) : d)));
        }
      }
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan hutang ini?')) return;
    setDebts(debts.filter((d) => d.id !== debtId));
    setPayments(payments.filter((p) => p.debt_id !== debtId));

    if (userId && supabase) {
      await supabase.from('debts').delete().eq('id', debtId);
    }
  };

  const handleTogglePaidOff = async (debtId: string) => {
    const target = debts.find((d) => d.id === debtId);
    if (!target) return;
    const newPaidStatus = !target.is_paid_off;

    setDebts(
      debts.map((d) =>
        d.id === debtId
          ? {
              ...d,
              is_paid_off: newPaidStatus,
              current_balance: newPaidStatus ? 0 : d.original_balance || d.current_balance,
            }
          : d
      )
    );

    if (userId && supabase) {
      await supabase
        .from('debts')
        .update({
          is_paid_off: newPaidStatus,
          current_balance: newPaidStatus ? 0 : target.original_balance || target.current_balance,
        })
        .eq('id', debtId);
    }
  };

  const handleMovePriority = (debtId: string, direction: 'up' | 'down') => {
    const activeDebts = [...debts.filter((d) => !d.is_paid_off && d.current_balance > 0)];
    const index = activeDebts.findIndex((d) => d.id === debtId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = activeDebts[index];
      activeDebts[index] = activeDebts[index - 1];
      activeDebts[index - 1] = temp;
    } else if (direction === 'down' && index < activeDebts.length - 1) {
      const temp = activeDebts[index];
      activeDebts[index] = activeDebts[index + 1];
      activeDebts[index + 1] = temp;
    }

    // Reassign custom_priority
    const updatedWithPriority = debts.map((d) => {
      const foundIdx = activeDebts.findIndex((ad) => ad.id === d.id);
      if (foundIdx !== -1) {
        return { ...d, custom_priority: foundIdx + 1 };
      }
      return d;
    });

    setDebts(updatedWithPriority);
  };

  // Record Payment
  const handleRecordPayment = async (
    debtId: string,
    amount: number,
    paymentDate: string,
    notes?: string
  ) => {
    const targetDebt = debts.find((d) => d.id === debtId);
    if (!targetDebt) return;

    const newBalance = Math.max(0, targetDebt.current_balance - amount);
    const isNowPaidOff = newBalance === 0;

    // Update debt
    setDebts(
      debts.map((d) =>
        d.id === debtId
          ? { ...d, current_balance: newBalance, is_paid_off: isNowPaidOff }
          : d
      )
    );

    // Add payment log
    const newPayment: DebtPayment = {
      id: `pay-${Date.now()}`,
      debt_id: debtId,
      debt_name: targetDebt.name,
      amount,
      payment_date: paymentDate,
      notes,
      created_at: new Date().toISOString(),
    };
    setPayments([newPayment, ...payments]);

    if (userId && supabase) {
      await supabase
        .from('debts')
        .update({
          current_balance: newBalance,
          is_paid_off: isNowPaidOff,
          updated_at: new Date().toISOString(),
        })
        .eq('id', debtId);

      await supabase.from('debt_payments').insert({
        user_id: userId,
        debt_id: debtId,
        amount,
        payment_date: paymentDate,
        notes,
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Hapus riwayat pembayaran ini?')) return;
    setPayments(payments.filter((p) => p.id !== paymentId));

    if (userId && supabase) {
      await supabase.from('debt_payments').delete().eq('id', paymentId);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (userId && supabase) {
      await supabase.from('user_settings').upsert({
        user_id: userId,
        monthly_extra_budget: updated.monthly_extra_budget,
        preferred_strategy: updated.preferred_strategy,
        currency: updated.currency,
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Reset to Demo Data
  const handleResetDemo = () => {
    if (confirm('Muat ulang data contoh (demo data)? Data saat ini di browser akan diganti dengan data contoh.')) {
      setDebts(INITIAL_DEMO_DEBTS);
      setPayments(INITIAL_DEMO_PAYMENTS);
      setSettings(INITIAL_DEMO_SETTINGS);
      localStorage.clear();
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      debts,
      payments,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bebashutang-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.debts && Array.isArray(json.debts)) {
          setDebts(json.debts);
          if (json.payments) setPayments(json.payments);
          if (json.settings) setSettings(json.settings);
          alert('Data berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Auth logout
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUserEmail(null);
      setUserId(null);
      loadLocalStorageData();
    }
  };

  // Calculations
  const monthlySummary = calculateMonthlySummary(debts);
  const simulation = simulatePayoff(debts, settings.preferred_strategy, settings.monthly_extra_budget);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      
      {/* Cloud Status Banner */}
      <CloudStatusBanner
        isCloudConnected={isCloud && Boolean(userId)}
        userEmail={userEmail}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddDebt={() => {
          setEditingDebt(null);
          setIsDebtModalOpen(true);
        }}
        onResetDemo={handleResetDemo}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        isCloudConnected={isCloud}
        userEmail={userEmail}
        onLogout={handleLogout}
        onOpenLoginModal={() => router.push('/login')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            debts={debts}
            totalBalance={monthlySummary.totalBalance}
            totalMinPayment={monthlySummary.totalMinPayment}
            totalMonthlyInterest={monthlySummary.totalMonthlyInterest}
            simulation={simulation}
            onNavigateToTab={setActiveTab}
            onOpenAddDebt={() => {
              setEditingDebt(null);
              setIsDebtModalOpen(true);
            }}
          />
        )}

        {activeTab === 'bills' && (
          <MonthlyBillTracker
            debts={debts}
            payments={payments}
            onOpenPayModal={(debt) => {
              setSelectedDebtForPayment(debt);
              setIsPayModalOpen(true);
            }}
            onOpenHistoryModal={(debt) => {
              setSelectedDebtForHistory(debt);
              setIsHistoryModalOpen(true);
            }}
          />
        )}

        {activeTab === 'debts' && (
          <DebtList
            debts={debts}
            onEditDebt={(debt) => {
              setEditingDebt(debt);
              setIsDebtModalOpen(true);
            }}
            onDeleteDebt={handleDeleteDebt}
            onTogglePaidOff={handleTogglePaidOff}
            onMovePriority={handleMovePriority}
            onOpenAddDebt={() => {
              setEditingDebt(null);
              setIsDebtModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calculator' && (
          <PayoffCalculator
            debts={debts}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BebasHutang App • Siap Deploy di Vercel & Supabase Cloud</span>
          <span>Dukungan Bunga Flat, Efektif & Kartu Kredit • Snowball & Avalanche</span>
        </div>
      </footer>

      {/* Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        onSave={handleSaveDebt}
        initialDebt={editingDebt}
      />

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        debt={selectedDebtForPayment}
        onRecordPayment={handleRecordPayment}
      />

      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        debt={selectedDebtForHistory}
        payments={payments}
        onDeletePayment={handleDeletePayment}
      />

      <CloudSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

    </div>
  );
}
