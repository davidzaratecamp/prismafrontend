import { Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RetellLatencyStats } from '@/lib/types'
import { ms } from './format'

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function LatencyPanel({ data }: { data?: RetellLatencyStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="size-4" /> Latencia de respuesta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="e2e p50 (prom.)" value={ms(data?.e2e_p50_avg_ms)} hint="usuario deja de hablar → agente responde" />
          <Stat label="e2e p90 (prom.)" value={ms(data?.e2e_p90_avg_ms)} />
          <Stat label="e2e p90 (máx.)" value={ms(data?.e2e_p90_max_ms)} />
          <Stat label="LLM p50 (prom.)" value={ms(data?.llm_p50_avg_ms)} hint="tiempo de respuesta del modelo" />
        </div>
      </CardContent>
    </Card>
  )
}
