import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Moon, Shapes, Sun, User as UserIcon } from 'lucide-react'
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
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useAreas } from '@/hooks/queries'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/roadmap', label: 'Roadmap' },
]

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
  )
}

export function PortalNav() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, toggleTheme } = useUiStore()
  const { data: areas } = useAreas()
  const navigate = useNavigate()
  const isDark = theme === 'dark' || document.documentElement.classList.contains('dark')

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shapes className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Prisma</p>
            <p className="text-[11px] text-muted-foreground">Portal de seguimiento</p>
          </div>
        </NavLink>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Áreas <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
              {areas?.map((a) => (
                <DropdownMenuItem key={a.id} onClick={() => navigate(`/areas/${a.slug}`)}>
                  <span className="size-2 rounded-full" style={{ background: a.color }} />
                  {a.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

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

      {/* nav compacta en móvil */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/areas" className={linkClass}>
          Áreas
        </NavLink>
      </nav>
    </header>
  )
}
