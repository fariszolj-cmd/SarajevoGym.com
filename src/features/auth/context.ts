import { createContext } from 'react';
import type { AppUser, UserRole } from '@/features/auth/types';

export type AuthContextValue = {
  user: AppUser | null;
  authError: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (role: UserRole) => AppUser;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
