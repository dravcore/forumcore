'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function revokeSession(sessionToken: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Giriş yapmalısın' }
  if (session.session.token === sessionToken) return { success: false, error: 'Mevcut oturumu silemezsiniz' }

  const target = await db.session.findUnique({ where: { token: sessionToken } })
  if (!target || target.userId !== session.user.id) return { success: false, error: 'Oturum bulunamadı' }

  await db.session.delete({ where: { token: sessionToken } })
  revalidatePath('/settings/sessions')
  return { success: true }
}

export async function revokeAllOtherSessions(): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Giriş yapmalısın' }

  await db.session.deleteMany({
    where: { userId: session.user.id, token: { not: session.session.token } },
  })
  revalidatePath('/settings/sessions')
  return { success: true }
}
