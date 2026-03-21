'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function toggleReaction(postId: string, type: string = 'LIKE') {
  const session = await requireAuth()

  const existing = await db.reaction.findUnique({
    where: { postId_userId_type: { postId, userId: session.user.id, type } },
  })

  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } })
    const count = await db.reaction.count({ where: { postId, type } })
    revalidatePath('/')
    return { success: true as const, liked: false, count }
  }

  await db.reaction.create({
    data: { postId, userId: session.user.id, type },
  })

  const count = await db.reaction.count({ where: { postId, type } })
  revalidatePath('/')
  return { success: true as const, liked: true, count }
}
