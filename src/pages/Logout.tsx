import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const clearSupabaseTokens = () => {
  Object.keys(localStorage)
    .filter(k => k.startsWith('sb-'))
    .forEach(k => localStorage.removeItem(k));
};

const Logout = () => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const doLogout = async () => {
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('[Logout] signOut failed:', err);
      }
      // Always clear tokens as belt-and-suspenders
      clearSupabaseTokens();
      window.location.href = '/';
    };

    doLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing out…</p>
    </div>
  );
};

export default Logout;
