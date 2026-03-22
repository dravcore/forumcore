import { db } from '@/lib/db'

export async function getForumStats() {
  const [totalUsers, totalThreads, totalPosts, totalCategories] = await Promise.all([
    db.user.count(),
    db.thread.count({ where: { deletedAt: null } }),
    db.post.count({ where: { deletedAt: null } }),
    db.category.count(),
  ])

  return { totalUsers, totalThreads, totalPosts, totalCategories }
}

export async function getDailyStats(days = 30) {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  since.setUTCHours(0, 0, 0, 0)

  const rows = await db.dailyStats.findMany({
    where: { date: { gte: since } },
    orderBy: { date: 'asc' },
  })

  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    dau: r.dau,
    newUsers: r.newUsers,
    newThreads: r.newThreads,
    newPosts: r.newPosts,
  }))
}

export async function getCategoryStats() {
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { threads: true } },
    },
    orderBy: { name: 'asc' },
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    threadCount: c._count.threads,
  }))
}

export async function getTopAuthors(limit = 10) {
  const authors = await db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      reputation: true,
      _count: { select: { posts: true, threads: true } },
    },
    orderBy: { reputation: 'desc' },
    take: limit,
  })

  return authors.map((a) => ({
    id: a.id,
    name: a.name,
    username: a.username,
    reputation: a.reputation,
    postCount: a._count.posts,
    threadCount: a._count.threads,
  }))
}

export async function getDailyStatsForExport(month: string) {
  // month format: "YYYY-MM"
  const [year, mon] = month.split('-').map(Number)
  const from = new Date(Date.UTC(year, mon - 1, 1))
  const to = new Date(Date.UTC(year, mon, 1))

  return db.dailyStats.findMany({
    where: { date: { gte: from, lt: to } },
    orderBy: { date: 'asc' },
  })
}
