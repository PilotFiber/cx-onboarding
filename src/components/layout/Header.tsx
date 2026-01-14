import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, User, FileText, X, Settings, LogOut, ChevronDown } from 'lucide-react'
import Logo from '../ui/Logo'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../ui/StatusBadge'
import NotificationCenter from '../features/NotificationCenter'
import { currentUser, roleLabels } from '../../data/teamMembers'

interface SearchResult {
  type: 'project' | 'customer' | 'task'
  id: string
  projectId?: string
  title: string
  subtitle: string
  status?: string
}

export default function Header() {
  const navigate = useNavigate()
  const { state, getCustomer, getBuilding } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search logic
  const getSearchResults = (): SearchResult[] => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search projects
    state.projects.forEach(project => {
      const customer = getCustomer(project.customerId)
      const building = getBuilding(project.buildingId)

      const matchesProject =
        project.serviceOrderId.toLowerCase().includes(query) ||
        project.product.toLowerCase().includes(query) ||
        project.serviceBandwidth.toLowerCase().includes(query) ||
        customer?.companyName.toLowerCase().includes(query) ||
        building?.address.toLowerCase().includes(query) ||
        project.cxAssignee?.toLowerCase().includes(query)

      if (matchesProject) {
        results.push({
          type: 'project',
          id: project.id,
          title: customer?.companyName || 'Unknown Customer',
          subtitle: `${project.product} • ${building?.address || ''}`,
          status: project.status
        })
      }

      // Search tasks within projects
      project.tasks.forEach(task => {
        if (task.title.toLowerCase().includes(query)) {
          results.push({
            type: 'task',
            id: task.id,
            projectId: project.id,
            title: task.title,
            subtitle: `${customer?.companyName} • ${task.section}`,
            status: task.completed ? 'completed' : 'pending'
          })
        }
      })
    })

    // Search customers (contacts)
    state.customers.forEach(customer => {
      const matchesCustomer =
        customer.companyName.toLowerCase().includes(query) ||
        customer.contacts.some(c =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
        )

      if (matchesCustomer) {
        // Find projects for this customer
        const customerProjects = state.projects.filter(p => p.customerId === customer.id)
        if (customerProjects.length > 0) {
          results.push({
            type: 'customer',
            id: customer.id,
            projectId: customerProjects[0].id,
            title: customer.companyName,
            subtitle: `${customerProjects.length} project${customerProjects.length > 1 ? 's' : ''}`
          })
        }
      }
    })

    // Dedupe and limit results
    const seen = new Set<string>()
    return results.filter(r => {
      const key = `${r.type}-${r.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 10)
  }

  const results = getSearchResults()

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery('')
    setIsSearchFocused(false)
    if (result.type === 'task' && result.projectId) {
      navigate(`/projects/${result.projectId}?tab=tasks`)
    } else if (result.type === 'customer' && result.projectId) {
      navigate(`/projects/${result.projectId}`)
    } else {
      navigate(`/projects/${result.id}`)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileText className="w-4 h-4 text-gray-400" />
      case 'customer': return <User className="w-4 h-4 text-gray-400" />
      case 'task': return <Building2 className="w-4 h-4 text-gray-400" />
      default: return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Logo />
        <span className="text-lg font-semibold text-pilot-secondary">CX Onboarding</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or press ⌘K..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-10 pr-16 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-80"
          />
          {!searchQuery && (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              ⌘K
            </kbd>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <ul>
                  {results.map((result, idx) => (
                    <li key={`${result.type}-${result.id}-${idx}`}>
                      <button
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                      >
                        <div className="mt-0.5">{getResultIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{result.title}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                              {result.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                        {result.status && (
                          <StatusBadge status={result.status as any} size="sm" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <NotificationCenter />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-pilot-primary flex items-center justify-center text-sm font-semibold text-pilot-secondary">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{roleLabels[currentUser.role]}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/profile')
                    setIsProfileOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/profile')
                    setIsProfileOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => {
                    // In a real app, this would log the user out
                    alert('Logout functionality would go here')
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
