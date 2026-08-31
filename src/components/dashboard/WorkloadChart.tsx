import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Users } from 'lucide-react'
import { TASK_STATUS } from '@/lib/status'
import type { DashboardData } from '@/lib/types'

const SERIES = [
  { key: 'todo', name: 'Por hacer', color: TASK_STATUS.todo.dot },
  { key: 'in_progress', name: 'En progreso', color: TASK_STATUS.in_progress.dot },
  { key: 'testing', name: 'En pruebas', color: TASK_STATUS.testing.dot },
  { key: 'blocked', name: 'Bloqueado', color: TASK_STATUS.blocked.dot },
] as const

export function WorkloadChart({ data }: { data: DashboardData['workload'] }) {
  const rows = data.map((w) => ({ ...w, short: w.name.split(' ')[0] }))
  const hasLoad = rows.some(
    (w) => w.todo + w.in_progress + w.testing + w.blocked > 0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Carga por desarrollador</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 || !hasLoad ? (
          <EmptyState
            icon={Users}
            title="Sin tareas asignadas"
            description="Asigna un responsable a las tareas (en Módulos y tareas o en el Tablero) para ver aquí la carga de cada desarrollador."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rows} margin={{ left: -16, right: 8 }}>
              <XAxis
                dataKey="short"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis
                allowDecimals={false}
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
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {SERIES.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stackId="load"
                  fill={s.color}
                  radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                  barSize={34}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
