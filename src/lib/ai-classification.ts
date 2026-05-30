import { classifyRequestText, type Department } from '@/lib/departments';

export interface AiClassificationResult {
  aiCategory: Department;
  aiConfidence: number;
}

/**
 * Simulated AI classification from title + description (no backend API).
 */
export function classifyRequestWithAI(
  title: string,
  description: string
): AiClassificationResult {
  const aiCategory = classifyRequestText(title, description);
  const text = `${title} ${description}`.toLowerCase();

  let aiConfidence = 72;

  const strongPatterns: Array<{ pattern: RegExp; department: Department; confidence: number }> = [
    { pattern: /unable to login|invalid password|login issue|cannot log in/, department: 'Technical Support', confidence: 94 },
    { pattern: /website error|page not loading|bug|crash|500 error/, department: 'Technical Support', confidence: 91 },
    { pattern: /payment failed|billing|invoice|charge|subscription/, department: 'Billing', confidence: 93 },
    { pattern: /refund|money back/, department: 'Billing', confidence: 90 },
    { pattern: /account locked|locked out|access denied/, department: 'Account Management', confidence: 92 },
    { pattern: /general question|how do i|information about/, department: 'General Support', confidence: 85 },
  ];

  for (const { pattern, department, confidence } of strongPatterns) {
    if (pattern.test(text) && department === aiCategory) {
      aiConfidence = confidence;
      break;
    }
  }

  if (aiConfidence === 72) {
    aiConfidence = Math.min(88, 68 + Math.min(text.length, 40));
  }

  return { aiCategory, aiConfidence };
}
