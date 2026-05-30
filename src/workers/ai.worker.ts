// src/workers/ai.worker.ts
import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { aiClassificationQueue } from "../services/queue.service";
import { classifyCustomerRequest } from "../services/ai/classification.service";
import { broadcastAdminNotificationsUpdated } from "@/services/realtime.service";
import { QUEUE_NAMES } from "../constants/queues";
import { getRedisClient } from "../lib/redis";

// Types for job data
export interface AIClassificationJobData {
  requestId: string; // UUID of CustomerRequest
  title: string;
  description: string;
}

// Helper to update request processing status
async function updateRequestStatus(requestId: string, status: "PROCESSING" | "COMPLETED" | "FAILED") {
  await prisma.customerRequest.update({
    where: { id: requestId },
    data: { aiProcessingStatus: status },
  });
}

// Main worker
const aiWorker = new Worker<AIClassificationJobData>(
  QUEUE_NAMES.AI_CLASSIFICATION_QUEUE,
  async (job: Job<AIClassificationJobData>) => {
    const { requestId, title, description } = job.data;

    // Mark as processing
    await updateRequestStatus(requestId, "PROCESSING");

    try {
      // Run mock classification (could be replaced by real provider later)
      const result = await classifyCustomerRequest({ title, description });

      // Create AIClassification record linked to request
      await prisma.aIClassification.create({
        data: {
          requestId,
          label: result.predictedCategory.toUpperCase() as any,
          confidence: result.confidenceScore,
          reasoning: null,
          modelVersion: 'mock-v1',
          rawResponse: result as unknown as object,
        },
      });

      // Update request priority based on AI suggestion (if applicable)
      if (result.suggestedPriority) {
        await prisma.customerRequest.update({
          where: { id: requestId },
          data: { priority: result.suggestedPriority as any },
        });
      }

      // Mark as completed
      await updateRequestStatus(requestId, "COMPLETED");
      void broadcastAdminNotificationsUpdated({
        action: 'AI_COMPLETED',
        requestId,
      });

      // TODO: Emit RequestEvent (placeholder for future realtime integration)
      // await prisma.requestEvent.create({ ... });
    } catch (error) {
      console.error("AI classification worker failed", error);
      // Mark request as failed
      await updateRequestStatus(requestId, "FAILED");
      void broadcastAdminNotificationsUpdated({
        action: 'AI_FAILED',
        requestId,
      });
      // Record failure event placeholder
      // await prisma.requestEvent.create({ ... });
      throw error; // let BullMQ handle retries according to queue options
    }
  },
  {
    connection: getRedisClient() as unknown as any, // reuse singleton redis client (cast to avoid ioredis typing mismatch)
    // Worker level options (optional but useful for production)
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
    // Backoff strategy is also defined on the queue side; keep defaults here
  }
);

aiWorker.on("error", (err) => {
  console.error("AI Worker encountered an error:", err);
});

export default aiWorker;
