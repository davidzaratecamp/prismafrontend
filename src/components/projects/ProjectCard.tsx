import { Link } from 'react-router-dom'
import { format, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, LayoutGrid, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/common/ProgressRing'
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge'
import { AreaBadge } from '@/components/common/AreaBadge'
import { AvatarStack } from '@/components/common/UserAvatar'
import { useAuthStore } from '@/stores/auth'
import type { Project } from '@/lib/types'

export function ProjectCard({ project: p }: { project: Project }) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const requestedByMe = !!currentUserId && p.requesters.some((r) => r.id === currentUserId)
  const overdue =
    p.due_date && isPast(parseISO(p.due_date)) && p.status !== 'completed' && p.status !== 'paused'

  return (
    <Link to={`/projects/${p.id}`}>
      <Card
        className={
          'group h-full p-5 transition-all hover:shadow-md ' +
          (requestedByMe
            ? 'border-primary/40 ring-1 ring-primary/20 hover:border-primary/60'
            : 'hover:border-primary/40')
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {p.area && <AreaBadge name={p.area.name} color={p.area.color} />}
              {p.areas.length > 1 && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{p.areas.length - 1} área{p.areas.length - 1 === 1 ? '' : 's'}
                </span>
              )}
              {requestedByMe && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  <Sparkles className="size-3" /> Solicitado por ti
                </span>
              )}
            </div>
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
            {p.planned_modules_count != null ? (
              <span
                className={
                  p.planned_modules_count > p.module_count
                    ? 'font-medium text-amber-600 dark:text-amber-400'
                    : undefined
                }
              >
                {p.module_count}/{p.planned_modules_count} módulos
              </span>
            ) : (
              <>
                {p.module_count} módulo{p.module_count === 1 ? '' : 's'}
              </>
            )}
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
