import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/config/env';

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

export const createClientWithToken = (token: string) => {
  return createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};
