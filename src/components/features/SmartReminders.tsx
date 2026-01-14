import { useState } from 'react'
import {
  Bell,
  Clock,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Timer,
  Mail,
  MessageSquare,
  Smartphone,
  Zap,
  Plus,
  Filter,
} from 'lucide-react'
import { Reminder, ReminderType, ReminderPriority, reminderTypeConfig, Customer, Project } from '../../types'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface SmartRemindersProps {
  reminders: Reminder[]
  customers: Customer[]
  projects: Project[]
  currentUserId?: string
  compact?: boolean
  title?: string
  onComplete?: (reminderId: string) => void
  onDismiss?: (reminderId: string) => void
  onSnooze?: (reminderId: string, hours: number) => void
  onCreate?: () => void
}

const typeIcons: Record<ReminderType, React.ElementType> = {
  'follow-up': PhoneCall,
  deadline: Clock,
  'check-in': UserCheck,
  escalation: AlertTriangle,
  custom: Bell,
}

const priorityColors: Record<ReminderPriority, { text: string; bg: string; border: string }> = {
  urgent: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  high: { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  normal: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  low: { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
}

export default function SmartReminders({
  reminders,
  customers,
  projects,
  compact = false,
  title = 'Smart Reminders',
  onComplete,
  onDismiss,
  onSnooze,
  onCreate,
}: SmartRemindersProps) {
  const [expandedReminder, setExpandedReminder] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<ReminderPriority | 'all'>('all')
  const [filterType, setFilterType] = useState<ReminderType | 'all'>('all')

  const customerMap = new Map(customers.map(c => [c.id, c]))
  const projectMap = new Map(projects.map(p => [p.id, p]))

  const now = new Date()

  // Filter and sort reminders
  const filteredReminders = reminders
    .filter(r => r.status === 'pending')
    .filter(r => filterPriority === 'all' || r.priority === filterPriority)
    .filter(r => filterType === 'all' || r.type === filterType)
    .sort((a, b) => {
      // Sort by urgency then by due date
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
    })

  // Group by time
  const overdueReminders = filteredReminders.filter(r => new Date(r.dueAt) < now)
  const todayReminders = filteredReminders.filter(r => {
    const dueAt = new Date(r.dueAt)
    return dueAt >= now && dueAt.toDateString() === now.toDateString()
  })
  const upcomingReminders = filteredReminders.filter(r => {
    const dueAt = new Date(r.dueAt)
    return dueAt > now && dueAt.toDateString() !== now.toDateString()
  })

  const toggleReminder = (id: string) => {
    setExpandedReminder(prev => (prev === id ? null : id))
  }

  if (compact) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">{title}</h3>
            {overdueReminders.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {overdueReminders.length} overdue
              </span>
            )}
          </div>
          {onCreate && (
            <Button size="sm" variant="secondary" onClick={onCreate}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {filteredReminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">No reminders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReminders.slice(0, 5).map(reminder => (
              <CompactReminderRow
                key={reminder.id}
                reminder={reminder}
                customer={reminder.customerId ? customerMap.get(reminder.customerId) : undefined}
                project={reminder.projectId ? projectMap.get(reminder.projectId) : undefined}
                onComplete={onComplete}
                onDismiss={onDismiss}
              />
            ))}
            {filteredReminders.length > 5 && (
              <p className="text-sm text-blue-600 text-center pt-2">
                +{filteredReminders.length - 5} more reminders
              </p>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            {filteredReminders.length}
          </span>
          {overdueReminders.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {overdueReminders.length} overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Reminder
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as ReminderPriority | 'all')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ReminderType | 'all')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
          >
            <option value="all">All Types</option>
            <option value="follow-up">Follow-up</option>
            <option value="deadline">Deadline</option>
            <option value="check-in">Check-in</option>
            <option value="escalation">Escalation</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </Card>

      {/* Overdue Section */}
      {overdueReminders.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-red-700">Overdue</h4>
            <span className="text-sm text-red-600">({overdueReminders.length})</span>
          </div>
          <div className="space-y-2">
            {overdueReminders.map(reminder => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                customer={reminder.customerId ? customerMap.get(reminder.customerId) : undefined}
                project={reminder.projectId ? projectMap.get(reminder.projectId) : undefined}
                isExpanded={expandedReminder === reminder.id}
                onToggle={() => toggleReminder(reminder.id)}
                onComplete={onComplete}
                onDismiss={onDismiss}
                onSnooze={onSnooze}
                isOverdue
              />
            ))}
          </div>
        </Card>
      )}

      {/* Today Section */}
      {todayReminders.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">Today</h4>
            <span className="text-sm text-gray-500">({todayReminders.length})</span>
          </div>
          <div className="space-y-2">
            {todayReminders.map(reminder => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                customer={reminder.customerId ? customerMap.get(reminder.customerId) : undefined}
                project={reminder.projectId ? projectMap.get(reminder.projectId) : undefined}
                isExpanded={expandedReminder === reminder.id}
                onToggle={() => toggleReminder(reminder.id)}
                onComplete={onComplete}
                onDismiss={onDismiss}
                onSnooze={onSnooze}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Section */}
      {upcomingReminders.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <h4 className="font-medium text-gray-900">Upcoming</h4>
            <span className="text-sm text-gray-500">({upcomingReminders.length})</span>
          </div>
          <div className="space-y-2">
            {upcomingReminders.map(reminder => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                customer={reminder.customerId ? customerMap.get(reminder.customerId) : undefined}
                project={reminder.projectId ? projectMap.get(reminder.projectId) : undefined}
                isExpanded={expandedReminder === reminder.id}
                onToggle={() => toggleReminder(reminder.id)}
                onComplete={onComplete}
                onDismiss={onDismiss}
                onSnooze={onSnooze}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredReminders.length === 0 && (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No reminders to show</p>
          {onCreate && (
            <Button variant="link" onClick={onCreate} className="mt-2">
              Create your first reminder
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}

interface ReminderRowProps {
  reminder: Reminder
  customer?: Customer
  project?: Project
  isExpanded: boolean
  onToggle: () => void
  onComplete?: (id: string) => void
  onDismiss?: (id: string) => void
  onSnooze?: (id: string, hours: number) => void
  isOverdue?: boolean
}

function ReminderRow({
  reminder,
  customer,
  project,
  isExpanded,
  onToggle,
  onComplete,
  onDismiss,
  onSnooze,
  isOverdue,
}: ReminderRowProps) {
  const config = reminderTypeConfig[reminder.type]
  const priorityConfig = priorityColors[reminder.priority]
  const Icon = typeIcons[reminder.type]

  const dueAt = new Date(reminder.dueAt)
  const now = new Date()
  const hoursUntilDue = Math.floor((dueAt.getTime() - now.getTime()) / (1000 * 60 * 60))

  const formatDueTime = () => {
    if (isOverdue) {
      const hoursOverdue = Math.abs(hoursUntilDue)
      if (hoursOverdue < 24) return `${hoursOverdue}h overdue`
      return `${Math.floor(hoursOverdue / 24)}d overdue`
    }
    if (hoursUntilDue < 1) return 'Due now'
    if (hoursUntilDue < 24) return `Due in ${hoursUntilDue}h`
    return dueAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${priorityConfig.border} ${isOverdue ? 'bg-red-50' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 hover:bg-opacity-50 transition-colors ${priorityConfig.bg}`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">{reminder.title}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {customer && <span>{customer.companyName}</span>}
              {customer && project && <span>•</span>}
              {project && <span>{project.product}</span>}
              {reminder.isAutoGenerated && (
                <span className="flex items-center gap-0.5 text-purple-600">
                  <Zap className="w-3 h-3" />
                  Auto
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              {formatDueTime()}
            </p>
            <div className="flex items-center gap-1 justify-end">
              {reminder.channels.map(channel => {
                const ChannelIcon =
                  channel === 'email' ? Mail :
                  channel === 'sms' ? Smartphone :
                  channel === 'slack' ? MessageSquare : Bell
                return <ChannelIcon key={channel} className="w-3 h-3 text-gray-400" />
              })}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-white">
          {reminder.description && (
            <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>
          )}

          {reminder.triggerCondition && (
            <div className="flex items-center gap-2 mb-3 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <Zap className="w-3 h-3" />
              <span>Triggered: {reminder.triggerCondition}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onSnooze && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSnooze(reminder.id, 1)}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Timer className="w-3 h-3 inline mr-1" />
                    1h
                  </button>
                  <button
                    onClick={() => onSnooze(reminder.id, 4)}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    4h
                  </button>
                  <button
                    onClick={() => onSnooze(reminder.id, 24)}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    1d
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onDismiss && (
                <button
                  onClick={() => onDismiss(reminder.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
              )}
              {onComplete && (
                <button
                  onClick={() => onComplete(reminder.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CompactReminderRowProps {
  reminder: Reminder
  customer?: Customer
  project?: Project
  onComplete?: (id: string) => void
  onDismiss?: (id: string) => void
}

function CompactReminderRow({
  reminder,
  customer,
  onComplete,
  onDismiss,
}: CompactReminderRowProps) {
  const config = reminderTypeConfig[reminder.type]
  const Icon = typeIcons[reminder.type]
  const now = new Date()
  const dueAt = new Date(reminder.dueAt)
  const isOverdue = dueAt < now

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <div>
          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{reminder.title}</p>
          {customer && (
            <p className="text-xs text-gray-500">{customer.companyName}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {dueAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
        {onComplete && (
          <button
            onClick={() => onComplete(reminder.id)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(reminder.id)}
            className="p-1 text-gray-400 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
