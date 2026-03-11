-- EARNIFY MASTER SETUP SCRIPT
-- This script will completely RESET your database and creates all tables with the latest features.
-- Features included:
-- 1. Users & Auth
-- 2. Ads System (View Once Policy)
-- 3. Wallet & Withdrawals (Min 10,000 limit logic is in code, schema supports it)
-- 4. Apps & Offers (Multi-Category: Apps, Bank, Demat, Hot)

-- 1. DROP EXISTING TABLES (Clean Slate) --------------------------------
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_apps CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE TABLES -----------------------------------------------------

-- USERS Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    pin TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    referral_code TEXT UNIQUE NOT NULL, -- Auto-generated code
    referred_by UUID REFERENCES users(id), -- Who referred this user
    role TEXT DEFAULT 'USER' -- 'USER' or 'ADMIN'
);

-- ADS Table
CREATE TABLE ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    reward NUMERIC DEFAULT 0,
    duration INTEGER DEFAULT 30
);

-- AD_VIEWS Table (For "View Once" Logic)
CREATE TABLE ad_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    UNIQUE(user_id, ad_id) -- Ensures a user can only view an ad once
);

-- WITHDRAWALS Table
CREATE TABLE withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,        -- Amount in Rupees
    points NUMERIC NOT NULL,        -- Added: Points used
    method TEXT NOT NULL,           -- 'UPI' or 'BANK'
    name TEXT NOT NULL,             -- Name on Account
    upi_id TEXT,
    ifsc TEXT,
    account_no TEXT,
    status TEXT DEFAULT 'PENDING'   -- 'PENDING', 'APPROVED', 'REJECTED'
);

-- APPS Table (New: Multi-Category)
CREATE TABLE apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    image_url TEXT, -- Placeholder for now
    reward NUMERIC DEFAULT 0,
    category TEXT DEFAULT 'APPS' -- 'APPS', 'BANK', 'DEMAT', 'HOT'
);

-- USER_APPS Table (Task Tracking)
CREATE TABLE user_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    rejection_reason TEXT, -- Reason for rejection
    UNIQUE(user_id, app_id) -- Ensures a user can only submit a task once per app
);

-- TRANSACTIONS Table (History)
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL, -- Positive for credit, Negative for debit
    type TEXT NOT NULL,      -- 'SIGNUP_BONUS', 'REFERRAL_COMMISSION', 'AD_REWARD', 'APP_REWARD', 'WITHDRAWAL', 'REFUND'
    description TEXT
);

-- 3. DISABLE RLS (For MVP Simplicity) -----------------------------------
-- We are DISABLING RLS to ensure data is always visible and writable for the MVP.
-- This fixes issues where apps/ads might not show up due to permission policies.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Policies are not needed when RLS is disabled, but we drop them just in case they exist
DROP POLICY IF EXISTS "Public Users" ON users;
DROP POLICY IF EXISTS "Public Ads" ON ads;
DROP POLICY IF EXISTS "Public AdViews" ON ad_views;
DROP POLICY IF EXISTS "Public Withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Public Apps" ON apps;
DROP POLICY IF EXISTS "Public UserApps" ON user_apps;
DROP POLICY IF EXISTS "Public Transactions" ON transactions;

-- 4. ENABLE REALTIME ---------------------------------------------------
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE ads;
ALTER PUBLICATION supabase_realtime ADD TABLE withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE apps;
ALTER PUBLICATION supabase_realtime ADD TABLE user_apps;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- 5. INSERT DEFAULT ADMIN (Optional helper) ----------------------------
-- Password/Pin is '121212'
INSERT INTO users (name, mobile, pin, role, balance, referral_code)
VALUES ('Admin User', '0000000000', '121212', 'ADMIN', 1000000, '0000000000')
ON CONFLICT (mobile) DO NOTHING;

