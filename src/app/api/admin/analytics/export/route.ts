import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getDailyStatsForExport } from '@/server/queries/analyticsQueries'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const month = searchParams.get('month')

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month parametresi YYYY-MM formatında olmalı' }, { status: 400 })
  }

  const rows = await getDailyStatsForExport(month)

  const csvLines = [
    'date,dau,new_users,new_threads,new_posts',
    ...rows.map((r) =>
      [r.date.toISOString().slice(0, 10), r.dau, r.newUsers, r.newThreads, r.newPosts].join(',')
    ),
  ]

  return new NextResponse(csvLines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="analytics-${month}.csv"`,
    },
  })
}
