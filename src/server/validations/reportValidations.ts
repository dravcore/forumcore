import { z } from 'zod'

export const createReportSchema = z.object({
  targetType: z.enum(['POST', 'THREAD', 'USER']),
  targetId: z.string().min(1),
  reason: z.string().min(10, 'Sebep en az 10 karakter olmalı').max(1000),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
