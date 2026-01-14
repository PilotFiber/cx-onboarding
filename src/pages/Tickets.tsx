import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MessageSquare, FileQuestion, Clock, Filter, User, Plus, CheckCircle2, AlertCircle, Circle, AlertTriangle, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTicketDrawer } from '../context/TicketDrawerContext'
import { TicketStatus, TicketType, TicketPriority, TicketCategory } from '../types'
import { currentUser } from '../data/teamMembers'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import NewTicketModal from '../components/features/NewTicketModal'

type FilterType = 'all' | 'open' | 'pending' | 'resolved' | 'needs-response' | 'sla-breached'

const typeIcons: Record<TicketType, React.ReactNode> = {
  'email': <Mail className="w-4 h-4" />,
  'phone': <Phone className="w-4 h-4" />,
  'internal': <MessageSquare className="w-4 h-4" />,
  'customer-request': <FileQuestion className="w-4 h-4" />,
}

const statusColors: Record<TicketStatus, string> = {
  'open': 'bg-blue-100 text-blue-700',
  'pending': 'bg-yellow-100 text-yellow-700',
  'resolved': 'bg-green-100 text-green-700',
  'closed': 'bg-gray-100 text-gray-500',
}

const priorityColors: Record<TicketPriority, string> = {
  'low': 'bg-gray-100 text-gray-600',
  'normal': 'bg-blue-100 text-blue-600',
  'high': 'bg-orange-100 text-orange-600',
  'urgent': 'bg-red-100 text-red-600',
}

const categoryLabels: Record<TicketCategory, string> = {
  'billing': 'Billing',
  'technical': 'Technical',
  'scheduling': 'Scheduling',
  'general': 'General',
  'complaint': 'Complaint',
  'change-request': 'Change Request',
}

const statusIcons: Record<TicketStatus, React.ReactNode> = {
  'open': <Circle className="w-3 h-3" />,
  'pending': <AlertCircle className="w-3 h-3" />,
  'resolved': <CheckCircle2 className="w-3 h-3" />,
  'closed': <CheckCircle2 className="w-3 h-3" />,
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Check if first response SLA is breached
function isFirstResponseBreached(ticket: { firstResponseDue: string; firstRespondedAt?: string; status: TicketStatus }) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return false
  if (ticket.firstRespondedAt) {
    return new Date(ticket.firstRespondedAt) > new Date(ticket.firstResponseDue)
  }
  return new Date() > new Date(ticket.firstResponseDue)
}

// Check if resolution SLA is breached
function isResolutionBreached(ticket: { resolutionDue: string; resolvedAt?: string; status: TicketStatus }) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return ticket.resolvedAt ? new Date(ticket.resolvedAt) > new Date(ticket.resolutionDue) : false
  }
  return new Date() > new Date(ticket.resolutionDue)
}

// Get SLA status text
function getSlaStatus(ticket: { firstResponseDue: string; resolutionDue: string; firstRespondedAt?: string; resolvedAt?: string; status: TicketStatus }) {
  const firstResponseBreached = isFirstResponseBreached(ticket)
  const resolutionBreached = isResolutionBreached(ticket)

  if (firstResponseBreached || resolutionBreached) {
    return { text: 'SLA Breached', color: 'text-red-600 bg-red-50' }
  }

  const now = new Date()

  // Check first response
  if (!ticket.firstRespondedAt) {
    const firstResponseDue = new Date(ticket.firstResponseDue)
    const hoursRemaining = (firstResponseDue.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursRemaining < 1) {
      return { text: `Response: ${Math.round(hoursRemaining * 60)}m`, color: 'text-red-600 bg-red-50' }
    }
    if (hoursRemaining < 4) {
      return { text: `Response: ${Math.round(hoursRemaining)}h`, color: 'text-yellow-600 bg-yellow-50' }
    }
  }

  // Check resolution
  if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
    const resolutionDue = new Date(ticket.resolutionDue)
    const hoursRemaining = (resolutionDue.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursRemaining < 4) {
      return { text: `Resolve: ${Math.round(hoursRemaining)}h`, color: 'text-yellow-600 bg-yellow-50' }
    }
  }

  return { text: 'On Track', color: 'text-green-600 bg-green-50' }
}

export default function Tickets() {
  const { state, getProject, getCustomer, dispatch } = useApp()
  const { openDrawer } = useTicketDrawer()
  const [searchParams] = useSearchParams()

  const [filter, setFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)

  // Handle URL parameters for views
  useEffect(() => {
    const view = searchParams.get('view')
    const category = searchParams.get('category')

    if (view) {
      switch (view) {
        case 'mine':
          setAssigneeFilter(currentUser.name)
          setFilter('all')
          setCategoryFilter('all')
          break
        case 'unassigned':
          setAssigneeFilter('unassigned')
          setFilter('all')
          setCategoryFilter('all')
          break
        case 'urgent':
          setFilter('all')
          setAssigneeFilter('all')
          setCategoryFilter('all')
          // Urgent is handled separately in filteredTickets
          break
        default:
          setFilter('all')
          setAssigneeFilter('all')
          setCategoryFilter('all')
      }
    } else if (category) {
      setCategoryFilter(category)
      setFilter('all')
      setAssigneeFilter('all')
    } else {
      // Reset to defaults if no params
      setFilter('all')
      setCategoryFilter('all')
      setAssigneeFilter('all')
    }
  }, [searchParams])

  // Get unique assignees
  const uniqueAssignees = Array.from(new Set(state.tickets.map(t => t.assignee).filter(Boolean))) as string[]

  // Count SLA breached tickets
  const slaBreachedCount = state.tickets.filter(t =>
    (t.status === 'open' || t.status === 'pending') &&
    (isFirstResponseBreached(t) || isResolutionBreached(t))
  ).length

  // Check if urgent view is active from URL
  const isUrgentView = searchParams.get('view') === 'urgent'

  const filteredTickets = state.tickets
    .filter(ticket => {
      // Handle urgent view from URL
      if (isUrgentView) {
        return ticket.priority === 'urgent' && ticket.status !== 'closed'
      }
      if (filter === 'open') return ticket.status === 'open'
      if (filter === 'pending') return ticket.status === 'pending'
      if (filter === 'resolved') return ticket.status === 'resolved' || ticket.status === 'closed'
      if (filter === 'needs-response') return ticket.requiresResponse && ticket.status === 'open'
      if (filter === 'sla-breached') {
        return (ticket.status === 'open' || ticket.status === 'pending') &&
          (isFirstResponseBreached(ticket) || isResolutionBreached(ticket))
      }
      return true
    })
    .filter(ticket => {
      if (categoryFilter !== 'all') return ticket.category === categoryFilter
      return true
    })
    .filter(ticket => {
      if (assigneeFilter === 'unassigned') return !ticket.assignee
      if (assigneeFilter !== 'all') return ticket.assignee === assigneeFilter
      return true
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const openCount = state.tickets.filter(t => t.status === 'open').length
  const pendingCount = state.tickets.filter(t => t.status === 'pending').length
  const needsResponseCount = state.tickets.filter(t => t.requiresResponse && t.status === 'open').length
  const unreadCount = state.tickets.filter(t => !t.isRead).length

  const filterOptions = [
    { value: 'all', label: `All Tickets (${state.tickets.length})` },
    { value: 'open', label: `Open (${openCount})` },
    { value: 'pending', label: `Pending (${pendingCount})` },
    { value: 'resolved', label: `Resolved` },
    { value: 'needs-response', label: `Needs Response (${needsResponseCount})` },
    { value: 'sla-breached', label: `SLA Breached (${slaBreachedCount})` },
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))
  ]

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...uniqueAssignees.map(name => ({
      value: name,
      label: name
    }))
  ]

  const handleTicketClick = (ticketId: string) => {
    dispatch({ type: 'MARK_TICKET_READ', payload: ticketId })
    openDrawer(ticketId)
  }

  // Generate page title based on current view
  const getPageTitle = () => {
    const view = searchParams.get('view')
    const category = searchParams.get('category')

    if (view) {
      switch (view) {
        case 'mine': return 'My Tickets'
        case 'unassigned': return 'Unassigned Tickets'
        case 'urgent': return 'Urgent Tickets'
        default: return 'All Tickets'
      }
    }
    if (category && categoryLabels[category as TicketCategory]) {
      return `${categoryLabels[category as TicketCategory]} Tickets`
    }
    return 'Tickets'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            {unreadCount > 0 && ` • ${unreadCount} unread`}
            {slaBreachedCount > 0 && (
              <span className="text-red-600 ml-2">• {slaBreachedCount} SLA breached</span>
            )}
          </p>
        </div>
        <Button onClick={() => setIsNewTicketModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('open')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-2xl font-bold text-blue-600">{openCount}</p>
              </div>
              <Circle className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('pending')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-200" />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('needs-response')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Needs Response</p>
                <p className="text-2xl font-bold text-red-600">{needsResponseCount}</p>
              </div>
              <Clock className="w-8 h-8 text-red-200" />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('sla-breached')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">SLA Breached</p>
                <p className={`text-2xl font-bold ${slaBreachedCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{slaBreachedCount}</p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${slaBreachedCount > 0 ? 'text-red-200' : 'text-gray-200'}`} />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('resolved')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{state.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-200" />
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
        <Filter className="w-5 h-5 text-gray-400" />
        <Select
          options={filterOptions}
          value={filter}
          onChange={(val) => setFilter(val as FilterType)}
          className="w-56"
        />
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          className="w-44"
        />
        <Select
          options={assigneeOptions}
          value={assigneeFilter}
          onChange={(val) => setAssigneeFilter(val)}
          className="w-44"
        />
        {(filter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all') && (
          <button
            onClick={() => {
              setFilter('all')
              setCategoryFilter('all')
              setAssigneeFilter('all')
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ticket List */}
      <Card className="p-0 overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No tickets</p>
            <p className="text-sm mt-1">
              {filter !== 'all' ? 'Try changing your filter' : 'No tickets to display'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => {
              const project = ticket.projectId ? getProject(ticket.projectId) : null
              const customer = ticket.customerId
                ? getCustomer(ticket.customerId)
                : project ? getCustomer(project.customerId) : null
              const slaStatus = getSlaStatus(ticket)

              return (
                <li
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className={`
                    p-4 cursor-pointer transition-colors
                    ${!ticket.isRead ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-2 rounded-lg flex-shrink-0
                      ${ticket.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        ticket.type === 'phone' ? 'bg-green-100 text-green-600' :
                        ticket.type === 'internal' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'}
                    `}>
                      {typeIcons[ticket.type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          {!ticket.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <span className={`font-medium truncate ${!ticket.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {ticket.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* SLA Status */}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slaStatus.color}`}>
                            {slaStatus.text}
                          </span>
                          {/* Status */}
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                            {statusIcons[ticket.status]}
                            {ticket.status}
                          </span>
                          {ticket.priority !== 'normal' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}>
                              {ticket.priority}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        {customer && (
                          <span className="truncate">{customer.companyName}</span>
                        )}
                        {ticket.from && (
                          <>
                            <span>•</span>
                            <span className="truncate">{ticket.from}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {categoryLabels[ticket.category]}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                        {ticket.description.slice(0, 120)}...
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-gray-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.updatedAt)}
                        </span>
                        {ticket.assignee && (
                          <span className="text-gray-400 inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.assignee}
                          </span>
                        )}
                        {ticket.requiresResponse && ticket.status === 'open' && (
                          <span className="text-red-600 font-medium">
                            Response needed
                          </span>
                        )}
                        {ticket.replies && ticket.replies.length > 0 && (
                          <span className="text-gray-400">
                            {ticket.replies.length} repl{ticket.replies.length !== 1 ? 'ies' : 'y'}
                          </span>
                        )}
                        {ticket.notes && ticket.notes.length > 0 && (
                          <span className="text-gray-400">
                            {ticket.notes.length} note{ticket.notes.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onTicketCreated={(ticketId) => {
          openDrawer(ticketId)
        }}
      />
    </div>
  )
}
