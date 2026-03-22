import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, MessageSquare } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getMyBookmarks } from '@/server/actions/bookmarkActions'
import { formatDistanceToNow } from '@/lib/dateUtils'

export const metadata: Metadata = { title: 'Yer İmleri' }
export const dynamic = 'force-dynamic'

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login?callbackUrl=/bookmarks')

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const { bookmarks, pageCount } = await getMyBookmarks(page)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Bookmark className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Yer İmleri</h1>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Henüz yer iminiz yok</p>
          <p className="text-sm text-muted-foreground">
            Konularda yer imi butonuna tıklayarak kaydedebilirsiniz.
          </p>
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Konulara göz at
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {bookmarks.map(({ id, thread, createdAt }) => (
              <Link
                key={id}
                href={`/c/${thread.category.slug}/${thread.slug}`}
                className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{thread.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">{thread.category.name}</span>
                    <span>{thread.author.username ?? thread.author.name}</span>
                    <span>·</span>
                    <span>{thread._count.posts} yanıt</span>
                    <span>·</span>
                    <span>Kaydedildi: {formatDistanceToNow(createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              {page > 1 && (
                <Link href={`/bookmarks?page=${page - 1}`} className="rounded-md border px-3 py-1.5 hover:bg-accent">
                  Önceki
                </Link>
              )}
              <span className="text-muted-foreground">{page} / {pageCount}</span>
              {page < pageCount && (
                <Link href={`/bookmarks?page=${page + 1}`} className="rounded-md border px-3 py-1.5 hover:bg-accent">
                  Sonraki
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
