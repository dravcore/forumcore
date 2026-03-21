'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { categorySchema } from '@/server/validations/categoryValidations'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCategory(input: unknown) {
  await requireAdmin()

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const { name, description } = parsed.data
  const slug = slugify(name)

  const last = await db.category.findFirst({ orderBy: { order: 'desc' } })
  const order = (last?.order ?? -1) + 1

  try {
    const category = await db.category.create({
      data: { name, slug, description: description || null, order },
    })
    revalidatePath('/')
    revalidatePath('/admin/categories')
    return { success: true as const, category }
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return { success: false as const, error: 'Bu isimde bir kategori zaten var.' }
    }
    return { success: false as const, error: 'Bir hata oluştu.' }
  }
}

export async function updateCategory(id: string, input: unknown) {
  await requireAdmin()

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const { name, description } = parsed.data
  const slug = slugify(name)

  try {
    const category = await db.category.update({
      where: { id },
      data: { name, slug, description: description || null },
    })
    revalidatePath('/')
    revalidatePath('/admin/categories')
    return { success: true as const, category }
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return { success: false as const, error: 'Bu isimde bir kategori zaten var.' }
    }
    return { success: false as const, error: 'Bir hata oluştu.' }
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin()

  try {
    await db.category.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/admin/categories')
    return { success: true as const }
  } catch {
    return { success: false as const, error: 'Kategori silinemedi. İçinde thread\'ler olabilir.' }
  }
}

export async function reorderCategory(id: string, direction: 'up' | 'down') {
  await requireAdmin()

  const category = await db.category.findUnique({ where: { id } })
  if (!category) return { success: false as const, error: 'Kategori bulunamadı.' }

  const neighbor = await db.category.findFirst({
    where: {
      order: direction === 'up' ? { lt: category.order } : { gt: category.order },
    },
    orderBy: { order: direction === 'up' ? 'desc' : 'asc' },
  })

  if (!neighbor) return { success: true as const }

  await db.$transaction([
    db.category.update({ where: { id }, data: { order: neighbor.order } }),
    db.category.update({ where: { id: neighbor.id }, data: { order: category.order } }),
  ])

  revalidatePath('/')
  revalidatePath('/admin/categories')
  return { success: true as const }
}
