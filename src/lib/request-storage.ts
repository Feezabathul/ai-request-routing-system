import { Department } from '@/lib/departments';

export const REQUESTS_STORAGE_KEY = 'requests';

export type RequestStatus = 'Pending' | 'In Progress' | 'AI Processing' | 'Resolved' | 'Closed';
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface StoredRequest {
  id: string;
  title: string;
  createdById: string;
  createdByName: string;
  createdByEmail: string;
  /** @deprecated Use createdByName — kept for older saved requests */
  customerName: string;
  /** @deprecated Use createdByEmail */
  customerEmail: string;
  description?: string;
  /** Legacy / display — mirrors aiCategory when set by AI */
  category: string;
  aiCategory?: Department;
  aiConfidence?: number;
  priority: RequestPriority;
  status: RequestStatus;
  assignedAgent?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentDepartment?: Department;
  assignedAt?: string;
  createdAt: string;
}

export function getRequests(): StoredRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRequests(requests: StoredRequest[]): void {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-notifications-updated'));
  }
}

export function getRequestById(id: string): StoredRequest | null {
  return getRequests().find((request) => request.id === id) ?? null;
}

export function updateRequest(
  id: string,
  updates: Partial<StoredRequest>
): StoredRequest | null {
  const requests = getRequests();
  const index = requests.findIndex((request) => request.id === id);
  if (index === -1) return null;

  const updated = { ...requests[index], ...updates };
  requests[index] = updated;
  saveRequests(requests);
  return updated;
}

export function assignAgentToRequest(
  requestId: string,
  agent: { id: string; name: string; department: Department }
): StoredRequest | null {
  return updateRequest(requestId, {
    assignedAgentId: agent.id,
    assignedAgentName: agent.name,
    assignedAgent: agent.name,
    assignedAgentDepartment: agent.department,
    assignedAt: new Date().toISOString().slice(0, 10),
  });
}
