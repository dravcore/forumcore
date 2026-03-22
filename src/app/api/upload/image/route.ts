import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'
import { auth } from '@/lib/auth'
import { minio, ensureBucket } from '@/lib/minio'
import { env } from '@/env'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file alanı gerekli' }, { status: 400 })
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Desteklenmeyen dosya türü. jpeg/png/gif/webp kullanın.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Dosya boyutu 5MB sınırını aşıyor.' }, { status: 400 })
  }

  const ext = EXT_MAP[file.type]
  const objectName = `uploads/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await ensureBucket()
  await minio.putObject(env.MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': file.type,
  })

  const protocol = env.MINIO_USE_SSL ? 'https' : 'http'
  const port = env.MINIO_PORT === 443 || env.MINIO_PORT === 80 ? '' : `:${env.MINIO_PORT}`
  const url = `${protocol}://${env.MINIO_ENDPOINT}${port}/${env.MINIO_BUCKET}/${objectName}`

  return NextResponse.json({ url })
}
