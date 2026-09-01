export type Role = 'admin' | 'developer' | 'viewer'
export type ProjectStatus =
  | 'planned'
  | 'in_progress'
  | 'testing'
  | 'blocked'
  | 'paused'
  | 'completed'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'testing' | 'done' | 'blocked'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  area_id: number | null
  avatar_color: string
  is_active?: boolean
  created_at?: string
}

export interface Area {
  id: number
  name: string
  slug: string
  color: string
  description: string | null
  created_at?: string
  project_count?: number
  active_count?: number
  avg_progress?: number
}

export interface MiniUser {
  id: number
  name: string
  avatar_color: string
  email?: string
  role?: Role
}

export interface Task {
  id: number
  module_id: number
  title: string
  description: string | null
  status: TaskStatus
  assignee_user_id: number | null
  assignee_name?: string | null
  assignee_color?: string | null
  estimate_points: number | null
  order_index: number
  done_at: string | null
}

export interface Module {
  id: number
  project_id: number
  name: string
  description: string | null
  status: ProjectStatus
  repo_url: string | null
  weight: number
  progress_manual: number | null
  progress_cached: number
  order_index: number
  due_date: string | null
  tasks?: Task[]
}

export interface Milestone {
  id: number
  project_id: number
  title: string
  date: string
  done: boolean
}

export interface Project {
  id: number
  name: string
  description: string | null
  area_id: number
  status: ProjectStatus
  priority: Priority
  lead_user_id: number | null
  repo_url: string | null
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  progress_manual: number | null
  progress_cached: number
  planned_modules_count: number | null
  created_at: string
  updated_at: string
  archived_at: string | null
  lead: MiniUser | null
  area: Pick<Area, 'id' | 'name' | 'slug' | 'color'> | null
  areas: Pick<Area, 'id' | 'name' | 'slug' | 'color'>[]
  members: MiniUser[]
  requesters: MiniUser[]
  is_watched: boolean
  module_count: number
  task_counts: Partial<Record<TaskStatus, number>>
  modules?: Module[]
  milestones?: Milestone[]
}

export interface ActivityItem {
  id: number
  actor_user_id: number | null
  actor_name: string | null
  actor_color: string | null
  area_id: number | null
  area_name: string | null
  area_color: string | null
  entity_type: string
  entity_id: number | null
  action: string
  summary: string
  created_at: string
}

export interface DashboardData {
  kpis: {
    total: number
    active: number
    blocked: number
    completed: number
    avg_progress: number
    delivered_this_month: number
    due_soon: number
  }
  by_area: {
    id: number
    name: string
    slug: string
    color: string
    total: number
    active: number
    avg_progress: number
  }[]
  workload: {
    id: number
    name: string
    avatar_color: string
    todo: number
    in_progress: number
    testing: number
    blocked: number
    open_tasks: number
    leads: number
  }[]
  at_risk: {
    id: number
    name: string
    status: ProjectStatus
    priority: Priority
    due_date: string | null
    progress_cached: number
    area_name: string
    area_color: string
    lead_name: string | null
  }[]
}

export interface RoadmapProject {
  id: number
  name: string
  status: ProjectStatus
  priority: Priority
  start_date: string | null
  due_date: string | null
  progress_cached: number
  area_id: number
  area_name: string
  area_color: string
  lead_name: string | null
  milestones: Milestone[]
}

export type KanbanData = Record<TaskStatus, {
  id: number
  title: string
  status: TaskStatus
  order_index: number
  estimate_points: number | null
  module_id: number
  module_name: string
  project_id: number
  project_name: string
  project_priority: Priority
  area_name: string
  area_color: string
  assignee_name: string | null
  assignee_color: string | null
}[]>
