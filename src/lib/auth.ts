import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { db } from '@/lib/db'

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
        unique: true,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'MEMBER',
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 gün
    updateAge: 60 * 60 * 24, // Her gün güncelle
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 dakika
    },
  },
})

export type Auth = typeof auth
