import { db } from '@/lib/db'

export async function getConversations(userId: string) {
  return db.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      participants: {
        where: { userId: { not: userId } },
        include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, content: true, createdAt: true, senderId: true },
      },
      _count: {
        select: {
          messages: { where: { readAt: null, senderId: { not: userId } } },
        },
      },
    },
  })
}

const MESSAGES_PER_PAGE = 30

export async function getConversationMessages(conversationId: string, userId: string, page = 1) {
  // Verify user is a participant
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  if (!participant) return null

  const skip = (page - 1) * MESSAGES_PER_PAGE

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: MESSAGES_PER_PAGE,
      include: {
        sender: { select: { id: true, name: true, username: true, avatarUrl: true } },
      },
    }),
    db.message.count({ where: { conversationId } }),
  ])

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        where: { userId: { not: userId } },
        include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      },
    },
  })

  return {
    messages,
    conversation,
    total,
    totalPages: Math.ceil(total / MESSAGES_PER_PAGE),
    page,
  }
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  // Find existing conversation between exactly these two users
  const existing = await db.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: {
      participants: { select: { userId: true } },
    },
  })

  if (existing && existing.participants.length === 2) return existing

  return db.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
  })
}

export async function getTotalUnreadMessages(userId: string) {
  return db.message.count({
    where: {
      conversation: { participants: { some: { userId } } },
      senderId: { not: userId },
      readAt: null,
    },
  })
}
