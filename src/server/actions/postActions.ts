'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { postContentSchema } from '@/server/validations/postValidations'
import { createNotification } from './notificationActions'
import { rateLimit } from '@/lib/rateLimit'
import { recalculateReputation } from '@/lib/reputation'
import { logAudit } from '@/lib/audit'

export async function createPost(threadId: string, categorySlug: string, input: unknown) {
  const session = await requireAuth()

  if (!rateLimit(`post:${session.user.id}`, 5, 60_000)) {
    return { success: false as const, error: 'Çok fazla yanıt gönderdiniz. Lütfen bekleyin.' }
  }

  const parsed = postContentSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread || thread.deletedAt) return { success: false as const, error: 'Konu bulunamadı.' }
  if (thread.isLocked) return { success: false as const, error: 'Bu konu kilitli.' }

  const post = await db.post.create({
    data: {
      content: parsed.data.content,
      threadId,
      authorId: session.user.id,
    },
  })

  // Update thread's updatedAt so it bubbles up in listing
  await db.thread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  })

  // Notify thread author on reply
  void createNotification({
    type: 'REPLY',
    userId: thread.authorId,
    actorId: session.user.id,
    threadId: thread.id,
    postId: post.id,
  })

  // Notify mentioned users (@username)
  const mentionRegex = /@(\w+)/g
  const mentions = [...parsed.data.content.matchAll(mentionRegex)].map((m) => m[1])
  if (mentions.length > 0) {
    const mentionedUsers = await db.user.findMany({
      where: { username: { in: mentions } },
      select: { id: true },
    })
    await Promise.all(
      mentionedUsers.map((u) =>
        createNotification({
          type: 'MENTION',
          userId: u.id,
          actorId: session.user.id,
          threadId: thread.id,
          postId: post.id,
        })
      )
    )
  }

  void recalculateReputation(session.user.id)

  revalidatePath(`/c/${categorySlug}/${thread.slug}`)
  return { success: true as const, post }
}

export async function updatePost(postId: string, categorySlug: string, threadSlug: string, input: unknown) {
  const session = await requireAuth()

  const parsed = postContentSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post || post.deletedAt) return { success: false as const, error: 'Yanıt bulunamadı.' }

  const canEdit =
    post.authorId === session.user.id ||
    session.user.role === 'ADMIN' ||
    session.user.role === 'MODERATOR'

  if (!canEdit) return { success: false as const, error: 'Bu işlem için yetkin yok.' }

  await db.post.update({
    where: { id: postId },
    data: { content: parsed.data.content, editedAt: new Date() },
  })

  revalidatePath(`/c/${categorySlug}/${threadSlug}`)
  return { success: true as const }
}

export async function deletePost(postId: string, categorySlug: string, threadSlug: string) {
  const session = await requireAuth()

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post || post.deletedAt) return { success: false as const, error: 'Yanıt bulunamadı.' }

  const canDelete =
    post.authorId === session.user.id ||
    session.user.role === 'ADMIN' ||
    session.user.role === 'MODERATOR'

  if (!canDelete) return { success: false as const, error: 'Bu işlem için yetkin yok.' }

  await db.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  })

  void recalculateReputation(post.authorId)
  if (session.user.id !== post.authorId) {
    void logAudit(session.user.id, 'DELETE_POST', 'post', postId, {})
  }

  revalidatePath(`/c/${categorySlug}/${threadSlug}`)
  return { success: true as const }
}
