import { db } from '@/lib/db'

export async function getUserByUsername(username: string) {
  return db.user.findFirst({
    where: {
      OR: [{ username }, { name: username }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      twitterHandle: true,
      githubHandle: true,
      role: true,
      reputation: true,
      trustLevel: true,
      createdAt: true,
      bannedAt: true,
      badges: {
        select: {
          awardedAt: true,
          badge: { select: { key: true, name: true, description: true, icon: true } },
        },
        orderBy: { awardedAt: 'asc' },
      },
      _count: {
        select: {
          threads: { where: { deletedAt: null } },
          posts: { where: { deletedAt: null } },
        },
      },
    },
  })
}

export async function getUserRecentThreads(userId: string, limit = 5) {
  return db.thread.findMany({
    where: { authorId: userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      _count: { select: { posts: true } },
    },
  })
}

export async function getUserRecentPosts(userId: string, limit = 5) {
  return db.post.findMany({
    where: { authorId: userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      content: true,
      createdAt: true,
      thread: {
        select: {
          title: true,
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  })
}
