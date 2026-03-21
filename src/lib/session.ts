import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * Server Component ve Server Action'larda session okumak için.
 * Session varsa döndürür, yoksa null.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

/**
 * Korumalı Server Action'larda kullanmak için.
 * Session yoksa /login'e yönlendirir, varsa session döndürür.
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/**
 * Admin gerektiren Server Action'larda kullanmak için.
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') redirect('/')
  return session
}

/**
 * Moderatör veya admin gerektiren işlemler için.
 */
export async function requireModerator() {
  const session = await requireAuth()
  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'MODERATOR') redirect('/')
  return session
}
