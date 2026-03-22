'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { headers } from 'next/headers'

/**
 * Hot score formula (Reddit-inspired, decays over time):
 * score = (posts * 3 + views * 0.1 + reactions) / ((ageHours + 2) ^ 1.5)
 *
 * Called from admin panel or a scheduled job.
 */
export async function recalculateHotScores(): Promise<{ success: boolean; updated: number; error?: string }> {
  const session = await getSession()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return { success: false, updated: 0, error: 'Unauthorized' }
  }

  const threads = await db.thread.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      viewCount: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  })

  // Get reaction counts per thread
  const reactionCounts = await db.reaction.groupBy({
    by: ['postId'],
    _count: { id: true },
    where: {
      post: { deletedAt: null, thread: { deletedAt: null } },
    },
  })

  const postToThread = await db.post.findMany({
    where: { deletedAt: null },
    select: { id: true, threadId: true },
  })
  const postThreadMap = new Map(postToThread.map((p) => [p.id, p.threadId]))

  const reactionsByThread = new Map<string, number>()
  for (const r of reactionCounts) {
    const threadId = postThreadMap.get(r.postId)
    if (threadId) {
      reactionsByThread.set(threadId, (reactionsByThread.get(threadId) ?? 0) + r._count.id)
    }
  }

  const now = Date.now()
  const updates = threads.map((t) => {
    const ageHours = (now - t.createdAt.getTime()) / 3_600_000
    const reactions = reactionsByThread.get(t.id) ?? 0
    const score = (t._count.posts * 3 + t.viewCount * 0.1 + reactions) / Math.pow(ageHours + 2, 1.5)
    return db.thread.update({ where: { id: t.id }, data: { hotScore: score } })
  })

  await Promise.all(updates)

  return { success: true, updated: threads.length }
}
