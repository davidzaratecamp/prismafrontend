import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2, PhoneOff, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type {
  AwareAgentRow,
  AwareHumanFunnelDay,
  AwareHumanOutcomes,
  AwareQueueAbandon,
} from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'
import { cn } from '@/lib/utils'

const axis = { fontSize: 11, fill: 'var(--color-muted-foreground)' }

const EFECT_COLOR: Record<string, string> = {
  UP: '#10b981',
  UN: '#f59e0b',
}

export function HumanOutcomesCard({ data }: { data?: AwareHumanOutcomes }) {
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="size-4" /> Resultado del asesor humano (tras la transferencia)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{num(data.atendidas)}</p>
            <p className="text-xs text-muted-foreground">atendidas ({pct(data.atendidas_rate)} de {num(data.transfers)})</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{num(data.util_positivo)}</p>
            <p className="text-xs text-muted-foreground">ÚTIL POSITIVO · conversión {pct(data.conversion_rate)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{num(data.util_negativo)}</p>
            <p className="text-xs text-muted-foreground">ÚTIL NEGATIVO</p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tipificación de las llamadas atendidas
          </p>
          <ul className="space-y-1.5">
            {data.tipificaciones.map((t) => {
              const w = data.atendidas ? (t.calls / data.atendidas) * 100 : 0
              return (
                <li key={t.cod} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.nombre}</span>
                    <span className="tabular-nums">{num(t.calls)} · {Math.round(w)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${w}%`, background: EFECT_COLOR[t.cod] ?? '#94a3b8' }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {num(data.sin_atender)} transferencias no llegaron a un asesor. El emparejamiento bot→asesor es
          aproximado (teléfono + fecha + hora).
        </p>
      </CardContent>
    </Card>
  )
}

export function ConversionTrendCard({ data }: { data: AwareHumanFunnelDay[] }) {
  const rows = data.map((d) => ({ day: d.day, conv: d.conversion_rate == null ? null : Math.round(d.conversion_rate * 100) }))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversión a ÚTIL POSITIVO por día (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Sin transferencias en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rows} margin={{ left: 4, right: 12, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axis} tickFormatter={(d: string) => d.slice(5)} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} width={34} tick={axis} />
              <Tooltip
                contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={((v: number) => [`${v}%`, 'Conversión']) as never}
              />
              <Line type="monotone" dataKey="conv" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function AgentRankingTable({
  rows,
  nameById = {},
}: {
  rows: AwareAgentRow[]
  nameById?: Record<string, string>
}) {
  const sorted = [...rows].sort((a, b) => (b.up_rate ?? 0) - (a.up_rate ?? 0))
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4" /> Asesores — resultado de negocio (tipificación)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-6"><EmptyState icon={Users} title="Sin llamadas de asesor en el rango" /></div>
        ) : (
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/95">
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Asesor</th>
                  <th className="px-4 py-2.5 text-right font-medium">Llamadas</th>
                  <th className="px-4 py-2.5 text-right font-medium">ÚTIL POS.</th>
                  <th className="px-4 py-2.5 text-right font-medium">% positivo</th>
                  <th className="px-4 py-2.5 text-right font-medium">% efectivo</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <tr key={a.agente_id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2">
                      {nameById[a.agente_id] ?? <span className="font-mono text-xs text-muted-foreground">{a.agente_id}</span>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{a.calls}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{a.up}</td>
                    <td className={cn('px-4 py-2 text-right tabular-nums font-medium', (a.up_rate ?? 0) >= 0.12 && 'text-emerald-600 dark:text-emerald-400')}>
                      {pct(a.up_rate)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{pct(a.efectivo_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function QueueAbandonCard({ data }: { data?: AwareQueueAbandon }) {
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PhoneOff className="size-4" /> Abandono en cola de asesor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{num(data.total)}</p>
            <p className="text-xs text-muted-foreground">abandonos</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{data.avg_espera_s}s</p>
            <p className="text-xs text-muted-foreground">espera media</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{Math.round(data.max_espera_s / 60)}m</p>
            <p className="text-xs text-muted-foreground">espera máxima</p>
          </div>
        </div>
        {data.by_day.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.by_day} margin={{ left: 4, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axis} tickFormatter={(d: string) => d.slice(5)} minTickGap={20} />
              <YAxis tickLine={false} axisLine={false} width={30} tick={axis} />
              <Tooltip contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="abandonos" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="text-[11px] text-muted-foreground">{data.note}</p>
      </CardContent>
    </Card>
  )
}
