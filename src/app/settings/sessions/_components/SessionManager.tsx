'use client'

import { useState, useTransition } from 'react'
import { Monitor, Smartphone, Loader2, Trash2, ShieldOff } from 'lucide-react'
import { revokeSession, revokeAllOtherSessions } from '@/server/actions/sessionActions'
import { formatDistanceToNow } from '@/lib/dateUtils'

interface SessionItem {
  token: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: Date
  expiresAt: Date
}

interface SessionManagerProps {
  sessions: SessionItem[]
  currentToken: string
}

export function SessionManager({ sessions: initialSessions, currentToken }: SessionManagerProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRevoke(token: string) {
    setError(null)
    startTransition(async () => {
      const result = await revokeSession(token)
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSessions((prev) => prev.filter((s) => s.token !== token))
    })
  }

  function handleRevokeAll() {
    if (!confirm('Diğer tüm oturumlar kapatılacak. Devam?')) return
    setError(null)
    startTransition(async () => {
      const result = await revokeAllOtherSessions()
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSessions((prev) => prev.filter((s) => s.token === currentToken))
    })
  }

  const otherCount = sessions.filter((s) => s.token !== currentToken).length

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {sessions.map((s) => {
        const isCurrent = s.token === currentToken
        const isMobile = /mobile|android|iphone/i.test(s.userAgent ?? '')
        const Icon = isMobile ? Smartphone : Monitor

        return (
          <div key={s.token} className={`flex items-start gap-4 rounded-lg border bg-card p-4 ${isCurrent ? 'border-primary/40' : ''}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {s.userAgent?.split(' ').slice(0, 3).join(' ') ?? 'Bilinmeyen cihaz'}
                </p>
                {isCurrent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Bu oturum
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {s.ipAddress ?? 'IP bilinmiyor'} · {formatDistanceToNow(s.createdAt)} önce
              </p>
            </div>
            {!isCurrent && (
              <button
                onClick={() => handleRevoke(s.token)}
                disabled={isPending}
                aria-label="Oturumu kapat"
                className="shrink-0 rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        )
      })}

      {otherCount > 0 && (
        <button
          onClick={handleRevokeAll}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 py-2.5 text-sm text-destructive hover:bg-destructive/5 disabled:opacity-50"
        >
          <ShieldOff className="h-4 w-4" />
          Diğer tüm oturumları kapat ({otherCount})
        </button>
      )}
    </div>
  )
}
