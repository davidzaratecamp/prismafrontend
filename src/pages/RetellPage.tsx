import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  Bot,
  CheckCheck,
  Clock,
  DollarSign,
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
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { EmptyState } from '@/components/common/EmptyState'
import { CostByDayChart } from '@/components/retell/CostByDayChart'
import { MiniBarList, type MiniBarRow } from '@/components/retell/MiniBarList'
import { AgentCostTable } from '@/components/retell/AgentCostTable'
import { AgentCompare } from '@/components/retell/AgentCompare'
import { DisconnectionBySuccessTable } from '@/components/retell/DisconnectionBySuccessTable'
import { CallsTab } from '@/components/retell/CallsTab'
import { VolumeByDayChart } from '@/components/retell/VolumeByDayChart'
import { HourHeatmap } from '@/components/retell/HourHeatmap'
import { DurationHistogram } from '@/components/retell/DurationHistogram'
import { LatencyPanel } from '@/components/retell/LatencyPanel'
import { MonthlyComparisonCard } from '@/components/retell/MonthlyComparisonCard'
import { SuccessTrendChart } from '@/components/retell/SuccessTrendChart'
import { num, pct, usd } from '@/components/retell/format'
import { apiErrorMessage } from '@/lib/api'
import { parseDbDate } from '@/lib/time'
import {
  useRetellByAgent,
  useRetellConfig,
  useRetellCostByDay,
  useRetellCostByProduct,
  useRetellDailyTrend,
  useRetellDisconnections,
  useRetellDisconnectionBySuccess,
  useRetellDurationBuckets,
  useRetellFilterOptions,
  useRetellHeatmap,
  useRetellLatency,
  useRetellMonthlyComparison,
  useRetellOverview,
  useRetellSentiment,
  useRetellStatusBreakdown,
  useRetellSync,
  useRetellVolumeByDay,
  type RetellFilters,
} from '@/hooks/retell'
import { RETELL_TZ_OFFSET_MS } from '@/components/retell/format'

const RELATIVE_RANGES = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
]

const SENTIMENT_COLOR: Record<string, string> = {
  Positive: '#10b981',
  Neutral: '#94a3b8',
  Negative: '#ef4444',
  Unknown: '#cbd5e1',
}

/** Últimos N meses como opciones {value: 'month:YYYY-MM', label: 'Septiembre 2026'}. */
function monthOptions(count = 12) {
  const nl = new Date(Date.now() + RETELL_TZ_OFFSET_MS)
  const out: { value: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(nl.getUTCFullYear(), nl.getUTCMonth() - i, 1))
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const raw = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    out.push({ value: `month:${ym}`, label: raw.charAt(0).toUpperCase() + raw.slice(1) })
  }
  return out
}

/** Traduce la selección de rango a filtros {from, to, month}. */
function useSelection(key: string): RetellFilters {
  return useMemo(() => {
    if (key === 'all') return {}
    if (key.startsWith('month:')) {
      const ym = key.slice(6)
      const [y, m] = ym.split('-').map(Number)
      // límites del mes en Bogotá, expresados como instantes UTC
      const from = new Date(Date.UTC(y, m - 1, 1) - RETELL_TZ_OFFSET_MS)
      const to = new Date(Date.UTC(y, m, 1) - RETELL_TZ_OFFSET_MS)
      return { from: from.toISOString(), to: to.toISOString(), month: ym }
    }
    const to = new Date()
    const from = new Date(to.getTime() - Number(key) * 86400000)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [key])
}

export default function RetellPage() {
  const [rangeKey, setRangeKey] = useState('30')
  const [agentId, setAgentId] = useState('all')
  const selection = useSelection(rangeKey)
  const months = useMemo(() => monthOptions(12), [])

  const filterOptions = useRetellFilterOptions()
  const agents = filterOptions.data?.agents ?? []

  const filters: RetellFilters = useMemo(
    () => ({ ...selection, agentId: agentId === 'all' ? undefined : agentId }),
    [selection, agentId],
  )

  const config = useRetellConfig()
  const sync = useRetellSync()

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retell IA"
        description="Costos, agentes virtuales y llamadas del proveedor de IA (Retell)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los agentes</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.agent_id} value={a.agent_id}>
                    {a.agent_name || a.agent_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rangeKey} onValueChange={setRangeKey}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIVE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectLabel>Mes específico</SelectLabel>
                {months.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="all">Todo el histórico</SelectItem>
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
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
          <TabsTrigger value="agentes">Agentes</TabsTrigger>
          <TabsTrigger value="llamadas">Llamadas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="pt-4">
          <ResumenTab range={filters} />
        </TabsContent>
        <TabsContent value="actividad" className="pt-4">
          <ActividadTab range={filters} />
        </TabsContent>
        <TabsContent value="agentes" className="pt-4">
          <AgentesTab range={filters} singleAgent={agentId !== 'all'} />
        </TabsContent>
        <TabsContent value="llamadas" className="pt-4">
          <CallsTab key={`${rangeKey}:${agentId}`} filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ───────────────────────── Resumen ───────────────────────── */

function ResumenTab({ range }: { range: RetellFilters }) {
  const overview = useRetellOverview(range)
  const monthly = useRetellMonthlyComparison(range)
  const costByDay = useRetellCostByDay(range)
  const trend = useRetellDailyTrend(range)
  const byProduct = useRetellCostByProduct(range)
  const sentiment = useRetellSentiment(range)
  const disconnects = useRetellDisconnections(range)

  const k = overview.data

  if (overview.isLoading || !k) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }

  if (k.total_calls === 0) {
    return (
      <EmptyState
        icon={PhoneCall}
        title="Sin llamadas sincronizadas en este rango"
        description="Pulsa “Sincronizar” para traer los datos desde Retell, o amplía el rango de fechas."
      />
    )
  }

  const costPerSuccess = k.successful_calls > 0 ? k.total_cost_usd / k.successful_calls : null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Llamadas" value={num(k.total_calls)} hint={`${k.unique_agents} agentes`} icon={PhoneCall} />
        <KpiCard label="Costo total" value={usd(k.total_cost_usd)} hint={`prom. ${usd(k.avg_cost_usd, 3)}/llamada`} icon={DollarSign} tone="success" />
        <KpiCard label="Costo / llamada exitosa" value={usd(costPerSuccess, 3)} hint={`${num(k.successful_calls)} exitosas`} icon={CheckCheck} tone="success" />
        <KpiCard label="Minutos" value={num(k.total_minutes)} hint={`${k.total_hours} h · ${usd(k.cost_per_minute_usd, 3)}/min`} icon={Timer} />
        <KpiCard
          label="Tasa de éxito"
          value={pct(k.success_rate)}
          hint={`${num(k.successful_calls)} ok · ${num(k.failed_calls)} fallidas`}
          icon={Bot}
          tone={k.success_rate != null && k.success_rate < 0.6 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyComparisonCard data={monthly.data} />
        <CostByDayChart data={costByDay.data ?? []} />
      </div>

      <SuccessTrendChart data={trend.data ?? []} />

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
    </div>
  )
}

/* ───────────────────────── Actividad ───────────────────────── */

function ActividadTab({ range }: { range: RetellFilters }) {
  const volume = useRetellVolumeByDay(range)
  const heatmap = useRetellHeatmap(range)
  const duration = useRetellDurationBuckets(range)
  const status = useRetellStatusBreakdown(range)
  const latency = useRetellLatency(range)

  const loading = volume.isLoading || heatmap.isLoading

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <VolumeByDayChart data={volume.data ?? []} />
      <HourHeatmap data={heatmap.data ?? []} />
      <div className="grid gap-4 lg:grid-cols-2">
        <DurationHistogram data={duration.data ?? []} />
        <MiniBarList
          title="Estado de las llamadas"
          emptyLabel="Sin llamadas en el rango"
          rows={(status.data ?? []).map<MiniBarRow>((s) => ({ label: s.status, value: s.calls }))}
        />
      </div>
      <LatencyPanel data={latency.data} />
    </div>
  )
}

/* ───────────────────────── Agentes ───────────────────────── */

function AgentesTab({ range, singleAgent }: { range: RetellFilters; singleAgent: boolean }) {
  const byAgent = useRetellByAgent(range)
  const discXSuccess = useRetellDisconnectionBySuccess(range)

  if (byAgent.isLoading) return <Skeleton className="h-72 rounded-xl" />

  const rows = byAgent.data ?? []

  return (
    <div className="space-y-6">
      <AgentCostTable rows={rows} />
      {rows.length >= 2 ? (
        <AgentCompare agents={rows} />
      ) : singleAgent ? (
        <p className="text-xs text-muted-foreground">
          Elige “Todos los agentes” arriba para ver la comparativa lado a lado.
        </p>
      ) : null}
      <DisconnectionBySuccessTable rows={discXSuccess.data ?? []} />
    </div>
  )
}
