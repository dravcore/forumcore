import { Flag } from 'lucide-react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getOpenReports } from '@/server/queries/reportQueries'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'
import { ResolveButton } from './_components/ResolveButton'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { reports, total, pageCount } = await getOpenReports(page)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Raporlar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} bekleyen rapor</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Flag className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Bekleyen rapor yok</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {reports.map((report) => (
            <div key={report.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    {report.targetType}
                  </span>
                  <span className="truncate font-mono text-xs text-muted-foreground">{report.targetId}</span>
                </div>
                <p className="text-sm">{report.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {report.reporter.username ?? report.reporter.name} · {formatDistanceToNow(report.createdAt)}
                </p>
              </div>
              <div className="shrink-0">
                <ResolveButton reportId={report.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/reports?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <ChevronLeft className="h-4 w-4" />Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pageCount}</span>
          {page < pageCount && (
            <Link href={`/admin/reports?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sonraki<ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
