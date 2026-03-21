'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth, requireModerator } from '@/lib/session'
import { createReportSchema } from '@/server/validations/reportValidations'

export async function createReport(input: unknown) {
  const session = await requireAuth()

  const parsed = createReportSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Geçersiz veri.' }

  const { targetType, targetId, reason } = parsed.data

  const existing = await db.report.findFirst({
    where: { targetType, targetId, reporterId: session.user.id, resolvedAt: null },
  })
  if (existing) return { success: false as const, error: 'Bu içeriği zaten raporladınız.' }

  await db.report.create({
    data: { targetType, targetId, reason, reporterId: session.user.id },
  })

  return { success: true as const }
}

export async function resolveReport(reportId: string) {
  await requireModerator()

  await db.report.update({
    where: { id: reportId },
    data: { resolvedAt: new Date() },
  })

  revalidatePath('/admin/reports')
  return { success: true as const }
}
