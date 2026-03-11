-- SAFE UPDATE SCRIPT
-- Run this in your Supabase SQL Editor to enable Rejection Reasons without losing data.

ALTER TABLE user_apps 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Confirm it worked
SELECT 'Column Added Successfully' as result;
