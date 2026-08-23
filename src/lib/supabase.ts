import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mnbkhenipdqyvdqiaujn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uYmtoZW5pcGRxeXZkcWlhdWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDM2NTEsImV4cCI6MjEwMzA3OTY1MX0.ThABs4HxMQuatS5VdV7WmNXejXUSLfOMglSPRKZlW5E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
