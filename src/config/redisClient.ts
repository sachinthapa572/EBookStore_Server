import Redis from "ioredis";

const redisURl =
  process.env.REDIS_URL ||
  "rediss://default:AVNS_Rp1bNGp12wWllIfkkpG@redisfy-tiehie16-ccf6.e.aivencloud.com:12748";
const redis = new Redis(redisURl);

redis.on("connect", () => {
  console.log("Redis connected");
});
redis.on("error", (err) => {
  console.log("Redis error", err);
});

export default redis;
