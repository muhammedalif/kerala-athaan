import { createClient } from '@supabase/supabase-js';

// Adheres to Rule 7: No secrets in the client.
// Variables are read strictly from environment flags at build/runtime.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
