// src/services/ai/providers/provider.interface.ts

/**
 * Interface that all AI classification providers must implement.
 *
 * The `classifyRequest` method receives a request title and description
 * and returns a classification result. Implementations can be a mock,
 * a third‑party API client, or any custom model.
 */
export interface AIProvider {
  /**
   * Classify a customer request.
   * @param payload - Object containing the request title and description.
   * @returns Classification result with category, confidence, priority and the
   *          simulated processing time in milliseconds.
   */
  classifyRequest(payload: {
    title: string;
    description: string;
  }): Promise<ClassificationResult>;
}

/**
 * Shape of the classification result returned by any provider.
 */
export interface ClassificationResult {
  /** Predicted category (e.g., "Billing", "Technical", "General"). */
  predictedCategory: string;
  /** Confidence score between 0 and 1.
   * Higher means the provider is more certain about its prediction.
   */
  confidenceScore: number;
  /** Suggested priority level for handling the request.
   * Typical values: "LOW", "MEDIUM", "HIGH", "URGENT".
   */
  suggestedPriority: string;
  /** Duration the provider spent processing (ms). */
  processingTimeMs: number;
}
