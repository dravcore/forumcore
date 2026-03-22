import { createHash } from 'crypto'
import { db } from '@/lib/db'

/**
 * Validates a Bearer API key from the Authorization header.
 * Returns the userId if valid and not revoked, otherwise null.
 */
export async function validateApiKey(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const raw = authHeader.slice(7)
  if (!raw) return null

  const keyHash = createHash('sha256').update(raw).digest('hex')
  const apiKey = await db.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, userId: true, revokedAt: true },
  })

  if (!apiKey || apiKey.revokedAt) return null

  // Update lastUsedAt in background — don't await
  void db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })

  return apiKey.userId
}
