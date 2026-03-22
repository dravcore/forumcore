'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-çğışöüçğışöü]/gi, '')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const tagNameSchema = z.string().min(2, 'Etiket en az 2 karakter olmalı').max(32, 'Etiket en fazla 32 karakter olabilir')

export async function createTag(input: unknown) {
  await requireAdmin()

  const parsed = z.object({ name: tagNameSchema }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: parsed.error.message }

  const { name } = parsed.data
  const slug = toSlug(name)

  const existing = await db.tag.findFirst({ where: { OR: [{ name }, { slug }] } })
  if (existing) return { success: false as const, error: 'Bu etiket zaten mevcut.' }

  const tag = await db.tag.create({ data: { name, slug } })
  revalidatePath('/admin/tags')
  return { success: true as const, tag }
}

export async function renameTag(id: string, input: unknown) {
  await requireAdmin()

  const parsed = z.object({ name: tagNameSchema }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: parsed.error.message }

  const { name } = parsed.data
  const slug = toSlug(name)

  const existing = await db.tag.findFirst({ where: { OR: [{ name }, { slug }], NOT: { id } } })
  if (existing) return { success: false as const, error: 'Bu etiket adı zaten kullanılıyor.' }

  const tag = await db.tag.update({ where: { id }, data: { name, slug } })
  revalidatePath('/admin/tags')
  return { success: true as const, tag }
}

export async function deleteTag(id: string) {
  await requireAdmin()
  await db.tag.delete({ where: { id } })
  revalidatePath('/admin/tags')
  return { success: true as const }
}

export async function mergeTag(sourceId: string, targetId: string) {
  await requireAdmin()

  if (sourceId === targetId) return { success: false as const, error: 'Kaynak ve hedef etiket aynı olamaz.' }

  // Move all thread_tags from source → target (skip duplicates)
  const sourceThreads = await db.threadTag.findMany({ where: { tagId: sourceId } })

  for (const tt of sourceThreads) {
    await db.threadTag.upsert({
      where: { threadId_tagId: { threadId: tt.threadId, tagId: targetId } },
      create: { threadId: tt.threadId, tagId: targetId },
      update: {},
    })
  }

  await db.tag.delete({ where: { id: sourceId } })
  revalidatePath('/admin/tags')
  return { success: true as const }
}
