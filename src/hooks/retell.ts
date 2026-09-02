import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  RetellAgent,
  RetellAgentStat,
  RetellCall,
  RetellCallsPage,
  RetellConfig,
  RetellCostDay,
  RetellDailyTrend,
  RetellDisconnectionBySuccess,
  RetellDurationBucket,
  RetellFilterOptions,
  RetellHeatCell,
  RetellLatencyStats,
  RetellMonthlyComparison,
  RetellOverview,
  RetellProductCost,
  RetellReasonRow,
  RetellSentimentRow,
  RetellStatusRow,
  RetellVolumeDay,
} from '@/lib/types'

export interface RetellFilters {
  from?: string
  to?: string
  agentId?: string
  direction?: 'inbound' | 'outbound'
  callType?: 'web_call' | 'phone_call'
  status?: string
  sentiment?: string
  callSuccessful?: 'true' | 'false'
  month?: string // 'YYYY-MM' — solo lo usa monthly-comparison
  allStatuses?: boolean
  page?: number
  pageSize?: number
}

/** Limpia claves vacías para no ensuciar la queryKey ni el query string. */
function clean(f: RetellFilters = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === null || v === '' || v === 'all') continue
    out[k] = v as string | number | boolean
  }
  return out
}

function useRetellQuery<T>(sub: string, path: string, f?: RetellFilters, enabled = true) {
  const params = clean(f)
  return useQuery({
    queryKey: ['retell', sub, params],
    queryFn: async () => (await api.get<T>(`/retell/${path}`, { params })).data,
    enabled,
  })
}

export function useRetellConfig() {
  return useQuery({
    queryKey: ['retell', 'config'],
    queryFn: async () => (await api.get<RetellConfig>('/retell/config')).data,
  })
}

export const useRetellOverview = (f?: RetellFilters) =>
  useRetellQuery<RetellOverview>('overview', 'analytics/overview', f)

export const useRetellCostByDay = (f?: RetellFilters) =>
  useRetellQuery<RetellCostDay[]>('cost-by-day', 'analytics/cost-by-day', f)

export const useRetellByAgent = (f?: RetellFilters) =>
  useRetellQuery<RetellAgentStat[]>('by-agent', 'analytics/by-agent', f)

export const useRetellCostByProduct = (f?: RetellFilters) =>
  useRetellQuery<RetellProductCost[]>('cost-by-product', 'analytics/cost-by-product', f)

export const useRetellSentiment = (f?: RetellFilters) =>
  useRetellQuery<RetellSentimentRow[]>('sentiment', 'analytics/sentiment', f)

export const useRetellDisconnections = (f?: RetellFilters) =>
  useRetellQuery<RetellReasonRow[]>('disconnection-reasons', 'analytics/disconnection-reasons', f)

export const useRetellVolumeByDay = (f?: RetellFilters) =>
  useRetellQuery<RetellVolumeDay[]>('volume-by-day', 'analytics/volume-by-day', f)

export const useRetellHeatmap = (f?: RetellFilters) =>
  useRetellQuery<RetellHeatCell[]>('heatmap', 'analytics/heatmap', f)

export const useRetellDurationBuckets = (f?: RetellFilters) =>
  useRetellQuery<RetellDurationBucket[]>('duration-buckets', 'analytics/duration-buckets', f)

export const useRetellLatency = (f?: RetellFilters) =>
  useRetellQuery<RetellLatencyStats>('latency', 'analytics/latency', f)

export const useRetellStatusBreakdown = (f?: RetellFilters) =>
  useRetellQuery<RetellStatusRow[]>('status-breakdown', 'analytics/status-breakdown', f)

export const useRetellDailyTrend = (f?: RetellFilters) =>
  useRetellQuery<RetellDailyTrend[]>('daily-trend', 'analytics/daily-trend', f)

export const useRetellMonthlyComparison = (f?: RetellFilters) =>
  useRetellQuery<RetellMonthlyComparison>('monthly-comparison', 'analytics/monthly-comparison', f)

export const useRetellDisconnectionBySuccess = (f?: RetellFilters) =>
  useRetellQuery<RetellDisconnectionBySuccess[]>(
    'disconnection-by-success',
    'analytics/disconnection-by-success',
    f,
  )

export const useRetellCalls = (f?: RetellFilters) =>
  useRetellQuery<RetellCallsPage>('calls', 'calls', f)

export const useRetellAgents = () => useRetellQuery<RetellAgent[]>('agents', 'agents')

export const useRetellFilterOptions = () =>
  useRetellQuery<RetellFilterOptions>('filters', 'analytics/filters')

export function useRetellCall(callId: string | null) {
  return useQuery({
    queryKey: ['retell', 'call', callId],
    queryFn: async () => (await api.get<RetellCall & Record<string, unknown>>(`/retell/calls/${callId}`)).data,
    enabled: !!callId,
  })
}

export function useRetellSync() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (only?: string[]) =>
      (await api.post('/retell/sync', only ? { only } : {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retell'] }),
  })
}
