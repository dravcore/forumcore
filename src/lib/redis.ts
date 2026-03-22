import Redis from 'ioredis'
import { env } from '@/env'

const globalForRedis = globalThis as unknown as { redis?: Redis }

function createRedisClient() {
  const client = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 })
  client.on('error', () => {}) // silent — Redis is non-critical
  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key)
    return val ? (JSON.parse(val) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch {
    // non-fatal
  }
}
