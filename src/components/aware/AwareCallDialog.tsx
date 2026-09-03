import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAwareCall } from '@/hooks/aware'
import { dur } from '@/lib/analyticsFormat'
import { hangupLabel, sentimentLabel } from './labels'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? '—'}</span>
    </div>
  )
}

export function AwareCallDialog({ callId, onClose }: { callId: string | null; onClose: () => void }) {
  const { data, isLoading } = useAwareCall(callId)

  return (
    <Dialog open={!!callId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-xs">{callId}</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            <div className="divide-y">
              <div className="pb-2">
                <Row label="Campaña" value={data.proyecto_name} />
                <Row label="Fecha" value={`${data.fecha ?? '—'} ${data.hora ?? ''}`} />
                <Row label="Teléfono" value={data.telefono} />
                <Row label="Duración" value={dur(data.duration_seconds)} />
                <Row label="Cómo terminó" value={hangupLabel(data.hangup_reason)} />
                <Row
                  label="Sentimiento"
                  value={
                    data.user_sentiment ? (
                      <Badge variant="secondary">{sentimentLabel(data.user_sentiment)}</Badge>
                    ) : (
                      '—'
                    )
                  }
                />
                <Row
                  label="Éxito (según el bot)"
                  value={data.call_successful == null ? '—' : data.call_successful ? 'Sí' : 'No'}
                />
              </div>

              {data.call_summary && (
                <div className="py-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Resumen
                  </p>
                  <p className="text-sm">{data.call_summary}</p>
                </div>
              )}
            </div>

            {data.audio_url && (
              <audio controls preload="none" src={data.audio_url} className="w-full">
                Tu navegador no soporta audio.
              </audio>
            )}

            {data.transcript.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Transcripción
                </p>
                <div className="space-y-2">
                  {data.transcript.map((t, i) => (
                    <div
                      key={i}
                      className={
                        t.role === 'agent'
                          ? 'rounded-lg bg-primary/10 p-2.5 text-sm'
                          : 'rounded-lg bg-muted p-2.5 text-sm'
                      }
                    >
                      <span className="mr-2 text-[11px] font-semibold uppercase text-muted-foreground">
                        {t.role === 'agent' ? 'SOFIA' : 'Cliente'}
                      </span>
                      {t.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
