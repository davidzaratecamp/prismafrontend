import { useState } from 'react'
import { ChevronLeft, ChevronRight, PhoneCall } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useRetellCalls, type RetellFilters } from '@/hooks/retell'
import { dur, fmtBogota, usd } from './format'
import { CallDetailDialog } from './CallDetailDialog'

const SENTIMENT_TONE: Record<string, string> = {
  Positive: 'text-emerald-600 dark:text-emerald-400',
  Negative: 'text-red-600 dark:text-red-400',
  Neutral: 'text-muted-foreground',
}

/** `filters` trae from/to/agentId globales del panel; aquí se añaden dirección/estado/resultado. */
export function CallsTab({ filters: base }: { filters: RetellFilters }) {
  const [direction, setDirection] = useState('all')
  const [status, setStatus] = useState('all')
  const [result, setResult] = useState('all') // all | ok | fail
  const [page, setPage] = useState(1)
  const [openCall, setOpenCall] = useState<string | null>(null)

  const filters: RetellFilters = {
    ...base,
    direction: direction === 'all' ? undefined : (direction as 'inbound' | 'outbound'),
    status: status === 'all' ? undefined : status,
    callSuccessful: result === 'ok' ? 'true' : result === 'fail' ? 'false' : undefined,
    allStatuses: status === 'all',
    page,
    pageSize: 25,
  }
  const { data, isLoading, isFetching } = useRetellCalls(filters)

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={direction} onValueChange={resetPage(setDirection)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda dirección</SelectItem>
            <SelectItem value="inbound">Entrante</SelectItem>
            <SelectItem value="outbound">Saliente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={resetPage(setStatus)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo estado</SelectItem>
            <SelectItem value="ended">Finalizada</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="ongoing">En curso</SelectItem>
            <SelectItem value="not_connected">No conectó</SelectItem>
          </SelectContent>
        </Select>

        <Select value={result} onValueChange={resetPage(setResult)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Resultado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo resultado</SelectItem>
            <SelectItem value="ok">Exitosas</SelectItem>
            <SelectItem value="fail">Fallidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState icon={PhoneCall} title="Sin llamadas para estos filtros" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Fecha (Bogotá)</th>
                  <th className="px-4 py-2.5 font-medium">Agente</th>
                  <th className="px-4 py-2.5 font-medium">Dirección</th>
                  <th className="px-4 py-2.5 text-right font-medium">Duración</th>
                  <th className="px-4 py-2.5 text-right font-medium">Costo</th>
                  <th className="px-4 py-2.5 font-medium">Sentimiento</th>
                  <th className="px-4 py-2.5 text-center font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((c) => (
                  <tr
                    key={c.call_id}
                    onClick={() => setOpenCall(c.call_id)}
                    className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                      {fmtBogota(c.started_at)}
                    </td>
                    <td className="px-4 py-2.5">{c.agent_name || c.agent_id || '—'}</td>
                    <td className="px-4 py-2.5">
                      {c.direction === 'inbound' ? 'Entrante' : c.direction === 'outbound' ? 'Saliente' : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{dur(c.duration_seconds)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{usd(c.combined_cost_usd, 4)}</td>
                    <td className={`px-4 py-2.5 ${SENTIMENT_TONE[c.user_sentiment ?? ''] ?? ''}`}>
                      {c.user_sentiment ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {c.call_successful == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : c.call_successful ? (
                        <Badge variant="secondary">OK</Badge>
                      ) : (
                        <Badge variant="destructive">Falló</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-4 py-2.5 text-sm text-muted-foreground">
            <span>
              {data.total.toLocaleString('es-CO')} llamadas · página {data.page}/{data.total_pages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <CallDetailDialog callId={openCall} onClose={() => setOpenCall(null)} />
    </div>
  )
}
