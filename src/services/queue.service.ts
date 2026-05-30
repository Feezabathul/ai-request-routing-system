import { Queue, Job, QueueOptions, JobsOptions } from 'bullmq';
import { getRedisClient } from '@/lib/redis';
import { QUEUE_NAMES } from '@/constants/queues';

/**
 * Base configuration shared by all queues.
 *   - `defaultJobOptions` defines retry, back‑off, and clean‑up policies.
 *   - `connection` re‑uses the singleton Redis instance.
 */
const baseOptions: QueueOptions = {
  connection: getRedisClient() as unknown as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential', // exponential back‑off – 500ms, 1s, 2s, 4s, …
      delay: 500,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

/** BullMQ Queue instance for AI classification jobs. */
export const aiClassificationQueue = new Queue(QUEUE_NAMES.AI_CLASSIFICATION_QUEUE, baseOptions);

/**
 * Add a new AI classification job to the queue.
 *
 * @param requestId   - UUID of the CustomerRequest created earlier.
 * @param title       - Human readable title of the request (used by the mock AI).
 * @param description - Full description text.
 * @returns          - The BullMQ Job instance (useful for testing / tracking).
 */
export async function addAIClassificationJob(params: {
  requestId: string;
  title: string;
  description: string;
}): Promise<Job<any, any, string>> {
  const { requestId, title, description } = params;

  const jobOpts: JobsOptions = {
    // Override retry/back‑off only if needed – we rely on baseOptions.
    // `jobId` guarantees idempotency: the same requestId cannot be queued twice.
    jobId: `classify-${requestId}`,
  };

  return aiClassificationQueue.add('classify', { requestId, title, description }, jobOpts);
}

/** Utility export – useful for future workers. */
export const queues = {
  aiClassificationQueue,
};
