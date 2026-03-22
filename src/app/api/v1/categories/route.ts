import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateApiKey } from '@/lib/apiAuth'

export async function GET(request: NextRequest) {
  const userId = await validateApiKey(request.headers.get('authorization'))
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      order: true,
      _count: { select: { threads: true } },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      order: c.order,
      threadCount: c._count.threads,
    })),
  })
}
