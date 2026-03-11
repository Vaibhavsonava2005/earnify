-- Create daily_activity table to track limits
CREATE TABLE IF NOT EXISTS daily_activity (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    daily_login_claimed BOOLEAN DEFAULT FALSE,
    scratch_count INT DEFAULT 0,
    spin_count INT DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Policy (Optional: RLS is good but for now we rely on service role/public if simpler)
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily activity" ON daily_activity
    FOR SELECT USING (auth.uid() = user_id);

-- (If using Service Role for key updates, policies might not matter as much, 
-- but ensuring 'users' table exists is key. The REFERENCES users(id) handles that).
