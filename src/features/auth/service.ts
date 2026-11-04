import type { AppUser, UserRole } from './types';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/env';

const STORAGE_KEY = 'sarajevogym-auth-user';

export const demoUsers: Record<UserRole, AppUser> = {
  user: {
    id: 'user-1',
    email: 'member@sarajevogym.com',
    name: 'Sarajevo Member',
    role: 'user',
    isAuthenticated: true,
  },
  admin: {
    id: 'admin-1',
    email: 'admin@sarajevogym.com',
    name: 'Gym Admin',
    role: 'admin',
    isAuthenticated: true,
  },
};

export function getStoredUser(): AppUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw) as AppUser;
    return user && user.email ? user : null;
  } catch {
    return null;
  }
}

export function persistUser(user: AppUser | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function signIn(role: UserRole): AppUser {
  const nextUser = demoUsers[role];
  persistUser(nextUser);
  return nextUser;
}

export function signOut(): void {
  persistUser(null);
}

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Google sign-in is not configured for this app yet.');
  }

  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw error;
  }
}

export async function getAuthenticatedUser(authUser: User): Promise<AppUser> {
  const { data: profile, error } = await getSupabaseClient()
    .from('profiles')
    .select('display_name, role')
    .eq('id', authUser.id)
    .single();

  if (error) {
    throw new Error(`Could not load your account profile: ${error.message}`);
  }

  if (profile.role !== 'user' && profile.role !== 'admin') {
    throw new Error('Your account has an unsupported role. Contact the site administrator.');
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: profile.display_name || authUser.user_metadata.name || authUser.email || 'SarajevoGym member',
    role: profile.role,
    isAuthenticated: true,
  };
}
