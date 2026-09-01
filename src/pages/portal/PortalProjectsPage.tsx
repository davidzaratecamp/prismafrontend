import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
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
import { PortalProjectCard } from '@/components/portal/PortalProjectCard'
import { useAreas, useProjects } from '@/hooks/queries'
import { projectHealth, type HealthKey } from '@/lib/health'

const HEALTH_FILTERS: { value: string; label: string; keys: HealthKey[] }[] = [
  { value: 'all', label: 'Cualquier estado', keys: [] },
  { value: 'ontrack', label: 'En fecha', keys: ['ontrack'] },
  { value: 'risk', label: 'En riesgo', keys: ['risk'] },
  { value: 'delayed', label: 'Con retraso / bloqueado', keys: ['delayed', 'attention'] },
  { value: 'completed', label: 'Entregado', keys: ['completed'] },
]

export default function PortalProjectsPage() {
  const [params, setParams] = useSearchParams()
  const { data: areas } = useAreas()
  const [q, setQ] = useState('')
  const area = params.get('area') ?? 'all'
  const health = params.get('health') ?? 'all'
  const mine = params.get('mine') === '1'

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const { data: projects, isLoading } = useProjects(
    area !== 'all' ? { area_id: area } : {},
  )

  const filtered = useMemo(() => {
    if (!projects) return []
    const hf = HEALTH_FILTERS.find((f) => f.value === health)
    return projects.filter((p) => {
      if (mine && !p.is_watched) return false
      if (q.trim() && !p.name.toLowerCase().includes(q.trim().toLowerCase())) return false
      if (hf && hf.keys.length && !hf.keys.includes(projectHealth(p).key)) return false
      return true
    })
  }, [projects, q, health, mine])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
        <p className="mt-1 text-muted-foreground">
          Todo lo que el equipo de desarrollo está construyendo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar proyecto..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={area} onValueChange={(v) => setParam('area', v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {areas?.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={health} onValueChange={(v) => setParam('health', v)}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            {HEALTH_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant={mine ? 'default' : 'outline'}
          onClick={() => setParam('mine', mine ? 'all' : '1')}
        >
          <Star className={mine ? 'size-4 fill-current' : 'size-4'} /> Los que sigo
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No hay proyectos con estos filtros" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PortalProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
