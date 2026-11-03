import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/context';
import { getStoredUser, persistUser, signIn as signInUser, signOut as signOutUser } from '@/features/auth/service';
import type { AppUser, UserRole } from '@/features/auth/types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => getStoredUser());

  useEffect(() => {
    persistUser(user);
  }, [user]);

  const signIn = useCallback((role: UserRole) => {
    const nextUser = signInUser(role);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    signOutUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
