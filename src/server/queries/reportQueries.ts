import { db } from '@/lib/db'

export async function getOpenReports(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [reports, total] = await Promise.all([
    db.report.findMany({
      where: { resolvedAt: null },
      include: { reporter: { select: { id: true, name: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.report.count({ where: { resolvedAt: null } }),
  ])
  return { reports, total, pageCount: Math.ceil(total / pageSize) }
}
