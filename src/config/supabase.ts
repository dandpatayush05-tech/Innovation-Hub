import { createClient } from '@supabase/supabase-js';

// Fallback to dummy values for local development if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ybudianbjwedmreyhgrp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidWRpYW5iandlZG1yZXloZ3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDU2MDIsImV4cCI6MjEwNDYyMTYwMn0.dummy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
