import { Mail, Phone, MessageSquare, FileQuestion, User, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react'
import { Ticket, TicketStatus, TicketType } from '../../types'
import Card from '../ui/Card'

interface TicketListProps {
  tickets: Ticket[]
  onMarkRead?: (ticketId: string) => void
  onSelectTicket?: (ticket: Ticket) => void
}

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

const statusIcons: Record<TicketStatus, React.ReactNode> = {
  'open': <Circle className="w-3 h-3" />,
  'pending': <AlertCircle className="w-3 h-3" />,
  'resolved': <CheckCircle2 className="w-3 h-3" />,
  'closed': <CheckCircle2 className="w-3 h-3" />,
}

function formatTimeAgo(dateStr: string): string {
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
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export default function TicketList({ tickets, onMarkRead, onSelectTicket }: TicketListProps) {
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'pending')
  const closedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')

  const handleTicketClick = (ticket: Ticket) => {
    if (!ticket.isRead && onMarkRead) {
      onMarkRead(ticket.id)
    }
    if (onSelectTicket) {
      onSelectTicket(ticket)
    }
  }

  const renderTicket = (ticket: Ticket) => (
    <div
      key={ticket.id}
      onClick={() => handleTicketClick(ticket)}
      className={`
        p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50
        ${!ticket.isRead ? 'bg-blue-50/50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${ticket.type === 'email' ? 'bg-blue-100 text-blue-600' : ticket.type === 'phone' ? 'bg-green-100 text-green-600' : ticket.type === 'internal' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
          {typeIcons[ticket.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!ticket.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
                <h4 className={`font-medium truncate ${!ticket.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {ticket.subject}
                </h4>
              </div>
              {ticket.from && (
                <p className="text-sm text-gray-500 mt-0.5">
                  From: {ticket.from}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                {statusIcons[ticket.status]}
                {ticket.status}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {ticket.description}
          </p>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(ticket.updatedAt)}
            </span>
            {ticket.assignee && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {ticket.assignee}
              </span>
            )}
            {ticket.requiresResponse && ticket.status === 'open' && (
              <span className="text-red-600 font-medium">
                Response needed
              </span>
            )}
          </div>

          {ticket.notes && ticket.notes.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {ticket.notes.length} note{ticket.notes.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (tickets.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No tickets yet</p>
          <p className="text-sm mt-1">Tickets will appear here when communications begin.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'open').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}</p>
        </div>
      </div>

      {/* Open/Pending Tickets */}
      {openTickets.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900">
              Open Tickets ({openTickets.length})
            </h3>
          </div>
          <div className="divide-y">
            {openTickets.map(renderTicket)}
          </div>
        </Card>
      )}

      {/* Resolved/Closed Tickets */}
      {closedTickets.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-500">
              Resolved ({closedTickets.length})
            </h3>
          </div>
          <div className="divide-y">
            {closedTickets.map(renderTicket)}
          </div>
        </Card>
      )}
    </div>
  )
}
