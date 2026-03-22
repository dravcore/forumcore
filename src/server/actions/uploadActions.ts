'use server'

import { randomUUID } from 'crypto'
import { requireAuth } from '@/lib/session'
import { uploadFile } from '@/lib/storage'

const POST_IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const POST_IMAGE_ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function uploadPostImage(formData: FormData) {
  await requireAuth()

  const file = formData.get('image') as File | null
  if (!file) return { success: false as const, error: 'Dosya seçilmedi.' }

  if (file.size > POST_IMAGE_MAX_SIZE) {
    return { success: false as const, error: 'Dosya boyutu 5MB\'yi geçemez.' }
  }

  const ext = POST_IMAGE_ALLOWED_TYPES[file.type]
  if (!ext) {
    return { success: false as const, error: 'Sadece JPEG, PNG, WebP veya GIF yükleyebilirsin.' }
  }

  const key = `post-images/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadFile(key, buffer, file.type)

  return { success: true as const, url }
}
