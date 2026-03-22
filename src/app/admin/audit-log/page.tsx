import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/dateUtils'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Denetim Günlüğü — Admin' }

const ACTION_LABELS: Record<string, string> = {
  BAN_USER: 'Kullanıcı Engellendi',
  UNBAN_USER: 'Engel Kaldırıldı',
  DELETE_POST: 'Yanıt Silindi',
  DELETE_THREAD: 'Konu Silindi',
  PIN_THREAD: 'Konu Sabitlendi',
  UNPIN_THREAD: 'Sabitleme Kaldırıldı',
  LOCK_THREAD: 'Konu Kilitlendi',
  UNLOCK_THREAD: 'Kilit Açıldı',
  CHANGE_ROLE: 'Rol Değiştirildi',
  RESOLVE_REPORT: 'Rapor Çözüldü',
  DELETE_TAG: 'Etiket Silindi',
  MERGE_TAG: 'Etiket Birleştirildi',
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminAuditLogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = 30
  const skip = (page - 1) * pageSize

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        actor: { select: { id: true, name: true, username: true } },
      },
    }),
    db.auditLog.count(),
  ])

  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Denetim Günlüğü</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin ve moderatör eylemlerinin kaydı. Toplam {total} kayıt.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">Henüz kayıt yok</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Eylem</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Aktör</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Hedef</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <Link href={`/u/${log.actor.username ?? log.actor.name}`} className="hover:text-foreground">
                      {log.actor.username ?? log.actor.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {log.targetType}:{log.targetId.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/audit-log?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <ChevronLeft className="h-4 w-4" />Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pageCount}</span>
          {page < pageCount && (
            <Link href={`/admin/audit-log?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sonraki<ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
