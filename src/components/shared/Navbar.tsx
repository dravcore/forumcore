import Link from 'next/link'
import { MessageSquare, TrendingUp } from 'lucide-react'
import { NavbarUser } from './NavbarUser'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>ForumCore</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Kategoriler
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <TrendingUp className="h-3.5 w-3.5" />Keşfet
          </Link>
          <Link
            href="/search"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Ara
          </Link>
        </nav>

        {/* Auth — renders NavbarUser based on session state */}
        <NavbarUser />
      </div>
    </header>
  )
}
