import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useDjangoAuth();

  useEffect(() => {
    logout().then(() => navigate('/', { replace: true }));
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing out…</p>
    </div>
  );
};

export default Logout;
