-- DISABLE Row Level Security to allow public access (Simplest fix for this App)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- ALTERNATIVELY: If you want to keep RLS enabled, run these policies instead:
-- CREATE POLICY "Enable read/write for all" ON users FOR ALL USING (true);
-- CREATE POLICY "Enable read/write for all" ON ads FOR ALL USING (true);
-- CREATE POLICY "Enable read/write for all" ON withdrawals FOR ALL USING (true);
