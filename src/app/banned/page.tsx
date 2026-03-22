import { Ban } from 'lucide-react'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/dateUtils'

export default async function BannedPage() {
  const session = await getSession()
  let reason: string | null = null
  let bannedUntil: Date | null = null

  if (session) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { bannedReason: true, bannedUntil: true },
    })
    reason = user?.bannedReason ?? null
    bannedUntil = user?.bannedUntil ?? null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Ban className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Hesabınız Engellendi</h1>
        {reason && (
          <p className="rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Sebep: </span>{reason}
          </p>
        )}
        {bannedUntil && (
          <p className="text-sm text-muted-foreground">
            Engel bitiş tarihi: <span className="font-medium text-foreground">{formatDate(bannedUntil)}</span>
          </p>
        )}
        {!bannedUntil && (
          <p className="text-sm text-muted-foreground">Bu engel kalıcıdır.</p>
        )}
        <p className="text-sm text-muted-foreground">
          İtiraz etmek için site yöneticisiyle iletişime geçin.
        </p>
      </div>
    </div>
  )
}
