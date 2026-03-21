'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { NotificationType } from '@/generated/prisma/client'

export async function markAllAsRead() {
  const session = await requireAuth()
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })
  return { success: true as const }
}

export async function markAsRead(notificationId: string) {
  const session = await requireAuth()
  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  })
  return { success: true as const }
}

// Internal helper — not a server action, used by other actions
export async function createNotification({
  type,
  userId,
  actorId,
  threadId,
  postId,
}: {
  type: NotificationType
  userId: string
  actorId: string
  threadId?: string
  postId?: string
}) {
  // Don't notify yourself
  if (userId === actorId) return

  await db.notification.create({
    data: { type, userId, actorId, threadId, postId },
  })
}
