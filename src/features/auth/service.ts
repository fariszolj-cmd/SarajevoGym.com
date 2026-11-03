import type { AppUser, UserRole } from './types';

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
