import { useSearchParams } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { RoadmapGantt } from '@/components/roadmap/RoadmapGantt'
import { useAreas, useRoadmap } from '@/hooks/queries'

export default function PortalRoadmapPage() {
  const [params, setParams] = useSearchParams()
  const { data: areas } = useAreas()
  const area = params.get('area') ?? 'all'
  const { data, isLoading } = useRoadmap(area !== 'all' ? area : undefined)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roadmap</h1>
          <p className="mt-1 text-muted-foreground">
            Cronograma de entregas por área, con hitos y línea de tiempo.
          </p>
        </div>
        <Select
          value={area}
          onValueChange={(v) => {
            const next = new URLSearchParams(params)
            if (v === 'all') next.delete('area')
            else next.set('area', v)
            setParams(next, { replace: true })
          }}
        >
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {areas?.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 border border-foreground bg-background" /> Hito pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 border border-emerald-600 bg-emerald-500" /> Hito cumplido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded bg-red-500/70" /> Hoy
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <RoadmapGantt projects={data ?? []} linkBase="/proyectos" />
      )}
    </div>
  )
}
