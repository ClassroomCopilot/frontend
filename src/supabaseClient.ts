import { createClient } from '@supabase/supabase-js'
import { logger } from './debugConfig'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
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
if (import.meta.env.VITE_DEV === 'true') {
  logger.debug('supabase-client', '🔄 Supabase client initialized', {
    url: supabaseUrl,
    anonKey: supabaseAnonKey
  });
}