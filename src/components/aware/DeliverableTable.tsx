import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, Headphones } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/utils'
import { dur } from '@/lib/analyticsFormat'
import {
  downloadDeliverable,
  useAwareDeliverable,
  useAwareDeliverableCall,
  type AwareFilters,
} from '@/hooks/aware'
import { ESTADO_BADGE } from './labels'

/** Códigos del árbol de tipificación (tabla tipo_contacto de Aware). */
const TIP_CODES: [string, string][] = [
  ['UP', 'Útil positivo (venta)'],
  ['UN', 'Útil negativo'],
  ['VLL', 'Manifiesta interés'],
  ['DME', 'Volver a llamar'],
  ['EO', 'Cliente no disponible/ocupado'],
  ['ABN', 'Abandono'],
  ['NC', 'No contesta'],
  ['ND', 'Fono no disponible'],
  ['ERC', 'Error de conexión'],
  ['FER', 'Fono no corresponde'],
  ['CFA', 'Cliente fallecido'],
  ['FCH', 'Fuera del país'],
  ['FS', 'Fuera de servicio'],
  ['GRB', 'Grabadora'],
  ['TF', 'Tono fax'],
  ['TO', 'Tono ocupado'],
]

const COLS: { key: string; label: string; help: string; align?: 'right' | 'center' }[] = [
  { key: 'id', label: 'ID único', help: '1 · Identificador único de la llamada (correlaciona ambos tramos)' },
  { key: 'fecha', label: 'Fecha', help: '2 · Fecha de la interacción' },
  { key: 'hora', label: 'Hora', help: '3 · Hora de la interacción (Bogotá)' },
  { key: 'asesor', label: 'Asesor', help: '4 · Nombre del asesor que atendió la llamada' },
  { key: 'dia', label: 'Dur. IA (s)', help: '5 · Duración gestionada por la IA, en segundos', align: 'right' },
  { key: 'dase', label: 'Dur. asesor (s)', help: '6 · Duración gestionada por el asesor, en segundos', align: 'right' },
  { key: 'dtot', label: 'Dur. total (s)', help: '7 · Duración total (IA + asesor), en segundos', align: 'right' },
  { key: 'did', label: 'DID', help: '8 · DID asociado al origen del tráfico' },
  { key: 'seg', label: 'Segmento', help: '9 · Segmento de la llamada, según el DID configurado' },
  { key: 'estado', label: 'Estado', help: '10 · Estado de la interacción: Transferido / Abandonado' },
  { key: 'venta', label: 'Venta', help: '11 · Venta: Sí / No', align: 'center' },
  { key: 'tip_ia', label: 'Tip. IA', help: '12 · Tipificación de SOFIA (cómo terminó su gestión)' },
  { key: 'tip_ase', label: 'Tip. asesor', help: '12 · Tipificación final del asesor (árbol de tipificación), en continuidad con la de SOFIA' },
  { key: 'trans', label: 'Transcr.', help: '13 · Transcripción completa SOFIA ↔ cliente (abrir la fila)', align: 'center' },
  { key: 'rec', label: 'Grabación', help: '14 · Enlace a la grabación (IA y asesor)', align: 'center' },
]

export function DeliverableTable({ base }: { base: AwareFilters }) {
  const [estado, setEstado] = useState('all')
  const [venta, setVenta] = useState('all')
  const [tip, setTip] = useState('all')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<'csv' | 'json' | null>(null)

  const filters: AwareFilters = {
    ...base,
    estado: estado === 'all' ? undefined : (estado as AwareFilters['estado']),
    venta: venta === 'all' ? undefined : (venta as AwareFilters['venta']),
    tipificacion: tip === 'all' ? undefined : tip,
    page,
    pageSize: 50,
  }
  const { data, isLoading, isFetching } = useAwareDeliverable(filters)

  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  async function grab(fmt: 'csv' | 'json') {
    setDownloading(fmt)
    try {
      await downloadDeliverable(fmt, filters)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={estado} onValueChange={reset(setEstado)}>
          <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier estado</SelectItem>
            <SelectItem value="transferido">Transferido</SelectItem>
            <SelectItem value="abandonado">Abandonado</SelectItem>
            <SelectItem value="ia">Gestión IA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={venta} onValueChange={reset(setVenta)}>
          <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Venta" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Venta: todo</SelectItem>
            <SelectItem value="si">Venta: Sí</SelectItem>
            <SelectItem value="no">Venta: No</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tip} onValueChange={reset(setTip)}>
          <SelectTrigger className="h-9 w-52"><SelectValue placeholder="Tipificación" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda tipificación</SelectItem>
            {TIP_CODES.map(([c, label]) => (
              <SelectItem key={c} value={c}>{c} · {label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" disabled={!!downloading} onClick={() => grab('csv')}>
            <FileSpreadsheet className="size-4" /> {downloading === 'csv' ? 'Generando…' : 'CSV'}
          </Button>
          <Button variant="outline" size="sm" disabled={!!downloading} onClick={() => grab('json')}>
            <Download className="size-4" /> {downloading === 'json' ? 'Generando…' : 'JSON'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Una fila por llamada, correlacionable por el ID único. El tramo del asesor se empareja por
        teléfono + fecha + hora (aproximado). La exportación entrega hasta 20 000 filas del rango.
      </p>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState icon={FileSpreadsheet} title="Sin llamadas para estos filtros" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      title={c.help}
                      className={cn('whitespace-nowrap px-3 py-2.5 font-medium', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center')}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr
                    key={r.call_id}
                    onClick={() => setOpen(r.call_id)}
                    className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs" title={r.call_id}>
                      {r.call_id.slice(0, 14)}…
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.fecha ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.hora ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2">{r.asesor_nombre ?? '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums" title={dur(r.duracion_ia_seg)}>
                      {r.duracion_ia_seg ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums" title={dur(r.duracion_asesor_seg)}>
                      {r.duracion_asesor_seg ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium" title={dur(r.duracion_total_seg)}>
                      {r.duracion_total_seg}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.did ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2">{r.segmento ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', ESTADO_BADGE[r.estado])}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {r.venta === 'Sí'
                        ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">Sí</span>
                        : <span className="text-muted-foreground">No</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                      {r.tipificacion_ia}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2" title={r.tipificacion_asesor_nombre ?? ''}>
                      {r.tipificacion_asesor_codigo
                        ? <span title={r.tipificacion_asesor_nombre ?? ''}>{r.tipificacion_asesor_codigo}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">
                      {r.transcripcion_ia_turnos || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {r.grabacion_ia_url ? (
                          <a href={r.grabacion_ia_url} target="_blank" rel="noreferrer" title="Grabación IA" className="text-indigo-600 hover:underline dark:text-indigo-400">
                            <Headphones className="size-4" />
                          </a>
                        ) : <span className="text-muted-foreground">—</span>}
                        {r.grabacion_asesor_url ? (
                          <a href={r.grabacion_asesor_url} target="_blank" rel="noreferrer" title="Grabación asesor" className="text-emerald-600 hover:underline dark:text-emerald-400">
                            <Headphones className="size-4" />
                          </a>
                        ) : null}
                      </div>
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

      <DeliverableCallDialog callId={open} onClose={() => setOpen(null)} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? '—'}</span>
    </div>
  )
}

function DeliverableCallDialog({ callId, onClose }: { callId: string | null; onClose: () => void }) {
  const { data, isLoading } = useAwareDeliverableCall(callId)

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
                <Row label="Campaña / Segmento" value={`${data.proyecto_name} · ${data.segmento ?? '—'}`} />
                <Row label="Fecha / Hora" value={`${data.fecha ?? '—'} ${data.hora ?? ''}`} />
                <Row label="DID" value={data.did} />
                <Row label="Teléfono" value={data.telefono} />
                <Row label="Estado" value={data.estado} />
                <Row label="Asesor" value={data.asesor_nombre} />
                <Row
                  label="Duración IA / asesor / total"
                  value={`${data.duracion_ia_seg ?? 0}s · ${data.duracion_asesor_seg ?? 0}s · ${data.duracion_total_seg}s`}
                />
                <Row label="Tipo de servicio (SOFIA)" value={data.tipo_servicio} />
                <Row label="Venta" value={data.venta} />
                <Row
                  label="Tipificación IA → asesor"
                  value={
                    data.tipificacion_asesor_codigo
                      ? `${data.tipificacion_ia}  →  ${data.tipificacion_asesor_codigo} — ${data.tipificacion_asesor_nombre ?? ''}`
                      : data.tipificacion_ia
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {data.grabacion_ia_url && (
                <div className="min-w-[240px] flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Grabación IA</p>
                  <audio controls preload="none" src={data.grabacion_ia_url} className="w-full">
                    Tu navegador no soporta audio.
                  </audio>
                </div>
              )}
              {data.grabacion_asesor_url && (
                <div className="min-w-[240px] flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Grabación asesor</p>
                  <audio controls preload="none" src={data.grabacion_asesor_url} className="w-full">
                    Tu navegador no soporta audio.
                  </audio>
                </div>
              )}
            </div>

            {data.transcripcion_ia.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Transcripción SOFIA ↔ cliente
                </p>
                <div className="space-y-2">
                  {data.transcripcion_ia.map((t, i) => (
                    <div
                      key={i}
                      className={t.role === 'agent' ? 'rounded-lg bg-primary/10 p-2.5 text-sm' : 'rounded-lg bg-muted p-2.5 text-sm'}
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
