export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { MessageSquare, Users, TrendingUp, LayoutGrid, ChevronRight } from 'lucide-react'
import { getCategories } from '@/server/queries/categoryQueries'
import { db } from '@/lib/db'

async function getStats() {
  const [userCount, threadCount, postCount] = await Promise.all([
    db.user.count(),
    db.thread.count({ where: { deletedAt: null } }),
    db.post.count({ where: { deletedAt: null } }),
  ])
  return { userCount, threadCount, postCount }
}

export default async function HomePage() {
  const [categories, stats] = await Promise.all([getCategories(), getStats()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Topluluğa Hoş Geldiniz
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sorularını sor, deneyimlerini paylaş, topluluğa katkıda bulun.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-4 rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center gap-1">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">{stats.userCount}</span>
          <span className="text-xs text-muted-foreground">Üye</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">{stats.threadCount}</span>
          <span className="text-xs text-muted-foreground">Konu</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">{stats.postCount}</span>
          <span className="text-xs text-muted-foreground">Yanıt</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Kategoriler</h2>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <LayoutGrid className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">Henüz kategori eklenmemiş</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Admin panelinden ilk kategoriyi ekleyebilirsin.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/c/${category.slug}`}
                className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium group-hover:text-primary">{category.name}</p>
                  {category.description && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                  <span>{category._count.threads} konu</span>
                  <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
