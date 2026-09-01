import { CalendarClock } from 'lucide-react'
import { countdownTo, useNow } from '@/lib/time'
import { cn } from '@/lib/utils'

export function DeliveryCountdown({
  due,
  status,
  variant = 'inline',
}: {
  due: string | null
  status: string
  variant?: 'inline' | 'block'
}) {
  const now = useNow(60_000)
  if (status === 'completed') {
    return variant === 'inline' ? (
      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Entregado</span>
    ) : null
  }
  if (!due) {
    return <span className="text-xs text-muted-foreground">Sin fecha de entrega</span>
  }
  const c = countdownTo(due, now)
  const tone = c.overdue
    ? 'text-red-600 dark:text-red-400'
    : c.days <= 3
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground'

  if (variant === 'block') {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2', c.overdue && 'border-red-300 dark:border-red-900')}>
        <CalendarClock className={cn('size-4', tone)} />
        <span className={cn('text-sm font-semibold', tone)}>{c.long}</span>
      </div>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', tone)}>
      <CalendarClock className="size-3.5" />
      {c.label}
    </span>
  )
}
