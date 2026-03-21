import { db } from '@/lib/db'

export async function getAdminUsers(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [users, total] = await Promise.all([
    db.user.findMany({
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
    db.user.count(),
  ])
  return { users, total, pageCount: Math.ceil(total / pageSize) }
}
