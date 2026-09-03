import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { AwareAgentHangup, AwareSentimentByOutcome, AwareServiceGroup } from '@/lib/types'
import { dur, num, pct } from '@/lib/analyticsFormat'
import { sentimentLabel } from './labels'

const axis = { fontSize: 11, fill: 'var(--color-muted-foreground)' }
const rowPct = (v: number, total: number) => (total ? `${Math.round((v / total) * 100)}%` : '—')

export function SentimentOutcomeCard({ rows }: { rows: AwareSentimentByOutcome[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Sentimiento × cómo terminó</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState icon={Bot} title="Sin datos" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Sentimiento</th>
                  <th className="px-4 py-2.5 text-right font-medium">Transferida</th>
                  <th className="px-4 py-2.5 text-right font-medium">Colgó cliente</th>
                  <th className="px-4 py-2.5 text-right font-medium">Colgó bot</th>
                  <th className="px-4 py-2.5 text-right font-medium">Inactividad</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sentiment} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      {sentimentLabel(r.sentiment)}{' '}
                      <span className="text-xs text-muted-foreground">({num(r.total)})</span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{rowPct(r.transfer, r.total)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{rowPct(r.user_hangup, r.total)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{rowPct(r.agent_hangup, r.total)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{rowPct(r.inactivity, r.total)}</td>
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

export function ServiceGroupsCard({ rows }: { rows: AwareServiceGroup[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Por tipo de servicio (agrupado del texto del bot)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState icon={Bot} title="Sin datos" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Grupo</th>
                  <th className="px-4 py-2.5 text-right font-medium">Llamadas</th>
                  <th className="px-4 py-2.5 text-right font-medium">% transferidas</th>
                  <th className="px-4 py-2.5 text-right font-medium">% éxito bot</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.grupo} className="border-b last:border-0">
                    <td className="px-4 py-2">{r.grupo}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{num(r.calls)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{pct(r.transfer_rate)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{pct(r.success_rate)}</td>
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

export function AgentHangupPanel({ data }: { data?: AwareAgentHangup }) {
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="size-4" /> Cuando el bot cuelga la llamada (<code>agent_hangup</code>)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {data.by_project.map((p) => (
            <div key={p.proyecto_id} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{p.name}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{pct(p.rate)}</p>
              <p className="text-xs text-muted-foreground">{num(p.agent_hangup)} de {num(p.calls)} llamadas</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          En estas llamadas el bot habla más ({data.avg_turns} turnos, {dur(data.avg_seconds)} de media) — suele
          ser un callejón sin salida o un cierre prematuro.
        </p>

        {data.by_hour.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.by_hour} margin={{ left: 4, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={axis} tickFormatter={(h) => `${h}h`} />
              <YAxis tickLine={false} axisLine={false} width={36} tick={axis} />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)' }}
                contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="calls" name="Colgó el bot" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {data.sample.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ejemplos recientes
            </p>
            <div className="space-y-2">
              {data.sample.slice(0, 6).map((s) => (
                <div key={s.call_id} className="rounded-lg border p-2.5 text-sm">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{s.proyecto_name} · {s.fecha} {s.hora}</span>
                    <span>{dur(s.duration_seconds)}</span>
                  </div>
                  <p className="line-clamp-2">{s.call_summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
