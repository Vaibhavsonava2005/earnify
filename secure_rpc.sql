-- SECURE RPC IMPLEMENTATION
-- Goal: Prevent Public Data Leak by disabling direct SELECT on 'users'
-- and replacing it with specific, controlled Remote Remote Procedure Calls (RPC).

-- 1. REVOKE PUBLIC ACCESS
-- We keep RLS enabled, but we remove the "True" policy for SELECT.
DROP POLICY IF EXISTS "Public Read Users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Admins can view all data" ON users;

-- Create a restrictive policy: No one can SELECT directly via the API
-- (Except maybe Service Role, but 'anon' is blocked)
CREATE POLICY "Deny Public Select" ON users
FOR SELECT
TO anon
USING (false); -- Nobody can select directly!

-- 2. SECURE LOGIN FUNCTION
-- Returns user data ONLY if Mobile AND Pin match
CREATE OR REPLACE FUNCTION secure_login(p_mobile text, p_pin text)
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM users 
  WHERE mobile = p_mobile AND pin = p_pin
  LIMIT 1;
$$;

-- 3. GET USER BY ID (For Session Refresh)
-- Prevents "Listing" all users. You must know the UUID.
CREATE OR REPLACE FUNCTION get_user_by_id(p_user_id uuid)
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM users 
  WHERE id = p_user_id
  LIMIT 1;
$$;

-- 4. CHECK REFERRER (For Signup)
-- Returns ID only, not full details, to minimize leak
CREATE OR REPLACE FUNCTION check_referrer(p_mobile text)
RETURNS TABLE(id uuid)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM users 
  WHERE mobile = p_mobile
  LIMIT 1;
$$;

-- 5. ADMIN: GET ALL USERS
-- Protected by a hardcoded "App Secret" (Simple protection for this architecture)
-- The UI will send this secret.
CREATE OR REPLACE FUNCTION admin_get_users(p_secret text)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple check: In a real app, use proper Auth. 
  -- Here we block casual API browsing.
  -- The secret 'EARNIFY_ADMIN_SECRET' should be verified against client.
  IF p_secret = 'EARNIFY_ADMIN_SECURED_2026' THEN
    RETURN QUERY SELECT * FROM users ORDER BY created_at DESC;
  ELSE
    RETURN; -- Empty result if wrong secret
  END IF;
END;
$$;

-- 6. ADMIN: GET WITHDRAWALS WITH USER INFO
-- Since we can't JOIN 'users' if Select is disabled, we need a function
-- that runs as "Security Definer" to bypass the restriction.
CREATE OR REPLACE FUNCTION admin_get_withdrawals(p_secret text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount numeric,
  points numeric,
  method text,
  status text,
  created_at timestamptz,
  user_name text,
  user_mobile text, 
  upi_id text,
  account_no text,
  ifsc text,
  account_holder text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_secret = 'EARNIFY_ADMIN_SECURED_2026' THEN
    RETURN QUERY 
    SELECT 
      w.id,
      w.user_id,
      w.amount,
      w.points,
      w.method,
      w.status,
      w.created_at,
      u.name as user_name,
      u.mobile as user_mobile,
      w.upi_id,
      w.account_no,
      w.ifsc,
      w.name as account_holder
    FROM withdrawals w
    LEFT JOIN users u ON w.user_id = u.id
    ORDER BY w.created_at DESC;
  ELSE
    RETURN;
  END IF;
END;
$$;

-- 7. SECURE USER CREATION (Because INSERT might need Select to check duplicate?)
-- Standard INSERT still works if the Policy allows INSERT.
-- Let's check INSERT policy.
-- Usually "Enable RLS" blocks EVERYTHING unless permitted.
CREATE POLICY "Public Insert" ON users FOR INSERT TO anon WITH CHECK (true);

-- 8. GRANT EXECUTE
GRANT EXECUTE ON FUNCTION secure_login TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_id TO anon;
GRANT EXECUTE ON FUNCTION check_referrer TO anon;
GRANT EXECUTE ON FUNCTION admin_get_users TO anon;
GRANT EXECUTE ON FUNCTION admin_get_withdrawals TO anon;
