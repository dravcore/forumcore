'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function toggleBookmark(
  threadId: string,
  categorySlug: string,
  threadSlug: string,
): Promise<{ success: boolean; bookmarked: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, bookmarked: false, error: 'Giriş yapmalısın' }

  const existing = await db.bookmark.findUnique({
    where: { userId_threadId: { userId: session.user.id, threadId } },
  })

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } })
    revalidatePath(`/c/${categorySlug}/${threadSlug}`)
    return { success: true, bookmarked: false }
  } else {
    await db.bookmark.create({ data: { userId: session.user.id, threadId } })
    revalidatePath(`/c/${categorySlug}/${threadSlug}`)
    return { success: true, bookmarked: true }
  }
}

export async function getMyBookmarks(page = 1) {
  const session = await getSession()
  if (!session) return { bookmarks: [], pageCount: 0 }

  const PAGE_SIZE = 20
  const [bookmarks, total] = await Promise.all([
    db.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        thread: {
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            category: { select: { slug: true, name: true } },
            author: { select: { name: true, username: true } },
            _count: { select: { posts: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.bookmark.count({ where: { userId: session.user.id } }),
  ])

  return { bookmarks, pageCount: Math.ceil(total / PAGE_SIZE) }
}
