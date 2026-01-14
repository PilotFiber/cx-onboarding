import { useState } from 'react'
import {
  Clock,
  MessageSquare,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Project, Customer, ActivityLogEntry, CommunicationLogEntry, InternalNote } from '../../types'
import { MentionText } from '../ui/MentionTextarea'

interface TimelineEvent {
  id: string
  type: 'activity' | 'communication' | 'note' | 'status_change' | 'project_created'
  projectId: string
  projectName: string
  title: string
  description: string
  author: string
  createdAt: string
  icon: React.ReactNode
  color: string
  metadata?: Record<string, unknown>
}

interface CustomerTimelineProps {
  customer: Customer
  projects: Project[]
  showFilters?: boolean
  maxItems?: number
}

type EventFilter = 'all' | 'activity' | 'communication' | 'note' | 'status_change'

export default function CustomerTimeline({
  customer: _customer,
  projects,
  showFilters = true,
  maxItems,
}: CustomerTimelineProps) {
  // _customer is available for future use (customer-specific filtering, etc.)
  const [filter, setFilter] = useState<EventFilter>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)

  // Aggregate all events from all projects
  const allEvents: TimelineEvent[] = []

  projects.forEach((project) => {
    const projectLabel = `${project.product} - ${project.serviceBandwidth}`

    // Add project creation as first event
    allEvents.push({
      id: `proj-created-${project.id}`,
      type: 'project_created',
      projectId: project.id,
      projectName: projectLabel,
      title: 'Project Created',
      description: `New ${project.projectType.replace('-', ' ')} project created`,
      author: project.cxAssignee || 'System',
      createdAt: project.createdAt,
      icon: <FileText className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100',
    })

    // Add activity log entries
    project.activityLog.forEach((activity: ActivityLogEntry) => {
      allEvents.push({
        id: activity.id,
        type: 'activity',
        projectId: project.id,
        projectName: projectLabel,
        title: getActivityTitle(activity.type),
        description: activity.description,
        author: activity.author,
        createdAt: activity.createdAt,
        icon: getActivityIcon(activity.type),
        color: getActivityColor(activity.type),
        metadata: activity.metadata,
      })
    })

    // Add communication log entries
    if (project.communicationLog) {
      project.communicationLog.forEach((comm: CommunicationLogEntry) => {
        allEvents.push({
          id: comm.id,
          type: 'communication',
          projectId: project.id,
          projectName: projectLabel,
          title: `${comm.direction === 'outbound' ? 'Outbound' : 'Inbound'} ${getCommunicationLabel(comm.type)}`,
          description: `${comm.contactName}: ${comm.summary}`,
          author: comm.author,
          createdAt: comm.createdAt,
          icon: getCommunicationIcon(comm.type),
          color: comm.direction === 'outbound' ? 'text-green-600 bg-green-100' : 'text-purple-600 bg-purple-100',
        })
      })
    }

    // Add internal notes
    project.internalNotes.forEach((note: InternalNote) => {
      allEvents.push({
        id: note.id,
        type: 'note',
        projectId: project.id,
        projectName: projectLabel,
        title: 'Internal Note',
        description: note.content,
        author: note.author,
        createdAt: note.createdAt,
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-yellow-600 bg-yellow-100',
      })
    })
  })

  // Sort by date descending
  allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Apply filter
  const filteredEvents = filter === 'all'
    ? allEvents
    : allEvents.filter((e) => e.type === filter)

  // Apply max items limit
  const displayEvents = maxItems && !showAll
    ? filteredEvents.slice(0, maxItems)
    : filteredEvents

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEvents(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffHours / 24

    if (diffHours < 1) {
      const mins = Math.floor(diffMs / (1000 * 60))
      return `${mins}m ago`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const filterOptions: { value: EventFilter; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'activity', label: 'Activities' },
    { value: 'communication', label: 'Communications' },
    { value: 'note', label: 'Notes' },
    { value: 'status_change', label: 'Status Changes' },
  ]

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No timeline events yet</p>
        <p className="text-sm">Events will appear here as you interact with this customer</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as EventFilter)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-pilot-primary"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Events */}
        <ul className="space-y-4">
          {displayEvents.map((event) => {
            const isExpanded = expandedEvents.has(event.id)
            const isLongContent = event.description.length > 150

            return (
              <li key={event.id} className="relative pl-10">
                {/* Icon */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${event.color}`}
                >
                  {event.icon}
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{event.title}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {event.projectName}
                        </span>
                      </div>
                      <div className={`mt-1 text-sm text-gray-600 ${!isExpanded && isLongContent ? 'line-clamp-2' : ''}`}>
                        {event.type === 'note' ? (
                          <MentionText text={event.description} />
                        ) : (
                          event.description
                        )}
                      </div>
                      {isLongContent && (
                        <button
                          onClick={() => toggleExpanded(event.id)}
                          className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Show more
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(event.createdAt)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.author}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Show more button */}
        {maxItems && filteredEvents.length > maxItems && !showAll && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Show {filteredEvents.length - maxItems} more events
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getActivityTitle(type: string): string {
  const titles: Record<string, string> = {
    status_change: 'Status Changed',
    task_completed: 'Task Completed',
    note_added: 'Note Added',
    blocker_added: 'Blocker Added',
    blocker_resolved: 'Blocker Resolved',
    escalated: 'Project Escalated',
    de_escalated: 'Project De-escalated',
    assigned: 'Project Assigned',
    scheduled: 'Install Scheduled',
    communication: 'Communication Logged',
  }
  return titles[type] || 'Activity'
}

function getActivityIcon(type: string): React.ReactNode {
  switch (type) {
    case 'status_change':
      return <CheckCircle2 className="w-4 h-4" />
    case 'task_completed':
      return <CheckCircle2 className="w-4 h-4" />
    case 'blocker_added':
    case 'blocker_resolved':
      return <AlertTriangle className="w-4 h-4" />
    case 'escalated':
    case 'de_escalated':
      return <AlertTriangle className="w-4 h-4" />
    case 'scheduled':
      return <Calendar className="w-4 h-4" />
    case 'communication':
      return <MessageSquare className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'status_change':
      return 'text-cyan-600 bg-cyan-100'
    case 'task_completed':
      return 'text-green-600 bg-green-100'
    case 'blocker_added':
      return 'text-red-600 bg-red-100'
    case 'blocker_resolved':
      return 'text-green-600 bg-green-100'
    case 'escalated':
      return 'text-red-600 bg-red-100'
    case 'de_escalated':
      return 'text-green-600 bg-green-100'
    case 'scheduled':
      return 'text-cyan-600 bg-cyan-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

function getCommunicationIcon(type: string): React.ReactNode {
  switch (type) {
    case 'call':
      return <Phone className="w-4 h-4" />
    case 'email':
      return <Mail className="w-4 h-4" />
    case 'meeting':
      return <Users className="w-4 h-4" />
    default:
      return <MessageSquare className="w-4 h-4" />
  }
}

function getCommunicationLabel(type: string): string {
  const labels: Record<string, string> = {
    call: 'Call',
    email: 'Email',
    meeting: 'Meeting',
    text: 'Text',
    other: 'Communication',
  }
  return labels[type] || 'Communication'
}
