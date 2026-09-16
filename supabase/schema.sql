-- ==============================================================================
-- SKEMA DATABASE BEBASHUTANG (DEBT TRACKER & PAYOFF CALCULATOR)
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda (https://app.supabase.com)
-- ==============================================================================

-- 1. TABEL HUTANG (debts)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other', -- credit_card, mortgage, kta, pinjol, paylater, vehicle, other
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    original_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    interest_rate NUMERIC(6, 2) NOT NULL DEFAULT 0, -- APR dalam % (misal 15.5 untuk 15.5%/tahun)
    interest_type TEXT NOT NULL DEFAULT 'effective', -- 'effective', 'flat', 'credit_card'
    min_payment NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Cicilan minimum bulanan
    due_date INTEGER NOT NULL DEFAULT 1 CHECK (due_date >= 1 AND due_date <= 31), -- Tanggal jatuh tempo (1 - 31)
    custom_priority INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    is_paid_off BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABEL PEMBAYARAN / HISTORI CICILAN (debt_payments)
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    principal_amount NUMERIC(15, 2) DEFAULT 0,
    interest_amount NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL PENGATURAN USER (user_settings)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_extra_budget NUMERIC(15, 2) DEFAULT 0,
    preferred_strategy TEXT DEFAULT 'snowball', -- 'snowball', 'avalanche', 'custom'
    currency TEXT DEFAULT 'IDR',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN AKSES (POLICIES) UNTUK DEBTS
CREATE POLICY "Pengguna hanya dapat melihat hutang miliknya sendiri"
    ON public.debts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat menambah hutang miliknya sendiri"
    ON public.debts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat mengupdate hutang miliknya sendiri"
    ON public.debts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat menghapus hutang miliknya sendiri"
    ON public.debts FOR DELETE
    USING (auth.uid() = user_id);

-- KEBIJAKAN AKSES UNTUK DEBT_PAYMENTS
CREATE POLICY "Pengguna hanya dapat melihat pembayaran miliknya sendiri"
    ON public.debt_payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat menambah pembayaran miliknya sendiri"
    ON public.debt_payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat menghapus pembayaran miliknya sendiri"
    ON public.debt_payments FOR DELETE
    USING (auth.uid() = user_id);

-- KEBIJAKAN AKSES UNTUK USER_SETTINGS
CREATE POLICY "Pengguna dapat melihat pengaturan sendiri"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat mengupdate pengaturan sendiri"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
