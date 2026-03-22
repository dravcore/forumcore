import { db } from '@/lib/db'

export async function getAllTags() {
  return db.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { threads: true } } },
  })
}

export async function getTagBySlug(slug: string) {
  return db.tag.findUnique({
    where: { slug },
    include: { _count: { select: { threads: true } } },
  })
}

const THREADS_PER_TAG_PAGE = 20

export async function getThreadsByTag(tagSlug: string, page = 1) {
  const skip = (page - 1) * THREADS_PER_TAG_PAGE

  const [threads, total] = await Promise.all([
    db.thread.findMany({
      where: {
        deletedAt: null,
        tags: { some: { tag: { slug: tagSlug } } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isPinned: true,
        isLocked: true,
        viewCount: true,
        createdAt: true,
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { posts: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: THREADS_PER_TAG_PAGE,
    }),
    db.thread.count({
      where: {
        deletedAt: null,
        tags: { some: { tag: { slug: tagSlug } } },
      },
    }),
  ])

  return { threads, total, totalPages: Math.ceil(total / THREADS_PER_TAG_PAGE) }
}
