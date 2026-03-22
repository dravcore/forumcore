import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { NotificationPreferencesForm } from './_components/NotificationPreferencesForm'

export const metadata: Metadata = { title: 'Bildirim Tercihleri' }

export default async function NotificationSettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login?callbackUrl=/settings/notifications')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailNotifications: true, digestFrequency: true },
  })

  if (!user) redirect('/')

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Bildirim Tercihleri</h1>
      </div>

      <NotificationPreferencesForm
        initialEmailNotifications={user.emailNotifications}
        initialDigestFrequency={user.digestFrequency as 'off' | 'daily' | 'weekly'}
      />
    </div>
  )
}
