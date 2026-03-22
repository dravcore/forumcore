import { db } from '@/lib/db'

export interface BadgeDefinition {
  key: string
  name: string
  description: string
  icon: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: 'first_post',
    name: 'İlk Adım',
    description: 'İlk yanıtını yazdın.',
    icon: '✍️',
  },
  {
    key: 'first_thread',
    name: 'Konu Açıcı',
    description: 'İlk konunu açtın.',
    icon: '📌',
  },
  {
    key: 'reactions_10',
    name: 'Beğenilen',
    description: '10 reaksiyon aldın.',
    icon: '👍',
  },
  {
    key: 'reactions_50',
    name: 'Popüler',
    description: '50 reaksiyon aldın.',
    icon: '⭐',
  },
  {
    key: 'posts_10',
    name: 'Aktif Üye',
    description: '10 yanıt yazdın.',
    icon: '💬',
  },
  {
    key: 'posts_50',
    name: 'Deneyimli',
    description: '50 yanıt yazdın.',
    icon: '🏅',
  },
  {
    key: 'posts_200',
    name: 'Veteran',
    description: '200 yanıt yazdın.',
    icon: '🏆',
  },
]

export async function seedBadges(): Promise<void> {
  for (const def of BADGE_DEFINITIONS) {
    await db.badge.upsert({
      where: { key: def.key },
      create: def,
      update: { name: def.name, description: def.description, icon: def.icon },
    })
  }
}

export async function awardBadges(userId: string): Promise<void> {
  const [postCount, threadCount, reactionsReceived] = await Promise.all([
    db.post.count({ where: { authorId: userId, deletedAt: null } }),
    db.thread.count({ where: { authorId: userId, deletedAt: null } }),
    db.reaction.count({ where: { post: { authorId: userId, deletedAt: null } } }),
  ])

  const earned: string[] = []

  if (postCount >= 1) earned.push('first_post')
  if (threadCount >= 1) earned.push('first_thread')
  if (reactionsReceived >= 10) earned.push('reactions_10')
  if (reactionsReceived >= 50) earned.push('reactions_50')
  if (postCount >= 10) earned.push('posts_10')
  if (postCount >= 50) earned.push('posts_50')
  if (postCount >= 200) earned.push('posts_200')

  if (earned.length === 0) return

  const badges = await db.badge.findMany({ where: { key: { in: earned } } })

  await Promise.all(
    badges.map((badge) =>
      db.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        create: { userId, badgeId: badge.id },
        update: {},
      })
    )
  )
}
