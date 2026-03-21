type RateLimitEntry = { count: number; resetAt: number }

// In-memory store — works on single-instance Coolify deployments
const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Returns true if the action is allowed, false if rate limited.
 * @param key   unique key, e.g. `post:userId`
 * @param limit max requests in the window
 * @param windowMs window duration in ms
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
