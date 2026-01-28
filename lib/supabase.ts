import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

export const createClientWithToken = (token: string) => {
  return createClient(
    supabaseUrl || '',
    supabaseKey || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};
