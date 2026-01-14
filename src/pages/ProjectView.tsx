import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Globe,
  Wifi,
  Router,
  Calendar,
  FileText,
  ExternalLink,
  Clock,
  Building2,
  Truck,
  UserCheck,
  ShoppingBag,
  AlertTriangle,
  Activity,
  Layers,
  Link2
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { teamMembers, currentUser } from '../data/teamMembers'
import { BlockerType, ContactRole, contactRoleLabels, ReadinessTask, CommunicationLogEntry, ProjectStatus, CommunicationType, CommunicationDirection } from '../types'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import StatusBadge from '../components/ui/StatusBadge'
import ProjectTypeBadge from '../components/ui/ProjectTypeBadge'
import SLAIndicator from '../components/features/SLAIndicator'
import TaskList from '../components/features/TaskList'
import BuildingInfo from '../components/features/BuildingInfo'
import TicketList from '../components/features/TicketList'
import ActivityTimeline from '../components/features/ActivityTimeline'
import InternalNotes from '../components/features/InternalNotes'
import BlockerList from '../components/features/BlockerList'
import EmailTemplateModal from '../components/features/EmailTemplateModal'
import EmailComposer from '../components/features/EmailComposer'
import ReadinessChecklist from '../components/features/ReadinessChecklist'
import CommunicationLog from '../components/features/CommunicationLog'
import QuickActionsPanel from '../components/features/QuickActionsPanel'
import HealthScoreBadge from '../components/features/HealthScoreBadge'
import ProjectGroupBadge from '../components/ui/ProjectGroupBadge'
import ProjectGroupModal from '../components/features/ProjectGroupModal'
import AddressLink from '../components/ui/AddressLink'
import VIPBadge from '../components/ui/VIPBadge'
import DocumentVault from '../components/features/DocumentVault'
import PlaybookPanel from '../components/features/PlaybookPanel'
import { getEffectiveVIPTier } from '../utils/vip'
import { getDocumentsByProject } from '../data/mockDocuments'
import { mockPlaybooks, getActiveExecutionsForProject } from '../data/mockPlaybooks'

type TabType = 'overview' | 'tickets' | 'tasks' | 'activity' | 'report'

export default function ProjectView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getProject, getCustomer, getBuilding, getProjectTickets, getProjectGroup, state, dispatch } = useApp()

  const initialTab = (searchParams.get('tab') as TabType) || 'overview'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [startingPlaybookId, setStartingPlaybookId] = useState<string | null>(null)
  const [activePlaybookExecutions, setActivePlaybookExecutions] = useState(getActiveExecutionsForProject(id!))

  const project = getProject(id!)
  const customer = project ? getCustomer(project.customerId) : null
  const building = project ? getBuilding(project.buildingId) : null
  const tickets = project ? getProjectTickets(project.id) : []
  const projectGroup = project?.projectGroupId ? getProjectGroup(project.projectGroupId) : null

  if (!project || !customer || !building) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Button variant="link" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    )
  }

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { projectId: project.id, taskId, completed }
    })
  }

  const handleMarkTicketRead = (ticketId: string) => {
    dispatch({ type: 'MARK_TICKET_READ', payload: ticketId })
  }

  const handleCxAssigneeChange = (cxAssignee: string) => {
    dispatch({
      type: 'UPDATE_PROJECT_ASSIGNEE',
      payload: { projectId: project.id, cxAssignee }
    })
  }

  const handleTaskAssigneeChange = (taskId: string, assignee: string) => {
    dispatch({
      type: 'UPDATE_TASK_ASSIGNEE',
      payload: { projectId: project.id, taskId, assignee }
    })
  }

  const handleTaskDueDateChange = (taskId: string, dueDate: string) => {
    dispatch({
      type: 'UPDATE_TASK_DUE_DATE',
      payload: { projectId: project.id, taskId, dueDate }
    })
  }

  const [showEmailTemplates, setShowEmailTemplates] = useState(false)
  const [showEmailComposer, setShowEmailComposer] = useState(false)

  const handleAddNote = (content: string, mentions?: string[]) => {
    dispatch({
      type: 'ADD_INTERNAL_NOTE',
      payload: {
        projectId: project.id,
        note: {
          id: `note-${Date.now()}`,
          content,
          author: currentUser.name,
          createdAt: new Date().toISOString(),
          mentions,
        }
      }
    })
  }

  const handleDeleteNote = (noteId: string) => {
    dispatch({
      type: 'DELETE_INTERNAL_NOTE',
      payload: { projectId: project.id, noteId }
    })
  }

  const handleToggleNotePin = (noteId: string) => {
    dispatch({
      type: 'TOGGLE_NOTE_PIN',
      payload: { projectId: project.id, noteId }
    })
  }

  const handleAddBlocker = (type: BlockerType, description: string) => {
    dispatch({
      type: 'ADD_BLOCKER',
      payload: {
        projectId: project.id,
        blocker: {
          id: `block-${Date.now()}`,
          type,
          description,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.name,
        }
      }
    })
  }

  const handleResolveBlocker = (blockerId: string) => {
    dispatch({
      type: 'RESOLVE_BLOCKER',
      payload: { projectId: project.id, blockerId, resolvedBy: currentUser.name }
    })
  }

  const handleToggleEscalation = () => {
    const newEscalated = !project.isEscalated
    const reason = newEscalated ? prompt('Reason for escalation:') : undefined
    if (newEscalated && !reason) return

    dispatch({
      type: 'TOGGLE_ESCALATION',
      payload: {
        projectId: project.id,
        isEscalated: newEscalated,
        escalatedBy: newEscalated ? currentUser.name : undefined,
        reason: reason || undefined,
      }
    })
  }

  const handleContactRoleChange = (contactId: string, role: ContactRole) => {
    dispatch({
      type: 'UPDATE_CONTACT_ROLE',
      payload: {
        customerId: customer.id,
        contactId,
        role,
        isPrimary: role === 'primary',
      }
    })
  }

  const handleReadinessTaskUpdate = (taskId: string, updates: Partial<ReadinessTask>) => {
    dispatch({
      type: 'UPDATE_READINESS_TASK',
      payload: {
        projectId: project.id,
        taskId,
        updates,
      }
    })
  }

  const handleAddCommunication = (entry: Omit<CommunicationLogEntry, 'id' | 'createdAt' | 'author'>) => {
    dispatch({
      type: 'ADD_COMMUNICATION_LOG',
      payload: {
        projectId: project.id,
        entry: {
          ...entry,
          id: `comm-${Date.now()}`,
          author: currentUser.name,
          createdAt: new Date().toISOString(),
        }
      }
    })
  }

  const handleStatusChange = (status: ProjectStatus) => {
    dispatch({
      type: 'UPDATE_PROJECT_STATUS',
      payload: { projectId: project.id, status }
    })
  }

  const handleStartPlaybook = (playbookId: string) => {
    setStartingPlaybookId(playbookId)
  }

  const handleConfirmStartPlaybook = () => {
    if (!startingPlaybookId) return
    const playbook = mockPlaybooks.find(p => p.id === startingPlaybookId)
    if (!playbook) return

    // Create new execution
    const newExecution = {
      id: `exec-${Date.now()}`,
      playbookId: startingPlaybookId,
      projectId: project.id,
      customerId: project.customerId,
      startedAt: new Date().toISOString(),
      currentStepId: playbook.steps[0]?.id || '',
      status: 'in-progress' as const,
      stepCompletions: [],
    }

    setActivePlaybookExecutions(prev => [...prev, newExecution])
    setStartingPlaybookId(null)
  }

  const handleCompleteStep = (executionId: string, stepId: string) => {
    setActivePlaybookExecutions(prev =>
      prev.map(exec => {
        if (exec.id !== executionId) return exec

        const playbook = mockPlaybooks.find(p => p.id === exec.playbookId)
        if (!playbook) return exec

        const currentStepIndex = playbook.steps.findIndex(s => s.id === stepId)
        const nextStep = playbook.steps[currentStepIndex + 1]

        return {
          ...exec,
          currentStepId: nextStep?.id || '',
          status: nextStep ? 'in-progress' : 'completed',
          stepCompletions: [
            ...exec.stepCompletions,
            {
              stepId,
              completedAt: new Date().toISOString(),
              completedBy: currentUser.name,
            }
          ]
        }
      })
    )
  }

  const handleQuickLogCommunication = (
    type: CommunicationType,
    direction: CommunicationDirection,
    contactName: string,
    summary: string
  ) => {
    dispatch({
      type: 'ADD_COMMUNICATION_LOG',
      payload: {
        projectId: project.id,
        entry: {
          id: `comm-${Date.now()}`,
          type,
          direction,
          contactName,
          summary,
          followUpRequired: false,
          author: currentUser.name,
          createdAt: new Date().toISOString(),
        }
      }
    })
  }

  const cxAssigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...teamMembers.map(tm => ({ value: tm.name, label: tm.name }))
  ]

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'pending')
  const unreadTickets = tickets.filter(t => !t.isRead)

  const activeBlockers = project.blockers.filter(b => !b.resolvedAt).length

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tickets', label: 'Tickets', badge: openTickets.length || unreadTickets.length },
    { id: 'tasks', label: 'Tasks', badge: project.tasks.filter(t => !t.completed).length },
    { id: 'activity', label: 'Activity', badge: activeBlockers },
    { id: 'report', label: 'Install Report' },
  ]

  const slotLabels: Record<string, string> = {
    'early-7': '7:00 AM (Early)',
    'morning-9': '9:00 AM',
    'morning-11': '11:00 AM',
    'all-day': '9 AM - 5 PM',
    'after-hours': '6:00 PM (After Hours)',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{customer.companyName}</h1>
              <ProjectTypeBadge type={project.projectType} size="md" />
              <StatusBadge status={project.status} />
              <VIPBadge tier={getEffectiveVIPTier(project, customer)} size="md" />
              {project.priority !== 'normal' && (
                <StatusBadge type="priority" status={project.priority} />
              )}
              {project.isEscalated && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                  <AlertTriangle className="w-3 h-3" />
                  Escalated
                </span>
              )}
              <HealthScoreBadge project={project} size="md" />
              {projectGroup ? (
                <ProjectGroupBadge group={projectGroup} size="md" />
              ) : (
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xs font-medium rounded transition-colors"
                  title="Link to project group"
                >
                  <Link2 className="w-3 h-3" />
                  Link to Group
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <AddressLink building={building} className="text-gray-600" />
              <span className="text-gray-300">|</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                {project.serviceOrderId}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">FOC:</span>
                <span className="font-medium text-gray-700">
                  {new Date(project.focDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {project.status !== 'completed' && (
                <SLAIndicator deadline={project.focDate} />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowEmailTemplates(true)}>
            <Mail className="w-4 h-4 mr-1" />
            Email Templates
          </Button>
          <Button
            variant={project.isEscalated ? 'danger' : 'secondary'}
            onClick={handleToggleEscalation}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            {project.isEscalated ? 'De-escalate' : 'Escalate'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                pb-4 text-sm font-medium transition-colors relative
                ${activeTab === tab.id
                  ? 'text-pilot-secondary border-b-2 border-pilot-primary'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-2 bg-pilot-primary text-pilot-secondary text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Company</span>
                <p className="font-medium">{customer.companyName}</p>
                {project.isWholesale && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1">
                    <ShoppingBag className="w-3 h-3" />
                    Wholesale / Carrier
                  </span>
                )}
              </div>

              {/* Customer Contacts */}
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Contacts</span>
                <div className="space-y-3">
                  {customer.contacts.map((contact) => (
                    <div key={contact.id} className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <select
                          value={contact.role || 'other'}
                          onChange={(e) => handleContactRoleChange(contact.id, e.target.value as ContactRole)}
                          className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-pilot-primary"
                        >
                          {Object.entries(contactRoleLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Third-Party IT Contact */}
              {project.thirdPartyItContact && (
                <div className="pt-3 border-t">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Third-Party IT Contact
                  </span>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="font-medium text-sm">{project.thirdPartyItContact.name}</p>
                    {project.thirdPartyItContact.company && (
                      <p className="text-xs text-gray-600">{project.thirdPartyItContact.company}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${project.thirdPartyItContact.email}`} className="hover:underline">
                        {project.thirdPartyItContact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${project.thirdPartyItContact.phone}`} className="hover:underline">
                        {project.thirdPartyItContact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Wholesale End User Contact */}
              {project.isWholesale && project.hasEndUserContact && project.endUserContact && (
                <div className="pt-3 border-t">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    End User Contact
                  </span>
                  <div className="bg-purple-50 p-2 rounded">
                    <p className="font-medium text-sm">{project.endUserContact.name}</p>
                    {project.endUserContact.company && (
                      <p className="text-xs text-gray-600">{project.endUserContact.company}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${project.endUserContact.email}`} className="hover:underline">
                        {project.endUserContact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${project.endUserContact.phone}`} className="hover:underline">
                        {project.endUserContact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Montgomery Contact */}
              {project.projectType === 'montgomery' && project.montgomeryContact && (
                <div className="pt-3 border-t">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Montgomery Contact
                  </span>
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="font-medium text-sm">{project.montgomeryContact.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${project.montgomeryContact.email}`} className="hover:underline">
                        {project.montgomeryContact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${project.montgomeryContact.phone}`} className="hover:underline">
                        {project.montgomeryContact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Contractor Contact */}
              {project.projectType === 'contract-labor' && project.contractorContact && (
                <div className="pt-3 border-t">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Contractor Contact
                  </span>
                  <div className="bg-amber-50 p-2 rounded">
                    <p className="font-medium text-sm">{project.contractorContact.name}</p>
                    <p className="text-xs text-gray-600">{project.contractorContact.company}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${project.contractorContact.email}`} className="hover:underline">
                        {project.contractorContact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${project.contractorContact.phone}`} className="hover:underline">
                        {project.contractorContact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* VIP Status */}
              <div className="pt-3 border-t">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">VIP Status</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer Tier</span>
                    <select
                      value={customer.vipTier || 'standard'}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_CUSTOMER_VIP_TIER',
                        payload: {
                          customerId: customer.id,
                          vipTier: e.target.value === 'standard' ? undefined : e.target.value as 'silver' | 'gold' | 'platinum'
                        }
                      })}
                      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-pilot-primary"
                    >
                      <option value="standard">Standard</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project Override</span>
                    <select
                      value={project.vipTierOverride || 'inherit'}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_PROJECT_VIP_OVERRIDE',
                        payload: {
                          projectId: project.id,
                          vipTierOverride: e.target.value === 'inherit' ? undefined : e.target.value as 'standard' | 'silver' | 'gold' | 'platinum'
                        }
                      })}
                      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-pilot-primary"
                    >
                      <option value="inherit">Inherit from Customer</option>
                      <option value="standard">Standard</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <span className="text-xs text-gray-500 uppercase tracking-wide">CX Assignee</span>
                <Select
                  options={cxAssigneeOptions}
                  value={project.cxAssignee || ''}
                  onChange={handleCxAssigneeChange}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Service Details */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Service Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Product</span>
                <p className="font-medium">{project.product}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Bandwidth</span>
                  <p className="font-medium">{project.serviceBandwidth}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">IP Type</span>
                  <p className="font-medium uppercase">{project.ipType}</p>
                </div>
              </div>
              {project.numStaticIps && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide"># Static IPs</span>
                  <p className="font-medium">{project.numStaticIps}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">MRC</span>
                  <p className="font-medium text-green-600">${project.mrc.toLocaleString()}/mo</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">NRC</span>
                  <p className="font-medium">${project.nrc.toLocaleString()}</p>
                </div>
              </div>
              {project.device && (
                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Device</span>
                  <p className="font-medium">{project.device}</p>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${project.ipType === 'static' || project.ipType === 'bgp' ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={project.ipType === 'static' || project.ipType === 'bgp' ? 'text-gray-700' : 'text-gray-400'}>
                    Static IP
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Router className={`w-4 h-4 ${project.customerOwnRouter ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={project.customerOwnRouter ? 'text-gray-700' : 'text-gray-400'}>
                    Own Router
                  </span>
                </div>
                {project.eeroRequired && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    eero Required
                  </span>
                )}
              </div>
              {project.flightDeckUrl && (
                <div className="pt-2 border-t">
                  <a
                    href={project.flightDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View in Flight Deck
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Schedule & Notes Column */}
          <div className="space-y-4">
            {/* Schedule */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Installation Schedule
              </h3>
              {project.scheduledDate ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Date</span>
                    <p className="font-medium text-sm">
                      {new Date(project.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {project.scheduledSlot && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Slot</span>
                      <p className="font-medium text-sm">{slotLabels[project.scheduledSlot]}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Not yet scheduled</p>
                  <Button variant="link" size="sm" className="mt-1">
                    Schedule Install
                  </Button>
                </div>
              )}
            </Card>

            {/* Internal Notes */}
            <Card>
              <InternalNotes
                notes={project.internalNotes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleToggleNotePin}
              />
            </Card>
          </div>

          {/* Quick Actions & Health Score */}
          <div className="col-span-3 lg:col-span-1 space-y-4">
            <QuickActionsPanel
              project={project}
              onLogCommunication={handleQuickLogCommunication}
              onAddNote={handleAddNote}
              onAddBlocker={handleAddBlocker}
              onChangeStatus={handleStatusChange}
              onToggleEscalation={handleToggleEscalation}
              onOpenEmailTemplates={() => setShowEmailTemplates(true)}
              onOpenAIComposer={() => setShowEmailComposer(true)}
            />
            <HealthScoreBadge project={project} showDetails />
          </div>

          {/* Install Readiness */}
          <Card className="col-span-3 lg:col-span-2">
            <ReadinessChecklist project={project} onUpdateTask={handleReadinessTaskUpdate} />
          </Card>

          {/* Building Info - Full Width */}
          <div className="col-span-3">
            <BuildingInfo building={building} />
          </div>

          {/* Document Vault - Full Width */}
          <div className="col-span-3">
            <DocumentVault
              documents={getDocumentsByProject(project.id)}
              projectId={project.id}
              customerId={project.customerId}
              title="Project Documents"
              onUpload={() => console.log('Upload document')}
            />
          </div>

          {/* Playbooks - Full Width */}
          <div className="col-span-3">
            <PlaybookPanel
              playbooks={mockPlaybooks}
              executions={activePlaybookExecutions}
              customers={state.customers}
              projectId={project.id}
              onStartPlaybook={handleStartPlaybook}
              onCompleteStep={handleCompleteStep}
              compact
            />
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <TicketList tickets={tickets} onMarkRead={handleMarkTicketRead} />
      )}

      {activeTab === 'tasks' && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Task Checklist</h3>
          <TaskList
            tasks={project.tasks}
            onToggle={handleTaskToggle}
            onAssigneeChange={handleTaskAssigneeChange}
            onDueDateChange={handleTaskDueDateChange}
            editable
          />
        </Card>
      )}

      {activeTab === 'activity' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Activity Timeline */}
          <div className="col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
              </div>
              <ActivityTimeline activities={project.activityLog} />
            </Card>

            {/* Communication Log */}
            <Card>
              <CommunicationLog
                entries={project.communicationLog || []}
                onAddEntry={handleAddCommunication}
              />
            </Card>
          </div>

          {/* Right Column: Notes & Blockers */}
          <div className="space-y-6">
            {/* Internal Notes */}
            <Card>
              <InternalNotes
                notes={project.internalNotes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleToggleNotePin}
              />
            </Card>

            {/* Blockers */}
            <Card>
              <BlockerList
                blockers={project.blockers}
                onAddBlocker={handleAddBlocker}
                onResolveBlocker={handleResolveBlocker}
              />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <Card>
          {project.installReport ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Installation Report</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Installer</span>
                  <p className="font-medium">{project.installReport.installerName}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Completed</span>
                  <p className="font-medium">
                    {new Date(project.installReport.completedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Device</span>
                  <p className="font-medium font-mono">{project.installReport.deviceInstalled}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Serial</span>
                  <p className="font-medium font-mono">{project.installReport.deviceSerial}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Power Status</span>
                  <p className="font-medium capitalize">{project.installReport.powerStatus}</p>
                </div>
              </div>

              {project.installReport.notes && (
                <div className="mt-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Notes</span>
                  <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">
                    {project.installReport.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No installation report yet</p>
              <p className="text-sm mt-1">The report will appear here after installation is complete.</p>
            </div>
          )}
        </Card>
      )}

      {/* Email Templates Modal */}
      <EmailTemplateModal
        isOpen={showEmailTemplates}
        onClose={() => setShowEmailTemplates(false)}
        variables={{
          contactName: customer.contacts.find(c => c.isPrimary)?.name || customer.contacts[0]?.name || '',
          companyName: customer.companyName,
          cxName: currentUser.name,
          address: building.address,
          product: project.product,
          bandwidth: project.serviceBandwidth,
          focDate: new Date(project.focDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          scheduledDate: project.scheduledDate
            ? new Date(project.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : '',
          scheduledTime: project.scheduledSlot ? slotLabels[project.scheduledSlot] : '',
          device: project.device || '',
          accessRequirements: building.accessInstructions || 'Please coordinate access with building management',
        }}
      />

      {/* AI Email Composer */}
      <EmailComposer
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
        project={project}
        customer={customer}
        building={building}
      />

      {/* Link to Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowGroupModal(false)} />
            <Card className="relative max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Link to Project Group
              </h3>

              {/* Existing groups for this customer */}
              {state.projectGroups.filter(g => g.customerId === project.customerId).length > 0 ? (
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Select an existing group or create a new one:</p>
                  {state.projectGroups
                    .filter(g => g.customerId === project.customerId)
                    .map(group => (
                      <button
                        key={group.id}
                        onClick={() => {
                          dispatch({
                            type: 'LINK_PROJECT_TO_GROUP',
                            payload: { projectId: project.id, groupId: group.id }
                          })
                          setShowGroupModal(false)
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: group.color }}
                        >
                          <Layers className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{group.name}</p>
                          {group.description && (
                            <p className="text-sm text-gray-500 truncate">{group.description}</p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  No existing groups for {customer.companyName}. Create a new group to link related projects together.
                </p>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setShowGroupModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowGroupModal(false)
                    // Open the create group modal - we'll use a different approach
                    setShowCreateGroupModal(true)
                  }}
                >
                  Create New Group
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <ProjectGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        defaultCustomerId={project.customerId}
        onGroupCreated={(groupId) => {
          dispatch({
            type: 'LINK_PROJECT_TO_GROUP',
            payload: { projectId: project.id, groupId }
          })
        }}
      />

      {/* Start Playbook Confirmation Modal */}
      {startingPlaybookId && (() => {
        const playbook = mockPlaybooks.find(p => p.id === startingPlaybookId)
        if (!playbook) return null
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Start Playbook</h3>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-gray-600">
                  You are about to start the <strong>{playbook.name}</strong> playbook for this project.
                </p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">{playbook.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{playbook.steps.length} steps</span>
                    <span>•</span>
                    <span>{playbook.estimatedDuration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setStartingPlaybookId(null)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmStartPlaybook}>
                  Start Playbook
                </Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
