import { db } from '@/lib/db'

export async function getAdminUsers(page = 1, pageSize = 20, search?: string) {
  const skip = (page - 1) * pageSize
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        bannedAt: true,
        bannedReason: true,
        createdAt: true,
        _count: { select: { threads: true, posts: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.user.count({ where }),
  ])
  return { users, total, pageCount: Math.ceil(total / pageSize) }
}

export async function getDashboardStats() {
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalThreads,
    totalPosts,
    newUsersToday,
    newPostsToday,
    activeCategories,
    recentActivity,
  ] = await Promise.all([
    db.user.count(),
    db.thread.count({ where: { deletedAt: null } }),
    db.post.count({ where: { deletedAt: null } }),
    db.user.count({ where: { createdAt: { gte: dayAgo } } }),
    db.post.count({ where: { createdAt: { gte: dayAgo }, deletedAt: null } }),
    db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { threads: true } },
      },
      orderBy: { threads: { _count: 'desc' } },
      take: 5,
    }),
    db.post.findMany({
      where: { createdAt: { gte: weekAgo }, deletedAt: null },
      select: {
        id: true,
        createdAt: true,
        author: { select: { name: true, username: true } },
        thread: { select: { title: true, slug: true, category: { select: { slug: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return {
    totalUsers,
    totalThreads,
    totalPosts,
    newUsersToday,
    newPostsToday,
    activeCategories,
    recentActivity,
  }
}
