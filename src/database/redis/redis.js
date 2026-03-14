import { createClient } from "redis";
import { env } from "../../../config/index.js";
export const client = createClient({
  url: env.redisUrl,
});
client.on("error", function (err) {
  throw err;
});
export const connectRedis = async () => {
  try {
    await client.connect();
    console.log("✅ Redis Connected Successfully");
  } catch (error) {
    console.log("Failed to connect to Redis", error);
  }
};