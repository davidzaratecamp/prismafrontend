import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Moon, PhoneIncoming, Sun, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/common/UserAvatar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

/** Interfaz única del rol `analista`: sólo el panel de analítica de Aware. */
export function AnalystShell() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, toggleTheme } = useUiStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isDark = theme === 'dark' || document.documentElement.classList.contains('dark')

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PhoneIncoming className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Analítica Aware</p>
            <p className="text-[11px] text-muted-foreground">SOFIA · inbound Claro</p>
          </div>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Cambiar tema">
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-accent">
              <UserAvatar name={user?.name} color={user?.avatar_color} size="sm" />
              <span className="hidden text-xs font-medium sm:block">{user?.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/ajustes')}>
                <UserIcon className="size-4" /> Mi perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="size-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
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
