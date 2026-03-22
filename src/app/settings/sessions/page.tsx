import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { SessionManager } from './_components/SessionManager'

export const metadata: Metadata = { title: 'Oturum Yönetimi' }
export const dynamic = 'force-dynamic'

export default async function SessionsPage() {
  const session = await getSession()
  if (!session) redirect('/login?callbackUrl=/settings/sessions')

  const sessions = await db.session.findMany({
    where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Aktif Oturumlar</h1>
          <p className="text-sm text-muted-foreground">Hesabınıza bağlı cihazları yönetin</p>
        </div>
      </div>

      <SessionManager sessions={sessions} currentToken={session.session.token} />
    </div>
  )
}
