import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, 'Ad soyad zorunlu').max(64, 'En fazla 64 karakter'),
  username: z
    .string()
    .min(3, 'En az 3 karakter')
    .max(32, 'En fazla 32 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve _ kullanılabilir'),
  email: z.string().email('Geçerli bir email gir'),
  bio: z.string().max(500, 'Bio en fazla 500 karakter olabilir').optional().or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Geçerli bir URL gir')
    .optional()
    .or(z.literal('')),
  twitterHandle: z
    .string()
    .max(50)
    .regex(/^[a-zA-Z0-9_]*$/, 'Sadece harf, rakam ve _ kullanılabilir')
    .optional()
    .or(z.literal('')),
  githubHandle: z
    .string()
    .max(50)
    .regex(/^[a-zA-Z0-9-]*$/, 'Sadece harf, rakam ve - kullanılabilir')
    .optional()
    .or(z.literal('')),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const AVATAR_MAX_SIZE = 2 * 1024 * 1024 // 2MB
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
