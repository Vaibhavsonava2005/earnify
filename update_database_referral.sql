-- Create referral_rewards table to track claimed milestones
CREATE TABLE IF NOT EXISTS referral_rewards (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    milestone INT NOT NULL, -- 3 or 10
    claimed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, milestone)
);

-- RLS
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rewards" ON referral_rewards
    FOR SELECT USING (auth.uid() = user_id);
