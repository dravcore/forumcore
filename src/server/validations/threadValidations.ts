import { z } from 'zod'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

export const createThreadSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  content: z
    .string()
    .max(100000, 'İçerik çok uzun')
    .refine((val) => stripHtml(val).length >= 10, 'İçerik en az 10 karakter olmalı'),
  tagIds: z.array(z.string()).max(5, 'En fazla 5 etiket seçebilirsin').optional(),
})

export type CreateThreadInput = z.infer<typeof createThreadSchema>
