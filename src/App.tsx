import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Shapes } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { AppShell } from '@/components/layout/AppShell'
import { AdminRoute, ProtectedRoute } from '@/routes/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const AreaDashboardPage = lazy(() => import('@/pages/AreaDashboardPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const KanbanPage = lazy(() => import('@/pages/KanbanPage'))
const RoadmapPage = lazy(() => import('@/pages/RoadmapPage'))
const TeamPage = lazy(() => import('@/pages/TeamPage'))
const AreasAdminPage = lazy(() => import('@/pages/AreasAdminPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <Shapes className="size-5 animate-pulse" />
    </div>
  )
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/areas/:slug" element={<AreaDashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin/areas" element={<AreasAdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
