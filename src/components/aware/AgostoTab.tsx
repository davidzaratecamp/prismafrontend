import { useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardCheck, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/common/EmptyState'
import { MiniBarList, type MiniBarRow } from '@/components/common/MiniBarList'
import { BarRow } from './HumanCards'
import {
  useAwareAgostoResumen,
  useAwareAgostoCalls,
  useAwareAgostoMotivos,
  type AwareAgostoFilters,
} from '@/hooks/aware'
import { num, pct } from '@/lib/analyticsFormat'

function ResumenAgosto() {
  const { data, isLoading } = useAwareAgostoResumen()
  if (isLoading) return <Skeleton className="h-72 rounded-xl" />
  if (!data || !data.total) return <EmptyState icon={ClipboardCheck} title="Sin datos de agosto" />

  const venta = data.por_tipificacion.find((t) => t.tipificacion === 'VENTA EXITOSA')
  const noVenta = data.por_tipificacion.find((t) => t.tipificacion === 'NO VENTA')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{num(venta?.calls ?? 0)}</p>
          <p className="text-xs text-muted-foreground">VENTA EXITOSA · {pct(venta?.rate ?? null)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">{num(noVenta?.calls ?? 0)}</p>
          <p className="text-xs text-muted-foreground">NO VENTA · {pct(noVenta?.rate ?? null)}</p>
        </Card>
      </div>

      <MiniBarList
        title="Por línea (DID)"
        rows={data.por_linea.map<MiniBarRow>((l) => ({ label: l.linea, value: l.calls, display: `${num(l.calls)} · ${pct(l.rate)}` }))}
      />

      {data.no_venta_arbol.categorias.map((cat) => (
        <Card key={cat.categoria}>
          <CardHeader>
            <CardTitle className="text-base">No venta — {cat.categoria}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {cat.items.map((it) => (
                <BarRow key={it.tip} label={it.label} calls={it.calls} rate={it.rate} color="#f59e0b" />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {data.no_venta_arbol.sin_clasificar && (
        <p className="text-[11px] text-muted-foreground">
          {num(data.no_venta_arbol.sin_clasificar.calls)} no venta ({pct(data.no_venta_arbol.sin_clasificar.rate)}) con un
          motivo que no matchea ningún código del árbol de Claro.
        </p>
      )}
    </div>
  )
}

function TablaAgosto() {
  const [phone, setPhone] = useState('')
  const [tipificacion, setTipificacion] = useState('all')
  const [motivo, setMotivo] = useState('all')
  const [page, setPage] = useState(1)
  const { data: motivos } = useAwareAgostoMotivos()

  const filters: AwareAgostoFilters = {
    phone: phone.trim() || undefined,
    tipificacion: tipificacion === 'all' ? undefined : (tipificacion as 'venta' | 'no_venta'),
    motivo: motivo === 'all' ? undefined : motivo,
    page,
    pageSize: 50,
  }
  const { data, isLoading, isFetching } = useAwareAgostoCalls(filters)

  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 w-44 pl-8" placeholder="Teléfono…" value={phone} onChange={(e) => reset(setPhone)(e.target.value)} />
        </div>
        <Select value={tipificacion} onValueChange={reset(setTipificacion)}>
          <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Tipificación" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier tipificación</SelectItem>
            <SelectItem value="venta">Venta exitosa</SelectItem>
            <SelectItem value="no_venta">No venta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={motivo} onValueChange={reset(setMotivo)}>
          <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Motivo" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Cualquier motivo</SelectItem>
            {(motivos ?? []).map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Sin llamadas para estos filtros" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Teléfono</th>
                  <th className="px-4 py-2.5 font-medium">Línea</th>
                  <th className="px-4 py-2.5 font-medium">Tipificación</th>
                  <th className="px-4 py-2.5 font-medium">Motivo</th>
                  <th className="px-4 py-2.5 font-medium">Agente</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dur. IA</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dur. asesor</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">{r.fecha} {r.hora}</td>
                    <td className="px-4 py-2.5 tabular-nums">{r.telefono || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">{r.linea || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">{r.tipificacion}</td>
                    <td className="max-w-[260px] truncate px-4 py-2.5" title={r.motivo_rechazo ?? ''}>{r.motivo_rechazo ?? '—'}</td>
                    <td className="px-4 py-2.5">{r.agente_nombre || r.agente_id || '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.duracion_ia_seg ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.duracion_asesor_seg ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-4 py-2.5 text-sm text-muted-foreground">
            <span>{data.total.toLocaleString('es-CO')} llamadas · página {data.page}/{data.total_pages}</span>
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
    </div>
  )
}

export function AgostoTab() {
  return (
    <div className="space-y-6">
      <ResumenAgosto />
      <TablaAgosto />
    </div>
  )
}
