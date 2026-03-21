import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@/env'

const globalForS3 = globalThis as unknown as { s3: S3Client | undefined }

function createS3Client() {
  const protocol = env.MINIO_USE_SSL ? 'https' : 'http'
  return new S3Client({
    endpoint: `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
    region: 'us-east-1', // MinIO requires a region even if unused
    credentials: {
      accessKeyId: env.MINIO_ACCESS_KEY,
      secretAccessKey: env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // Required for MinIO
  })
}

export const s3 = globalForS3.s3 ?? createS3Client()
if (process.env.NODE_ENV !== 'production') globalForS3.s3 = s3

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )

  const protocol = env.MINIO_USE_SSL ? 'https' : 'http'
  return `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET}/${key}`
}

export async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key,
    }),
  )
}
