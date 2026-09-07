import { useEffect, useRef } from 'react'
import { Radio } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAwareMonitor } from '@/hooks/aware'

const ERROR_MSG: Record<string, string> = {
  not_ongoing: 'La llamada ya terminó o no está disponible para monitoreo en vivo.',
  auth: 'Falta configurar RETELL_API_KEY en el backend (o no tiene permiso Call → Edit).',
  max_watchers: 'La llamada ya tiene 5 monitores conectados (incluye el panel de Retell).',
  retell_not_configured: 'Falta configurar RETELL_API_KEY en el backend.',
  closed: 'Se cortó la conexión con Retell. Cierra y vuelve a abrir para reintentar.',
  ws_error: 'No se pudo conectar con el monitoreo de Retell.',
}

export function LiveMonitorDialog({ callId, onClose }: { callId: string | null; onClose: () => void }) {
  const { data, isLoading } = useAwareMonitor(callId)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [data?.transcripts.length])

  const live = !!data && !data.ended && !data.error

  return (
    <Dialog open={!!callId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            {live && <Radio className="size-4 animate-pulse text-emerald-500" />}
            <span className="font-mono text-xs">{callId}</span>
            {live && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">EN VIVO</span>}
          </DialogTitle>
        </DialogHeader>

        <p className="rounded-md bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
          Transcripción en tiempo real (se actualiza cada ~2 s). El <strong>audio en vivo</strong> solo está
          en el panel de Retell (Live Listen); aquí la grabación queda disponible al terminar la llamada.
        </p>

        {isLoading || !data ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
              <span>
                {data.ended
                  ? `Llamada terminada${data.reason ? ` · ${data.reason}` : ''}`
                  : data.connected
                    ? 'Conectado a Retell'
                    : 'Conectando…'}
              </span>
              <span className="tabular-nums">{data.transcripts.length} turnos</span>
            </div>

            {data.error && (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                {ERROR_MSG[data.error] ?? data.error}
              </p>
            )}

            <div ref={scrollRef} className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              {data.transcripts.length === 0 && !data.error ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Esperando las primeras palabras…
                </p>
              ) : (
                data.transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={
                      t.role === 'agent'
                        ? 'rounded-lg bg-primary/10 p-2.5 text-sm'
                        : 'rounded-lg bg-muted p-2.5 text-sm'
                    }
                  >
                    <span className="mr-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      {t.role === 'agent' ? 'SOFIA' : t.role === 'user' ? 'Cliente' : t.role}
                    </span>
                    {t.content}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
