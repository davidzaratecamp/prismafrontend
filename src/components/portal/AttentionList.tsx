import { Link } from 'react-router-dom'
import { format, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaBadge } from '@/components/common/AreaBadge'
import { HealthBadge } from './HealthBadge'
import { projectHealth } from '@/lib/health'
import type { Project } from '@/lib/types'

const RANK = { attention: 0, delayed: 1, risk: 2 } as Record<string, number>

export function AttentionList({ projects }: { projects: Project[] }) {
  const items = projects
    .map((p) => ({ p, h: projectHealth(p) }))
    .filter((x) => x.h.needsAttention)
    .sort((a, b) => {
      const r = (RANK[a.h.key] ?? 9) - (RANK[b.h.key] ?? 9)
      if (r !== 0) return r
      return (a.p.due_date || '9999').localeCompare(b.p.due_date || '9999')
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TriangleAlert className="size-4 text-amber-500" />
          Requiere atención
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ShieldCheck className="size-8 text-emerald-500" />
            <p className="text-sm font-medium">Todo en orden</p>
            <p className="text-xs text-muted-foreground">
              Ningún proyecto bloqueado, en riesgo o con retraso.
            </p>
          </div>
        ) : (
          items.map(({ p }) => {
            const overdue = p.due_date && isPast(parseISO(p.due_date))
            const areas = p.areas.length ? p.areas : p.area ? [p.area] : []
            return (
              <Link
                key={p.id}
                to={`/proyectos/${p.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {areas[0] && <AreaBadge name={areas[0].name} color={areas[0].color} />}
                    <HealthBadge project={p} />
                    {p.due_date && (
                      <span
                        className={
                          overdue
                            ? 'text-xs font-medium text-red-600 dark:text-red-400'
                            : 'text-xs text-muted-foreground'
                        }
                      >
                        {overdue ? 'Venció ' : 'Entrega '}
                        {format(parseISO(p.due_date), "d 'de' MMM", { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {p.progress_cached}%
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
