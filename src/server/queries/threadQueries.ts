import { db } from '@/lib/db'

const THREADS_PER_PAGE = 20

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
    },
  })
}

export async function getThreadWithPosts(slug: string) {
  return db.thread.findFirst({
    where: { slug, deletedAt: null },
    include: {
      author: { select: { id: true, name: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, username: true } },
        },
      },
    },
  })
}
