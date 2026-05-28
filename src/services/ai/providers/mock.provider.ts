// src/services/ai/providers/mock.provider.ts

import { AIProvider, ClassificationResult } from '@/services/ai/providers/provider.interface';

/**
 * Deterministic mock AI classification provider.
 *
 * - Simulates a 1‑2 second processing delay.
 * - Uses simple keyword heuristics to assign category, priority and confidence.
 * - Guarantees the same input always yields the same output (pure function).
 */
export class MockAIProvider implements AIProvider {
  async classifyRequest(payload: {
    title: string;
    description: string;
  }): Promise<ClassificationResult> {
    const start = Date.now();

    // Simulated processing latency (1‑2 seconds).
    const delay = 1000 + Math.floor(Math.random() * 1000);
    await new Promise((res) => setTimeout(res, delay));

    const { title, description } = payload;
    const text = `${title} ${description}`.toLowerCase();

    // Simple deterministic keyword based classification.
    let predictedCategory = 'General';
    if (text.includes('bill') || text.includes('invoice') || text.includes('payment')) {
      predictedCategory = 'Billing';
    } else if (text.includes('error') || text.includes('bug') || text.includes('crash') || text.includes('tech')) {
      predictedCategory = 'Technical';
    } else if (text.includes('account') || text.includes('login')) {
      predictedCategory = 'Account';
    }

    let suggestedPriority = 'MEDIUM';
    if (text.includes('urgent') || text.includes('asap') || text.includes('high priority')) {
      suggestedPriority = 'URGENT';
    } else if (text.includes('high')) {
      suggestedPriority = 'HIGH';
    } else if (text.includes('low')) {
      suggestedPriority = 'LOW';
    }

    // Confidence is higher for clearer keyword matches.
    const confidenceScore = predictedCategory !== 'General' ? 0.95 : 0.78;

    const processingTimeMs = Date.now() - start;

    const result: ClassificationResult = {
      predictedCategory,
      confidenceScore,
      suggestedPriority,
      processingTimeMs,
    };

    return result;
  }
}
