import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Shapes } from 'lucide-react'

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shapes className="size-5 animate-pulse" />
          Cargando Prisma...
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

export function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  if (user && user.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
