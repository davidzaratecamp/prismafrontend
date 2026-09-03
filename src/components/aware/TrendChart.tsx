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
import type { AwareDailyTrend } from '@/lib/types'

export function TrendChart({ data }: { data: AwareDailyTrend[] }) {
  const p = (v: number | null) => (v == null ? null : Math.round(v * 100))
  const rows = data.map((d) => ({
    day: d.day,
    exito: p(d.success_rate),
    positivo: p(d.positive_rate),
    neutral: p(d.neutral_rate),
    negativo: p(d.negative_rate),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tendencia de éxito y sentimiento (%)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <EmptyState icon={LineIcon} title="Sin datos en el rango" />
        ) : (
          <>
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
                  width={34}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
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
                <Line type="monotone" dataKey="exito" name="Éxito bot" stroke="var(--color-primary)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="positivo" name="Sent. positivo" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="neutral" name="Sent. neutral" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                <Line type="monotone" dataKey="negativo" name="Sent. negativo" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground">
              Positivo + neutral + negativo = 100% del sentimiento. El <span className="font-medium">éxito</span> lo
              decide el propio bot (¿cumplió el objetivo de la llamada?) — no es "venta".
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
