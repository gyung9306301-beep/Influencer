import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://yxudkqvhfrpclicoqjco.supabase.co';
const supabaseAnonKey = '여기에_anon_publishable_key_sb_publishable__GO2bReJm9Yt5zfW0i2fkw_YCAKZM8y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
