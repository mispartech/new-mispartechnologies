import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vbakqmbnkhzpzmwbcczz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWtxbWJua2h6cHptd2JjY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTk2MDUsImV4cCI6MjA3ODg5NTYwNX0.tDRU2IYzmeoI1LIXV5UAd6gYH8ET4D6fx2WGkZrWIDM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
