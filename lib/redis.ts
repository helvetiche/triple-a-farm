import { Redis } from "@upstash/redis";

// Lazy initialization of Redis client
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables"
      );
    }

    redisClient = new Redis({
      url,
      token,
    });
  }

  return redisClient;
}

// Export redis getter
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisClient();
    const value = client[prop as keyof Redis];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Cache key prefixes
export const CACHE_KEYS = {
  ROOSTERS: "roosters:all",
  ROOSTER: (id: string) => `rooster:${id}`,
  ROOSTER_STATS: "roosters:stats",
  INVENTORY: (locationId?: string) =>
    locationId ? `inventory:location:${locationId}` : "inventory:all",
  INVENTORY_STATS: (locationId?: string) =>
    locationId ? `inventory:stats:${locationId}` : "inventory:stats:all",
  INVENTORY_ITEM: (id: string) => `inventory:item:${id}`,
  INVENTORY_ACTIVITIES: (limit?: number) =>
    limit ? `inventory:activities:${limit}` : "inventory:activities:all",
  SALES_TRANSACTIONS: "sales:transactions:all",
  SALES_ANALYTICS: "sales:analytics",
  SALES_TRANSACTION: (id: string) => `sales:transaction:${id}`,
  ANALYTICS: (startDate?: Date, endDate?: Date) => {
    const start = startDate?.toISOString().split("T")[0] || "all";
    const end = endDate?.toISOString().split("T")[0] || "all";
    return `analytics:${start}:${end}`;
  },
  REVIEWS: "reviews:all",
  TESTIMONIALS: "reviews:testimonials",
  BREEDS: "breeds:all",
  LOCATIONS: "locations:all",
  SUPPLIERS: "suppliers:all",
  SUPPLIER: (id: string) => `supplier:${id}`,
  DASHBOARD_ACTIVITY: "dashboard:activity",
  AUDIT_LOGS: (params: string) => `audit:logs:${params}`,
  AUDIT_STATS: "audit:stats",
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  FAST: 30, // 30 seconds - frequently changing data
  MEDIUM: 60, // 1 minute - moderate changes
  SLOW: 300, // 5 minutes - rarely changing data
  STATIC: 600, // 10 minutes - static/reference data
} as const;

// Cache helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key);
    return cached;
  } catch (error) {
    console.error(`Redis GET error for key "${key}":`, error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Redis SET error for key "${key}":`, error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key "${key}":`, error);
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Redis pattern invalidation error for "${pattern}":`, error);
  }
}

// Wrapper function for cache-aside pattern
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (fire and forget)
  setCached(key, data, ttl).catch((err) =>
    console.error("Cache set failed:", err)
  );

  return data;
}
