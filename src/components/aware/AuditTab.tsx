import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, GitCommitHorizontal, History, LogIn, RefreshCw, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

/**
 * Bitácora de auditoría (pedido de Claro). Dos registros distintos:
 * - Cambios: altas/modificaciones/bajas de usuarios y permisos (antes →
 *   después) y las versiones desplegadas (quién sube cada cambio y cuándo).
 * - Accesos: inicios de sesión y lo que cada usuario consulta, exporta o
 *   escucha en el panel.
 * Todo sale de datos reales del servidor (tabla audit_log y git).
 */

interface AuditEvent {
  id: number | string
  created_at: string
  tipo: 'cambio' | 'acceso'
  accion: string
  user_name: string | null
  user_email: string | null
  detalle: string
  cambios: Record<string, { antes: unknown; despues: unknown }> | null
  resultado: string
  ip: string | null
  origen: 'audit_log' | 'activity_log'
}

interface Version {
  repo: string
  desplegado?: string | null
  commit?: string
  autor?: string
  autor_email?: string
  fecha_commit?: string
  mensaje?: string
  operacion?: string
  error?: string
}

const ACCION: Record<string, string> = {
  login: 'Inicio de sesión',
  login_fallido: 'Inicio de sesión fallido',
  consulta: 'Consulta',
  exportacion: 'Exportación',
  audio: 'Audio',
  usuario_creado: 'Usuario creado',
  usuario_modificado: 'Usuario modificado',
  usuario_desactivado: 'Usuario desactivado',
  usuario_updated: 'Usuario modificado',
}

const CAMPO: Record<string, string> = {
  name: 'Nombre',
  email: 'Correo',
  role: 'Rol',
  area_id: 'Área',
  aware_scope: 'Campaña',
  aware_quality: 'Calidad IA',
  aware_recorrido: 'Recorrido',
  aware_view: 'Vista',
  admin_no_create: 'Solo lectura',
  retell_scope: 'Campaña Retell',
  is_active: 'Activo',
  password: 'Contraseña',
}

function fmtTs(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function fmtVal(campo: string, v: unknown) {
  if (v === null || v === undefined || v === '') return '—'
  if (campo === 'aware_scope' || campo === 'retell_scope') return v === 12 ? 'Hogar' : v === 13 ? 'TyT' : String(v)
  if (typeof v === 'boolean' || v === 0 || v === 1) {
    if (['aware_quality', 'aware_recorrido', 'admin_no_create', 'is_active'].includes(campo)) return v ? 'Sí' : 'No'
  }
  return String(v)
}

const RESULT_TONE: Record<string, string> = {
  ok: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  fallido: 'bg-red-500/10 text-red-700 dark:text-red-400',
  denegado: 'bg-red-500/10 text-red-700 dark:text-red-400',
  error: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
}

function useEvents(tipo: 'cambio' | 'acceso', f: { from: string; to: string; q: string }) {
  return useQuery({
    queryKey: ['audit', tipo, f],
    queryFn: async () =>
      (await api.get<AuditEvent[]>('/audit', { params: { tipo, from: f.from || undefined, to: f.to || undefined, q: f.q || undefined, limit: 500 } }))
        .data,
  })
}

async function downloadCsv(tipo: 'cambio' | 'acceso', f: { from: string; to: string; q: string }) {
  const res = await api.get('/audit/export.csv', {
    params: { tipo, from: f.from || undefined, to: f.to || undefined, q: f.q || undefined },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prisma-auditoria-${tipo === 'cambio' ? 'cambios' : 'accesos'}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('px-3 py-2 text-left text-xs font-medium text-muted-foreground', className)}>{children}</th>
}

function EventsTable({ tipo, filters }: { tipo: 'cambio' | 'acceso'; filters: { from: string; to: string; q: string } }) {
  const ev = useEvents(tipo, filters)
  if (ev.isLoading) return <p className="p-4 text-sm text-muted-foreground">Cargando…</p>
  if (ev.error) return <p className="p-4 text-sm text-red-600">{apiErrorMessage(ev.error)}</p>
  const rows = ev.data ?? []
  if (!rows.length) return <p className="p-4 text-sm text-muted-foreground">Sin eventos para estos filtros.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Fecha y hora</Th>
            <Th>Usuario</Th>
            <Th>Acción</Th>
            <Th>Detalle</Th>
            {tipo === 'cambio' && <Th>Antes → Después</Th>}
            <Th>Resultado</Th>
            <Th>IP</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b align-top last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums">{fmtTs(r.created_at)}</td>
              <td className="px-3 py-2 text-xs">
                <p className="font-medium">{r.user_name || '—'}</p>
                <p className="text-muted-foreground">{r.user_email || ''}</p>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{ACCION[r.accion] ?? r.accion}</td>
              <td className="px-3 py-2 text-xs">
                {r.detalle}
                {r.origen === 'activity_log' && <span className="ml-1 text-muted-foreground">(bitácora anterior)</span>}
              </td>
              {tipo === 'cambio' && (
                <td className="px-3 py-2 text-xs">
                  {r.cambios && Object.keys(r.cambios).length ? (
                    <ul className="space-y-0.5">
                      {Object.entries(r.cambios).map(([campo, c]) => (
                        <li key={campo}>
                          <span className="text-muted-foreground">{CAMPO[campo] ?? campo}:</span> {fmtVal(campo, c.antes)} →{' '}
                          <b>{fmtVal(campo, c.despues)}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              )}
              <td className="px-3 py-2 text-xs">
                <span className={cn('rounded px-1.5 py-0.5 font-medium', RESULT_TONE[r.resultado] ?? 'bg-muted')}>{r.resultado}</span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground">{r.ip || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VersionsTable() {
  const v = useQuery({
    queryKey: ['audit', 'versiones'],
    queryFn: async () => (await api.get<Version[]>('/audit/versiones', { params: { limit: 60 } })).data,
  })
  if (v.isLoading) return <p className="p-4 text-sm text-muted-foreground">Cargando…</p>
  if (v.error) return <p className="p-4 text-sm text-red-600">{apiErrorMessage(v.error)}</p>
  const rows = v.data ?? []
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Desplegado en producción</Th>
            <Th>Componente</Th>
            <Th>Versión</Th>
            <Th>Autor del cambio</Th>
            <Th>Descripción</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) =>
            r.error ? (
              <tr key={`e${i}`} className="border-b">
                <td colSpan={5} className="px-3 py-2 text-xs text-amber-700">
                  {r.repo}: {r.error}
                </td>
              </tr>
            ) : (
              <tr key={`${r.repo}-${r.desplegado}-${i}`} className="border-b align-top last:border-0">
                <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums">{fmtTs(r.desplegado)}</td>
                <td className="px-3 py-2 text-xs capitalize">{r.repo === 'backend' ? 'Servidor (API)' : 'Web'}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.commit}</td>
                <td className="px-3 py-2 text-xs">
                  <p className="font-medium">{r.autor}</p>
                  <p className="text-muted-foreground">{fmtTs(r.fecha_commit)}</p>
                </td>
                <td className="px-3 py-2 text-xs">{r.mensaje}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

export function AuditTab() {
  const [section, setSection] = useState<'cambios' | 'versiones' | 'accesos'>('cambios')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState('')
  const filters = { from, to, q }
  const tipo = section === 'accesos' ? 'acceso' : 'cambio'

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-start gap-3 p-4 text-sm">
        <History className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Bitácora de auditoría</p>
          <p className="text-muted-foreground">
            Registro real de los cambios en usuarios y permisos, de las versiones que se suben a producción y de los accesos a la
            plataforma: quién, qué, cuándo y desde qué IP. Las contraseñas nunca se registran; solo se anota que cambiaron.
          </p>
        </div>
      </Card>

      <Tabs value={section} onValueChange={(v) => setSection(v as typeof section)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="cambios">
              <UserCog className="size-3.5" /> Cambios
            </TabsTrigger>
            <TabsTrigger value="versiones">
              <GitCommitHorizontal className="size-3.5" /> Versiones desplegadas
            </TabsTrigger>
            <TabsTrigger value="accesos">
              <LogIn className="size-3.5" /> Accesos
            </TabsTrigger>
          </TabsList>
          {section !== 'versiones' && (
            <div className="flex flex-wrap items-center gap-2">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-[140px] text-xs" aria-label="Desde" />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-[140px] text-xs" aria-label="Hasta" />
              <Input
                placeholder="Buscar usuario o detalle"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-8 w-[200px] text-xs"
              />
              <Button size="sm" variant="outline" onClick={() => downloadCsv(tipo, filters).catch((e) => alert(apiErrorMessage(e)))}>
                <Download className="size-3.5" /> CSV
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="cambios" className="pt-3">
          <Card className="overflow-hidden p-0">
            <EventsTable tipo="cambio" filters={filters} />
          </Card>
        </TabsContent>
        <TabsContent value="versiones" className="pt-3">
          <Card className="overflow-hidden p-0">
            <p className="flex items-center gap-1.5 border-b px-3 py-2 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5" /> Cada fila es una actualización aplicada en el servidor de producción, tomada del
              historial de versiones (git) del propio servidor.
            </p>
            <VersionsTable />
          </Card>
        </TabsContent>
        <TabsContent value="accesos" className="pt-3">
          <Card className="overflow-hidden p-0">
            <EventsTable tipo="acceso" filters={filters} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
