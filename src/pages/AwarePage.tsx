import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRightLeft,
  Bot,
  PhoneCall,
  PhoneOff,
  Radio,
  Timer,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { EmptyState } from '@/components/common/EmptyState'
import { MiniBarList, type MiniBarRow } from '@/components/common/MiniBarList'
import { HourHeatmap } from '@/components/common/HourHeatmap'
import { dur, num, pct } from '@/lib/analyticsFormat'
import { CallsByDayChart } from '@/components/aware/CallsByDayChart'
import { TrendChart } from '@/components/aware/TrendChart'
import { TransfersAttendedCard } from '@/components/aware/TransfersAttendedCard'
import { ByProjectCompare } from '@/components/aware/ByProjectCompare'
import { DurationHistogram } from '@/components/aware/DurationHistogram'
import { CallsTable } from '@/components/aware/CallsTable'
import { FunnelCard } from '@/components/aware/FunnelCard'
import { HourlyOpsChart, WeekdayChart } from '@/components/aware/OpsCharts'
import { TurnBucketsCard, DurationByOutcomeCard } from '@/components/aware/ConversationCards'
import { SentimentOutcomeCard, ServiceGroupsCard, AgentHangupPanel } from '@/components/aware/CrossCards'
import { NotAttendedChart, RepeatCallersCard } from '@/components/aware/SmallCards'
import { LiveFeed } from '@/components/aware/LiveFeed'
import { HANGUP_COLOR, HANGUP_LABEL, SENTIMENT_COLOR, SENTIMENT_LABEL } from '@/components/aware/labels'
import {
  useAwareAgentHangup,
  useAwareByProject,
  useAwareConfig,
  useAwareDailyTrend,
  useAwareDurationBuckets,
  useAwareDurationByOutcome,
  useAwareFirstUtterances,
  useAwareFunnel,
  useAwareHangup,
  useAwareHeatmap,
  useAwareHourlyOps,
  useAwareNotAttendedByDay,
  useAwareOverview,
  useAwareRepeatCallers,
  useAwareSentiment,
  useAwareSentimentByOutcome,
  useAwareServiceGroups,
  useAwareServiceTypes,
  useAwareTransfersAttended,
  useAwareTurnBuckets,
  useAwareTurnsByOutcome,
  useAwareVolumeByDay,
  useAwareWeekdayOps,
  type AwareFilters,
} from '@/hooks/aware'

/* ── rango de fechas (hora Colombia) ── */
const OFFSET = -5 * 3600000
const todayCo = () => new Date(Date.now() + OFFSET).toISOString().slice(0, 10)
const shift = (ymd: string, days: number) => {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const RELATIVE = [
  { value: 'today', label: 'Hoy' },
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
]

function monthOptions(count = 6) {
  const nl = new Date(Date.now() + OFFSET)
  const out: { value: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(nl.getUTCFullYear(), nl.getUTCMonth() - i, 1))
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const raw = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    out.push({ value: `month:${ym}`, label: raw.charAt(0).toUpperCase() + raw.slice(1) })
  }
  return out
}

function useRange(key: string): { from: string; to: string } {
  return useMemo(() => {
    const today = todayCo()
    if (key === 'today') return { from: today, to: today }
    if (key.startsWith('month:')) {
      const [y, m] = key.slice(6).split('-').map(Number)
      const from = `${key.slice(6)}-01`
      const to = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
      return { from, to }
    }
    return { from: shift(today, -(Number(key) - 1)), to: today }
  }, [key])
}

export default function AwarePage() {
  const [rangeKey, setRangeKey] = useState('30')
  const [proyecto, setProyecto] = useState<'all' | '12' | '13'>('all')
  const range = useRange(rangeKey)
  const months = useMemo(() => monthOptions(6), [])

  const filters: AwareFilters = useMemo(
    () => ({ ...range, proyecto: proyecto === 'all' ? undefined : proyecto }),
    [range, proyecto],
  )

  const config = useAwareConfig()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analítica Aware · SOFIA inbound"
        description="Claro Hogar y Claro TyT — llamadas, transferencias, cuelgues y sentimiento del voicebot."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 sm:flex">
              <Radio className="size-3.5 animate-pulse" /> en vivo · 60 s
            </span>
            <Select value={proyecto} onValueChange={(v) => setProyecto(v as typeof proyecto)}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Ambas campañas</SelectItem>
                  <SelectItem value="12">Claro Hogar</SelectItem>
                  <SelectItem value="13">Claro TyT</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={rangeKey} onValueChange={setRangeKey}>
              <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {RELATIVE.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Mes específico</SelectLabel>
                  {months.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {config.data && !config.data.configured && (
        <Card className="flex items-start gap-3 border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">Falta la conexión a Aware</p>
            <p className="text-muted-foreground">
              Define <code>AWARE_DB_*</code> en <code>backend/.env</code> y reinicia el backend.
            </p>
          </div>
        </Card>
      )}
      {config.data?.error && (
        <Card className="border-red-500/40 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-400">
          No se pudo consultar Aware: {config.data.error}
        </Card>
      )}

      <Tabs defaultValue="resumen">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="recorrido">Recorrido</TabsTrigger>
          <TabsTrigger value="operacion">Operación</TabsTrigger>
          <TabsTrigger value="conversacion">Conversación</TabsTrigger>
          <TabsTrigger value="cruces">Cruces</TabsTrigger>
          <TabsTrigger value="llamadas">Llamadas</TabsTrigger>
          <TabsTrigger value="envivo">En vivo</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="pt-4">
          <ResumenTab filters={filters} single={proyecto !== 'all'} />
        </TabsContent>
        <TabsContent value="recorrido" className="pt-4">
          <RecorridoTab filters={filters} />
        </TabsContent>
        <TabsContent value="operacion" className="pt-4">
          <OperacionTab filters={filters} />
        </TabsContent>
        <TabsContent value="conversacion" className="pt-4">
          <ConversacionTab filters={filters} />
        </TabsContent>
        <TabsContent value="cruces" className="pt-4">
          <CrucesTab filters={filters} />
        </TabsContent>
        <TabsContent value="llamadas" className="pt-4">
          <CallsTable key={`${rangeKey}:${proyecto}`} base={filters} />
        </TabsContent>
        <TabsContent value="envivo" className="pt-4">
          <LiveFeed filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ───────────────────────── Resumen ───────────────────────── */

function ResumenTab({ filters, single }: { filters: AwareFilters; single: boolean }) {
  const overview = useAwareOverview(filters)
  const funnel = useAwareFunnel(filters)
  const volume = useAwareVolumeByDay(filters)
  const trend = useAwareDailyTrend(filters)
  const hangup = useAwareHangup(filters)
  const sentiment = useAwareSentiment(filters)
  const services = useAwareServiceTypes(filters)

  const k = overview.data
  if (overview.isLoading || !k) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }
  if (k.total_calls === 0) {
    return <EmptyState icon={PhoneCall} title="Sin llamadas en el rango elegido" />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Llamadas entrantes" value={num(k.total_calls)} hint={`${filters.from} → ${filters.to}`} icon={PhoneCall} />
        <KpiCard label="Transferidas a asesor" value={pct(k.transfer_rate)} hint={`${num(k.transfers)} llamadas`} icon={ArrowRightLeft} />
        <KpiCard label="Colgó el cliente" value={pct(k.user_hangup_rate)} hint={`${num(k.user_hangup)} llamadas`} icon={PhoneOff} tone="danger" />
        <KpiCard label="Colgó el bot" value={pct(k.agent_hangup_rate)} hint={`${num(k.agent_hangup)} llamadas`} icon={Bot} tone="warning" />
        <KpiCard label="Cerró por inactividad" value={pct(k.inactivity_rate)} hint={`${num(k.inactivity)} llamadas`} icon={PhoneOff} tone="warning" />
        <KpiCard label="Duración media" value={dur(k.avg_duration_seconds)} hint={`P50 ${dur(k.p50_duration_seconds)} · P90 ${dur(k.p90_duration_seconds)}`} icon={Timer} />
        <KpiCard label="Éxito del bot" value={pct(k.success_rate)} hint="según análisis del propio bot" icon={Bot} tone={k.success_rate != null && k.success_rate < 0.5 ? 'warning' : 'success'} />
        <KpiCard label="Sentimiento positivo" value={pct(k.positive_rate)} hint={`negativo ${pct(k.negative_rate)}`} icon={Bot} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelCard data={funnel.data} />
        <CallsByDayChart data={volume.data ?? []} single={single} />
      </div>
      <TrendChart data={trend.data ?? []} />

      <div className="grid gap-4 lg:grid-cols-3">
        <MiniBarList
          title="Cómo terminan las llamadas"
          rows={(hangup.data ?? []).map<MiniBarRow>((r) => ({
            label: HANGUP_LABEL[r.reason ?? ''] ?? r.reason ?? '—',
            value: r.calls,
            color: HANGUP_COLOR[r.reason ?? ''],
          }))}
        />
        <MiniBarList
          title="Sentimiento del cliente"
          rows={(sentiment.data ?? []).map<MiniBarRow>((r) => ({
            label: SENTIMENT_LABEL[r.sentiment ?? ''] ?? r.sentiment ?? '—',
            value: r.calls,
            color: SENTIMENT_COLOR[r.sentiment ?? ''],
          }))}
        />
        <MiniBarList
          title="Tipo de servicio (texto del bot, sin normalizar)"
          emptyLabel="Sin datos"
          rows={(services.data ?? []).slice(0, 8).map<MiniBarRow>((r) => ({ label: r.tipo ?? '—', value: r.calls }))}
        />
      </div>
    </div>
  )
}

/* ───────────────────────── Recorrido ───────────────────────── */

function RecorridoTab({ filters }: { filters: AwareFilters }) {
  const funnel = useAwareFunnel(filters)
  const notAttended = useAwareNotAttendedByDay(filters)
  const transfers = useAwareTransfersAttended(filters)
  const byProject = useAwareByProject(filters)
  const repeat = useAwareRepeatCallers(filters)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelCard data={funnel.data} />
        {transfers.isLoading ? <Skeleton className="h-64 rounded-xl" /> : <TransfersAttendedCard data={transfers.data} />}
      </div>
      <NotAttendedChart data={notAttended.data ?? []} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ByProjectCompare rows={byProject.data ?? []} />
        <RepeatCallersCard data={repeat.data} />
      </div>
    </div>
  )
}

/* ───────────────────────── Operación ───────────────────────── */

function OperacionTab({ filters }: { filters: AwareFilters }) {
  const hourly = useAwareHourlyOps(filters)
  const weekday = useAwareWeekdayOps(filters)
  const heatmap = useAwareHeatmap(filters)

  if (hourly.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <HourlyOpsChart data={hourly.data ?? []} />
      <WeekdayChart data={weekday.data ?? []} />
      <HourHeatmap data={heatmap.data ?? []} />
    </div>
  )
}

/* ───────────────────────── Conversación ───────────────────────── */

function ConversacionTab({ filters }: { filters: AwareFilters }) {
  const turns = useAwareTurnBuckets(filters)
  const turnsByOutcome = useAwareTurnsByOutcome(filters)
  const durByOutcome = useAwareDurationByOutcome(filters)
  const durBuckets = useAwareDurationBuckets(filters)
  const utterances = useAwareFirstUtterances(filters)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <TurnBucketsCard data={turns.data} byOutcome={turnsByOutcome.data ?? []} />
        <DurationByOutcomeCard rows={durByOutcome.data ?? []} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DurationHistogram data={durBuckets.data ?? []} />
        <MiniBarList
          title="Primera frase del cliente (literal, ruidoso)"
          emptyLabel="Sin transcripciones"
          rows={(utterances.data ?? []).slice(0, 10).map<MiniBarRow>((u) => ({ label: u.frase, value: u.calls }))}
        />
      </div>
    </div>
  )
}

/* ───────────────────────── Cruces ───────────────────────── */

function CrucesTab({ filters }: { filters: AwareFilters }) {
  const sentimentOutcome = useAwareSentimentByOutcome(filters)
  const serviceGroups = useAwareServiceGroups(filters)
  const agentHangup = useAwareAgentHangup(filters)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <SentimentOutcomeCard rows={sentimentOutcome.data ?? []} />
        <ServiceGroupsCard rows={serviceGroups.data ?? []} />
      </div>
      <AgentHangupPanel data={agentHangup.data} />
    </div>
  )
}
