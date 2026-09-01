import { Outlet, useLocation } from 'react-router-dom'
import { PortalNav } from './PortalNav'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export function PortalShell() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <PortalNav />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Prisma · Área de Desarrollo de Asiste Ing
      </footer>
    </div>
  )
}
