// src/workers/ai.worker.ts
import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { aiClassificationQueue } from "../services/queue.service";
import { classifyCustomerRequest } from "../services/ai/classification.service";
import { QueueName } from "../constants/queues";
import { Redis } from "ioredis";
import { Redis as RedisConnection } from "../lib/redis"; // singleton instance

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
  QueueName.AI_CLASSIFICATION_QUEUE,
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
          predictedCategory: result.predictedCategory,
          confidenceScore: result.confidenceScore,
          suggestedPriority: result.suggestedPriority,
          processingTimeMs: result.processingTimeMs,
        },
      });

      // Update request priority based on AI suggestion (if applicable)
      if (result.suggestedPriority) {
        await prisma.customerRequest.update({
          where: { id: requestId },
          data: { priority: result.suggestedPriority },
        });
      }

      // Mark as completed
      await updateRequestStatus(requestId, "COMPLETED");

      // TODO: Emit RequestEvent (placeholder for future realtime integration)
      // await prisma.requestEvent.create({ ... });
    } catch (error) {
      console.error("AI classification worker failed", error);
      // Mark request as failed
      await updateRequestStatus(requestId, "FAILED");
      // Record failure event placeholder
      // await prisma.requestEvent.create({ ... });
      throw error; // let BullMQ handle retries according to queue options
    }
  },
  {
    connection: RedisConnection, // reuse singleton redis client
    // Worker level options (optional but useful for production)
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
    // Backoff strategy is also defined on the queue side; keep defaults here
  }
);

aiWorker.on("error", (err) => {
  console.error("AI Worker encountered an error:", err);
});

export default aiWorker;
