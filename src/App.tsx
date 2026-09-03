import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Shapes } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PortalShell } from '@/components/portal/PortalShell'
import { AnalystShell } from '@/components/layout/AnalystShell'
import { AdminRoute, ProtectedRoute } from '@/routes/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'

// App (admin / developer)
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const AreaDashboardPage = lazy(() => import('@/pages/AreaDashboardPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const KanbanPage = lazy(() => import('@/pages/KanbanPage'))
const RoadmapPage = lazy(() => import('@/pages/RoadmapPage'))
const TeamPage = lazy(() => import('@/pages/TeamPage'))
const AreasAdminPage = lazy(() => import('@/pages/AreasAdminPage'))
const RetellPage = lazy(() => import('@/pages/RetellPage'))
const AwarePage = lazy(() => import('@/pages/AwarePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

// Portal (viewer)
const PortalOverviewPage = lazy(() => import('@/pages/portal/PortalOverviewPage'))
const PortalAreaPage = lazy(() => import('@/pages/portal/PortalAreaPage'))
const PortalAreasPage = lazy(() => import('@/pages/portal/PortalAreasPage'))
const PortalProjectsPage = lazy(() => import('@/pages/portal/PortalProjectsPage'))
const PortalProjectPage = lazy(() => import('@/pages/portal/PortalProjectPage'))
const PortalRoadmapPage = lazy(() => import('@/pages/portal/PortalRoadmapPage'))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <Shapes className="size-5 animate-pulse" />
    </div>
  )
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const role = useAuthStore((s) => s.user?.role)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const isViewer = role === 'viewer'
  const isAnalyst = role === 'analista'

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          {isAnalyst ? (
            <Route element={<AnalystShell />}>
              <Route path="/" element={<AwarePage />} />
              <Route path="/ajustes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          ) : isViewer ? (
            <Route element={<PortalShell />}>
              <Route path="/" element={<PortalOverviewPage />} />
              <Route path="/areas" element={<PortalAreasPage />} />
              <Route path="/areas/:slug" element={<PortalAreaPage />} />
              <Route path="/proyectos" element={<PortalProjectsPage />} />
              <Route path="/proyectos/:id" element={<PortalProjectPage />} />
              <Route path="/roadmap" element={<PortalRoadmapPage />} />
              <Route path="/ajustes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          ) : (
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
                <Route path="/admin/retell" element={<RetellPage />} />
                <Route path="/admin/aware" element={<AwarePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Route>
      </Routes>
    </Suspense>
  )
}
