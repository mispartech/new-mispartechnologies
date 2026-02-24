import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useDjangoAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error('[Logout] Error during sign out:', err);
      } finally {
        // Always redirect, even if logout threw
        window.location.href = '/';
      }
    };

    doLogout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing out…</p>
    </div>
  );
};

export default Logout;
