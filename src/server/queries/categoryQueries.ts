import { db } from '@/lib/db'

export async function getCategories() {
  return db.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { threads: true } },
    },
  })
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { threads: true } },
    },
  })
}

export async function getCategoryById(id: string) {
  return db.category.findUnique({ where: { id } })
}
