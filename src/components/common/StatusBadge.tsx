import { cn } from '@/lib/utils'
import { PRIORITY, PROJECT_STATUS, TASK_STATUS } from '@/lib/status'
import type { Priority, ProjectStatus, TaskStatus } from '@/lib/types'

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const m = PROJECT_STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', m.badge, className)}>
      <span className="size-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  )
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const m = TASK_STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', m.badge, className)}>
      <span className="size-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  )
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const m = PRIORITY[priority]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', m.badge, className)}>
      {m.label}
    </span>
  )
}
