import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { RetellVolumeDay } from '@/lib/types'

const TIP = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
}

export function VolumeByDayChart({ data }: { data: RetellVolumeDay[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Llamadas por día</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Activity} title="Sin llamadas en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
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
              <Bar dataKey="ended" stackId="s" name="Finalizadas" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="error" stackId="s" name="Error" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
