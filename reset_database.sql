-- ⚠️ WARNING: THIS WILL DELETE ALL DATA ⚠️

-- 1. DROP EVERYTHING (CASCADE handles dependencies)
DROP TABLE IF EXISTS user_apps CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create USERS Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    role TEXT DEFAULT 'USER' -- 'USER' or 'ADMIN'
);

-- 3. Create ADS Table
CREATE TABLE ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    reward NUMERIC NOT NULL,
    duration NUMERIC NOT NULL
);

-- 4. Create WITHDRAWALS Table
CREATE TABLE withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    points NUMERIC NOT NULL,
    upi_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING'
);

-- 5. Create AD_VIEWS Table (Track watched ads)
CREATE TABLE ad_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    ad_id UUID REFERENCES ads(id) NOT NULL,
    UNIQUE(user_id, ad_id)
);

-- 6. Create APPS Table (Offers with Categories)
CREATE TABLE apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    image_url TEXT,
    reward NUMERIC NOT NULL,
    category TEXT DEFAULT 'APPS' -- 'APPS', 'BANK', 'DEMAT', 'HOT'
);

-- 7. Create USER_APPS Table (Task Tracking)
CREATE TABLE user_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    app_id UUID REFERENCES apps(id) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    UNIQUE(user_id, app_id)
);

-- 8. Disable RLS (For MVP Simplicity)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_apps DISABLE ROW LEVEL SECURITY;

-- 9. Enable Realtime
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table ads;
alter publication supabase_realtime add table withdrawals;
alter publication supabase_realtime add table ad_views;
alter publication supabase_realtime add table apps;
alter publication supabase_realtime add table user_apps;

-- 10. Default Admin (Optional: Sign up normally then change role in Supabase)
-- INSERT INTO users (mobile, name, pin, role) VALUES ('admin', 'Admin', 'admin', 'ADMIN');
