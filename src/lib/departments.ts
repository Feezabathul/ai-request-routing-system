export const DEPARTMENTS = [
  'Technical Support',
  'Billing',
  'Account Management',
  'General Support',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export interface RequestLike {
  category: string;
  title?: string;
  description?: string;
}

/** Map request category / AI classification text to a support department. */
export function inferDepartmentFromRequest(request: RequestLike): Department {
  if (DEPARTMENTS.includes(request.category as Department)) {
    return request.category as Department;
  }

  const text = `${request.category} ${request.title ?? ''} ${request.description ?? ''}`.toLowerCase();

  if (/(payment|billing|invoice|refund|charge|paid|failed payment|subscription)/.test(text)) {
    return 'Billing';
  }

  if (/(account locked|locked account|account|profile|access denied|credentials)/.test(text)) {
    return 'Account Management';
  }

  if (/(login|website|error|bug|technical|support|password|portal|crash|api|down)/.test(text)) {
    return 'Technical Support';
  }

  if (/(general question|inquiry|information|how to|help)/.test(text)) {
    return 'General Support';
  }

  return 'General Support';
}

export function classifyRequestText(title: string, description: string): Department {
  return inferDepartmentFromRequest({ category: '', title, description });
}
