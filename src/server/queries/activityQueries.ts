import { db } from '@/lib/db'
import { Prisma } from '@/generated/prisma/client'

type DayActivity = { date: string; count: number }

export async function getUserActivityCalendar(userId: string, days = 365): Promise<DayActivity[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [postActivity, threadActivity] = await Promise.all([
    db.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT
        DATE("createdAt")::text AS date,
        COUNT(*)::bigint AS count
      FROM posts
      WHERE "authorId" = ${userId}
        AND "deletedAt" IS NULL
        AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
    `,
    db.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT
        DATE("createdAt")::text AS date,
        COUNT(*)::bigint AS count
      FROM threads
      WHERE "authorId" = ${userId}
        AND "deletedAt" IS NULL
        AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
    `,
  ])

  const activityMap = new Map<string, number>()

  for (const row of postActivity) {
    activityMap.set(row.date, (activityMap.get(row.date) ?? 0) + Number(row.count))
  }
  for (const row of threadActivity) {
    activityMap.set(row.date, (activityMap.get(row.date) ?? 0) + Number(row.count))
  }

  return Array.from(activityMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
