import { useState } from 'react'
import { Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useAwareLive, type AwareFilters } from '@/hooks/aware'
import { dur } from '@/lib/analyticsFormat'
import { HANGUP_LABEL, SENTIMENT_LABEL } from './labels'
import { AwareCallDialog } from './AwareCallDialog'

export function LiveFeed({ filters }: { filters: AwareFilters }) {
  const { data, isLoading, dataUpdatedAt } = useAwareLive({ proyecto: filters.proyecto })
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Radio className="size-3.5 animate-pulse text-emerald-500" />
        Últimas llamadas de hoy ({data?.date ?? '—'}) · se actualiza cada 20 s
        {dataUpdatedAt ? ` · ${new Date(dataUpdatedAt).toLocaleTimeString('es-CO')}` : ''}
      </p>

      {isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState icon={Radio} title="Aún no hay llamadas hoy" />
      ) : (
        <Card className="divide-y overflow-hidden">
          {data.rows.map((c) => (
            <button
              key={c.call_id}
              onClick={() => setOpen(c.call_id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/40"
            >
              <span className="w-14 shrink-0 tabular-nums text-muted-foreground">{c.hora}</span>
              <span className="w-24 shrink-0">{c.proyecto_name}</span>
              <span className="w-28 shrink-0 tabular-nums">{c.telefono || '—'}</span>
              <span className="w-16 shrink-0 text-right tabular-nums">{dur(c.duration_seconds)}</span>
              <span className="flex-1 truncate text-muted-foreground">
                {c.hangup_reason
                  ? HANGUP_LABEL[c.hangup_reason] ?? c.hangup_reason
                  : <span className="text-emerald-600 dark:text-emerald-400">en curso…</span>}
              </span>
              {c.user_sentiment && (
                <Badge variant="secondary" className="shrink-0">
                  {SENTIMENT_LABEL[c.user_sentiment] ?? c.user_sentiment}
                </Badge>
              )}
            </button>
          ))}
        </Card>
      )}

      <AwareCallDialog callId={open} onClose={() => setOpen(null)} />
    </div>
  )
}
