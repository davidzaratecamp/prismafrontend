import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { RetellDurationBucket } from '@/lib/types'

export function DurationHistogram({ data }: { data: RetellDurationBucket[] }) {
  const total = data.reduce((s, b) => s + b.calls, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Duración de las llamadas</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState icon={Timer} title="Sin llamadas en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)' }}
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={((v: number) => [`${v.toLocaleString('es-CO')} llamadas`, '']) as never}
              />
              <Bar dataKey="calls" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={44} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
