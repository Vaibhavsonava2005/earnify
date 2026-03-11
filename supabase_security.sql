-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTION: is_admin()
-- Safe way to check admin role without infinite recursion in RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS POLICIES

-- USERS TABLE
CREATE POLICY "Users view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins view all users" ON users
FOR SELECT USING (is_admin());

CREATE POLICY "Admins update all users" ON users
FOR UPDATE USING (is_admin());

-- APPS TABLE (Public Read, Admin Write)
CREATE POLICY "Public view apps" ON apps
FOR SELECT USING (true);

CREATE POLICY "Admins manage apps" ON apps
FOR ALL USING (is_admin());

-- USER_APPS TABLE (Progress)
CREATE POLICY "Users view own progress" ON user_apps
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress" ON user_apps
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress" ON user_apps
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins view all progress" ON user_apps
FOR SELECT USING (is_admin());

-- TRANSACTIONS TABLE
CREATE POLICY "Users view own transactions" ON transactions
FOR SELECT USING (auth.uid() = user_id);

-- ALLOW INSERT for now (Server-side/Edge Functions usually handle this, but if client does it directly)
-- ideally this should be restricted, but for this schema-less app structure:
CREATE POLICY "Users insert own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id); 

CREATE POLICY "Admins view all transactions" ON transactions
FOR SELECT USING (is_admin());

-- WITHDRAWALS TABLE
CREATE POLICY "Users view own withdrawals" ON withdrawals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users request withdrawals" ON withdrawals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view and manage withdrawals" ON withdrawals
FOR ALL USING (is_admin());

-- ADS TABLE (Public Read, Admin Write)
CREATE POLICY "Public view ads" ON ads
FOR SELECT USING (true);

CREATE POLICY "Admins manage ads" ON ads
FOR ALL USING (is_admin());

-- AD_VIEWS TABLE
CREATE POLICY "Users insert own views" ON ad_views
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own views" ON ad_views
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins see all views" ON ad_views
FOR SELECT USING (is_admin());


-- 4. PERFORMANCE INDEXES
-- Fix Slow Queries by indexing Foreign Keys
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_apps_user_id ON user_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON ad_views(user_id);

-- Optimize Lucky Draw & Offer Filtering
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);

-- Optimize Daily Login Checks (timestamp filtering)
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
