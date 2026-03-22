import type { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { db } from '@/lib/db'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { ModerationActions } from './_components/ModerationActions'

export const metadata: Metadata = { title: 'Moderasyon Kuyruğu — Admin' }

async function getModerationQueue() {
  const reports = await db.report.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: 'asc' },
    include: {
      reporter: { select: { id: true, name: true, username: true } },
    },
  })

  // Enrich with post/thread context
  const enriched = await Promise.all(
    reports.map(async (report) => {
      if (report.targetType === 'post') {
        const post = await db.post.findUnique({
          where: { id: report.targetId },
          select: {
            id: true,
            content: true,
            authorId: true,
            thread: { select: { slug: true, category: { select: { slug: true } } } },
          },
        })
        return {
          ...report,
          postContent: post?.content ?? null,
          postAuthorId: post?.authorId ?? null,
          postCategorySlug: post?.thread.category.slug ?? null,
          postThreadSlug: post?.thread.slug ?? null,
        }
      }
      return {
        ...report,
        postContent: null,
        postAuthorId: null,
        postCategorySlug: null,
        postThreadSlug: null,
      }
    })
  )

  return enriched
}

export default async function AdminModerationPage() {
  const reports = await getModerationQueue()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Moderasyon Kuyruğu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bekleyen raporları incele ve gerekli aksiyonu al.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <Shield className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">Bekleyen rapor yok</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      {report.targetType}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                      {report.targetId}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{report.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Raporlayan: {report.reporter.username ?? report.reporter.name} · {formatDistanceToNow(report.createdAt)}
                  </p>
                </div>
                <ModerationActions report={report} />
              </div>

              {report.postContent && (
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="line-clamp-3 text-xs text-muted-foreground">
                    {report.postContent.replace(/<[^>]*>/g, '').trim()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
