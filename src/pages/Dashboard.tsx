import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Ticket,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  AlertOctagon,
  Activity,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import StatsCard from '../components/features/StatsCard'
import StatusBadge from '../components/ui/StatusBadge'
import SLAIndicator from '../components/features/SLAIndicator'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Card from '../components/ui/Card'
import HealthScoreBadge from '../components/features/HealthScoreBadge'
import { calculateHealthScore } from '../utils/healthScore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { state, getCustomer, getBuilding } = useApp()

  const activeProjects = state.projects.filter(p => p.status !== 'completed')
  const openTickets = state.tickets.filter(t => t.status === 'open' || t.status === 'pending')
  const todayInstalls = state.projects.filter(p => {
    if (!p.scheduledDate) return false
    const scheduled = new Date(p.scheduledDate)
    const today = new Date()
    return (
      scheduled.getDate() === today.getDate() &&
      scheduled.getMonth() === today.getMonth() &&
      scheduled.getFullYear() === today.getFullYear()
    )
  })
  const overdueProjects = state.projects.filter(p => {
    if (p.status === 'completed') return false
    const focDate = new Date(p.focDate)
    return focDate < new Date()
  })

  const escalatedProjects = state.projects.filter(p => p.isEscalated && p.status !== 'completed')

  // Projects needing attention (low health scores)
  const projectsNeedingAttention = activeProjects
    .map(p => ({ project: p, health: calculateHealthScore(p) }))
    .filter(({ health }) => health.level === 'critical' || health.level === 'at-risk')
    .sort((a, b) => a.health.score - b.health.score)
    .slice(0, 5)

  // Active projects created in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentHandoffs = state.projects
    .filter(p => new Date(p.createdAt) >= sevenDaysAgo && p.status !== 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      width: '2fr',
      render: (row: typeof recentHandoffs[0]) => {
        const customer = getCustomer(row.customerId)
        return (
          <div>
            <p className="font-medium text-gray-900">{customer?.companyName}</p>
            <p className="text-sm text-gray-500 font-mono">{row.serviceOrderId}</p>
          </div>
        )
      }
    },
    {
      key: 'building',
      label: 'Building',
      width: '2fr',
      render: (row: typeof recentHandoffs[0]) => {
        const building = getBuilding(row.buildingId)
        return <span className="text-gray-700">{building?.address}</span>
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '1fr',
      render: (row: typeof recentHandoffs[0]) => (
        <StatusBadge status={row.status} size="sm" />
      )
    },
    {
      key: 'foc',
      label: 'FOC',
      width: '1fr',
      render: (row: typeof recentHandoffs[0]) => (
        <SLAIndicator deadline={row.focDate} />
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <Button onClick={() => navigate('/projects')}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4">
        <StatsCard
          title="Active Projects"
          value={activeProjects.length}
          icon={<FolderKanban className="w-6 h-6" />}
          color="yellow"
        />
        <StatsCard
          title="Open Tickets"
          value={openTickets.length}
          icon={<Ticket className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Installing Today"
          value={todayInstalls.length}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Escalated"
          value={escalatedProjects.length}
          icon={<AlertOctagon className="w-6 h-6" />}
          color={escalatedProjects.length > 0 ? 'red' : 'gray'}
        />
        <StatsCard
          title="Past FOC"
          value={overdueProjects.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={overdueProjects.length > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Needs Attention Section */}
      {projectsNeedingAttention.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Needs Attention
            </h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {projectsNeedingAttention.length} project{projectsNeedingAttention.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {projectsNeedingAttention.map(({ project, health }) => {
              const customer = getCustomer(project.customerId)
              const topIssue = health.factors.find(f => f.impact === 'negative')
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">
                      {customer?.companyName}
                    </p>
                    <HealthScoreBadge project={project} size="sm" />
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                  {topIssue && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {topIssue.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Handoffs */}
        <div className="col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Handoffs</h2>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <Table
              columns={columns}
              data={recentHandoffs}
              onRowClick={(row) => navigate(`/projects/${row.id}`)}
              emptyMessage="No new handoffs in the last 7 days"
            />
          </Card>
        </div>

        {/* Escalated Projects */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                Escalated
              </h2>
              {escalatedProjects.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {escalatedProjects.length} active
                </span>
              )}
            </div>

            {escalatedProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertOctagon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No escalated projects</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {escalatedProjects.slice(0, 5).map((project) => {
                  const customer = getCustomer(project.customerId)
                  return (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{customer?.companyName}</p>
                      {project.escalationReason && (
                        <p className="text-sm text-red-700 mt-1 line-clamp-2">{project.escalationReason}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={project.status} size="sm" />
                        <span className="text-xs text-gray-500">
                          {project.escalatedBy}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* FOC Alerts */}
          <Card className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">FOC Alerts</h2>
              {overdueProjects.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {overdueProjects.length} past FOC
                </span>
              )}
            </div>

            {overdueProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No projects past FOC</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {overdueProjects.slice(0, 5).map((project) => {
                  const customer = getCustomer(project.customerId)
                  return (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{customer?.companyName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge status={project.status} size="sm" />
                        <SLAIndicator deadline={project.focDate} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Open Tickets */}
          <Card className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Open Tickets</h2>
              <button
                onClick={() => navigate('/tickets')}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {openTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>All caught up!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {openTickets.slice(0, 3).map((ticket) => (
                  <li
                    key={ticket.id}
                    onClick={() => navigate(`/projects/${ticket.projectId}?tab=tickets`)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      ticket.status === 'open'
                        ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100'
                        : 'bg-yellow-50 border-l-4 border-yellow-500 hover:bg-yellow-100'
                    }`}
                  >
                    <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ticket.status}
                      </span>
                      {ticket.requiresResponse && (
                        <span className="text-red-600 text-xs">Response needed</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
