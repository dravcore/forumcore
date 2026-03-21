import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './_components/LoginForm'

export const metadata: Metadata = {
  title: 'Giriş Yap',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Giriş Yap</h1>
          <p className="text-sm text-muted-foreground">
            Hesabın yok mu?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
