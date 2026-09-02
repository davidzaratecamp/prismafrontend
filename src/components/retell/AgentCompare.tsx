import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RetellAgentStat } from '@/lib/types'
import { dur, ms, num, pct, usd } from './format'
import { cn } from '@/lib/utils'

interface Metric {
  label: string
  get: (a: RetellAgentStat) => string
  /** true = valor más alto es mejor (para resaltar) */
  higherBetter?: boolean
  raw?: (a: RetellAgentStat) => number | null
}

const METRICS: Metric[] = [
  { label: 'Llamadas', get: (a) => num(a.calls), raw: (a) => a.calls },
  { label: 'Costo total', get: (a) => usd(a.cost_usd), raw: (a) => a.cost_usd },
  { label: 'Costo / llamada', get: (a) => usd(a.avg_cost_usd, 3), raw: (a) => a.avg_cost_usd },
  { label: 'Costo / llamada exitosa', get: (a) => usd(a.cost_per_successful_usd, 3), raw: (a) => a.cost_per_successful_usd },
  { label: 'Minutos', get: (a) => num(a.minutes), raw: (a) => a.minutes },
  { label: 'Duración media', get: (a) => dur(a.avg_duration_seconds), raw: (a) => a.avg_duration_seconds },
  { label: 'Tasa de éxito', get: (a) => pct(a.success_rate), higherBetter: true, raw: (a) => a.success_rate },
  { label: 'Sent. positivo', get: (a) => pct(a.positive_rate), higherBetter: true, raw: (a) => a.positive_rate },
  { label: 'Latencia e2e', get: (a) => ms(a.avg_latency_e2e_ms), raw: (a) => a.avg_latency_e2e_ms },
]

/** Comparación lado a lado de hasta 3 agentes. */
export function AgentCompare({ agents }: { agents: RetellAgentStat[] }) {
  const cols = agents.slice(0, 3)
  if (cols.length < 2) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Comparativa de agentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Métrica</th>
                {cols.map((a) => (
                  <th key={a.agent_id} className="px-4 py-2.5 text-right font-medium">
                    {a.agent_name || a.agent_id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const vals = cols.map((a) => m.raw?.(a) ?? null)
                const nums = vals.filter((v): v is number => v != null)
                const best = m.higherBetter != null && nums.length > 1
                  ? (m.higherBetter ? Math.max(...nums) : Math.min(...nums))
                  : null
                return (
                  <tr key={m.label} className="border-b last:border-0">
                    <td className="px-4 py-2 text-muted-foreground">{m.label}</td>
                    {cols.map((a, i) => (
                      <td
                        key={a.agent_id}
                        className={cn(
                          'px-4 py-2 text-right tabular-nums',
                          best != null && vals[i] === best && 'font-semibold text-primary',
                        )}
                      >
                        {m.get(a)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
