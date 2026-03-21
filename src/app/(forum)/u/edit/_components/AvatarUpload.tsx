'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadAvatar } from '@/server/actions/profileActions'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  displayName: string
}

export function AvatarUpload({ currentAvatarUrl, displayName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    handleUpload(file)
  }

  async function handleUpload(file: File) {
    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('avatar', file)

    const result = await uploadAvatar(formData)
    setIsUploading(false)

    if (!result.success) {
      setError(result.error)
      setPreview(currentAvatarUrl) // revert preview
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
        {preview ? (
          <Image src={preview} alt={displayName} width={80} height={80} className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Avatar yükle"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {isUploading ? 'Yükleniyor...' : 'Avatar Değiştir'}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">Maks. 2MB — JPEG, PNG, WebP, GIF</p>
      </div>
    </div>
  )
}
