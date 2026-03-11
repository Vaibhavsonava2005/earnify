
import { createClient } from '@supabase/supabase-js';

// Hardcoded for successful build context (User provided)
const supabaseUrl = 'https://iwmbzyafquldfsmcraxb.supabase.co';
const supabaseKey = 'sb_publishable_4UGmmiKVZEuIzBrosLVJFw_huaJOJgX';

export const supabase = createClient(supabaseUrl, supabaseKey);
