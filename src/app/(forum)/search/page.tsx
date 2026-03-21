import { Suspense } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, FileText } from 'lucide-react'
import { search } from '@/server/queries/searchQueries'
import { db } from '@/lib/db'
import { formatDistanceToNow } from '@/lib/dateUtils'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Ara</h1>
      <SearchForm query={q} categorySlug={category} />
      {q && (
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={q} categorySlug={category} />
        </Suspense>
      )}
    </div>
  )
}

async function SearchForm({
  query,
  categorySlug,
}: {
  query?: string
  categorySlug?: string
}) {
  const categories = await db.category.findMany({
    select: { slug: true, name: true },
    orderBy: { order: 'asc' },
  })

  return (
    <form method="GET" className="mb-8 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Konu veya yanıt ara..."
          autoFocus
          className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <select
        name="category"
        defaultValue={categorySlug ?? ''}
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">Tüm kategoriler</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ara
      </button>
    </form>
  )
}

async function SearchResults({
  query,
  categorySlug,
}: {
  query: string
  categorySlug?: string
}) {
  const results = await search(query, categorySlug)

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Search className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          &ldquo;{query}&rdquo; için sonuç bulunamadı.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {results.length} sonuç bulundu
      </p>
      {results.map((r) => {
        const Icon = r.type === 'thread' ? MessageSquare : FileText
        const href = `/c/${r.categorySlug}/${r.threadSlug}`

        return (
          <Link
            key={`${r.type}-${r.id}`}
            href={href}
            className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {r.type === 'thread' ? 'Konu' : 'Yanıt'}
                </span>
                <span className="truncate text-sm font-medium">{r.title}</span>
              </div>
              {r.type === 'post' && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {r.excerpt}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {r.authorName} · {formatDistanceToNow(r.createdAt)}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted" />
      ))}
    </div>
  )
}
