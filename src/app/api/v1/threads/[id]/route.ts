import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateApiKey } from '@/lib/apiAuth'

const PAGE_SIZE = 20

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await validateApiKey(request.headers.get('authorization'))
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

  const thread = await db.thread.findUnique({
    where: { id, deletedAt: null },
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
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  })

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  const [posts, totalPosts] = await Promise.all([
    db.post.findMany({
      where: { threadId: id, deletedAt: null },
      select: {
        id: true,
        content: true,
        createdAt: true,
        editedAt: true,
        author: { select: { id: true, name: true, username: true } },
        _count: { select: { reactions: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.post.count({ where: { threadId: id, deletedAt: null } }),
  ])

  return NextResponse.json({
    data: {
      ...thread,
      tags: thread.tags.map((t) => t.tag),
      posts: posts.map((p) => ({ ...p, reactionCount: p._count.reactions })),
    },
    meta: {
      page,
      pageSize: PAGE_SIZE,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / PAGE_SIZE),
    },
  })
}
