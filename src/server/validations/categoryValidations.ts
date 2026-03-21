import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı').max(50, 'En fazla 50 karakter olabilir'),
  description: z
    .string()
    .max(500, 'En fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),
})

export type CategoryInput = z.infer<typeof categorySchema>
