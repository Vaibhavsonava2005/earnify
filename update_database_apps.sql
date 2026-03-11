-- Create Apps Table
CREATE TABLE apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    image_url TEXT,
    reward NUMERIC NOT NULL
);

-- Create User Apps Table (Task Tracking)
CREATE TABLE user_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    app_id UUID REFERENCES apps(id) NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    UNIQUE(user_id, app_id) -- One attempt per app per user
);

-- Disable RLS for now
ALTER TABLE apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_apps DISABLE ROW LEVEL SECURITY;

-- Enable Realtime
alter publication supabase_realtime add table apps;
alter publication supabase_realtime add table user_apps;
