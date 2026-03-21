'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

const schema = z.object({
  siteName: z.string().min(1).max(64),
  siteDescription: z.string().max(256),
  registrationOpen: z.boolean(),
})

export async function getSiteSettings() {
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (!settings) {
    return { siteName: 'ForumCore', siteDescription: 'Self-hosted forum platformu', registrationOpen: true }
  }
  return settings
}

export async function updateSiteSettings(input: unknown) {
  await requireAdmin()

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  await db.siteSettings.upsert({
    where: { id: 'default' },
    update: parsed.data,
    create: { id: 'default', ...parsed.data },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true as const }
}
