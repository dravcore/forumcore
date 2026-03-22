'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Image as TipTapImage } from '@tiptap/extension-image'
import { createLowlight, common } from 'lowlight'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Eye,
  Pencil,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RichTextRenderer } from './RichTextRenderer'
import { uploadPostImage } from '@/server/actions/uploadActions'

const lowlight = createLowlight(common)

export interface RichTextEditorRef {
  insertAtStart: (html: string) => void
  clear: () => void
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  onBlur?: () => void
}

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn(
        'rounded p-1.5 transition-colors hover:bg-muted disabled:opacity-40',
        active ? 'bg-muted text-foreground' : 'text-muted-foreground'
      )}
    >
      {children}
    </button>
  )
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, onBlur }, ref) => {
    const [isPreview, setIsPreview] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockLowlight.configure({ lowlight }),
        TipTapImage.configure({ inline: false }),
      ],
      content: value || '',
      onUpdate: ({ editor }) => {
        onChange(editor.isEmpty ? '' : editor.getHTML())
      },
      onBlur: () => onBlur?.(),
      editorProps: {
        attributes: {
          class: 'rich-content min-h-[160px] px-4 py-3 focus:outline-none text-sm leading-relaxed',
        },
      },
    })

    // Sync external value only when not focused (e.g. form reset)
    useEffect(() => {
      if (!editor || editor.isFocused) return
      const current = editor.getHTML()
      if (value !== current) {
        editor.commands.setContent(value || '', { emitUpdate: false })
      }
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    useImperativeHandle(ref, () => ({
      insertAtStart: (html: string) => {
        if (!editor) return
        editor.chain().focus().insertContentAt(0, html).run()
      },
      clear: () => {
        editor?.commands.clearContent()
      },
    }))

    async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file || !editor) return

      setUploadError(null)
      setIsUploading(true)

      const formData = new FormData()
      formData.append('image', file)

      const result = await uploadPostImage(formData)

      setIsUploading(false)
      e.target.value = ''

      if (!result.success) {
        setUploadError(result.error)
        return
      }

      editor.chain().focus().setImage({ src: result.url }).run()
    }

    if (!editor) return null

    return (
      <div
        className={cn(
          'rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring',
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Kalın"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="İtalik"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Üstü çizili"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Satır içi kod"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-border" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Başlık 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Başlık 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-border" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Madde listesi"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numaralı liste"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-border" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Alıntı bloğu"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Kod bloğu"
          >
            <Code2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
            title="Yatay çizgi"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-border" />

          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            active={false}
            disabled={isUploading}
            title="Görsel ekle"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageFileChange}
          />

          <div className="ml-auto">
            <ToolbarButton
              onClick={() => setIsPreview((p) => !p)}
              active={isPreview}
              title={isPreview ? 'Düzenle' : 'Önizle'}
            >
              {isPreview ? (
                <Pencil className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </ToolbarButton>
          </div>
        </div>

        {/* Upload error */}
        {uploadError && (
          <p className="border-b px-4 py-2 text-xs text-destructive">{uploadError}</p>
        )}

        {/* Editor / Preview area */}
        {isPreview ? (
          <div className="min-h-[160px] px-4 py-3">
            {editor.isEmpty ? (
              <p className="text-sm text-muted-foreground">Önizlenecek içerik yok.</p>
            ) : (
              <RichTextRenderer content={editor.getHTML()} />
            )}
          </div>
        ) : (
          <div className="relative">
            {editor.isEmpty && placeholder && (
              <p className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground">
                {placeholder}
              </p>
            )}
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'
