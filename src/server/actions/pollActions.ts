'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

const createPollSchema = z.object({
  threadId: z.string().min(1),
  question: z.string().min(3).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
  endsAt: z.string().datetime().optional(),
})

export async function createPoll(input: unknown) {
  const session = await getSession()
  if (!session) return { success: false as const, error: 'Giriş yapmalısın' }

  const parsed = createPollSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri' }

  const thread = await db.thread.findUnique({ where: { id: parsed.data.threadId } })
  if (!thread || thread.deletedAt) return { success: false as const, error: 'Konu bulunamadı' }

  const canCreate =
    thread.authorId === session.user.id ||
    session.user.role === 'ADMIN' ||
    session.user.role === 'MODERATOR'

  if (!canCreate) return { success: false as const, error: 'Yetki yok' }

  const existing = await db.poll.findUnique({ where: { threadId: parsed.data.threadId } })
  if (existing) return { success: false as const, error: 'Bu konuda zaten anket var' }

  await db.poll.create({
    data: {
      threadId: parsed.data.threadId,
      question: parsed.data.question,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      options: {
        create: parsed.data.options.map((text, i) => ({ text, order: i })),
      },
    },
  })

  return { success: true as const }
}

export async function votePoll(optionId: string, categorySlug: string, threadSlug: string) {
  const session = await getSession()
  if (!session) return { success: false as const, error: 'Giriş yapmalısın' }

  const option = await db.pollOption.findUnique({
    where: { id: optionId },
    include: { poll: true },
  })
  if (!option) return { success: false as const, error: 'Seçenek bulunamadı' }

  if (option.poll.endsAt && option.poll.endsAt < new Date()) {
    return { success: false as const, error: 'Anket sona erdi' }
  }

  // Check if user already voted in this poll
  const pollOptionIds = await db.pollOption.findMany({
    where: { pollId: option.pollId },
    select: { id: true },
  })
  const alreadyVoted = await db.pollVote.findFirst({
    where: { optionId: { in: pollOptionIds.map((o) => o.id) }, userId: session.user.id },
  })
  if (alreadyVoted) return { success: false as const, error: 'Zaten oy kullandınız' }

  await db.pollVote.create({ data: { optionId, userId: session.user.id } })
  revalidatePath(`/c/${categorySlug}/${threadSlug}`)
  return { success: true as const }
}

export async function acceptAnswer(
  postId: string,
  categorySlug: string,
  threadSlug: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Giriş yapmalısın' }

  const post = await db.post.findUnique({
    where: { id: postId },
    include: { thread: true },
  })
  if (!post || post.deletedAt) return { success: false, error: 'Yanıt bulunamadı' }

  const isOwner = post.thread.authorId === session.user.id
  const isMod = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR'
  if (!isOwner && !isMod) return { success: false, error: 'Yetki yok' }

  if (!post.thread.isQA) return { success: false, error: 'Bu konu S&C modunda değil' }

  // Toggle: if already accepted, unaccept
  const newAccepted = post.thread.acceptedPostId === postId ? null : postId
  await db.thread.update({ where: { id: post.thread.id }, data: { acceptedPostId: newAccepted } })

  revalidatePath(`/c/${categorySlug}/${threadSlug}`)
  return { success: true }
}
