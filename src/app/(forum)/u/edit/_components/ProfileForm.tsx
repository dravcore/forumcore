'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/server/actions/profileActions'
import { profileSchema, type ProfileInput } from '@/server/validations/profileValidations'

interface ProfileFormProps {
  defaultValues: ProfileInput
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  async function onSubmit(data: ProfileInput) {
    setServerError(null)
    setSuccess(false)
    const result = await updateProfile(data)
    if (!result.success) { setServerError(result.error); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <Check className="h-4 w-4" />Profil güncellendi.
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio <span className="text-muted-foreground">(opsiyonel)</span></Label>
        <Textarea id="bio" placeholder="Kendinden kısaca bahset..." rows={3} className="resize-none" {...register('bio')} />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="websiteUrl">Web Sitesi</Label>
        <Input id="websiteUrl" type="url" placeholder="https://ornek.com" {...register('websiteUrl')} />
        {errors.websiteUrl && <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="twitterHandle">Twitter / X Kullanıcı Adı</Label>
        <div className="flex items-center">
          <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">@</span>
          <Input id="twitterHandle" className="rounded-l-none" placeholder="kullanici_adi" {...register('twitterHandle')} />
        </div>
        {errors.twitterHandle && <p className="text-xs text-destructive">{errors.twitterHandle.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="githubHandle">GitHub Kullanıcı Adı</Label>
        <Input id="githubHandle" placeholder="github-kullanici" {...register('githubHandle')} />
        {errors.githubHandle && <p className="text-xs text-destructive">{errors.githubHandle.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </form>
  )
}
