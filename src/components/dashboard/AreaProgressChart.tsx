import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardData } from '@/lib/types'
import { EmptyState } from '@/components/common/EmptyState'
import { BarChart3 } from 'lucide-react'

export function AreaProgressChart({ data }: { data: DashboardData['by_area'] }) {
  const rows = [...data].sort((a, b) => b.avg_progress - a.avg_progress)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Avance promedio por área</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={BarChart3} title="Sin datos de áreas todavía" />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 44)}>
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)' }}
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={((v: number, _n: string, p: { payload: { active: number; name: string } }) => [
                  `${v}%  ·  ${p.payload.active} activos`,
                  p.payload.name,
                ]) as never}
              />
              <Bar dataKey="avg_progress" radius={[0, 6, 6, 0]} barSize={18}>
                {rows.map((r) => (
                  <Cell key={r.id} fill={r.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
