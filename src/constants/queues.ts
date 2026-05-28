export const QUEUE_NAMES = {
  AI_CLASSIFICATION_QUEUE: "ai_classification_queue",
} as const;

export type QueueName = keyof typeof QUEUE_NAMES;
