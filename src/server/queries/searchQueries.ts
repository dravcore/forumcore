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

export async function search(
  query: string,
  categorySlug?: string
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const categoryFilter = categorySlug
    ? Prisma.sql`AND c.slug = ${categorySlug}`
    : Prisma.sql``

  const [threads, posts] = await Promise.all([
    db.$queryRaw<RawThreadResult[]>`
      SELECT
        t.id,
        t.title,
        t.slug,
        c.slug AS category_slug,
        u.name AS author_name,
        t."createdAt" AS created_at
      FROM threads t
      JOIN categories c ON t."categoryId" = c.id
      JOIN users u ON t."authorId" = u.id
      WHERE t."deletedAt" IS NULL
        AND to_tsvector('turkish', t.title) @@ plainto_tsquery('turkish', ${query})
        ${categoryFilter}
      ORDER BY t."createdAt" DESC
      LIMIT 10
    `,
    db.$queryRaw<RawPostResult[]>`
      SELECT
        p.id,
        p.content,
        t.slug AS thread_slug,
        t.title AS thread_title,
        c.slug AS category_slug,
        u.name AS author_name,
        p."createdAt" AS created_at
      FROM posts p
      JOIN threads t ON p."threadId" = t.id
      JOIN categories c ON t."categoryId" = c.id
      JOIN users u ON p."authorId" = u.id
      WHERE p."deletedAt" IS NULL
        AND t."deletedAt" IS NULL
        AND to_tsvector('turkish', p.content) @@ plainto_tsquery('turkish', ${query})
        ${categoryFilter}
      ORDER BY p."createdAt" DESC
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
    excerpt: p.content.slice(0, 200),
    threadSlug: p.thread_slug,
    categorySlug: p.category_slug,
    authorName: p.author_name,
    createdAt: p.created_at,
  }))

  return [...threadResults, ...postResults].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}
