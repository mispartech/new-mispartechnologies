import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://sdyichnqroitptxloyyl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWljaG5xcm9pdHB0eGxveXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTA4NzEsImV4cCI6MjA4NDc2Njg3MX0.80fVjpUbKjHH0Z-pp5o0PIh9djXDW8AQt_sDx-EHJlw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
