import { Link } from 'react-router-dom'
import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarClock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { AreaBadge } from '@/components/common/AreaBadge'
import type { Project } from '@/lib/types'

export function UpcomingDeliveries({
  projects,
  days = 30,
}: {
  projects: Project[]
  days?: number
}) {
  const today = new Date()
  const items = projects
    .filter((p) => {
      if (!p.due_date || p.status === 'completed' || p.status === 'paused') return false
      const d = differenceInCalendarDays(parseISO(p.due_date), today)
      return d >= 0 && d <= days
    })
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))

  const groups = new Map<string, Project[]>()
  for (const p of items) {
    const wk = startOfWeek(parseISO(p.due_date!), { weekStartsOn: 1 }).toISOString()
    if (!groups.has(wk)) groups.set(wk, [])
    groups.get(wk)!.push(p)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="size-4 text-primary" />
          Próximas entregas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="Nada previsto en los próximos 30 días"
            description="No hay proyectos con entrega estimada en ese rango."
          />
        ) : (
          <div className="space-y-4">
            {[...groups.entries()].map(([wk, list]) => (
              <div key={wk}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Semana del {format(parseISO(wk), "d 'de' MMM", { locale: es })}
                </p>
                <div className="space-y-1">
                  {list.map((p) => {
                    const areas = p.areas.length ? p.areas : p.area ? [p.area] : []
                    return (
                      <Link
                        key={p.id}
                        to={`/proyectos/${p.id}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                      >
                        <span className="w-14 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                          {format(parseISO(p.due_date!), 'd MMM', { locale: es })}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                        {areas[0] && (
                          <AreaBadge name={areas[0].name} color={areas[0].color} />
                        )}
                        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                          {p.progress_cached}%
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
