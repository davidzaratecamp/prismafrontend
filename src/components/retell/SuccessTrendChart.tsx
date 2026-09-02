import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LineChart as LineIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { RetellDailyTrend } from '@/lib/types'

export function SuccessTrendChart({ data }: { data: RetellDailyTrend[] }) {
  const rows = data.map((d) => ({
    day: d.day,
    exito: d.success_rate == null ? null : Math.round(d.success_rate * 100),
    positivo: d.positive_rate == null ? null : Math.round(d.positive_rate * 100),
    negativo: d.negative_rate == null ? null : Math.round(d.negative_rate * 100),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tendencia de éxito y sentimiento (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={LineIcon} title="Sin datos en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rows} margin={{ left: 4, right: 12, top: 4 }}>
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
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={((v: number, n: string) => [`${v}%`, n]) as never}
              />
              <Line type="monotone" dataKey="exito" name="Éxito" stroke="var(--color-primary)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="positivo" name="Sent. positivo" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="negativo" name="Sent. negativo" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
