import { z } from 'zod'

export const createThreadSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  content: z
    .string()
    .min(10, 'İçerik en az 10 karakter olmalı')
    .max(50000, 'İçerik en fazla 50.000 karakter olabilir'),
})

export type CreateThreadInput = z.infer<typeof createThreadSchema>
