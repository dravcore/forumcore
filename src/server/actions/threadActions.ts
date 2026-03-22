'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth, requireModerator } from '@/lib/session'
import { slugify } from '@/lib/slugify'
import { createThreadSchema } from '@/server/validations/threadValidations'
import { rateLimit } from '@/lib/rateLimit'
import { logAudit } from '@/lib/audit'
import { dispatchWebhook } from '@/lib/webhook'

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title)
  let slug = base
  let attempt = 0
  while (true) {
    const existing = await db.thread.findUnique({ where: { slug } })
    if (!existing) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}

export async function createThread(categorySlug: string, input: unknown) {
  const session = await requireAuth()

  if (!rateLimit(`thread:${session.user.id}`, 3, 60_000)) {
    return { success: false as const, error: 'Çok fazla konu açtınız. Lütfen bekleyin.' }
  }

  const parsed = createThreadSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const { title, content, tagIds = [] } = parsed.data

  const category = await db.category.findUnique({ where: { slug: categorySlug } })
  if (!category) return { success: false as const, error: 'Kategori bulunamadı.' }

  const slug = await generateUniqueSlug(title)

  const thread = await db.thread.create({
    data: {
      title,
      slug,
      categoryId: category.id,
      authorId: session.user.id,
      posts: {
        create: {
          content,
          authorId: session.user.id,
        },
      },
      tags: tagIds.length > 0 ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    },
  })

  dispatchWebhook('thread.created', { threadId: thread.id, title: thread.title, categorySlug })

  revalidatePath(`/c/${categorySlug}`)
  revalidatePath('/')
  return { success: true as const, thread }
}

export async function deleteThread(threadId: string, categorySlug: string) {
  const session = await requireAuth()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return { success: false as const, error: 'Konu bulunamadı.' }

  const canDelete =
    thread.authorId === session.user.id ||
    session.user.role === 'ADMIN' ||
    session.user.role === 'MODERATOR'

  if (!canDelete) return { success: false as const, error: 'Bu işlem için yetkin yok.' }

  await db.thread.delete({ where: { id: threadId } })
  void logAudit(session.user.id, 'DELETE_THREAD', 'thread', threadId, {})

  revalidatePath(`/c/${categorySlug}`)
  revalidatePath('/')
  return { success: true as const }
}

export async function pinThread(threadId: string, categorySlug: string) {
  const session = await requireModerator()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return { success: false as const, error: 'Konu bulunamadı.' }

  await db.thread.update({
    where: { id: threadId },
    data: { isPinned: !thread.isPinned },
  })
  void logAudit(session.user.id, thread.isPinned ? 'UNPIN_THREAD' : 'PIN_THREAD', 'thread', threadId, {})

  revalidatePath(`/c/${categorySlug}`)
  return { success: true as const, isPinned: !thread.isPinned }
}

export async function lockThread(threadId: string, categorySlug: string) {
  const session = await requireModerator()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return { success: false as const, error: 'Konu bulunamadı.' }

  await db.thread.update({
    where: { id: threadId },
    data: { isLocked: !thread.isLocked },
  })
  void logAudit(session.user.id, thread.isLocked ? 'UNLOCK_THREAD' : 'LOCK_THREAD', 'thread', threadId, {})

  revalidatePath(`/c/${categorySlug}`)
  return { success: true as const, isLocked: !thread.isLocked }
}
