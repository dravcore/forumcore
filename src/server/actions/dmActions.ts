'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'
import { getOrCreateConversation } from '@/server/queries/dmQueries'

const messageSchema = z.string().min(1, 'Mesaj boş olamaz.').max(5000, 'Mesaj en fazla 5000 karakter olabilir.')

export async function sendMessage(conversationId: string, input: unknown) {
  const session = await requireAuth()

  if (!rateLimit(`dm:${session.user.id}`, 20, 60_000)) {
    return { success: false as const, error: 'Çok fazla mesaj gönderdiniz. Lütfen bekleyin.' }
  }

  const parsed = z.object({ content: messageSchema }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: parsed.error.message }

  // Verify sender is a participant
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  })
  if (!participant) return { success: false as const, error: 'Bu konuşmaya erişim izniniz yok.' }

  const message = await db.message.create({
    data: {
      content: parsed.data.content,
      conversationId,
      senderId: session.user.id,
    },
  })

  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  // Notify the other participant
  const otherParticipant = await db.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: session.user.id } },
  })
  if (otherParticipant) {
    await db.notification.create({
      data: {
        type: 'MESSAGE',
        userId: otherParticipant.userId,
        actorId: session.user.id,
        postId: message.id, // reuse postId field to store message id
      },
    })
  }

  revalidatePath(`/messages/${conversationId}`)
  return { success: true as const, message }
}

export async function startConversation(otherUserId: string) {
  const session = await requireAuth()

  if (session.user.id === otherUserId) {
    return { success: false as const, error: 'Kendinize mesaj gönderemezsiniz.' }
  }

  const otherUser = await db.user.findUnique({ where: { id: otherUserId } })
  if (!otherUser) return { success: false as const, error: 'Kullanıcı bulunamadı.' }

  const conversation = await getOrCreateConversation(session.user.id, otherUserId)
  return { success: true as const, conversationId: conversation.id }
}

export async function markMessagesRead(conversationId: string) {
  const session = await requireAuth()

  await db.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  revalidatePath('/messages')
  revalidatePath(`/messages/${conversationId}`)
  return { success: true as const }
}
