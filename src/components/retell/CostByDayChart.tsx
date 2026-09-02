import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { RetellCostDay } from '@/lib/types'
import { usd } from './format'

export function CostByDayChart({ data }: { data: RetellCostDay[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Costo por día (USD)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={BarChart3} title="Sin llamadas en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
              <defs>
                <linearGradient id="retellCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={(d: string) => d.slice(5)}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={
                  ((v: number, _n: string, p: { payload: RetellCostDay }) => [
                    `${usd(v)}  ·  ${p.payload.calls} llamadas  ·  ${p.payload.minutes} min`,
                    'Costo',
                  ]) as never
                }
              />
              <Area
                type="monotone"
                dataKey="cost_usd"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#retellCost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
