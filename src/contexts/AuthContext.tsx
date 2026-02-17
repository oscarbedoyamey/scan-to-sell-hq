import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBackedUpTokens } from '@/lib/sessionBackup';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!roleData);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listener for ONGOING auth changes (does NOT control isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer DB calls to avoid deadlock with auth state change
          setTimeout(() => {
            if (!mounted) return;
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // INITIAL load (controls isLoading)
    // Hard safety timeout so the spinner NEVER hangs forever,
    // even if getSession() hangs (e.g. after Stripe redirect).
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('Auth safety timeout reached — clearing loading state');
        setIsLoading(false);
      }
    }, 3000);

    const initializeAuth = async () => {
      try {
        // Check for backed-up tokens from before Stripe redirect
        const backedUpTokens = getBackedUpTokens();

        if (backedUpTokens) {
          console.log('[Auth] Found backed-up tokens, restoring session via setSession');
          const { error } = await supabase.auth.setSession({
            access_token: backedUpTokens.access_token,
            refresh_token: backedUpTokens.refresh_token,
          });
          if (error) {
            console.error('[Auth] Failed to restore session from backup:', error.message);
          } else {
            console.log('[Auth] Session successfully restored from backup');
          }
        } else {
          try {
            await Promise.race([
              supabase.auth.getSession(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('getSession timeout')), 2500)),
            ]);
          } catch (timeoutErr) {
            console.warn('[Auth] getSession timed out, attempting refreshSession…');
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('[Auth] refreshSession failed, signing out:', refreshError.message);
              await supabase.auth.signOut();
            } else {
              console.log('[Auth] Session refreshed successfully after timeout');
            }
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
            clearTimeout(safetyTimer);
          }
        }, 200);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isAdmin, isLoading, signInWithMagicLink, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
