-- RUN THIS TO FIX EVERYTHING

-- 1. Turn off the locks
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views DISABLE ROW LEVEL SECURITY;

-- 2. Remove the "already exists" errors
DROP POLICY IF EXISTS "Users view own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Admins view all users" ON users;
DROP POLICY IF EXISTS "Admins update all users" ON users;

DROP POLICY IF EXISTS "Public view apps" ON apps;
DROP POLICY IF EXISTS "Admins manage apps" ON apps;

DROP POLICY IF EXISTS "Users view own progress" ON user_apps;
DROP POLICY IF EXISTS "Users insert own progress" ON user_apps;
DROP POLICY IF EXISTS "Users update own progress" ON user_apps;
DROP POLICY IF EXISTS "Admins view all progress" ON user_apps;

DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins view all transactions" ON transactions;

DROP POLICY IF EXISTS "Users view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users request withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins view and manage withdrawals" ON withdrawals;

DROP POLICY IF EXISTS "Public view ads" ON ads;
DROP POLICY IF EXISTS "Admins manage ads" ON ads;

DROP POLICY IF EXISTS "Users insert own views" ON ad_views;
DROP POLICY IF EXISTS "Users see own views" ON ad_views;
DROP POLICY IF EXISTS "Admins see all views" ON ad_views;
