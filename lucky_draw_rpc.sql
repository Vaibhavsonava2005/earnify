-- Secure Lucky Draw Entry Function
-- This handles everything in one atomic step (Check Balance -> Deduct -> Enter).

CREATE OR REPLACE FUNCTION enter_lucky_draw(
  p_user_id UUID,
  p_draw_id UUID,
  p_entry_fee NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_balance NUMERIC;
  v_exists BOOLEAN;
BEGIN
  -- 1. Check if already entered
  SELECT EXISTS (
    SELECT 1 FROM user_apps WHERE user_id = p_user_id AND app_id = p_draw_id
  ) INTO v_exists;

  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already entered');
  END IF;

  -- 2. Check Balance (and Lock User Row)
  SELECT balance INTO v_balance FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_entry_fee THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient Balance');
  END IF;

  -- 3. Deduct Balance
  UPDATE users 
  SET balance = balance - p_entry_fee 
  WHERE id = p_user_id;

  -- 4. Record Entry
  INSERT INTO user_apps (user_id, app_id, status)
  VALUES (p_user_id, p_draw_id, 'PARTICIPATED');

  -- 5. Log Transaction
  INSERT INTO transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_entry_fee, 'LUCKY_DRAW_ENTRY', 'Entry Fee for Lucky Draw');

  RETURN jsonb_build_object('success', true, 'message', 'Entry successful');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
