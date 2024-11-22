import { createClient } from "redis";

const redis = createClient();

(async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
      console.log("Redis connected successfully");
    }
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

export default redis;
