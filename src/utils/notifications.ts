import { Project, Ticket } from '../types'
import { calculateHealthScore } from './healthScore'

export type NotificationType =
  | 'foc_approaching'
  | 'foc_overdue'
  | 'ticket_needs_response'
  | 'follow_up_due'
  | 'escalated'
  | 'task_overdue'
  | 'low_health'
  | 'no_contact'

export type NotificationPriority = 'urgent' | 'high' | 'normal'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  description: string
  projectId: string
  projectName: string
  timestamp: string
  actionLabel?: string
  actionUrl?: string
}

export function generateNotifications(
  projects: Project[],
  tickets: Ticket[],
  getCustomerName: (customerId: string) => string
): Notification[] {
  const notifications: Notification[] = []
  const now = new Date()

  projects.forEach(project => {
    if (project.status === 'completed') return

    const customerName = getCustomerName(project.customerId)
    const focDate = new Date(project.focDate)
    const daysUntilFoc = Math.floor((focDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // FOC Overdue
    if (daysUntilFoc < 0) {
      notifications.push({
        id: `foc-overdue-${project.id}`,
        type: 'foc_overdue',
        priority: 'urgent',
        title: 'FOC Date Passed',
        description: `${Math.abs(daysUntilFoc)} day${Math.abs(daysUntilFoc) !== 1 ? 's' : ''} past FOC`,
        projectId: project.id,
        projectName: customerName,
        timestamp: project.focDate,
        actionLabel: 'View Project',
        actionUrl: `/projects/${project.id}`
      })
    }
    // FOC Approaching (within 2 days)
    else if (daysUntilFoc <= 2 && daysUntilFoc >= 0) {
      notifications.push({
        id: `foc-approaching-${project.id}`,
        type: 'foc_approaching',
        priority: 'high',
        title: 'FOC Date Approaching',
        description: daysUntilFoc === 0 ? 'FOC is today!' : `FOC in ${daysUntilFoc} day${daysUntilFoc !== 1 ? 's' : ''}`,
        projectId: project.id,
        projectName: customerName,
        timestamp: project.focDate,
        actionLabel: 'View Project',
        actionUrl: `/projects/${project.id}`
      })
    }

    // Escalated Projects
    if (project.isEscalated) {
      notifications.push({
        id: `escalated-${project.id}`,
        type: 'escalated',
        priority: 'urgent',
        title: 'Escalated Project',
        description: project.escalationReason || 'Requires immediate attention',
        projectId: project.id,
        projectName: customerName,
        timestamp: project.escalatedAt || project.updatedAt,
        actionLabel: 'View Project',
        actionUrl: `/projects/${project.id}`
      })
    }

    // No Customer Contact (>5 days)
    const lastContact = new Date(project.lastCustomerContact)
    const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceContact > 5) {
      notifications.push({
        id: `no-contact-${project.id}`,
        type: 'no_contact',
        priority: daysSinceContact > 7 ? 'high' : 'normal',
        title: 'No Recent Contact',
        description: `${daysSinceContact} days since last customer contact`,
        projectId: project.id,
        projectName: customerName,
        timestamp: project.lastCustomerContact,
        actionLabel: 'Log Communication',
        actionUrl: `/projects/${project.id}?tab=activity`
      })
    }

    // Follow-ups Due
    if (project.communicationLog) {
      project.communicationLog.forEach(comm => {
        if (comm.followUpRequired && comm.followUpDate) {
          const followUpDate = new Date(comm.followUpDate)
          const daysUntilFollowUp = Math.floor((followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilFollowUp <= 1) {
            notifications.push({
              id: `follow-up-${comm.id}`,
              type: 'follow_up_due',
              priority: daysUntilFollowUp < 0 ? 'high' : 'normal',
              title: 'Follow-up Due',
              description: daysUntilFollowUp < 0
                ? `Follow-up with ${comm.contactName} is overdue`
                : daysUntilFollowUp === 0
                  ? `Follow-up with ${comm.contactName} due today`
                  : `Follow-up with ${comm.contactName} due tomorrow`,
              projectId: project.id,
              projectName: customerName,
              timestamp: comm.followUpDate,
              actionLabel: 'View Activity',
              actionUrl: `/projects/${project.id}?tab=activity`
            })
          }
        }
      })
    }

    // Tasks Overdue
    project.tasks.forEach(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate)
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilDue < 0) {
          notifications.push({
            id: `task-overdue-${task.id}`,
            type: 'task_overdue',
            priority: 'normal',
            title: 'Task Overdue',
            description: `"${task.title}" is ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`,
            projectId: project.id,
            projectName: customerName,
            timestamp: task.dueDate,
            actionLabel: 'View Tasks',
            actionUrl: `/projects/${project.id}?tab=tasks`
          })
        }
      }
    })

    // Low Health Score
    const health = calculateHealthScore(project)
    if (health.level === 'critical') {
      notifications.push({
        id: `health-${project.id}`,
        type: 'low_health',
        priority: 'high',
        title: 'Critical Health Score',
        description: `Health score is ${health.score} - needs immediate attention`,
        projectId: project.id,
        projectName: customerName,
        timestamp: project.updatedAt,
        actionLabel: 'View Project',
        actionUrl: `/projects/${project.id}`
      })
    }
  })

  // Tickets Requiring Response
  tickets.forEach(ticket => {
    if (ticket.requiresResponse && (ticket.status === 'open' || ticket.status === 'pending')) {
      const project = projects.find(p => p.id === ticket.projectId)
      if (project && project.status !== 'completed') {
        const customerName = getCustomerName(project.customerId)

        notifications.push({
          id: `ticket-response-${ticket.id}`,
          type: 'ticket_needs_response',
          priority: ticket.priority === 'urgent' ? 'urgent' : ticket.priority === 'high' ? 'high' : 'normal',
          title: 'Response Needed',
          description: ticket.subject,
          projectId: project.id,
          projectName: customerName,
          timestamp: ticket.updatedAt,
          actionLabel: 'View Ticket',
          actionUrl: `/projects/${project.id}?tab=tickets`
        })
      }
    }
  })

  // Sort by priority then timestamp
  const priorityOrder = { urgent: 0, high: 1, normal: 2 }
  return notifications.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'foc_approaching':
    case 'foc_overdue':
      return 'calendar'
    case 'ticket_needs_response':
      return 'mail'
    case 'follow_up_due':
      return 'phone'
    case 'escalated':
      return 'alert-triangle'
    case 'task_overdue':
      return 'check-square'
    case 'low_health':
      return 'activity'
    case 'no_contact':
      return 'user-x'
    default:
      return 'bell'
  }
}

export function getNotificationColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100'
    case 'high':
      return 'text-orange-600 bg-orange-100'
    case 'normal':
      return 'text-blue-600 bg-blue-100'
  }
}
