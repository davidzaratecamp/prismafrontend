import { projectHealth, type HealthInput } from '@/lib/health'
import { cn } from '@/lib/utils'

export function HealthBadge({
  project,
  className,
  size = 'sm',
}: {
  project: HealthInput
  className?: string
  size?: 'sm' | 'md'
}) {
  const h = projectHealth(project)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs',
        h.badge,
        className,
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: h.dot }} />
      {h.label}
    </span>
  )
}
