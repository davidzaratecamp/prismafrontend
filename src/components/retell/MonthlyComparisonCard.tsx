import { CalendarRange, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RetellMonthlyComparison } from '@/lib/types'
import { num, usd } from './format'
import { cn } from '@/lib/utils'

export function MonthlyComparisonCard({ data }: { data?: RetellMonthlyComparison }) {
  if (!data) return null
  const c = data.current_month
  const p = data.previous_month
  const pctVsPrevCost = p.cost_usd > 0 ? c.cost_usd / p.cost_usd - 1 : null
  const projPct = data.projected_vs_previous_pct
  const up = (projPct ?? 0) >= 0

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
            <p className="text-xs text-muted-foreground">{c.label} · {c.days_elapsed}/{c.days_in_month} días</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{usd(c.cost_usd)}</p>
            <p className="text-xs text-muted-foreground">{num(c.calls)} llamadas · {num(c.minutes)} min</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{p.label} (completo)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground">{usd(p.cost_usd)}</p>
            <p className="text-xs text-muted-foreground">{num(p.calls)} llamadas · {num(p.minutes)} min</p>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proyección a fin de mes</span>
            <span className="text-lg font-semibold tabular-nums">{usd(c.projected_cost_usd)}</span>
          </div>
          {projPct != null && (
            <div className={cn('mt-1 flex items-center gap-1 text-xs', up ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}>
              {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {up ? '+' : ''}{Math.round(projPct * 100)}% vs. {p.label}
            </div>
          )}
          {pctVsPrevCost != null && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Gasto hasta hoy: {pctVsPrevCost >= 0 ? '+' : ''}{Math.round(pctVsPrevCost * 100)}% del total del mes pasado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
