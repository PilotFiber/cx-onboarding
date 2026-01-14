export type ProjectStatus = 'new' | 'reviewing' | 'scheduled' | 'confirmed' | 'installing' | 'completed'
export type ProjectPriority = 'normal' | 'high' | 'urgent'
export type ScheduleSlot = 'morning-9' | 'morning-11' | 'all-day' | 'early-7' | 'after-hours'
export type DeploymentType = 'gpon' | 'xgs' | 'gpon-xgs' | 'fixed-wireless'
export type IPType = 'dynamic' | 'static' | 'bgp'
export type BuildingType = 'commercial' | 'residential' | 'mdu' | 'data-center'
export type BuildingStatus = 'on-net' | 'anchor' | 'near-net' | 'off-net' | 'in-construction'

// VIP Tiers with special SLA rules
export type VIPTier = 'standard' | 'silver' | 'gold' | 'platinum'

export interface VIPSLARules {
  tier: VIPTier
  label: string
  color: string
  bgColor: string
  // SLA multiplier (1.0 = standard, 0.5 = half the time)
  slaMultiplier: number
  // Response time targets in hours
  firstResponseHours: number
  // Lead time reduction in days
  leadTimeReductionDays: number
  // Priority boost (adds to project priority for sorting)
  priorityBoost: number
  // Special perks
  dedicatedSupport: boolean
  priorityScheduling: boolean
  executiveEscalation: boolean
}

export const vipTierConfig: Record<VIPTier, VIPSLARules> = {
  standard: {
    tier: 'standard',
    label: 'Standard',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    slaMultiplier: 1.0,
    firstResponseHours: 24,
    leadTimeReductionDays: 0,
    priorityBoost: 0,
    dedicatedSupport: false,
    priorityScheduling: false,
    executiveEscalation: false,
  },
  silver: {
    tier: 'silver',
    label: 'Silver',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    slaMultiplier: 0.75,
    firstResponseHours: 12,
    leadTimeReductionDays: 2,
    priorityBoost: 1,
    dedicatedSupport: false,
    priorityScheduling: true,
    executiveEscalation: false,
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    slaMultiplier: 0.5,
    firstResponseHours: 4,
    leadTimeReductionDays: 5,
    priorityBoost: 2,
    dedicatedSupport: true,
    priorityScheduling: true,
    executiveEscalation: false,
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    slaMultiplier: 0.25,
    firstResponseHours: 1,
    leadTimeReductionDays: 10,
    priorityBoost: 3,
    dedicatedSupport: true,
    priorityScheduling: true,
    executiveEscalation: true,
  },
}

// Project Types
export type ProjectType =
  | 'standard-on-net'
  | 'new-build'
  | 'contract-labor'
  | 'montgomery'
  | 'coex'
  | 'after-hours'
  | 'dark-fiber'
  | 'wavelength'
  | 'ethernet-transport'
  | 'ip-transit'

// Task with section grouping
export interface TaskTemplate {
  id: string
  title: string
  section: string // e.g., "Sales Hand Off", "Survey Required", "After Hours Process"
  assignee?: string
  conditional?: boolean // If true, task can be removed if not needed
  daysBeforeInstall?: number
}

export interface ApprovalRequirement {
  id: string
  name: string
  role: string
  required: boolean
}

export interface ProjectTypeConfig {
  id: ProjectType
  name: string
  description: string
  leadTimeDays: number
  color: string
  taskTemplates: TaskTemplate[]
  approvals: ApprovalRequirement[]
  requiresContractLabor?: boolean
  requiresEngineering?: boolean
  requiresPermits?: boolean
  requiresSpecialEquipment?: boolean
  requiresSurvey?: boolean
}

export interface Task {
  id: string
  title: string
  section: string
  completed: boolean
  assignee?: string
  dueDate?: string
  conditional?: boolean
}

export interface ReadinessTask {
  id: string
  label: string
  completed: boolean
  assignee?: string
  dueDate?: string
  critical?: boolean
  autoCheck?: string // ID of auto-check condition, if applicable
}

export interface Approval {
  id: string
  requirementId: string
  approvedBy?: string
  approvedAt?: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

export interface InstallReport {
  id: string
  installerName: string
  completedAt: string
  deviceInstalled: string
  deviceSerial: string
  powerStatus: 'permanent' | 'temporary'
  notes: string
  photos?: string[]
}

export interface Project {
  id: string
  projectType: ProjectType
  customerId: string
  buildingId: string
  serviceOrderId: string
  status: ProjectStatus
  priority: ProjectPriority

  // VIP tier override - if set, overrides customer's VIP tier for this project
  vipTierOverride?: VIPTier

  // Sales handoff
  handoffDate: string
  handoffEmailId: string
  salesRep: string
  cxAssignee?: string // CXA assigned to this project

  // FOC - Firm Order Commitment
  focDate: string

  // Service details (from Asana fields)
  product: string // e.g., "Dedicated Internet", "Dark Fiber"
  ipType: IPType
  serviceBandwidth: string // e.g., "1 Gbps", "10 Gbps"
  numStaticIps?: number
  mrc: number // Monthly Recurring Cost
  nrc: number // Non-Recurring Cost (install fee)

  // Building & Network info
  buildingOnNet: boolean
  buildingType: BuildingType
  buildingIspNotes?: string
  quotedLeadTime: number // Days quoted to customer

  // Device & Equipment
  device?: string // e.g., "Pilot XGS-2000"
  eeroRequired?: boolean

  // Channel Partner
  channelPartner?: string

  // Links
  flightDeckUrl?: string

  // Flags for conditional workflows
  surveyRequired: boolean
  afterHoursRequired: boolean
  riserDiagramRequired: boolean

  // Legacy fields for backward compatibility
  serviceType: string
  staticIp: boolean
  customerOwnRouter: boolean

  // Type-specific fields
  contractLaborVendor?: string
  engineeringNotes?: string
  permitNumber?: string
  specialEquipment?: string[]

  // Type-specific contacts
  montgomeryContact?: {
    name: string
    email: string
    phone: string
  }
  contractorContact?: {
    company: string
    name: string
    email: string
    phone: string
  }

  // Third-party IT contact
  thirdPartyItContact?: {
    company?: string
    name: string
    email: string
    phone: string
  }

  // Wholesale / Carrier service
  isWholesale: boolean
  hasEndUserContact?: boolean
  endUserContact?: {
    company?: string
    name: string
    email: string
    phone: string
  }

  // Survey/SOW tracking
  surveyDate?: string
  sowApproved?: boolean
  sowUrl?: string

  // Schedule
  scheduledDate?: string
  scheduledSlot?: ScheduleSlot
  assignedCrew?: string

  // Internal tasks
  tasks: Task[]

  // Install readiness tasks
  readinessTasks: ReadinessTask[]

  // Approvals
  approvals: Approval[]

  // SLA tracking
  slaDeadline: string
  lastCustomerContact: string

  // Post-install
  installReport?: InstallReport
  customerSurveyId?: string

  // Internal notes & activity
  internalNotes: InternalNote[]
  activityLog: ActivityLogEntry[]
  communicationLog: CommunicationLogEntry[]

  // Blockers
  blockers: Blocker[]

  // Escalation
  isEscalated: boolean
  escalatedAt?: string
  escalatedBy?: string
  escalationReason?: string

  // Project Group (for linked projects)
  projectGroupId?: string

  createdAt: string
  updatedAt: string
}

// Project Group - for linking related projects together
export interface ProjectGroup {
  id: string
  name: string
  description?: string
  customerId: string // Primary customer for the group
  color: string // For visual identification
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Contact roles
export type ContactRole = 'primary' | 'technical' | 'billing' | 'onsite' | 'it' | 'other'

export const contactRoleLabels: Record<ContactRole, string> = {
  primary: 'Primary',
  technical: 'Technical',
  billing: 'Billing',
  onsite: 'Onsite POC',
  it: 'IT Contact',
  other: 'Other',
}

// Reusable contact interface
export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role?: ContactRole
  isPrimary?: boolean
}

export interface Customer {
  id: string
  companyName: string
  contacts: Contact[]
  // VIP tier - applies to all projects for this customer unless overridden
  vipTier?: VIPTier
  // LinkedIn company page URL (auto-generated from email domain, user can edit)
  linkedInUrl?: string
  // Legacy fields for backward compatibility
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

export interface BuildingOutage {
  id: string
  type: 'outage' | 'maintenance'
  status: 'active' | 'scheduled' | 'resolved'
  title: string
  description?: string
  startTime: string
  endTime?: string
  affectedServices?: string[]
}

export interface Building {
  id: string
  address: string
  city: string
  state: string
  zip: string
  buildingStatus: BuildingStatus
  deploymentType: DeploymentType
  buildingType: BuildingType
  onNet: boolean
  installNotes: string[]
  recommendedDevice: string
  accessInstructions?: string
  ispNotes?: string
  requiresAfterHours?: boolean
  requiresContractWork?: boolean
  requiresSurvey?: boolean // Ground floor, retail, fitness spaces
  outages?: BuildingOutage[]
  flightDeckId?: string // For future Flight Deck integration
}

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketType = 'email' | 'phone' | 'internal' | 'customer-request'
export type TicketCategory = 'billing' | 'technical' | 'scheduling' | 'general' | 'complaint' | 'change-request'

// SLA targets in hours based on priority
export const ticketSlaTargets: Record<TicketPriority, { firstResponse: number; resolution: number }> = {
  low: { firstResponse: 24, resolution: 72 },
  normal: { firstResponse: 8, resolution: 48 },
  high: { firstResponse: 4, resolution: 24 },
  urgent: { firstResponse: 1, resolution: 8 },
}

export interface Ticket {
  id: string
  projectId?: string // Optional - tickets can be standalone
  customerId?: string // For standalone tickets
  type: TicketType
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  subject: string
  description: string
  from?: string
  to?: string[]
  assignee?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  isRead: boolean
  requiresResponse: boolean
  responseDeadline?: string
  // SLA tracking
  firstResponseDue: string
  resolutionDue: string
  firstRespondedAt?: string
  // Conversation thread
  replies?: TicketReply[]
  notes?: TicketNote[]
}

export interface TicketReply {
  id: string
  author: string
  authorType: 'agent' | 'customer' | 'system'
  content: string
  createdAt: string
  isInternal: boolean // Internal notes vs customer-visible replies
}

export interface TicketNote {
  id: string
  author: string
  content: string
  createdAt: string
  isInternal: boolean
}

export interface ServiceOrder {
  id: string
  customerId: string
  buildingId: string
  product: string
  serviceType: string
  serviceBandwidth: string
  ipType: IPType
  numStaticIps?: number
  monthlyRecurring: number
  installFee: number
  contractTerm: number
  staticIp: boolean
  channelPartner?: string
  notes?: string
}

// Activity Log
export type ActivityType =
  | 'status_change'
  | 'task_completed'
  | 'task_assigned'
  | 'email_sent'
  | 'email_received'
  | 'call_logged'
  | 'note_added'
  | 'schedule_set'
  | 'schedule_changed'
  | 'blocker_added'
  | 'blocker_resolved'
  | 'escalated'
  | 'de_escalated'
  | 'assignee_changed'
  | 'created'

export interface ActivityLogEntry {
  id: string
  projectId: string
  type: ActivityType
  description: string
  author: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// Communication Log
export type CommunicationType = 'call' | 'email' | 'meeting' | 'text' | 'other'
export type CommunicationDirection = 'inbound' | 'outbound'

export interface CommunicationLogEntry {
  id: string
  type: CommunicationType
  direction: CommunicationDirection
  contactName: string
  summary: string
  notes?: string
  duration?: number // in minutes
  followUpRequired: boolean
  followUpDate?: string
  author: string
  createdAt: string
}

// Blockers
export type BlockerType =
  | 'waiting_customer'
  | 'waiting_permit'
  | 'waiting_equipment'
  | 'waiting_scheduling'
  | 'waiting_internal'
  | 'waiting_vendor'
  | 'waiting_joe'
  | 'technical_issue'
  | 'other'

export interface Blocker {
  id: string
  type: BlockerType
  description: string
  createdAt: string
  createdBy: string
  resolvedAt?: string
  resolvedBy?: string
}

// Internal Notes
export interface InternalNote {
  id: string
  content: string
  author: string
  createdAt: string
  isPinned?: boolean
  mentions?: string[] // Array of team member IDs who were mentioned
}

// Email Templates
export type EmailTemplateCategory =
  | 'intro'
  | 'scheduling'
  | 'confirmation'
  | 'follow_up'
  | 'delay'
  | 'completion'

export interface EmailTemplate {
  id: string
  name: string
  category: EmailTemplateCategory
  subject: string
  body: string
  variables: string[] // e.g., ['customerName', 'scheduledDate', 'address']
}

// Performance Metrics
export interface TeamMemberMetrics {
  memberId: string
  memberName: string
  activeProjects: number
  completedThisMonth: number
  onTimeRate: number // percentage
  avgDaysToInstall: number
  projectsPastFoc: number
}

// Customer News Alerts
export type NewsAlertCategory =
  | 'funding'
  | 'milestone'
  | 'press'
  | 'leadership'
  | 'expansion'
  | 'product'
  | 'partnership'
  | 'award'
  | 'general'

export interface NewsAlert {
  id: string
  customerId: string
  category: NewsAlertCategory
  title: string
  summary: string
  source: 'linkedin' | 'news' | 'press-release' | 'social'
  sourceUrl?: string
  publishedAt: string
  isRead: boolean
  isDismissed: boolean
  suggestedAction?: string
}

export const newsAlertCategoryConfig: Record<NewsAlertCategory, {
  label: string
  color: string
  bgColor: string
  icon: string
  defaultAction: string
}> = {
  funding: {
    label: 'Funding',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'DollarSign',
    defaultAction: 'Consider upgrade opportunity',
  },
  milestone: {
    label: 'Milestone',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'Trophy',
    defaultAction: 'Send congratulations',
  },
  press: {
    label: 'Press',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'Newspaper',
    defaultAction: 'Stay informed',
  },
  leadership: {
    label: 'Leadership Change',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: 'Users',
    defaultAction: 'Introduce yourself to new contact',
  },
  expansion: {
    label: 'Expansion',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    icon: 'Building2',
    defaultAction: 'Explore new location opportunities',
  },
  product: {
    label: 'Product Launch',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: 'Package',
    defaultAction: 'Ensure bandwidth supports growth',
  },
  partnership: {
    label: 'Partnership',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    icon: 'Handshake',
    defaultAction: 'Discuss connectivity needs',
  },
  award: {
    label: 'Award',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'Award',
    defaultAction: 'Send congratulations',
  },
  general: {
    label: 'News',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'FileText',
    defaultAction: 'Review and follow up if relevant',
  },
}

// NPS (Net Promoter Score) Tracking
export type NPSCategory = 'promoter' | 'passive' | 'detractor'

export interface NPSSurveyResponse {
  id: string
  customerId: string
  projectId?: string // Optional - can be post-install survey or general
  score: number // 0-10
  category: NPSCategory
  feedback?: string
  contactName: string
  contactEmail: string
  surveyType: 'post-install' | 'quarterly' | 'annual' | 'ad-hoc'
  sentAt: string
  respondedAt: string
  followUpRequired: boolean
  followUpCompletedAt?: string
  followUpNotes?: string
}

export function getNPSCategory(score: number): NPSCategory {
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'passive'
  return 'detractor'
}

export const npsCategoryConfig: Record<NPSCategory, {
  label: string
  color: string
  bgColor: string
  description: string
}> = {
  promoter: {
    label: 'Promoter',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Score 9-10: Loyal enthusiasts who will refer others',
  },
  passive: {
    label: 'Passive',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Score 7-8: Satisfied but unenthusiastic',
  },
  detractor: {
    label: 'Detractor',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Score 0-6: Unhappy customers who may damage reputation',
  },
}

// Document Vault
export type DocumentCategory =
  | 'contract'
  | 'sow'
  | 'permit'
  | 'install-photo'
  | 'riser-diagram'
  | 'site-survey'
  | 'invoice'
  | 'correspondence'
  | 'other'

export interface Document {
  id: string
  name: string
  category: DocumentCategory
  description?: string
  fileUrl: string
  fileType: string // 'pdf', 'jpg', 'png', 'doc', etc.
  fileSize: number // in bytes
  uploadedBy: string
  uploadedAt: string
  // Associations - at least one required
  projectId?: string
  customerId?: string
  buildingId?: string
  // Metadata
  tags?: string[]
  isArchived: boolean
  version?: number
  previousVersionId?: string
}

export const documentCategoryConfig: Record<DocumentCategory, {
  label: string
  color: string
  bgColor: string
  icon: string
  description: string
}> = {
  contract: {
    label: 'Contract',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'FileText',
    description: 'Service agreements and contracts',
  },
  sow: {
    label: 'SOW',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'FileCheck',
    description: 'Statement of Work documents',
  },
  permit: {
    label: 'Permit',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: 'Shield',
    description: 'Building and work permits',
  },
  'install-photo': {
    label: 'Install Photo',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'Camera',
    description: 'Installation photographs',
  },
  'riser-diagram': {
    label: 'Riser Diagram',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    icon: 'GitBranch',
    description: 'Building riser diagrams',
  },
  'site-survey': {
    label: 'Site Survey',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: 'ClipboardList',
    description: 'Site survey reports',
  },
  invoice: {
    label: 'Invoice',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    icon: 'Receipt',
    description: 'Invoices and billing documents',
  },
  correspondence: {
    label: 'Correspondence',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'Mail',
    description: 'Email threads and correspondence',
  },
  other: {
    label: 'Other',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: 'File',
    description: 'Miscellaneous documents',
  },
}

// Smart Reminders
export type ReminderType = 'follow-up' | 'deadline' | 'check-in' | 'escalation' | 'custom'
export type ReminderChannel = 'email' | 'sms' | 'in-app' | 'slack'
export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'completed'
export type ReminderPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Reminder {
  id: string
  type: ReminderType
  title: string
  description?: string
  dueAt: string
  status: ReminderStatus
  priority: ReminderPriority
  channels: ReminderChannel[]
  // Associations
  projectId?: string
  customerId?: string
  assigneeId: string
  // Auto-generated reminder context
  isAutoGenerated: boolean
  triggerCondition?: string
  // Tracking
  createdAt: string
  createdBy: string
  sentAt?: string
  completedAt?: string
  dismissedAt?: string
  snoozeUntil?: string
  // Recurrence
  isRecurring: boolean
  recurrencePattern?: 'daily' | 'weekly' | 'monthly'
  recurringUntil?: string
}

export const reminderTypeConfig: Record<ReminderType, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  'follow-up': {
    label: 'Follow-up',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'PhoneCall',
  },
  deadline: {
    label: 'Deadline',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'Clock',
  },
  'check-in': {
    label: 'Check-in',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'UserCheck',
  },
  escalation: {
    label: 'Escalation',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'AlertTriangle',
  },
  custom: {
    label: 'Custom',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'Bell',
  },
}

// Automated Playbooks
export type PlaybookCategory =
  | 'onboarding'
  | 'escalation'
  | 'delay'
  | 'vip'
  | 'post-install'
  | 'at-risk'
  | 'custom'

export type PlaybookStepType =
  | 'task'
  | 'email'
  | 'call'
  | 'wait'
  | 'decision'
  | 'automation'

export interface PlaybookStep {
  id: string
  order: number
  type: PlaybookStepType
  title: string
  description: string
  // For task/email/call
  assignTo?: 'owner' | 'manager' | 'specific'
  specificAssignee?: string
  // For wait
  waitDays?: number
  waitHours?: number
  // For decision
  decisionOptions?: Array<{
    label: string
    nextStepId: string
  }>
  // For automation
  automationAction?: string
  // Completion tracking
  isOptional: boolean
  requiresApproval: boolean
}

export interface Playbook {
  id: string
  name: string
  description: string
  category: PlaybookCategory
  triggerConditions: string[]
  steps: PlaybookStep[]
  estimatedDuration: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  // Usage stats
  timesUsed: number
  avgCompletionDays: number
}

export interface PlaybookExecution {
  id: string
  playbookId: string
  projectId: string
  customerId: string
  startedAt: string
  completedAt?: string
  currentStepId: string
  status: 'in-progress' | 'completed' | 'paused' | 'cancelled'
  stepCompletions: Array<{
    stepId: string
    completedAt: string
    completedBy: string
    notes?: string
  }>
}

export const playbookCategoryConfig: Record<PlaybookCategory, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  onboarding: {
    label: 'Onboarding',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'UserPlus',
  },
  escalation: {
    label: 'Escalation',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'AlertTriangle',
  },
  delay: {
    label: 'Delay Mitigation',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'Clock',
  },
  vip: {
    label: 'VIP Treatment',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'Crown',
  },
  'post-install': {
    label: 'Post-Install',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle',
  },
  'at-risk': {
    label: 'At-Risk Customer',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'Shield',
  },
  custom: {
    label: 'Custom',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'Workflow',
  },
}

// Slack Integration
export type SlackNotificationType =
  | 'project-created'
  | 'project-escalated'
  | 'project-completed'
  | 'foc-approaching'
  | 'blocker-added'
  | 'blocker-resolved'
  | 'mention'
  | 'vip-activity'
  | 'customer-news'
  | 'nps-response'

export interface SlackChannel {
  id: string
  name: string
  isPrivate: boolean
  purpose?: string
}

export interface SlackNotificationPreference {
  type: SlackNotificationType
  enabled: boolean
  channelId?: string
  directMessage: boolean
}

export interface SlackIntegration {
  isConnected: boolean
  workspaceName?: string
  workspaceId?: string
  userId?: string
  userName?: string
  defaultChannelId?: string
  notifications: SlackNotificationPreference[]
  connectedAt?: string
}

export const slackNotificationTypeConfig: Record<SlackNotificationType, {
  label: string
  description: string
  defaultEnabled: boolean
  category: 'project' | 'customer' | 'team'
}> = {
  'project-created': {
    label: 'New Project',
    description: 'When a new project is assigned to you',
    defaultEnabled: true,
    category: 'project',
  },
  'project-escalated': {
    label: 'Project Escalated',
    description: 'When a project is escalated',
    defaultEnabled: true,
    category: 'project',
  },
  'project-completed': {
    label: 'Project Completed',
    description: 'When a project is marked as completed',
    defaultEnabled: true,
    category: 'project',
  },
  'foc-approaching': {
    label: 'FOC Approaching',
    description: 'When a project is within 3 days of FOC',
    defaultEnabled: true,
    category: 'project',
  },
  'blocker-added': {
    label: 'Blocker Added',
    description: 'When a blocker is added to your project',
    defaultEnabled: true,
    category: 'project',
  },
  'blocker-resolved': {
    label: 'Blocker Resolved',
    description: 'When a blocker is resolved',
    defaultEnabled: false,
    category: 'project',
  },
  mention: {
    label: '@Mention',
    description: 'When someone mentions you in a note',
    defaultEnabled: true,
    category: 'team',
  },
  'vip-activity': {
    label: 'VIP Activity',
    description: 'Activity on VIP customer projects',
    defaultEnabled: true,
    category: 'customer',
  },
  'customer-news': {
    label: 'Customer News',
    description: 'New news alerts for your customers',
    defaultEnabled: false,
    category: 'customer',
  },
  'nps-response': {
    label: 'NPS Response',
    description: 'When a customer responds to NPS survey',
    defaultEnabled: true,
    category: 'customer',
  },
}
