import { z } from 'zod'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

export const postContentSchema = z.object({
  content: z
    .string()
    .max(100000, 'En fazla 100.000 karakter olabilir')
    .refine((val) => stripHtml(val).length >= 1, 'Yanıt boş olamaz'),
})

export type PostContentInput = z.infer<typeof postContentSchema>
