import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Repeat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { AwareNotAttendedDay, AwareRepeatCallers } from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'

const axis = { fontSize: 11, fill: 'var(--color-muted-foreground)' }

export function NotAttendedChart({ data }: { data: AwareNotAttendedDay[] }) {
  const rows = data.map((d) => ({ day: d.day, tasa: d.atendidas_rate == null ? null : Math.round(d.atendidas_rate * 100), no_atendidas: d.no_atendidas }))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transferencias atendidas por día (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={Repeat} title="Sin transferencias en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rows} margin={{ left: 4, right: 12, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axis} tickFormatter={(d: string) => d.slice(5)} minTickGap={24} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={34} tick={axis} />
              <Tooltip
                contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={((v: number, n: string) => (n === 'tasa' ? [`${v}%`, 'Atendidas'] : [v, n])) as never}
              />
              <Line type="monotone" dataKey="tasa" name="tasa" stroke="var(--color-primary)" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function RepeatCallersCard({ data }: { data?: AwareRepeatCallers }) {
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="size-4" /> Clientes que volvieron a llamar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">
          {num(data.repiten)} <span className="text-base font-normal text-muted-foreground">números ({pct(data.repiten_rate)})</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {num(data.llamadas_de_repiten)} llamadas en total de esos clientes, sobre {num(data.numeros)} números
          distintos en el rango.
        </p>
        {data.top.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Máximo: {data.top[0].veces} llamadas de un mismo número.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
