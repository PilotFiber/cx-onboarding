import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FolderKanban,
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  FileText,
  Plus,
  ArrowRight,
  User,
  AlertTriangle,
  BarChart3,
  Command
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface CommandItem {
  id: string
  type: 'navigation' | 'project' | 'customer' | 'action'
  title: string
  subtitle?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { state, getCustomer, getBuilding } = useApp()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Build command items
  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = []

    // Navigation items
    items.push(
      {
        id: 'nav-dashboard',
        type: 'navigation',
        title: 'Dashboard',
        subtitle: 'Go to dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        action: () => { navigate('/'); onClose() },
        keywords: ['home', 'overview', 'stats']
      },
      {
        id: 'nav-projects',
        type: 'navigation',
        title: 'Projects',
        subtitle: 'View all projects',
        icon: <FolderKanban className="w-4 h-4" />,
        action: () => { navigate('/projects'); onClose() },
        keywords: ['onboarding', 'list', 'all']
      },
      {
        id: 'nav-calendar',
        type: 'navigation',
        title: 'Calendar',
        subtitle: 'View install schedule',
        icon: <Calendar className="w-4 h-4" />,
        action: () => { navigate('/calendar'); onClose() },
        keywords: ['schedule', 'installs', 'dates']
      },
      {
        id: 'nav-team',
        type: 'navigation',
        title: 'Team Workload',
        subtitle: 'View team assignments',
        icon: <Users className="w-4 h-4" />,
        action: () => { navigate('/team'); onClose() },
        keywords: ['workload', 'assignments', 'cxa']
      },
      {
        id: 'nav-tickets',
        type: 'navigation',
        title: 'Tickets',
        subtitle: 'View all tickets',
        icon: <Ticket className="w-4 h-4" />,
        action: () => { navigate('/tickets'); onClose() },
        keywords: ['inbox', 'emails', 'communications']
      },
      {
        id: 'nav-reports',
        type: 'navigation',
        title: 'Reports',
        subtitle: 'View analytics and reports',
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => { navigate('/reports'); onClose() },
        keywords: ['analytics', 'metrics', 'performance']
      }
    )

    // Action items
    items.push(
      {
        id: 'action-new-project',
        type: 'action',
        title: 'New Project',
        subtitle: 'Create a new onboarding project',
        icon: <Plus className="w-4 h-4" />,
        action: () => { navigate('/projects?new=true'); onClose() },
        keywords: ['create', 'add', 'onboarding']
      },
      {
        id: 'action-escalated',
        type: 'action',
        title: 'View Escalated Projects',
        subtitle: 'Show all escalated projects',
        icon: <AlertTriangle className="w-4 h-4" />,
        action: () => { navigate('/projects?filter=escalated'); onClose() },
        keywords: ['urgent', 'priority', 'issues']
      }
    )

    // Project items
    state.projects.forEach(project => {
      const customer = getCustomer(project.customerId)
      const building = getBuilding(project.buildingId)
      if (customer) {
        items.push({
          id: `project-${project.id}`,
          type: 'project',
          title: customer.companyName,
          subtitle: `${project.serviceOrderId} • ${building?.address || ''}`,
          icon: <FileText className="w-4 h-4" />,
          action: () => { navigate(`/projects/${project.id}`); onClose() },
          keywords: [
            project.serviceOrderId.toLowerCase(),
            project.product.toLowerCase(),
            project.cxAssignee?.toLowerCase() || '',
            building?.address.toLowerCase() || ''
          ]
        })
      }
    })

    // Customer items
    state.customers.forEach(customer => {
      const customerProjects = state.projects.filter(p => p.customerId === customer.id)
      if (customerProjects.length > 0) {
        items.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          title: customer.companyName,
          subtitle: `${customerProjects.length} project${customerProjects.length > 1 ? 's' : ''}`,
          icon: <User className="w-4 h-4" />,
          action: () => { navigate(`/projects/${customerProjects[0].id}`); onClose() },
          keywords: customer.contacts.map(c => c.email.toLowerCase())
        })
      }
    })

    return items
  }, [state.projects, state.customers, getCustomer, getBuilding, navigate, onClose])

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Show navigation and actions when no query
      return allItems.filter(item => item.type === 'navigation' || item.type === 'action')
    }

    const lowerQuery = query.toLowerCase()
    return allItems.filter(item => {
      if (item.title.toLowerCase().includes(lowerQuery)) return true
      if (item.subtitle?.toLowerCase().includes(lowerQuery)) return true
      if (item.keywords?.some(k => k.includes(lowerQuery))) return true
      return false
    }).slice(0, 10) // Limit results
  }, [allItems, query])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems, selectedIndex, onClose])

  if (!isOpen) return null

  const getTypeLabel = (type: CommandItem['type']) => {
    switch (type) {
      case 'navigation': return 'Go to'
      case 'project': return 'Project'
      case 'customer': return 'Customer'
      case 'action': return 'Action'
    }
  }

  const getTypeColor = (type: CommandItem['type']) => {
    switch (type) {
      case 'navigation': return 'bg-blue-100 text-blue-700'
      case 'project': return 'bg-green-100 text-green-700'
      case 'customer': return 'bg-purple-100 text-purple-700'
      case 'action': return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, customers, or type a command..."
              className="flex-1 text-base outline-none placeholder-gray-400"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-pilot-primary/20'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-pilot-primary text-pilot-secondary' : 'bg-gray-100 text-gray-600'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{item.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <ArrowRight className={`w-4 h-4 ${index === selectedIndex ? 'text-gray-600' : 'text-gray-300'}`} />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />K to open
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
