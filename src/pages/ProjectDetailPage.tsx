import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  GitBranch,
  Pencil,
  Sparkles,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge'
import { AreaBadge } from '@/components/common/AreaBadge'
import { ProgressRing } from '@/components/common/ProgressRing'
import { UserAvatar } from '@/components/common/UserAvatar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ModulesPanel } from '@/components/projects/ModulesPanel'
import { MilestoneList } from '@/components/projects/MilestoneList'
import { MemberPicker } from '@/components/projects/MemberPicker'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { useProject, useProjectMutations, useUsers } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import { useAuthStore, useCanWrite } from '@/stores/auth'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canWrite = useCanWrite()
  const currentUser = useAuthStore((s) => s.user)
  const { data: project, isLoading } = useProject(id)
  const { data: users } = useUsers({ active: true })
  const { setMembers, archive } = useProjectMutations()
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  if (isLoading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const saveMembers = async (ids: number[]) => {
    try {
      await setMembers.mutateAsync({ id: project.id, member_ids: ids })
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link to="/projects">
          <ArrowLeft className="size-4" /> Proyectos
        </Link>
      </Button>

      <PageHeader
        title={project.name}
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            {project.area && <AreaBadge name={project.area.name} color={project.area.color} />}
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            {currentUser && project.requested_by_user_id === currentUser.id && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Sparkles className="size-3" /> Solicitado por ti
              </span>
            )}
          </span>
        }
        actions={
          canWrite && (
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" /> Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => (project.archived_at ? archive.mutate({ id: project.id, restore: true }) : setArchiveOpen(true))}
              >
                {project.archived_at ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                {project.archived_at ? 'Restaurar' : 'Archivar'}
              </Button>
            </>
          )
        }
      />

      <Card>
        <CardContent className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-4">
            <ProgressRing value={project.progress_cached} size={72} strokeWidth={6} />
            <div className="text-sm">
              <p className="font-medium">Avance global</p>
              <p className="text-muted-foreground">
                {project.progress_manual != null
                  ? 'Definido manualmente'
                  : 'Calculado a partir de módulos y tareas'}
              </p>
              {project.planned_modules_count != null && (
                <p
                  className={
                    project.planned_modules_count > project.module_count
                      ? 'mt-0.5 font-medium text-amber-600 dark:text-amber-400'
                      : 'mt-0.5 text-muted-foreground'
                  }
                >
                  {project.module_count} de {project.planned_modules_count} módulos previstos
                  {project.planned_modules_count > project.module_count && ' · alcance en definición'}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Líder">
              {project.lead ? (
                <span className="flex items-center gap-2">
                  <UserAvatar name={project.lead.name} color={project.lead.avatar_color} size="xs" />
                  {project.lead.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </Info>
            <Info label="Solicitado por">
              {project.requester ? (
                <span className="flex items-center gap-2">
                  <UserAvatar
                    name={project.requester.name}
                    color={project.requester.avatar_color}
                    size="xs"
                  />
                  {project.requester.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Sin especificar</span>
              )}
            </Info>
            <Info label="Fechas">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                {project.start_date ? format(parseISO(project.start_date), 'd MMM', { locale: es }) : '—'}
                {' → '}
                {project.due_date ? format(parseISO(project.due_date), 'd MMM yyyy', { locale: es }) : '—'}
              </span>
            </Info>
            <Info label="Repositorio">
              {project.repo_url ? (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <GitBranch className="size-3.5" /> Abrir <ExternalLink className="size-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">No configurado</span>
              )}
            </Info>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules">
        <TabsList className="flex-wrap">
          <TabsTrigger value="modules">Módulos y tareas</TabsTrigger>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="milestones">Hitos</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <ModulesPanel project={project} canWrite={canWrite} />
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="mb-1 text-sm font-medium">Descripción</p>
                <p className="text-sm text-muted-foreground">
                  {project.description || 'Sin descripción.'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(project.modules ?? []).map((m) => (
                  <div key={m.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{m.name}</p>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {m.progress_cached}%
                      </span>
                    </div>
                    <Progress value={m.progress_cached} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm text-muted-foreground">
                {canWrite
                  ? 'Selecciona quién trabaja en este proyecto.'
                  : 'Personas asignadas a este proyecto.'}
              </p>
              {canWrite ? (
                <MemberPicker
                  users={(users ?? []).filter((u) => u.role !== 'viewer')}
                  selected={project.members.map((m) => m.id)}
                  onChange={saveMembers}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {project.members.map((m) => (
                    <span key={m.id} className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm">
                      <UserAvatar name={m.name} color={m.avatar_color} size="xs" />
                      {m.name}
                    </span>
                  ))}
                  {project.members.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nadie asignado.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardContent className="p-5">
              <MilestoneList
                projectId={project.id}
                milestones={project.milestones ?? []}
                canWrite={canWrite}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed areaId={project.area_id} limit={40} />
        </TabsContent>
      </Tabs>

      <ProjectForm open={editOpen} onOpenChange={setEditOpen} project={project} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archivar proyecto"
        description="Dejará de aparecer en listas y tableros. Podrás restaurarlo después."
        confirmLabel="Archivar"
        loading={archive.isPending}
        onConfirm={async () => {
          await archive.mutateAsync({ id: project.id })
          setArchiveOpen(false)
          navigate('/projects')
        }}
      />
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}
