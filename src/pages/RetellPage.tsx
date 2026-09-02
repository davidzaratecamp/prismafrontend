import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  Bot,
  Clock,
  DollarSign,
  Gauge,
  PhoneCall,
  RefreshCw,
  Timer,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { EmptyState } from '@/components/common/EmptyState'
import { CostByDayChart } from '@/components/retell/CostByDayChart'
import { MiniBarList, type MiniBarRow } from '@/components/retell/MiniBarList'
import { AgentCostTable } from '@/components/retell/AgentCostTable'
import { CallsTab } from '@/components/retell/CallsTab'
import { dur, num, pct, usd } from '@/components/retell/format'
import { apiErrorMessage } from '@/lib/api'
import { parseDbDate } from '@/lib/time'
import {
  useRetellByAgent,
  useRetellConfig,
  useRetellCostByDay,
  useRetellCostByProduct,
  useRetellDisconnections,
  useRetellOverview,
  useRetellSentiment,
  useRetellSync,
  type RetellFilters,
} from '@/hooks/retell'

const RANGES = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: 'all', label: 'Todo el histórico' },
]

const SENTIMENT_COLOR: Record<string, string> = {
  Positive: '#10b981',
  Neutral: '#94a3b8',
  Negative: '#ef4444',
  Unknown: '#cbd5e1',
}

function useRange(days: string): RetellFilters {
  return useMemo(() => {
    if (days === 'all') return {}
    const to = new Date()
    const from = new Date(to.getTime() - Number(days) * 86400000)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [days])
}

export default function RetellPage() {
  const [rangeDays, setRangeDays] = useState('30')
  const range = useRange(rangeDays)

  const config = useRetellConfig()
  const sync = useRetellSync()

  const overview = useRetellOverview(range)
  const costByDay = useRetellCostByDay(range)
  const byAgent = useRetellByAgent(range)
  const byProduct = useRetellCostByProduct(range)
  const sentiment = useRetellSentiment(range)
  const disconnects = useRetellDisconnections(range)

  const callsState = config.data?.sync_status?.find((s) => s.resource === 'calls')
  const lastRun = callsState?.last_run_at
    ? formatDistanceToNow(parseDbDate(callsState.last_run_at), { addSuffix: true, locale: es })
    : null

  async function runSync() {
    try {
      const res = await sync.mutateAsync(undefined)
      const n = res?.calls?.processed ?? 0
      toast.success(`Sincronización lista · ${n} llamadas actualizadas`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo sincronizar'))
    }
  }

  const k = overview.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retell IA"
        description="Costos, agentes virtuales y llamadas del proveedor de IA (Retell)."
        actions={
          <div className="flex items-center gap-2">
            <Select value={rangeDays} onValueChange={setRangeDays}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={runSync} disabled={sync.isPending}>
              <RefreshCw className={sync.isPending ? 'size-4 animate-spin' : 'size-4'} />
              {sync.isPending ? 'Sincronizando…' : 'Sincronizar'}
            </Button>
          </div>
        }
      />

      {config.data && !config.data.configured && (
        <Card className="flex items-start gap-3 border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">Falta la API key de Retell</p>
            <p className="text-muted-foreground">
              Define <code>RETELL_API_KEY</code> en <code>backend/.env</code> y reinicia el backend.
              Mientras tanto el panel muestra solo lo ya sincronizado.
            </p>
          </div>
        </Card>
      )}

      {lastRun && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Última sincronización de llamadas {lastRun}
          {callsState?.last_status === 'error' && (
            <span className="text-red-600 dark:text-red-400">· última corrida con error</span>
          )}
        </p>
      )}

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="agentes">Agentes</TabsTrigger>
          <TabsTrigger value="llamadas">Llamadas</TabsTrigger>
        </TabsList>

        {/* ─────────── Resumen ─────────── */}
        <TabsContent value="resumen" className="space-y-6 pt-4">
          {overview.isLoading || !k ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : k.total_calls === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="Sin llamadas sincronizadas en este rango"
              description="Pulsa “Sincronizar” para traer los datos desde Retell, o amplía el rango de fechas."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <KpiCard label="Llamadas" value={num(k.total_calls)} hint={`${k.unique_agents} agentes`} icon={PhoneCall} />
                <KpiCard label="Costo total" value={usd(k.total_cost_usd)} hint={`prom. ${usd(k.avg_cost_usd, 3)}/llamada`} icon={DollarSign} tone="success" />
                <KpiCard label="Minutos" value={num(k.total_minutes)} hint={`${k.total_hours} h en total`} icon={Timer} />
                <KpiCard label="Costo por minuto" value={usd(k.cost_per_minute_usd, 3)} hint={`dur. media ${dur(k.avg_duration_seconds)}`} icon={Gauge} />
                <KpiCard
                  label="Tasa de éxito"
                  value={pct(k.success_rate)}
                  hint={`${k.successful_calls} ok · ${k.failed_calls} fallidas`}
                  icon={Bot}
                  tone={k.success_rate != null && k.success_rate < 0.6 ? 'warning' : 'success'}
                />
              </div>

              <CostByDayChart data={costByDay.data ?? []} />

              <div className="grid gap-4 lg:grid-cols-3">
                <MiniBarList
                  title="Costo por producto (USD)"
                  emptyLabel="Sin desglose de costos"
                  rows={(byProduct.data ?? []).map<MiniBarRow>((p) => ({
                    label: p.product,
                    value: p.cost_usd,
                    display: usd(p.cost_usd),
                  }))}
                />
                <MiniBarList
                  title="Sentimiento del usuario"
                  emptyLabel="Sin análisis de sentimiento"
                  rows={(sentiment.data ?? []).map<MiniBarRow>((s) => ({
                    label: s.sentiment,
                    value: s.calls,
                    color: SENTIMENT_COLOR[s.sentiment],
                  }))}
                />
                <MiniBarList
                  title="Motivos de desconexión"
                  emptyLabel="Sin datos de corte"
                  rows={(disconnects.data ?? []).slice(0, 6).map<MiniBarRow>((r) => ({
                    label: r.reason,
                    value: r.calls,
                  }))}
                />
              </div>
            </>
          )}
        </TabsContent>

        {/* ─────────── Agentes ─────────── */}
        <TabsContent value="agentes" className="pt-4">
          {byAgent.isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <AgentCostTable rows={byAgent.data ?? []} />
          )}
        </TabsContent>

        {/* ─────────── Llamadas ─────────── */}
        <TabsContent value="llamadas" className="pt-4">
          <CallsTab range={range} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
