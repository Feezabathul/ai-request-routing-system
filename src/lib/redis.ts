import IORedis from 'ioredis';

/**
 * Redis singleton connection.
 *
 * Reads the connection string from the `REDIS_URL` environment variable.
 * In production this should point to a managed Redis instance (e.g. Upstash).
 * If the variable is missing, an error is thrown so the app fails fast –
 * this prevents accidental connections to a default localhost instance in CI.
 */
let redisInstance: IORedis | null = null;

export function getRedisClient(): IORedis {
  if (redisInstance) return redisInstance;

  const url = process.env.REDIS_URL;
  if (!url) {
    // Throw early – the app cannot function without Redis in production.
    throw new Error('Missing REDIS_URL environment variable. Please set it in .env.');
  }

  // ioredis automatically parses the URL (including password, TLS, etc.)
  redisInstance = new IORedis(url, {
    // Enable auto-reconnect and exponential back‑off for resiliency.
    retryStrategy: (times) => Math.min(times * 2000, 30000),
    // Optional: enable TLS when the URL scheme is rediss://
    tls: url.startsWith('rediss://') ? {} : undefined,
  });

  // Optional: add a simple connection test to surface errors early.
  redisInstance.on('error', (err) => {
    console.error('🚨 Redis connection error:', err);
  });

  return redisInstance;
}

export default getRedisClient();
