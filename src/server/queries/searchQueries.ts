import { db } from '@/lib/db'
import { Prisma } from '@/generated/prisma/client'

export type SearchResult = {
  type: 'thread' | 'post'
  id: string
  title: string | null
  excerpt: string
  threadSlug: string
  categorySlug: string
  authorName: string
  createdAt: Date
}

export type SearchSort = 'relevance' | 'newest' | 'oldest'
export type SearchDateRange = 'all' | 'today' | 'week' | 'month' | 'year'

type RawThreadResult = {
  id: string
  title: string
  slug: string
  category_slug: string
  author_name: string
  created_at: Date
}

type RawPostResult = {
  id: string
  content: string
  thread_slug: string
  thread_title: string
  category_slug: string
  author_name: string
  created_at: Date
}

function getDateCutoff(range: SearchDateRange): Date | null {
  const now = new Date()
  switch (range) {
    case 'today': { const d = new Date(now); d.setDate(d.getDate() - 1); return d }
    case 'week':  { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
    case 'month': { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d }
    case 'year':  { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d }
    default: return null
  }
}

export async function search(
  query: string,
  categorySlug?: string,
  dateRange: SearchDateRange = 'all',
  sort: SearchSort = 'relevance',
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const categoryFilter = categorySlug
    ? Prisma.sql`AND c.slug = ${categorySlug}`
    : Prisma.sql``

  const cutoff = getDateCutoff(dateRange)
  const threadDateFilter = cutoff ? Prisma.sql`AND t."createdAt" >= ${cutoff}` : Prisma.sql``
  const postDateFilter   = cutoff ? Prisma.sql`AND p."createdAt" >= ${cutoff}` : Prisma.sql``

  const threadOrder = sort === 'oldest'
    ? Prisma.sql`ORDER BY t."createdAt" ASC`
    : Prisma.sql`ORDER BY t."createdAt" DESC`

  const postOrder = sort === 'oldest'
    ? Prisma.sql`ORDER BY p."createdAt" ASC`
    : Prisma.sql`ORDER BY p."createdAt" DESC`

  const like = `%${query}%`

  const [threads, posts] = await Promise.all([
    db.$queryRaw<RawThreadResult[]>`
      SELECT
        t.id,
        t.title,
        t.slug,
        c.slug AS category_slug,
        coalesce(u.username, u.name) AS author_name,
        t."createdAt" AS created_at
      FROM threads t
      JOIN categories c ON t."categoryId" = c.id
      JOIN users u ON t."authorId" = u.id
      WHERE t."deletedAt" IS NULL
        AND (
          t."search_vector" @@ plainto_tsquery('turkish', ${query})
          OR t.title ILIKE ${like}
        )
        ${categoryFilter}
        ${threadDateFilter}
      ${threadOrder}
      LIMIT 10
    `,
    db.$queryRaw<RawPostResult[]>`
      SELECT
        p.id,
        p.content,
        t.slug AS thread_slug,
        t.title AS thread_title,
        c.slug AS category_slug,
        coalesce(u.username, u.name) AS author_name,
        p."createdAt" AS created_at
      FROM posts p
      JOIN threads t ON p."threadId" = t.id
      JOIN categories c ON t."categoryId" = c.id
      JOIN users u ON p."authorId" = u.id
      WHERE p."deletedAt" IS NULL
        AND t."deletedAt" IS NULL
        AND p.content ILIKE ${like}
        ${categoryFilter}
        ${postDateFilter}
      ${postOrder}
      LIMIT 20
    `,
  ])

  const threadResults: SearchResult[] = threads.map((t) => ({
    type: 'thread',
    id: t.id,
    title: t.title,
    excerpt: t.title,
    threadSlug: t.slug,
    categorySlug: t.category_slug,
    authorName: t.author_name,
    createdAt: t.created_at,
  }))

  const postResults: SearchResult[] = posts.map((p) => ({
    type: 'post',
    id: p.id,
    title: p.thread_title,
    excerpt: p.content.replace(/<[^>]+>/g, '').slice(0, 200),
    threadSlug: p.thread_slug,
    categorySlug: p.category_slug,
    authorName: p.author_name,
    createdAt: p.created_at,
  }))

  const combined = [...threadResults, ...postResults]
  combined.sort((a, b) =>
    sort === 'oldest'
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime()
  )

  return combined
}

export type HotThread = {
  id: string
  title: string
  slug: string
  categorySlug: string
  categoryName: string
  authorName: string
  postCount: number
  viewCount: number
  hotScore: number
  createdAt: Date
}

export async function getHotThreads(limit = 20): Promise<HotThread[]> {
  const threads = await db.thread.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      hotScore: true,
      createdAt: true,
      category: { select: { slug: true, name: true } },
      author: { select: { name: true, username: true } },
      _count: { select: { posts: true } },
    },
    orderBy: { hotScore: 'desc' },
    take: limit,
  })

  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    categorySlug: t.category.slug,
    categoryName: t.category.name,
    authorName: t.author.username ?? t.author.name,
    postCount: t._count.posts,
    viewCount: t.viewCount,
    hotScore: t.hotScore,
    createdAt: t.createdAt,
  }))
}
