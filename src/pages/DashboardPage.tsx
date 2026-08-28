import { PageHeader } from '@/components/common/PageHeader'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { useDashboard } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user?.name?.split(' ')[0] ?? ''}`}
        description="Estado general de todos los proyectos y áreas de Asiste Ing."
      />
      <DashboardContent data={data} isLoading={isLoading} />
    </div>
  )
}
