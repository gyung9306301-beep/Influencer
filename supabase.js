import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://yxudkqvhfrpclicoqjco.supabase.co';
const supabaseAnonKey = 'sb_publishable__GO2bReJm9Yt5zfW0i2fkw_YCAKZM8y';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your credentials.');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
