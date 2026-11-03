import { createContext } from 'react';
import type { AppUser, UserRole } from '@/features/auth/types';

export type AuthContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (role: UserRole) => AppUser;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
