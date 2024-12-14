import { createClient } from '@supabase/supabase-js'
import { logger } from './debugConfig'

const supabaseUrl = 'https://' + import.meta.env.VITE_SITE_URL + '/supabase';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('supabase-client', '❌ Missing Supabase configuration', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  }
});

// Log configuration in development
if (import.meta.env.DEV) {
  logger.debug('supabase-client', '🔄 Supabase client initialized', {
    url: supabaseUrl
  });
}