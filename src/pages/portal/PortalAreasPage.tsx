import { useAreas, useProjects } from '@/hooks/queries'
import { AreaStatusGrid } from '@/components/portal/AreaStatusGrid'
import { Skeleton } from '@/components/ui/skeleton'

export default function PortalAreasPage() {
  const { data: areas } = useAreas()
  const { data: projects, isLoading } = useProjects()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Áreas</h1>
        <p className="mt-1 text-muted-foreground">
          Estado de los desarrollos por área de negocio.
        </p>
      </div>
      {isLoading || !areas || !projects ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <AreaStatusGrid areas={areas} projects={projects} />
      )}
    </div>
  )
}
