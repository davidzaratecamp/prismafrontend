import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  GanttChartSquare,
  Users,
  Shapes,
  Settings,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAreas } from '@/hooks/queries'
import { useIsAdmin } from '@/stores/auth'
import { ScrollArea } from '@/components/ui/scroll-area'

const nav = [
  { to: '/', label: 'Panel general', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Proyectos', icon: FolderKanban },
  { to: '/kanban', label: 'Tablero', icon: Columns3 },
  { to: '/roadmap', label: 'Roadmap', icon: GanttChartSquare },
  { to: '/team', label: 'Equipo', icon: Users },
]

function itemClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: areas } = useAreas()
  const isAdmin = useIsAdmin()

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shapes className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Prisma</p>
          <p className="text-[11px] text-muted-foreground">Asiste Ing</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-2">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={itemClass} onClick={onNavigate}>
              <n.icon className="size-4" />
              {n.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin/areas" className={itemClass} onClick={onNavigate}>
              <Shapes className="size-4" />
              Áreas
            </NavLink>
          )}
        </nav>

        <div className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Áreas
        </div>
        <nav className="mt-1 space-y-0.5 pb-4">
          {areas?.map((a) => (
            <NavLink
              key={a.id}
              to={`/areas/${a.slug}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )
              }
              onClick={onNavigate}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: a.color }} />
                <span className="truncate">{a.name}</span>
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {a.active_count ?? 0}
              </span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="space-y-1 border-t p-3">
        {isAdmin && (
          <NavLink to="/admin/retell" className={itemClass} onClick={onNavigate}>
            <Bot className="size-4" />
            Retell IA
          </NavLink>
        )}
        <NavLink to="/settings" className={itemClass} onClick={onNavigate}>
          <Settings className="size-4" />
          Ajustes
        </NavLink>
      </div>
    </div>
  )
}
