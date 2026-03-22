'use client'

import { useState, useTransition } from 'react'
import { BarChart2, CheckCircle2, Loader2 } from 'lucide-react'
import { votePoll } from '@/server/actions/pollActions'

interface PollOption {
  id: string
  text: string
  _count: { votes: number }
}

interface PollDisplayProps {
  poll: {
    id: string
    question: string
    endsAt: Date | null
    options: PollOption[]
  }
  userVotedOptionId?: string
  totalVotes: number
  categorySlug: string
  threadSlug: string
  isLoggedIn: boolean
}

export function PollDisplay({
  poll,
  userVotedOptionId,
  totalVotes,
  categorySlug,
  threadSlug,
  isLoggedIn,
}: PollDisplayProps) {
  const [votedOptionId, setVotedOptionId] = useState(userVotedOptionId)
  const [counts, setCounts] = useState(
    Object.fromEntries(poll.options.map((o) => [o.id, o._count.votes]))
  )
  const [total, setTotal] = useState(totalVotes)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEnded = poll.endsAt ? poll.endsAt < new Date() : false
  const showResults = !!votedOptionId || isEnded || !isLoggedIn

  function handleVote(optionId: string) {
    if (votedOptionId || isEnded || !isLoggedIn) return
    setError(null)
    startTransition(async () => {
      const result = await votePoll(optionId, categorySlug, threadSlug)
      if (!result.success) { setError(result.error); return }
      setVotedOptionId(optionId)
      setCounts((prev) => ({ ...prev, [optionId]: (prev[optionId] ?? 0) + 1 }))
      setTotal((t) => t + 1)
    })
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <BarChart2 className="h-4 w-4 text-primary" />
        {poll.question}
      </div>

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      <div className="space-y-2">
        {poll.options.map((option) => {
          const pct = total > 0 ? Math.round((counts[option.id] ?? 0) / total * 100) : 0
          const isVoted = votedOptionId === option.id

          return showResults ? (
            <div key={option.id} className="relative">
              <div
                className="absolute inset-0 rounded-md bg-primary/10 transition-all"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span className="flex items-center gap-1.5">
                  {isVoted && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  {option.text}
                </span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            </div>
          ) : (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isPending}
              className="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
            >
              {option.text}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        <span>{total} oy</span>
        {poll.endsAt && (
          <>
            <span>·</span>
            <span>{isEnded ? 'Sona erdi' : `Bitiş: ${poll.endsAt.toLocaleDateString('tr-TR')}`}</span>
          </>
        )}
      </div>
    </div>
  )
}
