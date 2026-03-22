import { Client } from 'minio'
import { env } from '@/env'

const globalForMinio = globalThis as unknown as { minio: Client | undefined }

function createMinioClient() {
  return new Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  })
}

export const minio = globalForMinio.minio ?? createMinioClient()

if (process.env.NODE_ENV !== 'production') globalForMinio.minio = minio

export async function ensureBucket() {
  const exists = await minio.bucketExists(env.MINIO_BUCKET)
  if (!exists) {
    await minio.makeBucket(env.MINIO_BUCKET)
    // Public read policy
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${env.MINIO_BUCKET}/*`],
        },
      ],
    })
    await minio.setBucketPolicy(env.MINIO_BUCKET, policy)
  }
}
