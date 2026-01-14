import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Ticket,
  Calendar,
  Settings,
  CheckSquare,
  Sun,
  Users,
  BarChart3,
  Keyboard,
  ChevronDown,
  ChevronRight,
  Inbox,
  User,
  AlertCircle,
  Clock,
  Tag,
  BookOpen,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentUser } from '../../data/teamMembers'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/my-day', icon: Sun, label: 'My Day' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/tasks', icon: CheckSquare, label: 'My Tasks' },
]

const ticketViews = [
  { id: 'all', icon: Inbox, label: 'All Tickets', filter: '' },
  { id: 'mine', icon: User, label: 'My Tickets', filter: 'assignee:mine' },
  { id: 'unassigned', icon: AlertCircle, label: 'Unassigned', filter: 'assignee:none' },
  { id: 'urgent', icon: Clock, label: 'Urgent', filter: 'priority:urgent' },
]

const ticketCategories = [
  { id: 'billing', label: 'Billing' },
  { id: 'technical', label: 'Technical' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'general', label: 'General' },
  { id: 'complaint', label: 'Complaint' },
  { id: 'change-request', label: 'Change Request' },
]

const bottomNavItems = [
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/team', icon: Users, label: 'Team Workload' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/playbooks', icon: BookOpen, label: 'Playbooks' },
]

export default function Sidebar() {
  const { state } = useApp()
  const location = useLocation()
  const [ticketsExpanded, setTicketsExpanded] = useState(location.pathname.startsWith('/tickets'))
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)

  const openTickets = state.tickets.filter(t => t.status === 'open' || t.status === 'pending').length
  const activeProjects = state.projects.filter(p => p.status !== 'completed').length

  // Count incomplete tasks assigned to current user
  const myIncompleteTasks = state.projects.reduce((count, project) => {
    return count + project.tasks.filter(t => t.assignee === currentUser.name && !t.completed).length
  }, 0)

  // Count tickets for each view
  const getTicketViewCount = (viewId: string) => {
    switch (viewId) {
      case 'all':
        return state.tickets.filter(t => t.status !== 'closed').length
      case 'mine':
        return state.tickets.filter(t => t.assignee === currentUser.name && t.status !== 'closed').length
      case 'unassigned':
        return state.tickets.filter(t => !t.assignee && t.status !== 'closed').length
      case 'urgent':
        return state.tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length
      default:
        return 0
    }
  }

  // Count tickets by category
  const getTicketCategoryCount = (categoryId: string) => {
    return state.tickets.filter(t => t.category === categoryId && t.status !== 'closed').length
  }

  const getBadgeCount = (path: string) => {
    switch (path) {
      case '/tickets':
        return openTickets
      case '/projects':
        return activeProjects
      case '/tasks':
        return myIncompleteTasks
      default:
        return 0
    }
  }

  const isTicketViewActive = (viewId: string) => {
    const params = new URLSearchParams(location.search)
    const currentView = params.get('view') || 'all'
    return location.pathname === '/tickets' && currentView === viewId
  }

  const isTicketCategoryActive = (categoryId: string) => {
    const params = new URLSearchParams(location.search)
    return location.pathname === '/tickets' && params.get('category') === categoryId
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const badgeCount = getBadgeCount(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-pilot-primary text-pilot-secondary font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="bg-pilot-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}

          {/* Tickets Section with Sub-views */}
          <li>
            <button
              onClick={() => setTicketsExpanded(!ticketsExpanded)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/tickets'
                  ? 'bg-pilot-primary text-pilot-secondary font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span className="flex-1 text-left">Tickets</span>
              {openTickets > 0 && (
                <span className="bg-pilot-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full mr-1">
                  {openTickets}
                </span>
              )}
              {ticketsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {ticketsExpanded && (
              <ul className="ml-4 mt-1 space-y-0.5">
                {/* Ticket Views */}
                {ticketViews.map((view) => {
                  const count = getTicketViewCount(view.id)
                  const isActive = isTicketViewActive(view.id)
                  return (
                    <li key={view.id}>
                      <NavLink
                        to={`/tickets${view.id === 'all' ? '' : `?view=${view.id}`}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <view.icon className="w-4 h-4" />
                        <span className="flex-1">{view.label}</span>
                        {count > 0 && (
                          <span className="text-xs text-gray-400">{count}</span>
                        )}
                      </NavLink>
                    </li>
                  )
                })}

                {/* Categories Sub-section */}
                <li>
                  <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-sm"
                  >
                    <Tag className="w-4 h-4" />
                    <span className="flex-1 text-left">Categories</span>
                    {categoriesExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>

                  {categoriesExpanded && (
                    <ul className="ml-4 mt-0.5 space-y-0.5">
                      {ticketCategories.map((category) => {
                        const count = getTicketCategoryCount(category.id)
                        const isActive = isTicketCategoryActive(category.id)
                        return (
                          <li key={category.id}>
                            <NavLink
                              to={`/tickets?category=${category.id}`}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                                isActive
                                  ? 'bg-gray-100 text-gray-900 font-medium'
                                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                              }`}
                            >
                              <span className="flex-1">{category.label}</span>
                              {count > 0 && (
                                <span className="text-gray-300">{count}</span>
                              )}
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </li>

          {/* Bottom nav items */}
          {bottomNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-pilot-primary text-pilot-secondary font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={() => {
            // Dispatch a keyboard event to trigger the ? shortcut
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-sm"
        >
          <Keyboard className="w-4 h-4" />
          <span className="flex-1 text-left">Shortcuts</span>
          <kbd className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">?</kbd>
        </button>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
