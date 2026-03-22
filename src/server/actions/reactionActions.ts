'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createNotification } from './notificationActions'
import { recalculateReputation } from '@/lib/reputation'

export async function toggleReaction(postId: string, type: string = 'LIKE') {
  const session = await requireAuth()

  const existing = await db.reaction.findUnique({
    where: { postId_userId_type: { postId, userId: session.user.id, type } },
  })

  if (existing) {
    const deletedPost = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    await db.reaction.delete({ where: { id: existing.id } })
    if (deletedPost) void recalculateReputation(deletedPost.authorId)
    const count = await db.reaction.count({ where: { postId, type } })
    revalidatePath('/')
    return { success: true as const, liked: false, count }
  }

  await db.reaction.create({
    data: { postId, userId: session.user.id, type },
  })

  // Notify post author
  const postData = await db.post.findUnique({ where: { id: postId }, select: { authorId: true, threadId: true } })
  if (postData) {
    void createNotification({
      type: 'REACTION',
      userId: postData.authorId,
      actorId: session.user.id,
      threadId: postData.threadId,
      postId,
    })
    void recalculateReputation(postData.authorId)
  }

  const count = await db.reaction.count({ where: { postId, type } })
  revalidatePath('/')
  return { success: true as const, liked: true, count }
}
