import { db } from '@/lib/db'
import { awardBadges } from '@/lib/badges'

// Reputation formula:
// +1 per reaction received on any post
// +2 per post authored (non-deleted)
// +5 per thread authored (non-deleted)

function computeTrustLevel(
  postCount: number,
  reputation: number,
  accountAgeDays: number
): 'MEMBER' | 'REGULAR' | 'VETERAN' {
  if (postCount >= 200 && accountAgeDays >= 90 && reputation >= 500) return 'VETERAN'
  if (postCount >= 30 && accountAgeDays >= 30) return 'REGULAR'
  return 'MEMBER'
}

export async function recalculateReputation(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { createdAt: true } })
  if (!user) return

  const [reactionsReceived, postCount, threadCount] = await Promise.all([
    db.reaction.count({
      where: { post: { authorId: userId, deletedAt: null } },
    }),
    db.post.count({
      where: { authorId: userId, deletedAt: null },
    }),
    db.thread.count({
      where: { authorId: userId, deletedAt: null },
    }),
  ])

  const reputation = reactionsReceived + postCount * 2 + threadCount * 5
  const accountAgeDays = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  const trustLevel = computeTrustLevel(postCount, reputation, accountAgeDays)

  await db.user.update({
    where: { id: userId },
    data: { reputation, trustLevel },
  })

  void awardBadges(userId)
}
