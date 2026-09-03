import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { AwareVolumeDay } from '@/lib/types'

const TIP = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
}

export function CallsByDayChart({ data, single }: { data: AwareVolumeDay[]; single?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Llamadas por día</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Activity} title="Sin llamadas en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
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
                width={44}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip contentStyle={TIP} cursor={{ fill: 'var(--color-muted)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {single ? (
                <Bar dataKey="calls" name="Llamadas" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              ) : (
                <>
                  <Bar dataKey="hogar" stackId="s" name="Claro Hogar" fill="var(--color-primary)" />
                  <Bar dataKey="tyt" stackId="s" name="Claro TyT" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                </>
              )}
              <Line
                type="monotone"
                dataKey="transfers"
                name="Transferidas"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
