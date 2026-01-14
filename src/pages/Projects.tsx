import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Filter, Clock, Users, User, AlertTriangle, CheckSquare, Square, Download, UserPlus, Layers } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ProjectStatus, ProjectPriority, ProjectType, VIPTier } from '../types'
import { projectTypeConfigs } from '../data/projectTypes'
import { currentUser, teamMembers } from '../data/teamMembers'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Table from '../components/ui/Table'
import ProjectTypeBadge from '../components/ui/ProjectTypeBadge'
import ProjectGroupBadge from '../components/ui/ProjectGroupBadge'
import VIPBadge from '../components/ui/VIPBadge'
import NewProjectModal from '../components/features/NewProjectModal'
import HealthScoreBadge from '../components/features/HealthScoreBadge'
import AddressLink from '../components/ui/AddressLink'
import { getEffectiveVIPTier } from '../utils/vip'

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'installing', label: 'Installing' },
  { value: 'completed', label: 'Completed' },
]

type ViewMode = 'all' | 'my'

export default function Projects() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { state, getCustomer, getBuilding, getProjectGroup, dispatch } = useApp()

  const handleStatusChange = (projectId: string, status: ProjectStatus) => {
    dispatch({
      type: 'UPDATE_PROJECT_STATUS',
      payload: { projectId, status }
    })
  }

  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [vipFilter, setVipFilter] = useState<VIPTier | 'all' | 'vip-only'>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkStatus, setShowBulkStatus] = useState(false)
  const [showBulkAssignee, setShowBulkAssignee] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  // Read customer filter from URL params
  useEffect(() => {
    const customerParam = searchParams.get('customer')
    if (customerParam) {
      setCustomerFilter(customerParam)
    }
  }, [searchParams])

  // Get unique assignees
  const uniqueAssignees = Array.from(new Set(state.projects.map(p => p.cxAssignee).filter(Boolean))) as string[]

  const filteredProjects = state.projects.filter(p => {
    const customer = getCustomer(p.customerId)
    const vipTier = getEffectiveVIPTier(p, customer)

    // View mode filter
    if (viewMode === 'my' && p.cxAssignee !== currentUser.name) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false
    if (typeFilter !== 'all' && p.projectType !== typeFilter) return false
    if (assigneeFilter !== 'all' && p.cxAssignee !== assigneeFilter) return false
    if (customerFilter !== 'all' && p.customerId !== customerFilter) return false
    if (groupFilter !== 'all') {
      if (groupFilter === 'none' && p.projectGroupId) return false
      if (groupFilter !== 'none' && p.projectGroupId !== groupFilter) return false
    }
    // VIP filter
    if (vipFilter !== 'all') {
      if (vipFilter === 'vip-only' && vipTier === 'standard') return false
      if (vipFilter !== 'vip-only' && vipTier !== vipFilter) return false
    }
    return true
  }).sort((a, b) => {
    // Sort by VIP priority first, then by update date
    const customerA = getCustomer(a.customerId)
    const customerB = getCustomer(b.customerId)
    const vipBoostA = getEffectiveVIPTier(a, customerA) === 'standard' ? 0 :
      getEffectiveVIPTier(a, customerA) === 'silver' ? 1 :
      getEffectiveVIPTier(a, customerA) === 'gold' ? 2 : 3
    const vipBoostB = getEffectiveVIPTier(b, customerB) === 'standard' ? 0 :
      getEffectiveVIPTier(b, customerB) === 'silver' ? 1 :
      getEffectiveVIPTier(b, customerB) === 'gold' ? 2 : 3

    if (vipBoostB !== vipBoostA) return vipBoostB - vipBoostA
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const myProjectCount = state.projects.filter(p => p.cxAssignee === currentUser.name).length

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkStatusChange = (status: ProjectStatus) => {
    selectedIds.forEach(id => {
      dispatch({
        type: 'UPDATE_PROJECT_STATUS',
        payload: { projectId: id, status }
      })
    })
    setSelectedIds(new Set())
    setShowBulkStatus(false)
  }

  const handleBulkAssigneeChange = (assignee: string) => {
    selectedIds.forEach(id => {
      dispatch({
        type: 'UPDATE_PROJECT_ASSIGNEE',
        payload: { projectId: id, cxAssignee: assignee }
      })
    })
    setSelectedIds(new Set())
    setShowBulkAssignee(false)
  }

  const handleExportSelected = () => {
    const projectsToExport = filteredProjects.filter(p => selectedIds.has(p.id))
    const csvContent = generateCsv(projectsToExport)
    downloadCsv(csvContent, 'projects-export.csv')
    setSelectedIds(new Set())
  }

  const generateCsv = (projects: typeof filteredProjects) => {
    const headers = ['Company', 'Address', 'Product', 'Bandwidth', 'Status', 'FOC Date', 'Assignee', 'Group', 'Escalated']
    const rows = projects.map(p => {
      const customer = getCustomer(p.customerId)
      const building = getBuilding(p.buildingId)
      const group = p.projectGroupId ? getProjectGroup(p.projectGroupId) : null
      return [
        customer?.companyName || '',
        building?.address || '',
        p.product,
        p.serviceBandwidth,
        p.status,
        new Date(p.focDate).toLocaleDateString(),
        p.cxAssignee || 'Unassigned',
        group?.name || '',
        p.isEscalated ? 'Yes' : 'No'
      ]
    })
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'installing', label: 'Installing' },
    { value: 'completed', label: 'Completed' },
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.values(projectTypeConfigs).map(config => ({
      value: config.id,
      label: config.name
    }))
  ]

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    ...uniqueAssignees.map(name => ({
      value: name,
      label: name
    }))
  ]

  const groupOptions = [
    { value: 'all', label: 'All Groups' },
    { value: 'none', label: 'No Group' },
    ...state.projectGroups.map(group => ({
      value: group.id,
      label: group.name
    }))
  ]

  const customerOptions = [
    { value: 'all', label: 'All Customers' },
    ...state.customers.map(c => ({
      value: c.id,
      label: c.companyName
    }))
  ]

  // Get currently filtered customer name for display
  const filteredCustomerName = customerFilter !== 'all'
    ? state.customers.find(c => c.id === customerFilter)?.companyName
    : null

  const vipOptions = [
    { value: 'all', label: 'All VIP Levels' },
    { value: 'vip-only', label: 'VIP Only' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'standard', label: 'Standard' },
  ]

  const columns = [
    {
      key: 'select',
      label: '',
      width: '40px',
      render: (row: typeof filteredProjects[0]) => (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleSelectOne(row.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {selectedIds.has(row.id) ? (
              <CheckSquare className="w-5 h-5 text-pilot-secondary" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      width: '2fr',
      render: (row: typeof filteredProjects[0]) => {
        const customer = getCustomer(row.customerId)
        const activeBlockers = row.blockers.filter(b => !b.resolvedAt).length
        const vipTier = getEffectiveVIPTier(row, customer)
        return (
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (customer) navigate(`/customers/${customer.id}`)
                }}
                className="font-medium text-gray-900 hover:text-pilot-secondary hover:underline"
              >
                {customer?.companyName}
              </button>
              <VIPBadge tier={vipTier} size="sm" showLabel={false} />
              {row.isEscalated && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                  <AlertTriangle className="w-3 h-3" />
                </span>
              )}
              {activeBlockers > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  {activeBlockers} blocker{activeBlockers > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{row.cxAssignee || 'Unassigned'}</p>
          </div>
        )
      }
    },
    {
      key: 'type',
      label: 'Type',
      width: '1.5fr',
      render: (row: typeof filteredProjects[0]) => (
        <ProjectTypeBadge type={row.projectType} size="sm" />
      )
    },
    {
      key: 'group',
      label: 'Group',
      width: '1.5fr',
      render: (row: typeof filteredProjects[0]) => {
        if (!row.projectGroupId) {
          return <span className="text-gray-400 text-sm">—</span>
        }
        const group = getProjectGroup(row.projectGroupId)
        if (!group) return <span className="text-gray-400 text-sm">—</span>
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ProjectGroupBadge group={group} size="sm" showIcon={false} />
          </div>
        )
      }
    },
    {
      key: 'building',
      label: 'Building',
      width: '2fr',
      render: (row: typeof filteredProjects[0]) => {
        const building = getBuilding(row.buildingId)
        if (!building) return <span className="text-gray-400">Unknown</span>
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <AddressLink building={building} className="text-gray-700" />
            <p className="text-sm text-gray-500">{building.city}, {building.state}</p>
          </div>
        )
      }
    },
    {
      key: 'service',
      label: 'Service',
      width: '1.5fr',
      render: (row: typeof filteredProjects[0]) => (
        <div>
          <p className="text-gray-700">{row.product}</p>
          <p className="text-sm text-gray-500">{row.serviceBandwidth}</p>
        </div>
      )
    },
    {
      key: 'foc',
      label: 'FOC Date',
      width: '1fr',
      render: (row: typeof filteredProjects[0]) => (
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700">
            {new Date(row.focDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '1.5fr',
      render: (row: typeof filteredProjects[0]) => (
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value as ProjectStatus)}
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-pilot-primary cursor-pointer"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )
    },
    {
      key: 'health',
      label: 'Health',
      width: '80px',
      render: (row: typeof filteredProjects[0]) => (
        <HealthScoreBadge project={row} size="sm" />
      )
    },
  ]

  const hasFilters = statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' || assigneeFilter !== 'all' || groupFilter !== 'all' || vipFilter !== 'all' || customerFilter !== 'all'

  const clearAllFilters = () => {
    setStatusFilter('all')
    setPriorityFilter('all')
    setTypeFilter('all')
    setAssigneeFilter('all')
    setGroupFilter('all')
    setVipFilter('all')
    setCustomerFilter('all')
    // Clear URL params
    setSearchParams({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            {hasFilters && ' (filtered)'}
          </p>
        </div>
        <Button onClick={() => setShowNewProjectModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          All Projects
        </button>
        <button
          onClick={() => setViewMode('my')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'my'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          My Projects
          {myProjectCount > 0 && (
            <span className="bg-pilot-primary text-pilot-secondary text-xs px-1.5 py-0.5 rounded-full">
              {myProjectCount}
            </span>
          )}
        </button>
      </div>

      {/* Customer Filter Banner */}
      {filteredCustomerName && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-700">
              Showing projects for <span className="font-semibold">{filteredCustomerName}</span>
            </span>
          </div>
          <button
            onClick={() => {
              setCustomerFilter('all')
              setSearchParams({})
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Show all projects
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        <Select
          options={customerOptions}
          value={customerFilter}
          onChange={(val) => {
            setCustomerFilter(val)
            if (val === 'all') {
              setSearchParams({})
            } else {
              setSearchParams({ customer: val })
            }
          }}
          className="w-48"
        />
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(val) => setTypeFilter(val as ProjectType | 'all')}
          className="w-48"
        />
        <Select
          options={statusFilterOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as ProjectStatus | 'all')}
          className="w-40"
        />
        <Select
          options={priorityOptions}
          value={priorityFilter}
          onChange={(val) => setPriorityFilter(val as ProjectPriority | 'all')}
          className="w-40"
        />
        <Select
          options={assigneeOptions}
          value={assigneeFilter}
          onChange={(val) => setAssigneeFilter(val)}
          className="w-44"
        />
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4 text-gray-400" />
          <Select
            options={groupOptions}
            value={groupFilter}
            onChange={(val) => setGroupFilter(val)}
            className="w-44"
          />
        </div>
        <Select
          options={vipOptions}
          value={vipFilter}
          onChange={(val) => setVipFilter(val as VIPTier | 'all' | 'vip-only')}
          className="w-40"
        />
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-pilot-secondary text-white rounded-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="p-1 hover:bg-pilot-primary/20 rounded"
            >
              {selectedIds.size === filteredProjects.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="font-medium">{selectedIds.size} selected</span>
          </div>
          <div className="h-6 w-px bg-white/30" />
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowBulkStatus(!showBulkStatus)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              Change Status
            </button>
            {showBulkStatus && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleBulkStatusChange(opt.value as ProjectStatus)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowBulkAssignee(!showBulkAssignee)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Assign
            </button>
            {showBulkAssignee && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                <button
                  onClick={() => handleBulkAssigneeChange('')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Unassigned
                </button>
                {teamMembers.map(tm => (
                  <button
                    key={tm.id}
                    onClick={() => handleBulkAssigneeChange(tm.name)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {tm.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExportSelected}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Select All Helper */}
      {selectedIds.size === 0 && filteredProjects.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            <Square className="w-4 h-4" />
            Select all {filteredProjects.length} projects
          </button>
        </div>
      )}

      {/* Projects Table */}
      <Table
        columns={columns}
        data={filteredProjects}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        emptyMessage="No projects match your filters"
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  )
}
