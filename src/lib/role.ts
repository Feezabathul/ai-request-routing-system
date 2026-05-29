export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';
export const ROLE_STORAGE_KEY = 'userRole';
export const DEFAULT_USER_ROLE: UserRole = 'CUSTOMER';

const validRoles: UserRole[] = ['ADMIN', 'AGENT', 'CUSTOMER'];

export const getUserRole = (): UserRole => {
  if (typeof window === 'undefined') return DEFAULT_USER_ROLE;
  const role = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return validRoles.includes(role as UserRole) ? (role as UserRole) : DEFAULT_USER_ROLE;
};

export const setUserRole = (role: UserRole) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
};

export const isAdminRole = (role: UserRole) => role === 'ADMIN';
