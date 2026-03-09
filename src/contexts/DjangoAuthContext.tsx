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
  organization_name?: string;
  organization_type?: string;
  organization_size_range?: string;
  organization_branding?: Record<string, any>;
  department?: string;
  department_id?: string;
  face_image_url?: string;
  face_enrolled?: boolean;
  phone_number?: string;
  gender?: string;
  is_onboarded?: boolean;
  job_title?: string;
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
  overrideEnrollmentStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DjangoAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initDone = useRef(false);

  // Client-side override for when backend profile is stale about enrollment
  const overrideEnrollmentStatus = useCallback(() => {
    setUser(prev => prev ? { ...prev, face_enrolled: true } : prev);
  }, []);

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
    let lastAccessToken: string | null = null;

    const handleSession = async (session: any) => {
      if (!session) {
        if (mounted) setUser(null);
        return;
      }
      const token = session.access_token;
      if (token && token === lastAccessToken) {
        console.log('[DjangoAuth] Skipping duplicate session handling');
        return;
      }
      lastAccessToken = token;

      try {
        const profile = await fetchProfile();
        if (mounted) setUser(profile);
      } catch (err) {
        console.error('[DjangoAuth] Profile fetch failed:', err);
        if (mounted) setUser(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      console.log('[DjangoAuth] Auth state change:', event, !!session);

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        handleSession(session).finally(() => {
          if (!initDone.current && mounted) {
            initDone.current = true;
            setIsLoading(false);
          }
        });
      } else if (event === 'SIGNED_OUT') {
        lastAccessToken = null;
        if (mounted) setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        lastAccessToken = session.access_token;
      }
    });

    const fallbackTimer = setTimeout(() => {
      if (mounted && !initDone.current) {
        console.warn('[DjangoAuth] Fallback: resolving loading state');
        initDone.current = true;
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
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
    
    const profile = await fetchProfile();
    if (profile) {
      setUser(profile);
      return {};
    }
    
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
    overrideEnrollmentStatus,
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
