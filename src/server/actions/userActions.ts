'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

export async function changeUserRole(userId: string, role: 'ADMIN' | 'MODERATOR' | 'MEMBER') {
  await requireAdmin()

  await db.user.update({ where: { id: userId }, data: { role } })

  revalidatePath('/admin/users')
  return { success: true as const }
}

export async function banUser(userId: string, reason: string) {
  await requireAdmin()

  if (!reason?.trim()) return { success: false as const, error: 'Engelleme sebebi gerekli.' }

  await db.user.update({
    where: { id: userId },
    data: { bannedAt: new Date(), bannedReason: reason },
  })

  revalidatePath('/admin/users')
  return { success: true as const }
}

export async function unbanUser(userId: string) {
  await requireAdmin()

  await db.user.update({
    where: { id: userId },
    data: { bannedAt: null, bannedReason: null },
  })

  revalidatePath('/admin/users')
  return { success: true as const }
}
