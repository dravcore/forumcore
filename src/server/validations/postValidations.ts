import { z } from 'zod'

export const postContentSchema = z.object({
  content: z
    .string()
    .min(1, 'Yanıt boş olamaz')
    .max(50000, 'En fazla 50.000 karakter olabilir'),
})

export type PostContentInput = z.infer<typeof postContentSchema>
