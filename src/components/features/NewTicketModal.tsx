import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Ticket, TicketType, TicketCategory, TicketPriority, ticketSlaTargets } from '../../types'
import { teamMembers, currentUser } from '../../data/teamMembers'
import Button from '../ui/Button'
import Select from '../ui/Select'

interface NewTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onTicketCreated?: (ticketId: string) => void
  defaultProjectId?: string
  defaultCustomerId?: string
}

const typeOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'internal', label: 'Internal' },
  { value: 'customer-request', label: 'Customer Request' },
]

const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'change-request', label: 'Change Request' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default function NewTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  defaultProjectId,
  defaultCustomerId,
}: NewTicketModalProps) {
  const { state, dispatch } = useApp()

  const [type, setType] = useState<TicketType>('email')
  const [category, setCategory] = useState<TicketCategory>('general')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [from, setFrom] = useState('')
  const [projectId, setProjectId] = useState(defaultProjectId || '')
  const [customerId, setCustomerId] = useState(defaultCustomerId || '')
  const [assignee, setAssignee] = useState(currentUser.name)
  const [requiresResponse, setRequiresResponse] = useState(true)

  const resetForm = () => {
    setType('email')
    setCategory('general')
    setPriority('normal')
    setSubject('')
    setDescription('')
    setFrom('')
    setProjectId(defaultProjectId || '')
    setCustomerId(defaultCustomerId || '')
    setAssignee(currentUser.name)
    setRequiresResponse(true)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !description.trim()) return

    const now = new Date()
    const targets = ticketSlaTargets[priority]

    const firstResponseDue = new Date(now)
    firstResponseDue.setHours(firstResponseDue.getHours() + targets.firstResponse)

    const resolutionDue = new Date(now)
    resolutionDue.setHours(resolutionDue.getHours() + targets.resolution)

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      projectId: projectId || undefined,
      customerId: customerId || undefined,
      type,
      category,
      status: 'open',
      priority,
      subject: subject.trim(),
      description: description.trim(),
      from: from.trim() || undefined,
      assignee,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isRead: true,
      requiresResponse,
      firstResponseDue: firstResponseDue.toISOString(),
      resolutionDue: resolutionDue.toISOString(),
      replies: [],
      notes: [],
    }

    dispatch({ type: 'ADD_TICKET', payload: newTicket })

    if (onTicketCreated) {
      onTicketCreated(newTicket.id)
    }

    handleClose()
  }

  // Build project options
  const projectOptions = [
    { value: '', label: 'No linked project' },
    ...state.projects.map(p => {
      const customer = state.customers.find(c => c.id === p.customerId)
      return {
        value: p.id,
        label: `${customer?.companyName || 'Unknown'} - ${p.serviceOrderId}`
      }
    })
  ]

  // Build customer options
  const customerOptions = [
    { value: '', label: 'Select customer...' },
    ...state.customers.map(c => ({
      value: c.id,
      label: c.companyName
    }))
  ]

  // Build assignee options
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...teamMembers.map(m => ({ value: m.name, label: m.name }))
  ]

  // When project is selected, auto-fill customer
  const handleProjectChange = (pId: string) => {
    setProjectId(pId)
    if (pId) {
      const project = state.projects.find(p => p.id === pId)
      if (project) {
        setCustomerId(project.customerId)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Ticket</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Type, Category, Priority row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select
                  options={typeOptions}
                  value={type}
                  onChange={(val) => setType(val as TicketType)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => setCategory(val as TicketCategory)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  options={priorityOptions}
                  value={priority}
                  onChange={(val) => setPriority(val as TicketPriority)}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the ticket"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                required
              />
            </div>

            {/* From (contact email/phone) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From (Contact)
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Email or phone of the requester"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full details of the ticket..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary resize-none"
                required
              />
            </div>

            {/* Link to Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Project
              </label>
              <Select
                options={projectOptions}
                value={projectId}
                onChange={handleProjectChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Link this ticket to an existing project
              </p>
            </div>

            {/* Customer (if no project) */}
            {!projectId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <Select
                  options={customerOptions}
                  value={customerId}
                  onChange={setCustomerId}
                />
              </div>
            )}

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <Select
                options={assigneeOptions}
                value={assignee}
                onChange={setAssignee}
              />
            </div>

            {/* Requires Response */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresResponse"
                checked={requiresResponse}
                onChange={(e) => setRequiresResponse(e.target.checked)}
                className="w-4 h-4 text-pilot-secondary border-gray-300 rounded focus:ring-pilot-primary"
              />
              <label htmlFor="requiresResponse" className="text-sm text-gray-700">
                Requires response from customer
              </label>
            </div>

            {/* SLA Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">SLA Targets (based on priority)</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">First Response:</span>
                  <span className="ml-2 font-medium">{ticketSlaTargets[priority].firstResponse} hours</span>
                </div>
                <div>
                  <span className="text-gray-500">Resolution:</span>
                  <span className="ml-2 font-medium">{ticketSlaTargets[priority].resolution} hours</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!subject.trim() || !description.trim()}>
            Create Ticket
          </Button>
        </div>
      </div>
    </div>
  )
}
