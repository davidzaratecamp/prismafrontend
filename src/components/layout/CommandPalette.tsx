import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAreas, useProjects } from '@/hooks/queries'
import { FolderKanban, LayoutDashboard, Shapes } from 'lucide-react'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  const { data: projects } = useProjects()
  const { data: areas } = useAreas()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const go = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <Command className="[&_[cmdk-input]]:h-12" shouldFilter>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Buscar proyectos, áreas, secciones..."
            className="w-full border-b bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Sin resultados.
            </Command.Empty>

            <Command.Group heading="Ir a" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
              <PaletteItem onSelect={() => go('/')} icon={<LayoutDashboard className="size-4" />}>
                Panel general
              </PaletteItem>
              <PaletteItem onSelect={() => go('/projects')} icon={<FolderKanban className="size-4" />}>
                Proyectos
              </PaletteItem>
              <PaletteItem onSelect={() => go('/roadmap')} icon={<Shapes className="size-4" />}>
                Roadmap
              </PaletteItem>
            </Command.Group>

            {areas && areas.length > 0 && (
              <Command.Group heading="Áreas" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
                {areas.map((a) => (
                  <PaletteItem
                    key={a.id}
                    onSelect={() => go(`/areas/${a.slug}`)}
                    icon={<span className="size-2.5 rounded-full" style={{ background: a.color }} />}
                  >
                    {a.name}
                  </PaletteItem>
                ))}
              </Command.Group>
            )}

            {projects && projects.length > 0 && (
              <Command.Group heading="Proyectos" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
                {projects.map((p) => (
                  <PaletteItem
                    key={p.id}
                    onSelect={() => go(`/projects/${p.id}`)}
                    icon={<span className="size-2.5 rounded-full" style={{ background: p.area?.color }} />}
                  >
                    {p.name}
                  </PaletteItem>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function PaletteItem({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  onSelect: () => void
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      {icon}
      {children}
    </Command.Item>
  )
}
