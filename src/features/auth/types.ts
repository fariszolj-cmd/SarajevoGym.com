export type UserRole = 'user' | 'admin';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
};
