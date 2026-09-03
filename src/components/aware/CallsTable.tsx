import { useState } from 'react'
import { ChevronLeft, ChevronRight, PhoneCall, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useAwareCalls, type AwareFilters } from '@/hooks/aware'
import { dur } from '@/lib/analyticsFormat'
import { HANGUP_LABEL, SENTIMENT_LABEL } from './labels'
import { AwareCallDialog } from './AwareCallDialog'

const SENT_TONE: Record<string, string> = {
  Positive: 'text-emerald-600 dark:text-emerald-400',
  Negative: 'text-red-600 dark:text-red-400',
  Neutral: 'text-muted-foreground',
}

export function CallsTable({ base }: { base: AwareFilters }) {
  const [hangup, setHangup] = useState('all')
  const [sentiment, setSentiment] = useState('all')
  const [result, setResult] = useState('all')
  const [phone, setPhone] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<string | null>(null)

  const filters: AwareFilters = {
    ...base,
    hangup: hangup === 'all' ? undefined : hangup,
    sentiment: sentiment === 'all' ? undefined : sentiment,
    callSuccessful: result === 'ok' ? 'true' : result === 'fail' ? 'false' : undefined,
    phone: phone.trim() || undefined,
    page,
    pageSize: 25,
  }
  const { data, isLoading, isFetching } = useAwareCalls(filters)

  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 w-44 pl-8"
            placeholder="Teléfono…"
            value={phone}
            onChange={(e) => reset(setPhone)(e.target.value)}
          />
        </div>
        <Select value={hangup} onValueChange={reset(setHangup)}>
          <SelectTrigger className="h-9 w-52"><SelectValue placeholder="Cómo terminó" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier cierre</SelectItem>
            {Object.entries(HANGUP_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sentiment} onValueChange={reset(setSentiment)}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Sentimiento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo sentimiento</SelectItem>
            {Object.entries(SENTIMENT_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={result} onValueChange={reset(setResult)}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Éxito" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Éxito: todo</SelectItem>
            <SelectItem value="ok">Exitosas</SelectItem>
            <SelectItem value="fail">No exitosas</SelectItem>
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
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Campaña</th>
                  <th className="px-4 py-2.5 font-medium">Teléfono</th>
                  <th className="px-4 py-2.5 text-right font-medium">Duración</th>
                  <th className="px-4 py-2.5 font-medium">Cómo terminó</th>
                  <th className="px-4 py-2.5 font-medium">Sentimiento</th>
                  <th className="px-4 py-2.5 text-center font-medium">Éxito</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((c) => (
                  <tr
                    key={c.call_id}
                    onClick={() => setOpen(c.call_id)}
                    className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                      {c.fecha} {c.hora}
                    </td>
                    <td className="px-4 py-2.5">{c.proyecto_name}</td>
                    <td className="px-4 py-2.5 tabular-nums">{c.telefono || '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{dur(c.duration_seconds)}</td>
                    <td className="px-4 py-2.5">{HANGUP_LABEL[c.hangup_reason ?? ''] ?? c.hangup_reason ?? '—'}</td>
                    <td className={`px-4 py-2.5 ${SENT_TONE[c.user_sentiment ?? ''] ?? ''}`}>
                      {SENTIMENT_LABEL[c.user_sentiment ?? ''] ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {c.call_successful == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : c.call_successful ? (
                        <Badge variant="secondary">Sí</Badge>
                      ) : (
                        <Badge variant="destructive">No</Badge>
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
              <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.total_pages || isFetching} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <AwareCallDialog callId={open} onClose={() => setOpen(null)} />
    </div>
  )
}
