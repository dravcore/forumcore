import { db } from '@/lib/db'

const THREADS_PER_PAGE = 20
const POSTS_PER_PAGE = 20

export async function getThreadsByCategory(categorySlug: string, page = 1) {
  const skip = (page - 1) * THREADS_PER_PAGE

  const [threads, total] = await Promise.all([
    db.thread.findMany({
      where: {
        category: { slug: categorySlug },
        deletedAt: null,
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: THREADS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        isPinned: true,
        isLocked: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true, username: true } },
        _count: { select: { posts: true } },
      },
    }),
    db.thread.count({
      where: { category: { slug: categorySlug }, deletedAt: null },
    }),
  ])

  return {
    threads,
    total,
    pageCount: Math.ceil(total / THREADS_PER_PAGE),
    page,
  }
}

export async function getThreadBySlug(slug: string) {
  return db.thread.findFirst({
    where: { slug, deletedAt: null },
    include: {
      author: { select: { id: true, name: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { posts: true } },
    },
  })
}

export async function getPostsByThread(threadId: string, page = 1, userId?: string) {
  const skip = (page - 1) * POSTS_PER_PAGE

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { threadId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      skip,
      take: POSTS_PER_PAGE,
      include: {
        author: { select: { id: true, name: true, username: true } },
        _count: { select: { reactions: true } },
        reactions: userId ? { where: { userId, type: 'LIKE' }, select: { id: true } } : false,
      },
    }),
    db.post.count({ where: { threadId, deletedAt: null } }),
  ])

  return {
    posts,
    total,
    pageCount: Math.ceil(total / POSTS_PER_PAGE),
    page,
  }
}
