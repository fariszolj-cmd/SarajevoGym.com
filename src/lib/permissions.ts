import type { AppUser, UserRole } from '@/features/auth/types';

export type Permission = 'gym:read' | 'gym:write' | 'admin:manage';

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  user: ['gym:read'],
  admin: ['gym:read', 'gym:write', 'admin:manage'],
};

export function canAccess(user: AppUser | null, permission: Permission): boolean {
  if (!user) {
    return false;
  }

  return rolePermissions[user.role].includes(permission);
}

export function isAdmin(user: AppUser | null): boolean {
  return user?.role === 'admin';
}
