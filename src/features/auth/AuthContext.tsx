import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/context';
import {
  getAuthenticatedUser,
  getStoredUser,
  persistUser,
  signIn as signInUser,
  signInWithGoogle as startGoogleSignIn,
  signOut as signOutUser,
} from '@/features/auth/service';
import type { AppUser, UserRole } from '@/features/auth/types';
import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => (
    isSupabaseConfigured ? null : getStoredUser()
  ));
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      persistUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;
    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      if (!authUser) {
        setUser(null);
        setAuthError(null);
        return;
      }

      queueMicrotask(() => {
        void getAuthenticatedUser(authUser).then((authenticatedUser) => {
          if (active) {
            setUser(authenticatedUser);
            setAuthError(null);
          }
        }).catch((error: unknown) => {
          if (active) {
            setUser(null);
            setAuthError(error instanceof Error ? error.message : 'Could not load your account.');
          }
        });
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);

    try {
      await startGoogleSignIn();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in could not be started.');
    }
  }, []);

  const signIn = useCallback((role: UserRole) => {
    const nextUser = signInUser(role);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) {
        setAuthError(`Could not sign out: ${error.message}`);
        return;
      }
      setAuthError(null);
      setUser(null);
      return;
    }

    setUser(null);
    signOutUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authError,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      signInWithGoogle,
      signIn,
      signOut,
    }),
    [user, authError, signInWithGoogle, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
