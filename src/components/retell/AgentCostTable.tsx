import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Bot } from 'lucide-react'
import type { RetellAgentStat } from '@/lib/types'
import { dur, ms, pct, usd } from './format'

export function AgentCostTable({ rows }: { rows: RetellAgentStat[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={Bot} title="Sin datos de agentes en el rango" />
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Agente</th>
              <th className="px-4 py-2.5 text-right font-medium">Llamadas</th>
              <th className="px-4 py-2.5 text-right font-medium">Minutos</th>
              <th className="px-4 py-2.5 text-right font-medium">Costo</th>
              <th className="px-4 py-2.5 text-right font-medium">Costo/llamada</th>
              <th className="px-4 py-2.5 text-right font-medium">Duración media</th>
              <th className="px-4 py-2.5 text-right font-medium">Éxito</th>
              <th className="px-4 py-2.5 text-right font-medium">Latencia e2e</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.agent_id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <span className="font-medium">{r.agent_name || r.agent_id}</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.calls}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.minutes}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">{usd(r.cost_usd, 2)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{usd(r.avg_cost_usd, 3)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{dur(r.avg_duration_seconds)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{pct(r.success_rate)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{ms(r.avg_latency_e2e_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
