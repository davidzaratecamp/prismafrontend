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
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { AwareHourlyOp, AwareWeekdayOp } from '@/lib/types'

const TIP = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
}
const axis = { fontSize: 11, fill: 'var(--color-muted-foreground)' }

export function HourlyOpsChart({ data }: { data: AwareHourlyOp[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4" /> Por hora del día — promedio por día operativo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Clock} title="Sin llamadas en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={axis} tickFormatter={(h) => `${h}h`} />
              <YAxis tickLine={false} axisLine={false} width={40} tick={axis} />
              <Tooltip contentStyle={TIP} cursor={{ fill: 'var(--color-muted)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="calls_per_day" name="Llamadas/día" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              <Line dataKey="transfers_per_day" name="Transferencias/día" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Promedio de una hora en un día con actividad — úsalo para dimensionar la cola humana.
        </p>
      </CardContent>
    </Card>
  )
}

export function WeekdayChart({ data }: { data: AwareWeekdayOp[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Por día de semana — promedio diario</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Clock} title="Sin datos" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} tickFormatter={(l: string) => l.slice(0, 3)} />
              <YAxis tickLine={false} axisLine={false} width={40} tick={axis} />
              <Tooltip contentStyle={TIP} cursor={{ fill: 'var(--color-muted)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="calls_per_day" name="Llamadas/día" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="transfers_per_day" name="Transferencias/día" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
