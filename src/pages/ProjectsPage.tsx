import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { useAreas, useProjects, useUsers } from '@/hooks/queries'
import { PROJECT_STATUS_OPTIONS } from '@/lib/status'
import { useAuthStore, useCanWrite } from '@/stores/auth'

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const canWrite = useCanWrite()
  const currentUser = useAuthStore((s) => s.user)
  const { data: areas } = useAreas()
  const { data: users } = useUsers()
  const [formOpen, setFormOpen] = useState(false)
  const [q, setQ] = useState('')

  const area = params.get('area') ?? 'all'
  const status = params.get('status') ?? 'all'
  const lead = params.get('lead') ?? 'all'
  const mine = params.get('mine') === '1'

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const filters = useMemo(
    () => ({
      area_id: area !== 'all' ? area : undefined,
      status: status !== 'all' ? status : undefined,
      lead_user_id: lead !== 'all' ? lead : undefined,
      requested_by_user_id: mine && currentUser ? currentUser.id : undefined,
      q: q.trim() || undefined,
    }),
    [area, status, lead, mine, currentUser, q],
  )

  const { data: projects, isLoading } = useProjects(filters)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proyectos"
        description="Todo lo que el equipo está construyendo, por área y estado."
        actions={
          canWrite && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Nuevo proyecto
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={area} onValueChange={(v) => setParam('area', v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {areas?.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setParam('status', v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {PROJECT_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={lead} onValueChange={(v) => setParam('lead', v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Líder" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier líder</SelectItem>
            {users
              ?.filter((u) => u.role !== 'viewer')
              .map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={mine ? 'default' : 'outline'}
          onClick={() => setParam('mine', mine ? 'all' : '1')}
        >
          <Sparkles className="size-4" /> Mis solicitudes
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title="No hay proyectos con estos filtros"
          description="Ajusta la búsqueda o crea un proyecto nuevo."
          action={
            canWrite && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="size-4" /> Nuevo proyecto
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultAreaId={area !== 'all' ? Number(area) : undefined}
      />
    </div>
  )
}
