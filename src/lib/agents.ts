import { Department } from '@/lib/departments';

export const AGENTS_STORAGE_KEY = 'agents';
export const CURRENT_AGENT_KEY = 'currentAgent';

export interface StoredAgent {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'AGENT';
  status: 'ACTIVE' | 'INACTIVE';
  department: Department;
  createdAt: string;
  avatar?: string;
  assignedRequests?: number;
}

export function getAgents(): StoredAgent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAgents(agents: StoredAgent[]): void {
  localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
}

export function getActiveAgentsByDepartment(department: Department): StoredAgent[] {
  return getAgents().filter(
    (agent) => agent.department === department && agent.status === 'ACTIVE'
  );
}

export function getCurrentAgent(): StoredAgent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_AGENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAgent;
  } catch {
    return null;
  }
}

export function findAgentByCredentials(
  email: string,
  password: string
): StoredAgent | null {
  const normalized = email.trim().toLowerCase();
  return (
    getAgents().find(
      (agent) =>
        agent.email.toLowerCase() === normalized &&
        agent.password === password &&
        agent.status === 'ACTIVE'
    ) ?? null
  );
}
