import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')
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
