interface DayActivity { date: string; count: number }

interface ActivityCalendarProps {
  activity: DayActivity[]
  days?: number
}

function getColor(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900'
  if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-700'
  if (count <= 10) return 'bg-emerald-600 dark:bg-emerald-500'
  return 'bg-emerald-800 dark:bg-emerald-300'
}

export function ActivityCalendar({ activity, days = 365 }: ActivityCalendarProps) {
  const activityMap = new Map(activity.map((a) => [a.date, a.count]))

  // Build 52-week grid ending today
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days + 1)

  const cells: { date: string; count: number; dayOfWeek: number }[] = []
  const cursor = new Date(startDate)
  while (cursor <= today) {
    const dateStr = cursor.toISOString().split('T')[0]
    cells.push({ date: dateStr, count: activityMap.get(dateStr) ?? 0, dayOfWeek: cursor.getDay() })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Group into weeks (columns)
  const weeks: typeof cells[] = []
  let week: typeof cells = []
  for (const cell of cells) {
    week.push(cell)
    if (cell.dayOfWeek === 6) { weeks.push(week); week = [] }
  }
  if (week.length > 0) weeks.push(week)

  const totalContributions = activity.reduce((sum, a) => sum + a.count, 0)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Son 1 yıl</span>
        <span>{totalContributions} katkı</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-0">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={`${cell.date}: ${cell.count} katkı`}
                  className={`h-2.5 w-2.5 rounded-sm ${getColor(cell.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <span>Az</span>
        {[0, 2, 5, 10, 15].map((v) => (
          <div key={v} className={`h-2.5 w-2.5 rounded-sm ${getColor(v)}`} />
        ))}
        <span>Çok</span>
      </div>
    </div>
  )
}
