-- Create Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    role TEXT DEFAULT 'USER'
);

-- Create Ads Table
CREATE TABLE ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    reward NUMERIC DEFAULT 0,
    duration NUMERIC DEFAULT 15
);

-- Create Withdrawals Table
CREATE TABLE withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id),
    amount NUMERIC NOT NULL,
    points NUMERIC NOT NULL,
    upi_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING'
);

-- Enable Realtime for these tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table ads;
alter publication supabase_realtime add table withdrawals;
