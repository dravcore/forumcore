import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateApiKey } from '@/lib/apiAuth'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const userId = await validateApiKey(request.headers.get('authorization'))
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const categorySlug = searchParams.get('category')

  const where = {
    deletedAt: null,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  }

  const [threads, total] = await Promise.all([
    db.thread.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        isPinned: true,
        isLocked: true,
        viewCount: true,
        createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, username: true } },
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.thread.count({ where }),
  ])

  return NextResponse.json({
    data: threads.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      isPinned: t.isPinned,
      isLocked: t.isLocked,
      viewCount: t.viewCount,
      postCount: t._count.posts,
      createdAt: t.createdAt,
      category: t.category,
      author: t.author,
    })),
    meta: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  })
}
