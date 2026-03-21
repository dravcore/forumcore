import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './_components/RegisterForm'

export const metadata: Metadata = {
  title: 'Kayıt Ol',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Hesap Oluştur</h1>
          <p className="text-sm text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
