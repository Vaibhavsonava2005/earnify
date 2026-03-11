-- Create Ad Views Table to track watched ads
CREATE TABLE ad_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    ad_id UUID REFERENCES ads(id) NOT NULL,
    UNIQUE(user_id, ad_id) -- Prevent duplicate views
);

-- Disable RLS for now (Simplest for this stage)
ALTER TABLE ad_views DISABLE ROW LEVEL SECURITY;

-- Enable Realtime
alter publication supabase_realtime add table ad_views;
