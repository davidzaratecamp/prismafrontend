import { Link } from 'react-router-dom'
import { format, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AreaBadge } from '@/components/common/AreaBadge'
import type { DashboardData } from '@/lib/types'

export function AtRiskList({ items }: { items: DashboardData['at_risk'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-amber-500" />
          Proyectos en riesgo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 ? (
          <EmptyState title="Nada en riesgo" description="Ningún proyecto bloqueado ni con fecha vencida." />
        ) : (
          items.map((p) => {
            const overdue = p.due_date && isPast(parseISO(p.due_date))
            return (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <AreaBadge name={p.area_name} color={p.area_color} />
                    <StatusBadge status={p.status} />
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
