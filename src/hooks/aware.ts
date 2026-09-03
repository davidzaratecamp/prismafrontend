import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AwareByProject,
  AwareCall,
  AwareCallDetail,
  AwareCallsPage,
  AwareConfig,
  AwareCountRow,
  AwareDailyTrend,
  AwareDurationBucket,
  AwareFilterOptions,
  AwareHangupDay,
  AwareHeatCell,
  AwareOverview,
  AwareTransfersAttended,
  AwareVolumeDay,
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

export function useAwareCall(callId: string | null) {
  return useQuery({
    queryKey: ['aware', 'call', callId],
    queryFn: async () => (await api.get<AwareCallDetail>(`/aware/calls/${callId}`)).data,
    enabled: !!callId,
  })
}

export type { AwareCall }
