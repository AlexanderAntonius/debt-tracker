'use client';

import React from 'react';
import { 
  TrendingDown, 
  PlusCircle, 
  RotateCcw, 
  Download, 
  Upload, 
  LogIn, 
  LogOut,
  Sliders,
  CalendarCheck,
  Calculator,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'bills' | 'debts' | 'calculator';
  setActiveTab: (tab: 'overview' | 'bills' | 'debts' | 'calculator') => void;
  onOpenAddDebt: () => void;
  onResetDemo: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCloudConnected: boolean;
  userEmail?: string | null;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddDebt,
  onResetDemo,
  onExportJson,
  onImportJson,
  isCloudConnected,
  userEmail,
  onLogout,
  onOpenLoginModal,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Debt Tracker
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1">
                Bill & Payoff Engine
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'bills'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Tagihan Bulanan
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'debts'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Daftar Hutang
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Kalkulator Pelunasan
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Export / Import */}
            <div className="hidden lg:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
              <button
                onClick={onExportJson}
                title="Download Backup Data (JSON)"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Pulihkan Data dari JSON"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportJson}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={onResetDemo}
                title="Reset ke Data Contoh (Demo)"
                className="p-2 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Tambah Hutang Button */}
            <button
              onClick={onOpenAddDebt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition shadow-emerald-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Hutang</span>
              <span className="sm:hidden">Tambah</span>
            </button>

            {/* Auth / Cloud Login */}
            {isCloudConnected && (
              userEmail ? (
                <button
                  onClick={onLogout}
                  title={`Keluar (${userEmail})`}
                  className="inline-flex items-center gap-1 p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )
            )}

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/60 gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'bills'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Tagihan Bulanan
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'debts'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Daftar Hutang
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Kalkulator Pelunasan
          </button>
        </div>

      </div>
    </header>
  );
};
