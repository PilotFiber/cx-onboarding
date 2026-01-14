import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Project, Customer, Building, Ticket, ServiceOrder, InternalNote, ActivityLogEntry, Blocker, ProjectStatus, ContactRole, ReadinessTask, CommunicationLogEntry, TicketStatus, TicketPriority, TicketReply, ProjectGroup, VIPTier } from '../types'
import { mockProjects } from '../data/mockProjects'
import { mockCustomers } from '../data/mockCustomers'
import { mockBuildings } from '../data/mockBuildings'
import { mockTickets } from '../data/mockTickets'
import { mockServiceOrders } from '../data/mockServiceOrders'
import { mockProjectGroups } from '../data/mockProjectGroups'

interface AppState {
  projects: Project[]
  customers: Customer[]
  buildings: Building[]
  tickets: Ticket[]
  serviceOrders: ServiceOrder[]
  projectGroups: ProjectGroup[]
}

type AppAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT_ASSIGNEE'; payload: { projectId: string; cxAssignee: string } }
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { projectId: string; status: ProjectStatus } }
  | { type: 'SET_TICKETS'; payload: Ticket[] }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'MARK_TICKET_READ'; payload: string }
  | { type: 'UPDATE_TICKET_STATUS'; payload: { ticketId: string; status: TicketStatus } }
  | { type: 'UPDATE_TICKET_PRIORITY'; payload: { ticketId: string; priority: TicketPriority } }
  | { type: 'UPDATE_TICKET_ASSIGNEE'; payload: { ticketId: string; assignee: string } }
  | { type: 'ADD_TICKET_REPLY'; payload: { ticketId: string; reply: TicketReply } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; taskId: string; completed: boolean } }
  | { type: 'UPDATE_TASK_ASSIGNEE'; payload: { projectId: string; taskId: string; assignee: string } }
  | { type: 'UPDATE_TASK_DUE_DATE'; payload: { projectId: string; taskId: string; dueDate: string } }
  | { type: 'ADD_INTERNAL_NOTE'; payload: { projectId: string; note: InternalNote } }
  | { type: 'DELETE_INTERNAL_NOTE'; payload: { projectId: string; noteId: string } }
  | { type: 'TOGGLE_NOTE_PIN'; payload: { projectId: string; noteId: string } }
  | { type: 'ADD_ACTIVITY_LOG'; payload: { projectId: string; entry: ActivityLogEntry } }
  | { type: 'ADD_BLOCKER'; payload: { projectId: string; blocker: Blocker } }
  | { type: 'RESOLVE_BLOCKER'; payload: { projectId: string; blockerId: string; resolvedBy: string } }
  | { type: 'TOGGLE_ESCALATION'; payload: { projectId: string; isEscalated: boolean; escalatedBy?: string; reason?: string } }
  | { type: 'UPDATE_CONTACT_ROLE'; payload: { customerId: string; contactId: string; role: ContactRole; isPrimary?: boolean } }
  | { type: 'UPDATE_READINESS_TASK'; payload: { projectId: string; taskId: string; updates: Partial<ReadinessTask> } }
  | { type: 'ADD_COMMUNICATION_LOG'; payload: { projectId: string; entry: CommunicationLogEntry } }
  | { type: 'ADD_PROJECT_GROUP'; payload: ProjectGroup }
  | { type: 'UPDATE_PROJECT_GROUP'; payload: ProjectGroup }
  | { type: 'DELETE_PROJECT_GROUP'; payload: string }
  | { type: 'LINK_PROJECT_TO_GROUP'; payload: { projectId: string; groupId: string | undefined } }
  | { type: 'UPDATE_CUSTOMER_VIP_TIER'; payload: { customerId: string; vipTier: VIPTier | undefined } }
  | { type: 'UPDATE_CUSTOMER_LINKEDIN'; payload: { customerId: string; linkedInUrl: string | undefined } }
  | { type: 'UPDATE_PROJECT_VIP_OVERRIDE'; payload: { projectId: string; vipTierOverride: VIPTier | undefined } }
  | { type: 'LOAD_STATE'; payload: AppState }

const initialState: AppState = {
  projects: [],
  customers: [],
  buildings: [],
  tickets: [],
  serviceOrders: [],
  projectGroups: [],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload }
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      }
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload }
    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.payload] }
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      }
    case 'MARK_TICKET_READ':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload ? { ...t, isRead: true } : t
        ),
      }
    case 'UPDATE_TICKET_STATUS': {
      const now = new Date().toISOString()
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.ticketId
            ? {
                ...t,
                status: action.payload.status,
                updatedAt: now,
                resolvedAt: (action.payload.status === 'resolved' || action.payload.status === 'closed') ? now : t.resolvedAt,
              }
            : t
        ),
      }
    }
    case 'UPDATE_TICKET_PRIORITY':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.ticketId
            ? { ...t, priority: action.payload.priority, updatedAt: new Date().toISOString() }
            : t
        ),
      }
    case 'UPDATE_TICKET_ASSIGNEE':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.ticketId
            ? { ...t, assignee: action.payload.assignee, updatedAt: new Date().toISOString() }
            : t
        ),
      }
    case 'ADD_TICKET_REPLY': {
      const now = new Date().toISOString()
      return {
        ...state,
        tickets: state.tickets.map(t => {
          if (t.id !== action.payload.ticketId) return t
          const isFirstResponse = !t.firstRespondedAt && action.payload.reply.authorType === 'agent'
          return {
            ...t,
            replies: [...(t.replies || []), action.payload.reply],
            updatedAt: now,
            firstRespondedAt: isFirstResponse ? now : t.firstRespondedAt,
            requiresResponse: action.payload.reply.authorType === 'customer' ? true : false,
          }
        }),
      }
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map(t =>
                  t.id === action.payload.taskId
                    ? { ...t, completed: action.payload.completed }
                    : t
                ),
              }
            : p
        ),
      }
    case 'UPDATE_PROJECT_ASSIGNEE':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, cxAssignee: action.payload.cxAssignee }
            : p
        ),
      }
    case 'UPDATE_TASK_ASSIGNEE':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map(t =>
                  t.id === action.payload.taskId
                    ? { ...t, assignee: action.payload.assignee }
                    : t
                ),
              }
            : p
        ),
      }
    case 'UPDATE_TASK_DUE_DATE':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map(t =>
                  t.id === action.payload.taskId
                    ? { ...t, dueDate: action.payload.dueDate }
                    : t
                ),
              }
            : p
        ),
      }
    case 'UPDATE_PROJECT_STATUS':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, status: action.payload.status, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    case 'ADD_INTERNAL_NOTE': {
      const noteActivityEntry: ActivityLogEntry = {
        id: `activity-note-${action.payload.note.id}`,
        projectId: action.payload.projectId,
        type: 'note_added',
        description: action.payload.note.content.length > 100
          ? `${action.payload.note.content.substring(0, 100)}...`
          : action.payload.note.content,
        author: action.payload.note.author,
        createdAt: action.payload.note.createdAt,
      }
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                internalNotes: [action.payload.note, ...p.internalNotes],
                activityLog: [noteActivityEntry, ...p.activityLog],
                updatedAt: new Date().toISOString()
              }
            : p
        ),
      }
    }
    case 'DELETE_INTERNAL_NOTE':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, internalNotes: p.internalNotes.filter(n => n.id !== action.payload.noteId) }
            : p
        ),
      }
    case 'TOGGLE_NOTE_PIN':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                internalNotes: p.internalNotes.map(n =>
                  n.id === action.payload.noteId ? { ...n, isPinned: !n.isPinned } : n
                ),
              }
            : p
        ),
      }
    case 'ADD_ACTIVITY_LOG':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, activityLog: [action.payload.entry, ...p.activityLog] }
            : p
        ),
      }
    case 'ADD_BLOCKER':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, blockers: [action.payload.blocker, ...p.blockers], updatedAt: new Date().toISOString() }
            : p
        ),
      }
    case 'RESOLVE_BLOCKER':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                blockers: p.blockers.map(b =>
                  b.id === action.payload.blockerId
                    ? { ...b, resolvedAt: new Date().toISOString(), resolvedBy: action.payload.resolvedBy }
                    : b
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }
    case 'TOGGLE_ESCALATION':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                isEscalated: action.payload.isEscalated,
                escalatedAt: action.payload.isEscalated ? new Date().toISOString() : undefined,
                escalatedBy: action.payload.escalatedBy,
                escalationReason: action.payload.reason,
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }
    case 'UPDATE_CONTACT_ROLE':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.customerId
            ? {
                ...c,
                contacts: c.contacts.map(contact => {
                  if (contact.id === action.payload.contactId) {
                    return {
                      ...contact,
                      role: action.payload.role,
                      isPrimary: action.payload.isPrimary ?? contact.isPrimary,
                    }
                  }
                  // If setting this contact as primary, unset others
                  if (action.payload.isPrimary && action.payload.role === 'primary') {
                    return { ...contact, isPrimary: false }
                  }
                  return contact
                }),
              }
            : c
        ),
      }
    case 'UPDATE_READINESS_TASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                readinessTasks: p.readinessTasks.map(t =>
                  t.id === action.payload.taskId
                    ? { ...t, ...action.payload.updates }
                    : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }
    case 'ADD_COMMUNICATION_LOG':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                communicationLog: [action.payload.entry, ...(p.communicationLog || [])],
                lastCustomerContact: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }
    case 'ADD_PROJECT_GROUP':
      return {
        ...state,
        projectGroups: [...state.projectGroups, action.payload],
      }
    case 'UPDATE_PROJECT_GROUP':
      return {
        ...state,
        projectGroups: state.projectGroups.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      }
    case 'DELETE_PROJECT_GROUP':
      return {
        ...state,
        projectGroups: state.projectGroups.filter(g => g.id !== action.payload),
        // Also unlink all projects from this group
        projects: state.projects.map(p =>
          p.projectGroupId === action.payload
            ? { ...p, projectGroupId: undefined, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    case 'LINK_PROJECT_TO_GROUP':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, projectGroupId: action.payload.groupId, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    case 'UPDATE_CUSTOMER_VIP_TIER':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.customerId
            ? { ...c, vipTier: action.payload.vipTier }
            : c
        ),
      }
    case 'UPDATE_CUSTOMER_LINKEDIN':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.customerId
            ? { ...c, linkedInUrl: action.payload.linkedInUrl }
            : c
        ),
      }
    case 'UPDATE_PROJECT_VIP_OVERRIDE':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, vipTierOverride: action.payload.vipTierOverride, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  getProject: (id: string) => Project | undefined
  getCustomer: (id: string) => Customer | undefined
  getBuilding: (id: string) => Building | undefined
  getTicket: (id: string) => Ticket | undefined
  getProjectTickets: (projectId: string) => Ticket[]
  getServiceOrder: (id: string) => ServiceOrder | undefined
  getProjectGroup: (id: string) => ProjectGroup | undefined
  getProjectsInGroup: (groupId: string) => Project[]
}

const AppContext = createContext<AppContextValue | null>(null)

const STORAGE_KEY = 'cx-onboarding-state'
const STORAGE_VERSION_KEY = 'cx-onboarding-version'
const CURRENT_VERSION = '12' // Increment this when data structure changes - added VIP tiers

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load from localStorage or initialize with mock data
  useEffect(() => {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    const saved = localStorage.getItem(STORAGE_KEY)

    // If version mismatch or no saved data, use fresh mock data
    if (savedVersion !== CURRENT_VERSION || !saved) {
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          projects: mockProjects,
          customers: mockCustomers,
          buildings: mockBuildings,
          tickets: mockTickets,
          serviceOrders: mockServiceOrders,
          projectGroups: mockProjectGroups,
        },
      })
      return
    }

    try {
      const parsed = JSON.parse(saved)
      dispatch({ type: 'LOAD_STATE', payload: parsed })
    } catch {
      // If parsing fails, use mock data
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          projects: mockProjects,
          customers: mockCustomers,
          buildings: mockBuildings,
          tickets: mockTickets,
          serviceOrders: mockServiceOrders,
          projectGroups: mockProjectGroups,
        },
      })
    }
  }, [])

  // Save to localStorage on state change
  useEffect(() => {
    if (state.projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const getProject = (id: string) => state.projects.find(p => p.id === id)
  const getCustomer = (id: string) => state.customers.find(c => c.id === id)
  const getBuilding = (id: string) => state.buildings.find(b => b.id === id)
  const getTicket = (id: string) => state.tickets.find(t => t.id === id)
  const getProjectTickets = (projectId: string) =>
    state.tickets.filter(t => t.projectId === projectId).sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  const getServiceOrder = (id: string) => state.serviceOrders.find(s => s.id === id)
  const getProjectGroup = (id: string) => state.projectGroups.find(g => g.id === id)
  const getProjectsInGroup = (groupId: string) =>
    state.projects.filter(p => p.projectGroupId === groupId)

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        getProject,
        getCustomer,
        getBuilding,
        getTicket,
        getProjectTickets,
        getServiceOrder,
        getProjectGroup,
        getProjectsInGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
