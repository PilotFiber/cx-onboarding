import { Project } from '../types'
import { teamMembers, TeamMember } from '../data/teamMembers'

export interface TeamMemberCapacity {
  member: TeamMember
  activeProjects: number
  pendingScheduling: number
  scheduledThisWeek: number
  scheduledNextWeek: number
  scheduledTotal: number
  utilizationPercent: number
  status: 'available' | 'busy' | 'overloaded'
  upcomingInstalls: ScheduledInstall[]
}

export interface ScheduledInstall {
  projectId: string
  customerName: string
  date: Date
  product: string
  bandwidth: string
}

export interface DayCapacity {
  date: Date
  dateString: string
  dayOfWeek: string
  installs: Array<{
    projectId: string
    customerName: string
    cxAssignee: string
    product: string
  }>
  totalInstalls: number
  isOverCapacity: boolean
}

export interface CapacityOverview {
  teamCapacity: TeamMemberCapacity[]
  dailySchedule: DayCapacity[]
  summary: {
    totalActiveProjects: number
    totalScheduledInstalls: number
    overloadedMembers: number
    availableSlots: number
    busiestDay: string
    busiestDayCount: number
  }
  conflicts: SchedulingConflict[]
  recommendations: string[]
}

export interface SchedulingConflict {
  date: Date
  dateString: string
  assignees: string[]
  count: number
  message: string
}

const MAX_ACTIVE_PROJECTS_PER_MEMBER = 8
const MAX_DAILY_INSTALLS_PER_MEMBER = 2
const MAX_DAILY_INSTALLS_TEAM = 6

export function calculateCapacityPlanning(
  projects: Project[],
  getCustomerName: (customerId: string) => string
): CapacityOverview {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Calculate team member capacity
  const teamCapacity = teamMembers.map(member => {
    const memberProjects = projects.filter(p => p.cxAssignee === member.name)
    const activeProjects = memberProjects.filter(p => p.status !== 'completed')

    // Projects pending scheduling (no scheduled date yet)
    const pendingScheduling = activeProjects.filter(p => !p.scheduledDate).length

    // Projects scheduled for upcoming dates
    const scheduledProjects = activeProjects.filter(p => p.scheduledDate)

    // Get dates for this week and next week
    const thisWeekEnd = new Date(today)
    thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()))

    const nextWeekEnd = new Date(thisWeekEnd)
    nextWeekEnd.setDate(thisWeekEnd.getDate() + 7)

    const scheduledThisWeek = scheduledProjects.filter(p => {
      const date = new Date(p.scheduledDate!)
      return date >= today && date <= thisWeekEnd
    }).length

    const scheduledNextWeek = scheduledProjects.filter(p => {
      const date = new Date(p.scheduledDate!)
      return date > thisWeekEnd && date <= nextWeekEnd
    }).length

    const scheduledTotal = scheduledProjects.filter(p => {
      const date = new Date(p.scheduledDate!)
      return date >= today
    }).length

    const utilizationPercent = Math.round((activeProjects.length / MAX_ACTIVE_PROJECTS_PER_MEMBER) * 100)

    let status: 'available' | 'busy' | 'overloaded'
    if (activeProjects.length >= MAX_ACTIVE_PROJECTS_PER_MEMBER) {
      status = 'overloaded'
    } else if (activeProjects.length >= MAX_ACTIVE_PROJECTS_PER_MEMBER * 0.7) {
      status = 'busy'
    } else {
      status = 'available'
    }

    // Get upcoming installs for this member
    const upcomingInstalls: ScheduledInstall[] = scheduledProjects
      .filter(p => new Date(p.scheduledDate!) >= today)
      .map(p => ({
        projectId: p.id,
        customerName: getCustomerName(p.customerId),
        date: new Date(p.scheduledDate!),
        product: p.product,
        bandwidth: p.serviceBandwidth,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)

    return {
      member,
      activeProjects: activeProjects.length,
      pendingScheduling,
      scheduledThisWeek,
      scheduledNextWeek,
      scheduledTotal,
      utilizationPercent,
      status,
      upcomingInstalls,
    }
  })

  // Calculate daily schedule for next 14 days
  const dailySchedule: DayCapacity[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayOfWeek = dayNames[date.getDay()]

    // Find all projects scheduled for this date
    const dayProjects = projects.filter(p => {
      if (!p.scheduledDate || p.status === 'completed') return false
      const scheduledDate = new Date(p.scheduledDate)
      return scheduledDate.toDateString() === date.toDateString()
    })

    const installs = dayProjects.map(p => ({
      projectId: p.id,
      customerName: getCustomerName(p.customerId),
      cxAssignee: p.cxAssignee || 'Unassigned',
      product: p.product,
    }))

    dailySchedule.push({
      date,
      dateString,
      dayOfWeek,
      installs,
      totalInstalls: installs.length,
      isOverCapacity: installs.length > MAX_DAILY_INSTALLS_TEAM,
    })
  }

  // Find scheduling conflicts
  const conflicts: SchedulingConflict[] = []

  dailySchedule.forEach(day => {
    // Check for team-wide overload
    if (day.totalInstalls > MAX_DAILY_INSTALLS_TEAM) {
      conflicts.push({
        date: day.date,
        dateString: day.dateString,
        assignees: [...new Set(day.installs.map(i => i.cxAssignee))],
        count: day.totalInstalls,
        message: `${day.totalInstalls} installs scheduled - exceeds team capacity of ${MAX_DAILY_INSTALLS_TEAM}`,
      })
    }

    // Check for individual overload
    const byAssignee = new Map<string, number>()
    day.installs.forEach(install => {
      byAssignee.set(install.cxAssignee, (byAssignee.get(install.cxAssignee) || 0) + 1)
    })

    byAssignee.forEach((count, assignee) => {
      if (count > MAX_DAILY_INSTALLS_PER_MEMBER) {
        const existing = conflicts.find(c => c.dateString === day.dateString)
        if (!existing) {
          conflicts.push({
            date: day.date,
            dateString: day.dateString,
            assignees: [assignee],
            count,
            message: `${assignee} has ${count} installs - exceeds individual capacity of ${MAX_DAILY_INSTALLS_PER_MEMBER}`,
          })
        }
      }
    })
  })

  // Calculate summary
  const totalActiveProjects = teamCapacity.reduce((sum, t) => sum + t.activeProjects, 0)
  const totalScheduledInstalls = dailySchedule.reduce((sum, d) => sum + d.totalInstalls, 0)
  const overloadedMembers = teamCapacity.filter(t => t.status === 'overloaded').length

  // Available slots = max capacity - scheduled
  const totalCapacity = MAX_DAILY_INSTALLS_TEAM * 14 // 14 days
  const availableSlots = Math.max(0, totalCapacity - totalScheduledInstalls)

  const busiestDay = dailySchedule.reduce((busiest, day) =>
    day.totalInstalls > busiest.totalInstalls ? day : busiest
  , dailySchedule[0])

  // Generate recommendations
  const recommendations: string[] = []

  if (overloadedMembers > 0) {
    const overloadedNames = teamCapacity
      .filter(t => t.status === 'overloaded')
      .map(t => t.member.name)
      .join(', ')
    recommendations.push(`Consider redistributing projects from overloaded team members: ${overloadedNames}`)
  }

  if (conflicts.length > 0) {
    recommendations.push(`Review scheduling conflicts - ${conflicts.length} days have capacity issues`)
  }

  const underutilized = teamCapacity.filter(t => t.utilizationPercent < 50)
  if (underutilized.length > 0 && overloadedMembers > 0) {
    recommendations.push(`${underutilized.map(t => t.member.name).join(', ')} have capacity for additional projects`)
  }

  const weekendInstalls = dailySchedule
    .filter(d => d.dayOfWeek === 'Sat' || d.dayOfWeek === 'Sun')
    .filter(d => d.totalInstalls > 0)
  if (weekendInstalls.length > 0) {
    recommendations.push(`${weekendInstalls.length} weekend days have scheduled installs - verify these are intended`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Team capacity is well-balanced. No immediate actions needed.')
  }

  return {
    teamCapacity: teamCapacity.sort((a, b) => b.activeProjects - a.activeProjects),
    dailySchedule,
    summary: {
      totalActiveProjects,
      totalScheduledInstalls,
      overloadedMembers,
      availableSlots,
      busiestDay: busiestDay.dateString,
      busiestDayCount: busiestDay.totalInstalls,
    },
    conflicts,
    recommendations,
  }
}

export function getCapacityStatusColor(status: 'available' | 'busy' | 'overloaded'): string {
  switch (status) {
    case 'available':
      return 'text-green-600'
    case 'busy':
      return 'text-yellow-600'
    case 'overloaded':
      return 'text-red-600'
  }
}

export function getCapacityStatusBgColor(status: 'available' | 'busy' | 'overloaded'): string {
  switch (status) {
    case 'available':
      return 'bg-green-100'
    case 'busy':
      return 'bg-yellow-100'
    case 'overloaded':
      return 'bg-red-100'
  }
}

export function getUtilizationColor(percent: number): string {
  if (percent >= 100) return 'bg-red-500'
  if (percent >= 80) return 'bg-orange-500'
  if (percent >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}
