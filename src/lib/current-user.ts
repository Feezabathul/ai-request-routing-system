import { UserRole } from '@/lib/role';

export const CURRENT_USER_KEY = 'currentUser';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  status?: string | null;
  avatar?: string;
}

export function setCurrentUser(user: CurrentUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentUser;
    if (!parsed.id || !parsed.email || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

/** Filter requests for role-based views */
export function filterRequestsForRole<T extends {
  createdById?: string;
  createdByEmail?: string;
  customerEmail?: string;
  assignedAgentId?: string;
}>(requests: T[], role: UserRole, options?: { agentId?: string; userId?: string; userEmail?: string }): T[] {
  if (role === 'ADMIN' || role === 'MANAGER') return requests;
  if (role === 'AGENT' && options?.agentId) {
    return requests.filter((r) => r.assignedAgentId === options.agentId);
  }
  return requests;
}

export function getRequestCreator(request: {
  createdById?: string;
  createdByName?: string;
  createdByEmail?: string;
  customerName?: string;
  customerEmail?: string;
}): { id: string; name: string; email: string } {
  return {
    id: request.createdById ?? '',
    name: request.createdByName ?? request.customerName ?? 'Unknown',
    email: request.createdByEmail ?? request.customerEmail ?? '',
  };
}
