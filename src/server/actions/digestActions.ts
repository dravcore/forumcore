'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendEmail, digestEmailHtml } from '@/lib/email'
import { env } from '@/env'

/**
 * Send notification digest to a single user.
 * Called from admin or a scheduled job.
 */
export async function sendDigest(userId: string): Promise<{ success: boolean; sent: boolean }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, emailNotifications: true, digestFrequency: true },
  })

  if (!user || !user.emailNotifications || user.digestFrequency === 'off') {
    return { success: true, sent: false }
  }

  const since = user.digestFrequency === 'weekly'
    ? new Date(Date.now() - 7 * 24 * 3600 * 1000)
    : new Date(Date.now() - 24 * 3600 * 1000)

  const notifications = await db.notification.findMany({
    where: { userId, isRead: false, createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (notifications.length === 0) return { success: true, sent: false }

  const appUrl = env.NEXT_PUBLIC_APP_URL

  const items = notifications.map((n) => ({
    text: `${n.type} bildirimi`,
    url: n.threadId ? `${appUrl}/c/_/${n.threadId}` : `${appUrl}/notifications`,
  }))

  await sendEmail({
    to: user.email,
    subject: `ForumCore: ${notifications.length} yeni bildiriminiz var`,
    html: digestEmailHtml({
      userName: user.name,
      unreadCount: notifications.length,
      notifications: items,
      appUrl,
    }),
  })

  return { success: true, sent: true }
}

/**
 * Update current user's notification preferences.
 */
export async function updateNotificationPreferences(input: {
  emailNotifications: boolean
  digestFrequency: 'off' | 'daily' | 'weekly'
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Giriş yapmalısın' }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      emailNotifications: input.emailNotifications,
      digestFrequency: input.digestFrequency,
    },
  })

  return { success: true }
}
