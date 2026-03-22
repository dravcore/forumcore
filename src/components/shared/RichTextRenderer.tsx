import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'h2', 'h3', 'hr', 'img',
]

interface RichTextRendererProps {
  content: string
  className?: string
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['src', 'alt'],
  })

  return (
    <div
      className={`rich-content text-sm leading-relaxed ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
