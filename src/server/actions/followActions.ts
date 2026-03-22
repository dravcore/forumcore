'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(
  targetUserId: string,
  targetUsername: string,
): Promise<{ success: boolean; following: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, following: false, error: 'Giriş yapmalısın' }
  if (session.user.id === targetUserId) return { success: false, following: false, error: 'Kendinizi takip edemezsiniz' }

  const existing = await db.userFollow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  })

  if (existing) {
    await db.userFollow.delete({
      where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    })
    revalidatePath(`/u/${targetUsername}`)
    return { success: true, following: false }
  } else {
    await db.userFollow.create({ data: { followerId: session.user.id, followingId: targetUserId } })
    revalidatePath(`/u/${targetUsername}`)
    return { success: true, following: true }
  }
}

export async function toggleCategorySubscription(
  categoryId: string,
  categorySlug: string,
): Promise<{ success: boolean; subscribed: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, subscribed: false, error: 'Giriş yapmalısın' }

  const existing = await db.categorySubscription.findUnique({
    where: { userId_categoryId: { userId: session.user.id, categoryId } },
  })

  if (existing) {
    await db.categorySubscription.delete({
      where: { userId_categoryId: { userId: session.user.id, categoryId } },
    })
    revalidatePath(`/c/${categorySlug}`)
    return { success: true, subscribed: false }
  } else {
    await db.categorySubscription.create({ data: { userId: session.user.id, categoryId } })
    revalidatePath(`/c/${categorySlug}`)
    return { success: true, subscribed: true }
  }
}
