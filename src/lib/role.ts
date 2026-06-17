// Roles match the Prisma UserRole enum: AGENT | MANAGER | ADMIN
// CUSTOMER does not exist in the database — it is not a DB role.
export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'USER';
export const ROLE_STORAGE_KEY = 'userRole';
export const DEFAULT_USER_ROLE: UserRole = 'USER';

const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'AGENT', 'USER'];

export const getUserRole = (): UserRole => {
  if (typeof window === 'undefined') return DEFAULT_USER_ROLE;
  const role = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return validRoles.includes(role as UserRole) ? (role as UserRole) : DEFAULT_USER_ROLE;
};

export const setUserRole = (role: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
};

// Both ADMIN and MANAGER can access admin pages
export const isAdminRole = (role: UserRole) => role === 'ADMIN' || role === 'MANAGER';
