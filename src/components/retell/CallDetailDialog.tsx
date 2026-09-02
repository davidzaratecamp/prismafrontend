import { ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRetellCall } from '@/hooks/retell'
import { parseDbDate } from '@/lib/time'
import { dur, usd } from './format'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{value ?? '—'}</span>
    </div>
  )
}

export function CallDetailDialog({
  callId,
  onClose,
}: {
  callId: string | null
  onClose: () => void
}) {
  const { data, isLoading } = useRetellCall(callId)

  return (
    <Dialog open={!!callId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">{callId}</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="divide-y">
            <div className="pb-2">
              <Row label="Agente" value={data.agent_name || data.agent_id} />
              <Row label="Tipo" value={data.call_type} />
              <Row label="Dirección" value={data.direction} />
              <Row label="Estado" value={data.call_status} />
              <Row
                label="Inicio"
                value={data.started_at ? parseDbDate(data.started_at as string).toLocaleString('es-CO') : '—'}
              />
              <Row label="Duración" value={dur(data.duration_seconds as number)} />
              <Row label="Costo" value={usd(data.combined_cost_usd as number, 4)} />
              <Row label="De / Para" value={`${data.from_number || '—'} → ${data.to_number || '—'}`} />
              <Row
                label="Sentimiento"
                value={data.user_sentiment ? <Badge variant="secondary">{data.user_sentiment as string}</Badge> : '—'}
              />
              <Row label="Resultado" value={data.call_successful == null ? '—' : data.call_successful ? 'Exitosa' : 'Fallida'} />
              <Row label="Motivo de corte" value={data.disconnection_reason} />
            </div>

            {data.call_summary ? (
              <div className="py-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resumen
                </p>
                <p className="text-sm">{data.call_summary as string}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-3 text-sm">
              {data.recording_url ? (
                <a
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  href={data.recording_url as string}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3.5" /> Grabación
                </a>
              ) : null}
              {data.public_log_url ? (
                <a
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  href={data.public_log_url as string}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3.5" /> Log
                </a>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
