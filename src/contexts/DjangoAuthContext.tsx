import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { djangoApi } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization_id: string;
  department_id?: string;
  face_image_url?: string;
  phone_number?: string;
  gender?: string;
  is_onboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    gender?: string;
    invite_token?: string;
  }) => Promise<{ error?: string; user?: User }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DjangoAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initDone = useRef(false);

  const fetchProfile = useCallback(async (): Promise<User | null> => {
    try {
      console.log('[DjangoAuth] Fetching profile from Django...');
      const { data, error, status } = await djangoApi.getProfile({ silent: true });
      console.log('[DjangoAuth] Profile response:', { status, error, hasData: !!data });
      if (data && !error) {
        return data as User;
      }
      console.warn('[DjangoAuth] Failed to fetch profile:', error, 'status:', status);
      return null;
    } catch (err) {
      console.error('[DjangoAuth] Profile fetch threw:', err);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUser(null);
      return;
    }
    const profile = await fetchProfile();
    setUser(profile);
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          const profile = await fetchProfile();
          if (mounted) setUser(profile);
        }
      } catch (err) {
        console.error('[DjangoAuth] Initialize error:', err);
      } finally {
        if (mounted) {
          initDone.current = true;
          setIsLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('[DjangoAuth] Auth state change:', event);

      // Skip INITIAL_SESSION — initialize() already handles it
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        // Only fetch profile if initialize already completed (i.e. this is a real new login)
        if (initDone.current) {
          try {
            const profile = await fetchProfile();
            if (mounted) setUser(profile);
          } catch (err) {
            console.error('[DjangoAuth] Profile fetch after sign-in failed:', err);
            if (mounted) setUser(null);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
      }
      // TOKEN_REFRESHED — no action needed
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    console.log('[DjangoAuth] Login attempt for:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[DjangoAuth] Supabase login error:', error.message);
      return { error: error.message };
    }
    console.log('[DjangoAuth] Supabase login successful, fetching profile...');
    
    // Eagerly fetch profile here instead of waiting for onAuthStateChange race
    const profile = await fetchProfile();
    if (profile) {
      setUser(profile);
      return {};
    }
    
    // Profile fetch failed — backend is likely down
    console.error('[DjangoAuth] Profile fetch failed after login');
    return { error: 'Login succeeded but the server is temporarily unavailable. Please try again in a moment.' };
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('[DjangoAuth] signOut error, clearing manually:', err);
      const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
      keys.forEach(k => localStorage.removeItem(k));
    }
    setUser(null);
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    gender?: string;
    invite_token?: string;
  }) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { first_name: data.first_name, last_name: data.last_name },
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    if (!signUpData?.user) {
      return { error: 'No user returned from signup.' };
    }

    return {};
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useDjangoAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useDjangoAuth must be used within a DjangoAuthProvider');
  }
  return context;
};
