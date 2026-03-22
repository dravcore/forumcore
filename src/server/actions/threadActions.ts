'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth, requireModerator } from '@/lib/session'
import { slugify } from '@/lib/slugify'
import { createThreadSchema } from '@/server/validations/threadValidations'
import { rateLimit } from '@/lib/rateLimit'

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

  revalidatePath(`/c/${categorySlug}`)
  revalidatePath('/')
  return { success: true as const }
}

export async function pinThread(threadId: string, categorySlug: string) {
  await requireModerator()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return { success: false as const, error: 'Konu bulunamadı.' }

  await db.thread.update({
    where: { id: threadId },
    data: { isPinned: !thread.isPinned },
  })

  revalidatePath(`/c/${categorySlug}`)
  return { success: true as const, isPinned: !thread.isPinned }
}

export async function lockThread(threadId: string, categorySlug: string) {
  await requireModerator()

  const thread = await db.thread.findUnique({ where: { id: threadId } })
  if (!thread) return { success: false as const, error: 'Konu bulunamadı.' }

  await db.thread.update({
    where: { id: threadId },
    data: { isLocked: !thread.isLocked },
  })

  revalidatePath(`/c/${categorySlug}`)
  return { success: true as const, isLocked: !thread.isLocked }
}
