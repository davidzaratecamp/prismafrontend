import { CalendarRange, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RetellMonthlyComparison } from '@/lib/types'
import { num, usd } from './format'
import { cn } from '@/lib/utils'

function DeltaPill({ pct }: { pct: number }) {
  const up = pct >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        up ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      )}
    >
      {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
      {up ? '+' : ''}
      {Math.round(pct * 100)}%
    </span>
  )
}

export function MonthlyComparisonCard({ data }: { data?: RetellMonthlyComparison }) {
  if (!data) return null
  const c = data.current_month
  const p = data.previous_month
  const sp = data.previous_month_same_period

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="size-4" /> Mes en curso vs. anterior
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {c.label} · {c.days_elapsed}/{c.days_in_month} días
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{usd(c.cost_usd)}</p>
            <p className="text-xs text-muted-foreground">
              {num(c.calls)} llamadas · {num(c.minutes)} min
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{p.label} (completo)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground">
              {usd(p.cost_usd)}
            </p>
            <p className="text-xs text-muted-foreground">
              {num(p.calls)} llamadas · {num(p.minutes)} min
            </p>
          </div>
        </div>

        {/* comparación justa: mismo tramo del mes pasado */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Mismo tramo de {sp.label} (primeros {sp.through_day} días)
            </span>
            <span className="text-sm font-medium tabular-nums">{usd(sp.cost_usd)}</span>
          </div>
          {data.same_period_change_pct != null ? (
            <div className="mt-1 flex items-center gap-2">
              <DeltaPill pct={data.same_period_change_pct} />
              <span className="text-[11px] text-muted-foreground">
                vs. este mismo punto del mes pasado ({num(sp.calls)} llamadas entonces)
              </span>
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Sin base de comparación: {sp.label} no registró actividad en este tramo.
            </p>
          )}
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proyección a fin de mes</span>
            <span
              className={cn(
                'text-lg font-semibold tabular-nums',
                !c.projection_reliable && 'text-muted-foreground',
              )}
            >
              {usd(c.projected_cost_usd)}
            </span>
          </div>
          {data.projected_vs_previous_pct != null && (
            <div className="mt-1 flex items-center gap-2">
              <DeltaPill pct={data.projected_vs_previous_pct} />
              <span className="text-[11px] text-muted-foreground">vs. {p.label} completo</span>
            </div>
          )}
          {!c.projection_reliable && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Estimación provisional — solo {c.days_elapsed} día(s) de datos. Se estabiliza a partir del 3.º.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
