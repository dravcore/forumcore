'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TagOption {
  id: string
  name: string
  slug: string
}

interface TagSelectorProps {
  tags: TagOption[]
  value: string[]
  onChange: (ids: string[]) => void
  max?: number
  className?: string
}

export function TagSelector({ tags, value, onChange, max = 5, className }: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = tags.filter((t) => value.includes(t.id))
  const filtered = tags.filter(
    (t) =>
      !value.includes(t.id) &&
      t.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else if (value.length < max) {
      onChange([...value, id])
    }
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id))
  }

  const atMax = value.length >= max

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-9 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5',
          'focus-within:ring-2 focus-within:ring-ring',
          open && 'ring-2 ring-ring'
        )}
      >
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground">Etiket seç (isteğe bağlı)</span>
        )}
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {tag.name}
            <button
              type="button"
              aria-label={`${tag.name} etiketini kaldır`}
              onClick={(e) => {
                e.stopPropagation()
                remove(tag.id)
              }}
              className="rounded-full p-0.5 hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Etiket ara..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="max-h-48 overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Etiket bulunamadı.</li>
            ) : (
              filtered.map((tag) => {
                const disabled = atMax
                return (
                  <li
                    key={tag.id}
                    role="option"
                    aria-selected={false}
                    aria-disabled={disabled}
                    onClick={() => !disabled && toggle(tag.id)}
                    className={cn(
                      'cursor-pointer rounded-sm px-3 py-1.5 text-sm transition-colors',
                      disabled
                        ? 'cursor-not-allowed opacity-40'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {tag.name}
                  </li>
                )
              })
            )}
          </ul>
          {atMax && (
            <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
              En fazla {max} etiket seçebilirsin.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
