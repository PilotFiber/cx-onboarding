export type UserRole = 'cxa' | 'senior_cxa' | 'manager' | 'admin'

// Permissions based on role
export interface RolePermissions {
  canViewAllProjects: boolean
  canEditAllProjects: boolean
  canAssignProjects: boolean
  canDeleteProjects: boolean
  canManageTeam: boolean
  canViewReports: boolean
  canExportData: boolean
  canManageTickets: boolean
  canEscalate: boolean
  canChangeSettings: boolean
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  cxa: {
    canViewAllProjects: false, // Only assigned projects
    canEditAllProjects: false,
    canAssignProjects: false,
    canDeleteProjects: false,
    canManageTeam: false,
    canViewReports: false,
    canExportData: false,
    canManageTickets: true,
    canEscalate: true,
    canChangeSettings: false,
  },
  senior_cxa: {
    canViewAllProjects: true,
    canEditAllProjects: true,
    canAssignProjects: true,
    canDeleteProjects: false,
    canManageTeam: false,
    canViewReports: true,
    canExportData: true,
    canManageTickets: true,
    canEscalate: true,
    canChangeSettings: false,
  },
  manager: {
    canViewAllProjects: true,
    canEditAllProjects: true,
    canAssignProjects: true,
    canDeleteProjects: true,
    canManageTeam: true,
    canViewReports: true,
    canExportData: true,
    canManageTickets: true,
    canEscalate: true,
    canChangeSettings: true,
  },
  admin: {
    canViewAllProjects: true,
    canEditAllProjects: true,
    canAssignProjects: true,
    canDeleteProjects: true,
    canManageTeam: true,
    canViewReports: true,
    canExportData: true,
    canManageTickets: true,
    canEscalate: true,
    canChangeSettings: true,
  },
}

// Notification preference types
export interface NotificationPreferences {
  // Email notifications
  emailNewAssignment: boolean
  emailTicketResponse: boolean
  emailEscalation: boolean
  emailFocReminder: boolean
  emailDailyDigest: boolean

  // Slack notifications
  slackEnabled: boolean
  slackNewAssignment: boolean
  slackTicketResponse: boolean
  slackEscalation: boolean
  slackFocReminder: boolean
  slackMentions: boolean

  // In-app notifications
  inAppNewAssignment: boolean
  inAppTicketResponse: boolean
  inAppEscalation: boolean
  inAppFocReminder: boolean
  inAppStatusChange: boolean
  inAppMentions: boolean

  // Push notifications (for future mobile app)
  pushUrgentOnly: boolean

  // Timing preferences
  quietHoursEnabled: boolean
  quietHoursStart: string // HH:MM format
  quietHoursEnd: string
  digestTime: string // HH:MM for daily digest
}

export const defaultNotificationPreferences: NotificationPreferences = {
  emailNewAssignment: true,
  emailTicketResponse: true,
  emailEscalation: true,
  emailFocReminder: true,
  emailDailyDigest: false,

  slackEnabled: true,
  slackNewAssignment: true,
  slackTicketResponse: true,
  slackEscalation: true,
  slackFocReminder: false,
  slackMentions: true,

  inAppNewAssignment: true,
  inAppTicketResponse: true,
  inAppEscalation: true,
  inAppFocReminder: true,
  inAppStatusChange: true,
  inAppMentions: true,

  pushUrgentOnly: true,

  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  digestTime: '08:00',
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
  department?: string
  title?: string
  startDate?: string
  timezone?: string
  notificationPreferences: NotificationPreferences
  isActive: boolean
}

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@pilotfiber.com',
    role: 'senior_cxa',
    phone: '212-555-1001',
    title: 'Senior CX Associate',
    department: 'Customer Experience',
    startDate: '2022-03-15',
    timezone: 'America/New_York',
    notificationPreferences: {
      ...defaultNotificationPreferences,
      emailDailyDigest: true,
    },
    isActive: true,
  },
  {
    id: 'tm-2',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@pilotfiber.com',
    role: 'cxa',
    phone: '212-555-1002',
    title: 'CX Associate',
    department: 'Customer Experience',
    startDate: '2023-06-01',
    timezone: 'America/New_York',
    notificationPreferences: defaultNotificationPreferences,
    isActive: true,
  },
  {
    id: 'tm-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@pilotfiber.com',
    role: 'cxa',
    phone: '212-555-1003',
    title: 'CX Associate',
    department: 'Customer Experience',
    startDate: '2023-08-15',
    timezone: 'America/New_York',
    notificationPreferences: {
      ...defaultNotificationPreferences,
      quietHoursEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'tm-4',
    name: 'David Kim',
    email: 'david.kim@pilotfiber.com',
    role: 'cxa',
    phone: '212-555-1004',
    title: 'CX Associate',
    department: 'Customer Experience',
    startDate: '2024-01-08',
    timezone: 'America/New_York',
    notificationPreferences: defaultNotificationPreferences,
    isActive: true,
  },
  {
    id: 'tm-5',
    name: 'Alex Thompson',
    email: 'alex.thompson@pilotfiber.com',
    role: 'manager',
    phone: '212-555-1005',
    title: 'CX Manager',
    department: 'Customer Experience',
    startDate: '2021-09-01',
    timezone: 'America/New_York',
    notificationPreferences: {
      ...defaultNotificationPreferences,
      emailEscalation: true,
      inAppEscalation: true,
    },
    isActive: true,
  },
  {
    id: 'tm-6',
    name: 'Jessica Martinez',
    email: 'jessica.martinez@pilotfiber.com',
    role: 'admin',
    phone: '212-555-1006',
    title: 'Director of Customer Experience',
    department: 'Customer Experience',
    startDate: '2020-01-15',
    timezone: 'America/New_York',
    notificationPreferences: {
      ...defaultNotificationPreferences,
      emailDailyDigest: true,
      inAppStatusChange: false, // Too many notifications
    },
    isActive: true,
  },
]

// Current logged-in user (for demo purposes)
export const currentUser: TeamMember = teamMembers[0] // Sarah Chen

// Helper to get user's permissions
export function getUserPermissions(user: TeamMember): RolePermissions {
  return rolePermissions[user.role]
}

// Helper to check a specific permission
export function hasPermission(user: TeamMember, permission: keyof RolePermissions): boolean {
  return rolePermissions[user.role][permission]
}

// Role labels for display
export const roleLabels: Record<UserRole, string> = {
  cxa: 'CX Associate',
  senior_cxa: 'Senior CX Associate',
  manager: 'CX Manager',
  admin: 'Administrator',
}
