import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'h2', 'h3', 'hr',
  // Media & links
  'img', 'a',
  // Shiki wrapper elements
  'div', 'span', 'button',
]
const ALLOWED_ATTR = ['src', 'alt', 'href', 'target', 'rel', 'class', 'data-language', 'onclick', 'style']

interface RichTextRendererProps {
  content: string
  className?: string
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
    FORCE_BODY: false,
  })

  return (
    <div
      className={`rich-content text-sm leading-relaxed ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
