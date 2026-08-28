import { Link } from 'react-router-dom'
import { format, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/common/ProgressRing'
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge'
import { AreaBadge } from '@/components/common/AreaBadge'
import { AvatarStack } from '@/components/common/UserAvatar'
import type { Project } from '@/lib/types'

export function ProjectCard({ project: p }: { project: Project }) {
  const overdue =
    p.due_date && isPast(parseISO(p.due_date)) && p.status !== 'completed' && p.status !== 'paused'

  return (
    <Link to={`/projects/${p.id}`}>
      <Card className="group h-full p-5 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {p.area && <AreaBadge name={p.area.name} color={p.area.color} />}
            <h3 className="mt-2 line-clamp-2 font-semibold leading-snug group-hover:text-primary">
              {p.name}
            </h3>
          </div>
          <ProgressRing value={p.progress_cached} />
        </div>

        {p.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={p.status} />
          <PriorityBadge priority={p.priority} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="size-3.5" />
            {p.module_count} módulo{p.module_count === 1 ? '' : 's'}
          </span>
          {p.due_date && (
            <span
              className={
                overdue
                  ? 'flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400'
                  : 'flex items-center gap-1.5'
              }
            >
              <CalendarDays className="size-3.5" />
              {format(parseISO(p.due_date), "d MMM yyyy", { locale: es })}
            </span>
          )}
        </div>

        {p.members.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <AvatarStack people={p.members} />
            {p.lead && <span className="text-xs text-muted-foreground">Lidera {p.lead.name.split(' ')[0]}</span>}
          </div>
        )}
      </Card>
    </Link>
  )
}
