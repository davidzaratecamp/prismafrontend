import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
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

export default function RoadmapPage() {
  const [params, setParams] = useSearchParams()
  const { data: areas } = useAreas()
  const area = params.get('area') ?? 'all'
  const { data, isLoading } = useRoadmap(area !== 'all' ? area : undefined)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmap"
        description="Cronograma de proyectos por área, con hitos y línea de tiempo."
        actions={
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
        }
      />

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 border border-foreground bg-background" /> Hito pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 border border-emerald-600 bg-emerald-500" /> Hito cumplido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded bg-red-500/70" /> Línea de hoy
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <RoadmapGantt projects={data ?? []} />
      )}
    </div>
  )
}
