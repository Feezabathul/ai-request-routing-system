// src/services/ai/classification.service.ts

import { AIProvider, ClassificationResult } from '@/services/ai/providers/provider.interface';
import { MockAIProvider } from '@/services/ai/providers/mock.provider';

/**
 * Central classification service.
 *
 * By default it uses the `MockAIProvider`, but a different implementation can be
 * supplied (e.g. a real LLM API client) by passing it to `classifyCustomerRequest`.
 */
export class ClassificationService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    // If no provider is supplied, fall back to the deterministic mock.
    this.provider = provider ?? new MockAIProvider();
  }

  /**
   * Classify a customer request.
   *
   * @param payload - Request title and description.
   * @returns ClassificationResult on success.
   * @throws Error if the underlying provider fails.
   */
  async classify(payload: {
    title: string;
    description: string;
  }): Promise<ClassificationResult> {
    try {
      const result = await this.provider.classifyRequest(payload);
      return result;
    } catch (err) {
      // Wrap and re‑throw with a clear message for upstream handling.
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`AI classification failed: ${message}`);
    }
  }
}

/**
 * Convenience helper used throughout the application.
 * Creates a service with the default provider and forwards the call.
 */
export async function classifyCustomerRequest(params: {
  title: string;
  description: string;
}): Promise<ClassificationResult> {
  const service = new ClassificationService();
  return service.classify(params);
}
