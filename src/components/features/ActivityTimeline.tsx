import {
  GitCommit,
  CheckCircle,
  UserPlus,
  Mail,
  Phone,
  FileText,
  Calendar,
  AlertTriangle,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react'
import { ActivityLogEntry, ActivityType } from '../../types'

interface ActivityTimelineProps {
  activities: ActivityLogEntry[]
  maxItems?: number
}

const activityConfig: Record<ActivityType, { icon: typeof GitCommit; color: string; bgColor: string }> = {
  created: { icon: Plus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  status_change: { icon: GitCommit, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  task_completed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  task_assigned: { icon: UserPlus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  email_sent: { icon: Mail, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  email_received: { icon: Mail, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  call_logged: { icon: Phone, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  note_added: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  schedule_set: { icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
  schedule_changed: { icon: Calendar, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  blocker_added: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
  blocker_resolved: { icon: CheckSquare, color: 'text-green-600', bgColor: 'bg-green-100' },
  escalated: { icon: ArrowUp, color: 'text-red-600', bgColor: 'bg-red-100' },
  de_escalated: { icon: ArrowDown, color: 'text-green-600', bgColor: 'bg-green-100' },
  assignee_changed: { icon: UserPlus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxItems)

  if (sortedActivities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <GitCommit className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No activity yet</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedActivities.map((activity, idx) => {
          const config = activityConfig[activity.type]
          const Icon = config.icon
          const isLast = idx === sortedActivities.length - 1

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.author}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-gray-500">
                      {formatRelativeTime(activity.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
