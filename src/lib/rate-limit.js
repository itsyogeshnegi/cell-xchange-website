import { connectDB } from "@/lib/db";
import RateLimit from "@/models/RateLimit";

const memoryStore = global.mobileHubRateLimits || new Map();
global.mobileHubRateLimits = memoryStore;

function clientIdentifier(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "anonymous";
}

function memoryIncrement(key, expiresAt) {
  const now = Date.now();
  const current = memoryStore.get(key);
  const entry = current?.expiresAt > now ? current : { count: 0, expiresAt };
  entry.count += 1;
  memoryStore.set(key, entry);
  if (memoryStore.size > 2000) {
    for (const [storedKey, value] of memoryStore) if (value.expiresAt <= now) memoryStore.delete(storedKey);
  }
  return entry.count;
}

export async function enforceRateLimit(request, { scope, limit = 60, windowMs = 60_000 }) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = `${scope}:${clientIdentifier(request)}:${bucket}`;
  const expiresAt = new Date((bucket + 1) * windowMs);
  let count;

  if (process.env.MONGODB_URI) {
    await connectDB();
    const entry = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).select("count").lean().maxTimeMS(3000);
    count = entry.count;
  } else {
    count = memoryIncrement(key, expiresAt.getTime());
  }

  if (count > limit) {
    const error = new Error("Too many requests. Please try again shortly.");
    error.status = 429;
    error.retryAfter = Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000));
    throw error;
  }

  return { limit, remaining: Math.max(0, limit - count), reset: expiresAt.getTime() };
}
