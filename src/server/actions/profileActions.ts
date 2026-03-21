'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { profileSchema } from '@/server/validations/profileValidations'
import { AVATAR_MAX_SIZE, AVATAR_ALLOWED_TYPES } from '@/server/validations/profileValidations'
import { uploadFile, deleteFile } from '@/lib/storage'

export async function updateProfile(input: unknown) {
  const session = await requireAuth()

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const { name, username, email, bio, websiteUrl, twitterHandle, githubHandle } = parsed.data

  // Uniqueness checks
  const [existingUsername, existingEmail] = await Promise.all([
    db.user.findFirst({ where: { username, NOT: { id: session.user.id } } }),
    db.user.findFirst({ where: { email, NOT: { id: session.user.id } } }),
  ])
  if (existingUsername) return { success: false as const, error: 'Bu kullanıcı adı zaten alınmış.' }
  if (existingEmail) return { success: false as const, error: 'Bu email adresi zaten kullanılıyor.' }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      username,
      email,
      bio: bio || null,
      websiteUrl: websiteUrl || null,
      twitterHandle: twitterHandle || null,
      githubHandle: githubHandle || null,
    },
  })

  revalidatePath(`/u/${username}`)
  revalidatePath('/u/edit')
  return { success: true as const }
}

export async function uploadAvatar(formData: FormData) {
  const session = await requireAuth()

  const file = formData.get('avatar') as File | null
  if (!file) return { success: false as const, error: 'Dosya seçilmedi.' }

  if (file.size > AVATAR_MAX_SIZE) {
    return { success: false as const, error: 'Dosya boyutu 2MB\'yi geçemez.' }
  }
  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    return { success: false as const, error: 'Sadece JPEG, PNG, WebP veya GIF yükleyebilirsin.' }
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const key = `avatars/${session.user.id}-${Date.now()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadFile(key, buffer, file.type)

  // Delete old avatar from storage if it's a MinIO URL
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } })
  if (user?.avatarUrl) {
    try {
      const oldKey = new URL(user.avatarUrl).pathname.slice(1).split('/').slice(1).join('/')
      await deleteFile(oldKey)
    } catch {
      // ignore cleanup errors
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: url },
  })

  const username = session.user.username ?? session.user.name
  revalidatePath(`/u/${username}`)
  revalidatePath('/u/edit')
  return { success: true as const, url }
}
