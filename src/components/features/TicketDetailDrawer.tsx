import { useState } from 'react'
import {
  X,
  Mail,
  Phone,
  MessageSquare,
  FileQuestion,
  Send,
  Link2,
  ChevronDown,
  ChevronUp,
  StickyNote,
  ListTodo,
} from 'lucide-react'
import { useTicketDrawer } from '../../context/TicketDrawerContext'
import { useApp } from '../../context/AppContext'
import { TicketStatus, TicketPriority, TicketCategory, TicketReply } from '../../types'
import { teamMembers, currentUser } from '../../data/teamMembers'
import Button from '../ui/Button'
import Select from '../ui/Select'

const typeIcons: Record<string, React.ReactNode> = {
  'email': <Mail className="w-4 h-4" />,
  'phone': <Phone className="w-4 h-4" />,
  'internal': <MessageSquare className="w-4 h-4" />,
  'customer-request': <FileQuestion className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  'email': 'bg-blue-100 text-blue-600',
  'phone': 'bg-green-100 text-green-600',
  'internal': 'bg-purple-100 text-purple-600',
  'customer-request': 'bg-orange-100 text-orange-600',
}

const categoryLabels: Record<TicketCategory, string> = {
  'billing': 'Billing',
  'technical': 'Technical',
  'scheduling': 'Scheduling',
  'general': 'General',
  'complaint': 'Complaint',
  'change-request': 'Change Request',
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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

interface SlaIndicatorProps {
  label: string
  deadline: string
  respondedAt?: string
}

function SlaIndicator({ label, deadline, respondedAt }: SlaIndicatorProps) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const isBreached = respondedAt ? new Date(respondedAt) > deadlineDate : now > deadlineDate
  const isMet = respondedAt && new Date(respondedAt) <= deadlineDate

  const diffMs = deadlineDate.getTime() - now.getTime()
  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  let statusColor = 'text-green-600 bg-green-50'
  let statusText = ''

  if (isMet) {
    statusColor = 'text-green-600 bg-green-50'
    statusText = 'Met'
  } else if (isBreached) {
    statusColor = 'text-red-600 bg-red-50'
    statusText = 'Breached'
  } else if (hoursRemaining < 1) {
    statusColor = 'text-red-600 bg-red-50'
    statusText = `${minutesRemaining}m left`
  } else if (hoursRemaining < 4) {
    statusColor = 'text-yellow-600 bg-yellow-50'
    statusText = `${hoursRemaining}h ${minutesRemaining}m left`
  } else {
    statusColor = 'text-green-600 bg-green-50'
    statusText = `${hoursRemaining}h left`
  }

  return (
    <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
      <span className="text-gray-500 mr-1">{label}:</span>
      {statusText}
    </div>
  )
}

export default function TicketDetailDrawer() {
  const { isOpen, ticketId, closeDrawer } = useTicketDrawer()
  const { getTicket, getProject, getCustomer, dispatch } = useApp()

  const [replyContent, setReplyContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskSection, setTaskSection] = useState('Follow-Up')

  const ticket = ticketId ? getTicket(ticketId) : null

  if (!ticket) return null

  const project = ticket.projectId ? getProject(ticket.projectId) : null
  const customer = ticket.customerId
    ? getCustomer(ticket.customerId)
    : project
      ? getCustomer(project.customerId)
      : null

  const handleStatusChange = (status: TicketStatus) => {
    dispatch({
      type: 'UPDATE_TICKET_STATUS',
      payload: { ticketId: ticket.id, status }
    })
  }

  const handlePriorityChange = (priority: TicketPriority) => {
    dispatch({
      type: 'UPDATE_TICKET_PRIORITY',
      payload: { ticketId: ticket.id, priority }
    })
  }

  const handleAssigneeChange = (assignee: string) => {
    dispatch({
      type: 'UPDATE_TICKET_ASSIGNEE',
      payload: { ticketId: ticket.id, assignee }
    })
  }

  const handleSendReply = () => {
    if (!replyContent.trim()) return

    const reply: TicketReply = {
      id: `reply-${Date.now()}`,
      author: currentUser.name,
      authorType: isInternalNote ? 'agent' : 'agent',
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      isInternal: isInternalNote,
    }

    dispatch({
      type: 'ADD_TICKET_REPLY',
      payload: { ticketId: ticket.id, reply }
    })

    setReplyContent('')
    setIsInternalNote(false)
  }

  const handleCreateTask = () => {
    if (!taskTitle.trim() || !project) return

    const newTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      section: taskSection,
      completed: false,
      assignee: ticket.assignee || currentUser.name,
    }

    // Update the project with the new task
    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: new Date().toISOString(),
    }

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: updatedProject
    })

    // Also add an internal note about the task creation
    const taskNote: TicketReply = {
      id: `reply-${Date.now()}`,
      author: currentUser.name,
      authorType: 'agent',
      content: `Created task: "${taskTitle.trim()}" in section "${taskSection}"`,
      createdAt: new Date().toISOString(),
      isInternal: true,
    }

    dispatch({
      type: 'ADD_TICKET_REPLY',
      payload: { ticketId: ticket.id, reply: taskNote }
    })

    setTaskTitle('')
    setTaskSection('Follow-Up')
    setShowCreateTask(false)
  }

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...teamMembers.map(m => ({ value: m.name, label: m.name }))
  ]

  // Combine replies and notes into a conversation thread
  const conversationItems = [
    // Original description as first message
    {
      id: 'original',
      author: ticket.from || 'Unknown',
      authorType: 'customer' as const,
      content: ticket.description,
      createdAt: ticket.createdAt,
      isInternal: false,
    },
    // Replies
    ...(ticket.replies || []),
    // Notes (converted to conversation format)
    ...(ticket.notes || []).map(note => ({
      id: note.id,
      author: note.author,
      authorType: 'agent' as const,
      content: note.content,
      createdAt: note.createdAt,
      isInternal: true,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeColors[ticket.type]}`}>
              {typeIcons[ticket.type]}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Ticket #{ticket.id.split('-')[1]}</h2>
              <p className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Subject & SLA */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{ticket.subject}</h3>

            {/* SLA Indicators */}
            <div className="flex items-center gap-3">
              <SlaIndicator
                label="First Response"
                deadline={ticket.firstResponseDue}
                respondedAt={ticket.firstRespondedAt}
              />
              <SlaIndicator
                label="Resolution"
                deadline={ticket.resolutionDue}
                respondedAt={ticket.resolvedAt}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                <Select
                  options={statusOptions}
                  value={ticket.status}
                  onChange={(val) => handleStatusChange(val as TicketStatus)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Priority</label>
                <Select
                  options={priorityOptions}
                  value={ticket.priority}
                  onChange={(val) => handlePriorityChange(val as TicketPriority)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Assignee</label>
                <Select
                  options={assigneeOptions}
                  value={ticket.assignee || ''}
                  onChange={(val) => handleAssigneeChange(val)}
                />
              </div>
            </div>
          </div>

          {/* Details Section (collapsible) */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>Details</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="px-6 pb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{categoryLabels[ticket.category]}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{ticket.type.replace('-', ' ')}</span>
                </div>
                {customer && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Customer:</span>
                    <span className="ml-2 font-medium">{customer.companyName}</span>
                  </div>
                )}
                {ticket.from && (
                  <div className="col-span-2">
                    <span className="text-gray-500">From:</span>
                    <span className="ml-2 font-medium">{ticket.from}</span>
                  </div>
                )}
                {project && (
                  <div className="col-span-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Linked Project:</span>
                    <a
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:underline font-medium"
                      onClick={(e) => {
                        e.preventDefault()
                        closeDrawer()
                        window.location.href = `/projects/${project.id}`
                      }}
                    >
                      {project.serviceOrderId}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="px-6 py-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Conversation</h4>
            <div className="space-y-4">
              {conversationItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`${
                    item.isInternal
                      ? 'bg-yellow-50 border border-yellow-200'
                      : item.authorType === 'customer'
                        ? 'bg-gray-50 border border-gray-200'
                        : item.authorType === 'system'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-green-50 border border-green-200'
                  } rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.author}</span>
                      {item.isInternal && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
                          Internal Note
                        </span>
                      )}
                      {item.authorType === 'customer' && index === 0 && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                          Original
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatRelativeTime(item.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="mb-2 flex items-center gap-2">
            <button
              onClick={() => {
                setIsInternalNote(false)
                setShowCreateTask(false)
              }}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                !isInternalNote && !showCreateTask
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Reply
            </button>
            <button
              onClick={() => {
                setIsInternalNote(true)
                setShowCreateTask(false)
              }}
              className={`text-sm px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                isInternalNote && !showCreateTask
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <StickyNote className="w-3 h-3" />
              Internal Note
            </button>
            {project && (
              <button
                onClick={() => {
                  setShowCreateTask(true)
                  setTaskTitle(ticket.subject)
                }}
                className={`text-sm px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  showCreateTask
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ListTodo className="w-3 h-3" />
                Create Task
              </button>
            )}
          </div>

          {showCreateTask ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Section</label>
                <select
                  value={taskSection}
                  onChange={(e) => setTaskSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                >
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Customer Communication">Customer Communication</option>
                  <option value="Technical">Technical</option>
                  <option value="Scheduling">Scheduling</option>
                  <option value="Documentation">Documentation</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={!taskTitle.trim()}>
                  <ListTodo className="w-4 h-4 mr-1" />
                  Create Task
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={isInternalNote ? 'Add an internal note...' : 'Type your reply...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
