export type Role = 'admin' | 'developer' | 'viewer' | 'analista'
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
  last_activity_at: string
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

/* ----------------------------- Retell IA ----------------------------- */

export interface RetellSyncStateRow {
  resource: 'calls' | 'agents' | 'phone_numbers'
  last_synced_timestamp: number
  last_processed_count: number
  last_status: 'ok' | 'error' | 'running' | null
  last_error: string | null
  last_run_at: string | null
}

export interface RetellConfig {
  configured: boolean
  sync_status: RetellSyncStateRow[]
}

export interface RetellOverview {
  total_calls: number
  total_cost_usd: number
  avg_cost_usd: number
  total_minutes: number
  total_hours: number
  avg_duration_seconds: number
  cost_per_minute_usd: number | null
  successful_calls: number
  failed_calls: number
  success_rate: number | null
  inbound_calls: number
  outbound_calls: number
  voicemail_calls: number
  unique_agents: number
}

export interface RetellCostDay {
  day: string
  calls: number
  cost_usd: number
  minutes: number
}

export interface RetellAgentStat {
  agent_id: string
  agent_name: string
  calls: number
  cost_usd: number
  avg_cost_usd: number
  minutes: number
  avg_duration_seconds: number
  avg_latency_e2e_ms: number | null
  successful: number
  success_rate: number | null
  cost_per_successful_usd: number | null
  inbound: number
  outbound: number
  positive: number
  negative: number
  neutral: number
  positive_rate: number | null
}

export interface RetellProductCost {
  product: string
  cost_usd: number
  count: number
}

export interface RetellSentimentRow {
  sentiment: string
  calls: number
}

export interface RetellReasonRow {
  reason: string
  calls: number
}

export interface RetellCall {
  call_id: string
  agent_id: string | null
  agent_name: string | null
  call_type: string | null
  call_status: string | null
  direction: string | null
  from_number: string | null
  to_number: string | null
  started_at: string | null
  ended_at: string | null
  duration_seconds: number | null
  combined_cost_usd: number | null
  user_sentiment: string | null
  call_successful: boolean | null
  in_voicemail: boolean | null
  disconnection_reason: string | null
  call_summary: string | null
  recording_url: string | null
  public_log_url: string | null
}

export interface RetellCallsPage {
  page: number
  page_size: number
  total: number
  total_pages: number
  rows: RetellCall[]
}

export interface RetellAgent {
  agent_id: string
  agent_name: string | null
  channel: string | null
  voice_id: string | null
  language: string | null
  version: string | null
  last_modification_timestamp: number | null
  synced_at: string | null
}

export interface RetellFilterOptions {
  agents: { agent_id: string; agent_name: string }[]
  date_range: { min: string | null; max: string | null }
  call_types: string[]
  directions: string[]
}

export interface RetellVolumeDay {
  day: string
  calls: number
  inbound: number
  outbound: number
  ended: number
  error: number
}

export interface RetellHeatCell {
  hour: number
  weekday: number // 0 = lunes … 6 = domingo
  calls: number
}

export interface RetellDurationBucket {
  bucket: string
  calls: number
}

export interface RetellLatencyStats {
  e2e_p50_avg_ms: number | null
  e2e_p90_avg_ms: number | null
  e2e_p90_max_ms: number | null
  llm_p50_avg_ms: number | null
}

export interface RetellStatusRow {
  status: string
  calls: number
}

export interface RetellDailyTrend {
  day: string
  calls: number
  cost_usd: number
  success_rate: number | null
  positive_rate: number | null
  negative_rate: number | null
  neutral_rate: number | null
}

export interface RetellMonthlyComparison {
  is_current_month: boolean
  current_month: {
    label: string
    calls: number
    cost_usd: number
    minutes: number
    successful: number
    days_elapsed: number
    days_in_month: number
    projected_cost_usd: number
    projection_reliable: boolean
  }
  previous_month: {
    label: string
    calls: number
    cost_usd: number
    minutes: number
    successful: number
  }
  previous_month_same_period: {
    label: string
    through_day: number
    calls: number
    cost_usd: number
    minutes: number
    successful: number
  }
  same_period_change_pct: number | null
  projected_vs_previous_pct: number | null
}

export interface RetellDisconnectionBySuccess {
  reason: string
  total: number
  successful: number
  failed: number
  success_rate: number | null
  avg_duration_seconds: number | null
}

/* ----------------------------- Aware / SOFIA ----------------------------- */

export interface AwareConfig {
  configured: boolean
  min_date?: string | null
  max_date?: string | null
  projects?: { proyecto_id: number; name: string }[]
  error?: string
}

export interface AwareOverview {
  range: { from: string; to: string }
  total_calls: number
  transfers: number
  transfer_rate: number | null
  user_hangup: number
  user_hangup_rate: number | null
  agent_hangup: number
  agent_hangup_rate: number | null
  inactivity: number
  inactivity_rate: number | null
  avg_duration_seconds: number
  p50_duration_seconds: number
  p90_duration_seconds: number
  positive: number
  negative: number
  neutral: number
  positive_rate: number | null
  negative_rate: number | null
  successful: number
  success_rate: number | null
}

export interface AwareVolumeDay {
  day: string
  calls: number
  transfers: number
  hogar: number
  tyt: number
}

export interface AwareHangupDay {
  day: string
  transfer: number
  user_hangup: number
  agent_hangup: number
  inactivity: number
}

export interface AwareDailyTrend {
  day: string
  calls: number
  success_rate: number | null
  positive_rate: number | null
  negative_rate: number | null
  neutral_rate: number | null
}

export interface AwareCountRow {
  reason?: string
  sentiment?: string
  tipo?: string
  calls: number
}

export interface AwareDurationBucket {
  bucket: string
  calls: number
}

export interface AwareHeatCell {
  hour: number
  weekday: number
  calls: number
}

export interface AwareByProject {
  proyecto_id: number
  name: string
  calls: number
  transfer_rate: number | null
  user_hangup_rate: number | null
  agent_hangup_rate: number | null
  inactivity_rate: number | null
  avg_duration_seconds: number
  success_rate: number | null
  positive_rate: number | null
}

export interface AwareTransfersAttended {
  range: { from: string; to: string }
  total: { transfers: number; attended: number; not_attended: number; attended_rate: number | null }
  by_project: {
    proyecto_id: number
    name: string
    transfers: number
    attended: number
    not_attended: number
    attended_rate: number | null
  }[]
  approximate: boolean
}

export interface AwareCall {
  call_id: string
  proyecto_id: number
  proyecto_name: string
  fecha: string | null
  hora: string | null
  hangup_reason: string | null
  duration_seconds: number | null
  telefono: string | null
  user_sentiment: string | null
  call_successful: boolean | null
  call_summary: string | null
  audio_url: string | null
}

export interface AwareCallsPage {
  page: number
  page_size: number
  total: number
  total_pages: number
  rows: AwareCall[]
}

export interface AwareCallDetail extends AwareCall {
  analysis: Record<string, unknown> | null
  transcript: { role: string; content: string }[]
}

export interface AwareFilterOptions {
  min_date: string | null
  max_date: string | null
  projects: { proyecto_id: number; name: string }[]
}

export interface AwareFunnel {
  range: { from: string; to: string }
  stages: { key: string; label: string; count: number; of_prev: number | null }[]
  not_attended: number
  not_attended_rate: number | null
  approximate: boolean
}

export interface AwareNotAttendedDay {
  day: string
  transferidas: number
  atendidas: number
  no_atendidas: number
  atendidas_rate: number | null
}

export interface AwareRepeatCallers {
  numeros: number
  repiten: number
  repiten_rate: number | null
  llamadas_de_repiten: number
  top: { telefono: string; veces: number }[]
}

export interface AwareHourlyOp {
  hour: number
  calls: number
  transfers: number
  calls_per_day: number
  transfers_per_day: number
  transfer_rate: number | null
}

export interface AwareWeekdayOp {
  weekday: number
  label: string
  calls: number
  transfers: number
  days: number
  calls_per_day: number
  transfers_per_day: number
}

export interface AwareTurnBuckets {
  avg_turns: number
  p50_turns: number
  buckets: { bucket: string; calls: number }[]
}

export interface AwareTurnsByOutcome {
  reason: string
  calls: number
  avg_turns: number
}

export interface AwareDurationByOutcome {
  reason: string
  calls: number
  avg_seconds: number
  p50_seconds: number
  p90_seconds: number
}

export interface AwareFirstUtterance {
  frase: string
  calls: number
}

export interface AwareSentimentByOutcome {
  sentiment: string
  total: number
  transfer: number
  user_hangup: number
  agent_hangup: number
  inactivity: number
}

export interface AwareServiceGroup {
  grupo: string
  calls: number
  transfer_rate: number | null
  success_rate: number | null
}

export interface AwareAgentHangup {
  by_project: { proyecto_id: number; name: string; calls: number; agent_hangup: number; rate: number | null }[]
  by_hour: { hour: number; calls: number }[]
  total: number
  avg_seconds: number
  avg_turns: number
  sample: {
    call_id: string
    proyecto_name: string
    fecha: string | null
    hora: string | null
    duration_seconds: number | null
    call_summary: string | null
  }[]
}

export interface AwareLiveFeed {
  date: string
  rows: AwareCall[]
}
