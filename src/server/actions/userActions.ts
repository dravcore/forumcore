'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

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
