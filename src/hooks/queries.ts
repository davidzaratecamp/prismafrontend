import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  ActivityItem,
  Area,
  DashboardData,
  KanbanData,
  Project,
  RoadmapProject,
  User,
} from '@/lib/types'

/* ----------------------------- Areas ----------------------------- */
export function useAreas() {
  return useQuery({
    queryKey: ['areas'],
    queryFn: async () => (await api.get<Area[]>('/areas')).data,
  })
}

export function useArea(idOrSlug?: string) {
  return useQuery({
    queryKey: ['area', idOrSlug],
    queryFn: async () => (await api.get<Area>(`/areas/${idOrSlug}`)).data,
    enabled: !!idOrSlug,
  })
}

export function useAreaMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['areas'] })
  return {
    create: useMutation({
      mutationFn: async (body: Partial<Area>) => (await api.post('/areas', body)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...body }: Partial<Area> & { id: number }) =>
        (await api.patch(`/areas/${id}`, body)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: number) => (await api.delete(`/areas/${id}`)).data,
      onSuccess: invalidate,
    }),
  }
}

/* ----------------------------- Users ----------------------------- */
export function useUsers(params?: { role?: string; active?: boolean }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => (await api.get<User[]>('/users', { params })).data,
  })
}

export function useUserMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] })
  return {
    create: useMutation({
      mutationFn: async (body: Record<string, unknown>) => (await api.post('/users', body)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: number }) =>
        (await api.patch(`/users/${id}`, body)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: number) => (await api.delete(`/users/${id}`)).data,
      onSuccess: invalidate,
    }),
  }
}

/* --------------------------- Projects --------------------------- */
export interface ProjectFilters {
  area_id?: number | string
  status?: string
  lead_user_id?: number | string
  q?: string
  archived?: boolean
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => (await api.get<Project[]>('/projects', { params: filters })).data,
  })
}

export function useProject(id?: number | string) {
  return useQuery({
    queryKey: ['project', String(id)],
    queryFn: async () => (await api.get<Project>(`/projects/${id}`)).data,
    enabled: !!id,
  })
}

export function useProjectMutations() {
  const qc = useQueryClient()
  const invalidate = (id?: number) => {
    qc.invalidateQueries({ queryKey: ['projects'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    qc.invalidateQueries({ queryKey: ['roadmap'] })
    qc.invalidateQueries({ queryKey: ['kanban'] })
    qc.invalidateQueries({ queryKey: ['activity'] })
    if (id) qc.invalidateQueries({ queryKey: ['project', String(id)] })
  }
  return {
    create: useMutation({
      mutationFn: async (body: Record<string, unknown>) =>
        (await api.post<Project>('/projects', body)).data,
      onSuccess: (p) => invalidate(p.id),
    }),
    update: useMutation({
      mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: number }) =>
        (await api.patch<Project>(`/projects/${id}`, body)).data,
      onSuccess: (p) => invalidate(p.id),
    }),
    setMembers: useMutation({
      mutationFn: async ({ id, member_ids }: { id: number; member_ids: number[] }) =>
        (await api.put<Project>(`/projects/${id}/members`, { member_ids })).data,
      onSuccess: (p) => invalidate(p.id),
    }),
    archive: useMutation({
      mutationFn: async ({ id, restore }: { id: number; restore?: boolean }) =>
        (await api.delete(`/projects/${id}`, { params: restore ? { restore: true } : {} })).data,
      onSuccess: () => invalidate(),
    }),
  }
}

/* ---------------------------- Modules ---------------------------- */
export function useModuleMutations(projectId: number) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', String(projectId)] })
    qc.invalidateQueries({ queryKey: ['projects'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    qc.invalidateQueries({ queryKey: ['kanban'] })
  }
  return {
    create: useMutation({
      mutationFn: async (body: Record<string, unknown>) =>
        (await api.post(`/projects/${projectId}/modules`, body)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ moduleId, ...body }: Record<string, unknown> & { moduleId: number }) =>
        (await api.patch(`/projects/${projectId}/modules/${moduleId}`, body)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (moduleId: number) =>
        (await api.delete(`/projects/${projectId}/modules/${moduleId}`)).data,
      onSuccess: invalidate,
    }),
  }
}

/* ----------------------------- Tasks ----------------------------- */
export function useTaskMutations(projectId: number) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', String(projectId)] })
    qc.invalidateQueries({ queryKey: ['projects'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    qc.invalidateQueries({ queryKey: ['kanban'] })
  }
  return {
    create: useMutation({
      mutationFn: async ({ moduleId, ...body }: Record<string, unknown> & { moduleId: number }) =>
        (await api.post(`/projects/${projectId}/modules/${moduleId}/tasks`, body)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({
        moduleId,
        taskId,
        ...body
      }: Record<string, unknown> & { moduleId: number; taskId: number }) =>
        (await api.patch(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}`, body)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async ({ moduleId, taskId }: { moduleId: number; taskId: number }) =>
        (await api.delete(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}`)).data,
      onSuccess: invalidate,
    }),
  }
}

/* --------------------------- Milestones -------------------------- */
export function useMilestoneMutations(projectId: number) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', String(projectId)] })
    qc.invalidateQueries({ queryKey: ['roadmap'] })
  }
  return {
    create: useMutation({
      mutationFn: async (body: Record<string, unknown>) =>
        (await api.post(`/projects/${projectId}/milestones`, body)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: number }) =>
        (await api.patch(`/projects/${projectId}/milestones/${id}`, body)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: number) =>
        (await api.delete(`/projects/${projectId}/milestones/${id}`)).data,
      onSuccess: invalidate,
    }),
  }
}

/* --------------------------- Dashboard -------------------------- */
export function useDashboard(areaId?: number) {
  return useQuery({
    queryKey: ['dashboard', areaId ?? 'global'],
    queryFn: async () =>
      (await api.get<DashboardData>(areaId ? `/dashboard/areas/${areaId}` : '/dashboard/overview'))
        .data,
  })
}

/* ---------------------------- Activity -------------------------- */
export function useActivity(params?: { area_id?: number; entity?: string; limit?: number }) {
  return useQuery({
    queryKey: ['activity', params],
    queryFn: async () => (await api.get<ActivityItem[]>('/activity', { params })).data,
  })
}

/* ---------------------------- Roadmap --------------------------- */
export function useRoadmap(areaId?: number | string) {
  return useQuery({
    queryKey: ['roadmap', areaId ?? 'all'],
    queryFn: async () =>
      (await api.get<RoadmapProject[]>('/roadmap', { params: areaId ? { area_id: areaId } : {} }))
        .data,
  })
}

/* ---------------------------- Kanban ---------------------------- */
export function useKanban(params: { area_id?: number | string; project_id?: number | string }) {
  return useQuery({
    queryKey: ['kanban', params],
    queryFn: async () => (await api.get<KanbanData>('/kanban', { params })).data,
  })
}

export function useKanbanMove() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      moduleId,
      taskId,
      status,
      order_index,
    }: {
      projectId: number
      moduleId: number
      taskId: number
      status: string
      order_index?: number
    }) =>
      (
        await api.patch(
          `/projects/${projectId}/modules/${moduleId}/tasks/${taskId}/move`,
          { status, order_index },
        )
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kanban'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
