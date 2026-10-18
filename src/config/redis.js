import Redis from "ioredis";

let redisInstance = null;
let isRedisReady = false;

/**
 * Returns active Redis client if connected and ready.
 * Returns null if Redis is disabled, unreachable, or disconnected,
 * allowing instant fallback to MongoDB without blocking requests.
 */
export const getRedisClient = () => {
  if (!process.env.REDIS_URL || process.env.REDIS_URL.trim() === "") {
    return null;
  }

  if (!redisInstance) {
    try {
      redisInstance = new Redis(process.env.REDIS_URL, {
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false, // Don't hang requests if disconnected
        retryStrategy: (times) => {
          if (times > 3) {
            isRedisReady = false;
            return null; // Stop retrying if host unreachable
          }
          return Math.min(times * 1000, 3000);
        },
      });

      redisInstance.on("ready", () => {
        isRedisReady = true;
        console.log("Redis connected and ready ⚡");
      });

      redisInstance.on("error", (err) => {
        isRedisReady = false;
        console.warn("Redis unavailable, using direct DB queries:", err.message);
      });

      redisInstance.on("close", () => {
        isRedisReady = false;
      });

      redisInstance.on("end", () => {
        isRedisReady = false;
      });
    } catch (error) {
      isRedisReady = false;
      console.error("Failed to initialize Redis client:", error.message);
      return null;
    }
  }

  return isRedisReady ? redisInstance : null;
};

export default getRedisClient;

