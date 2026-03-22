'use server'

import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

const createSchema = z.object({
  name: z.string().min(1).max(64),
})

export async function createApiKey(formData: FormData) {
  const session = await requireAuth()
  const parsed = createSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { success: false, error: 'Geçersiz isim' }

  const raw = randomBytes(32).toString('hex') // 64-char hex key
  const keyHash = createHash('sha256').update(raw).digest('hex')

  await db.apiKey.create({
    data: {
      name: parsed.data.name,
      keyHash,
      userId: session.user.id,
    },
  })

  // Return the raw key only once — it won't be retrievable after this
  return { success: true, key: `fc_${raw}` }
}

export async function revokeApiKey(keyId: string) {
  const session = await requireAuth()

  const apiKey = await db.apiKey.findUnique({ where: { id: keyId }, select: { userId: true } })
  if (!apiKey || apiKey.userId !== session.user.id) {
    return { success: false, error: 'Bulunamadı' }
  }

  await db.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  })

  return { success: true }
}

export async function getMyApiKeys() {
  const session = await requireAuth()
  return db.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}
