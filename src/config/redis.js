import Redis from "ioredis";

let redisInstance = null;

export const getRedisClient = () => {
  if (!redisInstance && process.env.REDIS_URL) {
    try {
      redisInstance = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000, // Time out after 5 seconds if connection fails
        lazyConnect: true, // Don't connect until first command
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 3000);
          return delay;
        }
      });
      
      redisInstance.on("error", (err) => {
        console.warn("Redis Error: ", err.message);
      });
      
      console.log("Redis client initialized (lazy-loading enabled) ⚡");
    } catch (error) {
      console.error("Failed to initialize Redis client:", error.message);
      return null;
    }
  }
  return redisInstance;
};

export default getRedisClient;
