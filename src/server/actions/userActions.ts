'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { logAudit } from '@/lib/audit'

const adminEditSchema = z.object({
  name: z.string().min(1).max(64),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
})

export async function adminUpdateUser(userId: string, input: unknown) {
  await requireAdmin()

  const parsed = adminEditSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const { name, username, email } = parsed.data

  const [existingUsername, existingEmail] = await Promise.all([
    db.user.findFirst({ where: { username, NOT: { id: userId } } }),
    db.user.findFirst({ where: { email, NOT: { id: userId } } }),
  ])
  if (existingUsername) return { success: false as const, error: 'Bu kullanıcı adı zaten alınmış.' }
  if (existingEmail) return { success: false as const, error: 'Bu email zaten kullanılıyor.' }

  await db.user.update({ where: { id: userId }, data: { name, username, email } })

  revalidatePath('/admin/users')
  return { success: true as const }
}

export async function changeUserRole(userId: string, role: 'ADMIN' | 'MODERATOR' | 'MEMBER') {
  const session = await requireAdmin()

  await db.user.update({ where: { id: userId }, data: { role } })
  void logAudit(session.user.id, 'CHANGE_ROLE', 'user', userId, { role })

  revalidatePath('/admin/users')
  return { success: true as const }
}

export async function banUser(userId: string, reason: string, bannedUntil?: Date | null) {
  const session = await requireAdmin()

  if (!reason?.trim()) return { success: false as const, error: 'Engelleme sebebi gerekli.' }

  await db.user.update({
    where: { id: userId },
    data: { bannedAt: new Date(), bannedUntil: bannedUntil ?? null, bannedReason: reason },
  })
  void logAudit(session.user.id, 'BAN_USER', 'user', userId, {
    reason,
    bannedUntil: bannedUntil?.toISOString() ?? null,
  })

  revalidatePath('/admin/users')
  return { success: true as const }
}

export async function unbanUser(userId: string) {
  const session = await requireAdmin()

  await db.user.update({
    where: { id: userId },
    data: { bannedAt: null, bannedUntil: null, bannedReason: null },
  })
  void logAudit(session.user.id, 'UNBAN_USER', 'user', userId, {})

  revalidatePath('/admin/users')
  return { success: true as const }
}
