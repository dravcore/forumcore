'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { NotificationType } from '@/generated/prisma/client'
import { sendEmail, replyEmailHtml, mentionEmailHtml } from '@/lib/email'
import { env } from '@/env'

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

  // Send email notification for REPLY and MENTION
  if ((type === 'REPLY' || type === 'MENTION') && threadId) {
    const [recipient, actor, thread] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
      db.user.findUnique({ where: { id: actorId }, select: { name: true } }),
      db.thread.findUnique({
        where: { id: threadId },
        select: { title: true, slug: true, category: { select: { slug: true } } },
      }),
    ])

    if (recipient && actor && thread) {
      const threadUrl = `${env.NEXT_PUBLIC_APP_URL}/c/${thread.category.slug}/${thread.slug}`
      const html =
        type === 'REPLY'
          ? replyEmailHtml({ actorName: actor.name, threadTitle: thread.title, threadUrl })
          : mentionEmailHtml({ actorName: actor.name, threadTitle: thread.title, threadUrl })

      void sendEmail({
        to: recipient.email,
        subject: type === 'REPLY' ? `${actor.name} konuna yanıt verdi` : `${actor.name} seni bahsetti`,
        html,
      })
    }
  }
}
