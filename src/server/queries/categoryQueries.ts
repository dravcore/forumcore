import { db } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/redis'

const CATEGORIES_KEY = 'categories:all'
const CATEGORIES_TTL = 3600 // 1 hour

export async function getCategories() {
  type CategoryResult = Awaited<ReturnType<typeof fetchCategories>>
  const cached = await cacheGet<CategoryResult>(CATEGORIES_KEY)
  if (cached) return cached

  const data = await fetchCategories()
  void cacheSet(CATEGORIES_KEY, data, CATEGORIES_TTL)
  return data
}

function fetchCategories() {
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
