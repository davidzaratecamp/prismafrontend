import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AwareAgentHangup,
  AwareByProject,
  AwareCall,
  AwareCallDetail,
  AwareCallsPage,
  AwareConfig,
  AwareCountRow,
  AwareDailyTrend,
  AwareDurationBucket,
  AwareDurationByOutcome,
  AwareFilterOptions,
  AwareFirstUtterance,
  AwareFunnel,
  AwareHangupDay,
  AwareHeatCell,
  AwareHourlyOp,
  AwareLiveFeed,
  AwareNotAttendedDay,
  AwareOverview,
  AwareRepeatCallers,
  AwareSentimentByOutcome,
  AwareServiceGroup,
  AwareTransfersAttended,
  AwareTurnBuckets,
  AwareTurnsByOutcome,
  AwareVolumeDay,
  AwareWeekdayOp,
} from '@/lib/types'

export interface AwareFilters {
  from?: string // 'YYYY-MM-DD' (hora Colombia)
  to?: string
  proyecto?: '12' | '13'
  hangup?: string
  phone?: string
  sentiment?: string
  callSuccessful?: 'true' | 'false'
  page?: number
  pageSize?: number
}

const LIVE = 60_000

function clean(f: AwareFilters = {}): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === null || v === '' || v === 'all') continue
    out[k] = v as string | number
  }
  return out
}

function useAware<T>(sub: string, path: string, f?: AwareFilters, refetch: number | false = LIVE) {
  const params = clean(f)
  return useQuery({
    queryKey: ['aware', sub, params],
    queryFn: async () => (await api.get<T>(`/aware/${path}`, { params })).data,
    refetchInterval: refetch,
  })
}

export const useAwareConfig = () =>
  useQuery({
    queryKey: ['aware', 'config'],
    queryFn: async () => (await api.get<AwareConfig>('/aware/config')).data,
    refetchInterval: LIVE,
  })

export const useAwareFilters = () =>
  useAware<AwareFilterOptions>('filters', 'analytics/filters', undefined, false)

export const useAwareOverview = (f?: AwareFilters) =>
  useAware<AwareOverview>('overview', 'analytics/overview', f)
export const useAwareVolumeByDay = (f?: AwareFilters) =>
  useAware<AwareVolumeDay[]>('volume-by-day', 'analytics/volume-by-day', f)
export const useAwareVolumeByHour = (f?: AwareFilters) =>
  useAware<{ hour: number; calls: number }[]>('volume-by-hour', 'analytics/volume-by-hour', f)
export const useAwareHeatmap = (f?: AwareFilters) =>
  useAware<AwareHeatCell[]>('heatmap', 'analytics/heatmap', f)
export const useAwareHangup = (f?: AwareFilters) =>
  useAware<AwareCountRow[]>('hangup', 'analytics/hangup', f)
export const useAwareHangupByDay = (f?: AwareFilters) =>
  useAware<AwareHangupDay[]>('hangup-by-day', 'analytics/hangup-by-day', f)
export const useAwareSentiment = (f?: AwareFilters) =>
  useAware<AwareCountRow[]>('sentiment', 'analytics/sentiment', f)
export const useAwareDailyTrend = (f?: AwareFilters) =>
  useAware<AwareDailyTrend[]>('daily-trend', 'analytics/daily-trend', f)
export const useAwareServiceTypes = (f?: AwareFilters) =>
  useAware<AwareCountRow[]>('service-types', 'analytics/service-types', f)
export const useAwareDurationBuckets = (f?: AwareFilters) =>
  useAware<AwareDurationBucket[]>('duration-buckets', 'analytics/duration-buckets', f)
export const useAwareByProject = (f?: AwareFilters) =>
  useAware<AwareByProject[]>('by-project', 'analytics/by-project', f)
export const useAwareTransfersAttended = (f?: AwareFilters) =>
  useAware<AwareTransfersAttended>('transfers-attended', 'analytics/transfers-attended', f)
export const useAwareCalls = (f?: AwareFilters) =>
  useAware<AwareCallsPage>('calls', 'calls', f)

// recorrido / embudo
export const useAwareFunnel = (f?: AwareFilters) =>
  useAware<AwareFunnel>('funnel', 'analytics/funnel', f)
export const useAwareNotAttendedByDay = (f?: AwareFilters) =>
  useAware<AwareNotAttendedDay[]>('not-attended-by-day', 'analytics/not-attended-by-day', f)
export const useAwareRepeatCallers = (f?: AwareFilters) =>
  useAware<AwareRepeatCallers>('repeat-callers', 'analytics/repeat-callers', f)

// operación
export const useAwareHourlyOps = (f?: AwareFilters) =>
  useAware<AwareHourlyOp[]>('hourly-ops', 'analytics/hourly-ops', f)
export const useAwareWeekdayOps = (f?: AwareFilters) =>
  useAware<AwareWeekdayOp[]>('weekday-ops', 'analytics/weekday-ops', f)

// conversación
export const useAwareTurnBuckets = (f?: AwareFilters) =>
  useAware<AwareTurnBuckets>('turn-buckets', 'analytics/turn-buckets', f)
export const useAwareTurnsByOutcome = (f?: AwareFilters) =>
  useAware<AwareTurnsByOutcome[]>('turns-by-outcome', 'analytics/turns-by-outcome', f)
export const useAwareDurationByOutcome = (f?: AwareFilters) =>
  useAware<AwareDurationByOutcome[]>('duration-by-outcome', 'analytics/duration-by-outcome', f)
export const useAwareFirstUtterances = (f?: AwareFilters) =>
  useAware<AwareFirstUtterance[]>('first-utterances', 'analytics/first-utterances', f)

// cruces
export const useAwareSentimentByOutcome = (f?: AwareFilters) =>
  useAware<AwareSentimentByOutcome[]>('sentiment-by-outcome', 'analytics/sentiment-by-outcome', f)
export const useAwareServiceGroups = (f?: AwareFilters) =>
  useAware<AwareServiceGroup[]>('service-groups', 'analytics/service-groups', f)
export const useAwareAgentHangup = (f?: AwareFilters) =>
  useAware<AwareAgentHangup>('agent-hangup', 'analytics/agent-hangup', f)

// en vivo (llamadas de hoy) — refresca cada 20 s
export const useAwareLive = (f?: AwareFilters) =>
  useAware<AwareLiveFeed>('live', 'live', f, 20_000)

export function useAwareCall(callId: string | null) {
  return useQuery({
    queryKey: ['aware', 'call', callId],
    queryFn: async () => (await api.get<AwareCallDetail>(`/aware/calls/${callId}`)).data,
    enabled: !!callId,
  })
}

export type { AwareCall }
