import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Check for active ban
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { bannedAt: true, bannedUntil: true, bannedReason: true },
  })
  if (user?.bannedAt) {
    const isTemporary = user.bannedUntil !== null
    const isExpired = isTemporary && user.bannedUntil! < new Date()
    if (!isExpired) redirect('/banned')

    // Auto-lift expired temp ban
    if (isExpired) {
      await db.user.update({
        where: { id: session.user.id },
        data: { bannedAt: null, bannedUntil: null, bannedReason: null },
      })
    }
  }

  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') redirect('/')
  return session
}

export async function requireModerator() {
  const session = await requireAuth()
  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'MODERATOR') redirect('/')
  return session
}
