import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { env } from '@/env'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL

  const [categories, threads] = await Promise.all([
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.thread.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    }),
  ])

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...categories.map((c) => ({
      url: `${base}/c/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...threads.map((t) => ({
      url: `${base}/c/${t.category.slug}/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
