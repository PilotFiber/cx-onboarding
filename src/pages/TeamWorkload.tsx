import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { teamMembers } from '../data/teamMembers'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import StatusBadge from '../components/ui/StatusBadge'

interface TeamMemberStats {
  id: string
  name: string
  activeProjects: number
  completedThisMonth: number
  pastFoc: number
  atRisk: number
  installingToday: number
  avgDaysToComplete: number | null
}

export default function TeamWorkload() {
  const navigate = useNavigate()
  const { state, getCustomer } = useApp()

  const teamStats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return teamMembers.map((member): TeamMemberStats => {
      const memberProjects = state.projects.filter(p => p.cxAssignee === member.name)
      const activeProjects = memberProjects.filter(p => p.status !== 'completed')
      const completedThisMonth = memberProjects.filter(p => {
        if (p.status !== 'completed') return false
        const updated = new Date(p.updatedAt)
        return updated >= monthStart
      })

      const pastFoc = activeProjects.filter(p => {
        const foc = new Date(p.focDate)
        return foc < now
      })

      // At risk: within 2 days of FOC and not scheduled
      const atRisk = activeProjects.filter(p => {
        if (p.status === 'scheduled' || p.status === 'confirmed' || p.status === 'installing') return false
        const foc = new Date(p.focDate)
        const daysUntilFoc = (foc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return daysUntilFoc <= 2 && daysUntilFoc > 0
      })

      const installingToday = activeProjects.filter(p => {
        if (!p.scheduledDate) return false
        const scheduled = new Date(p.scheduledDate)
        return scheduled.toDateString() === now.toDateString()
      })

      // Calculate average days to complete
      const completedWithDates = memberProjects.filter(p => p.status === 'completed' && p.handoffDate)
      let avgDays: number | null = null
      if (completedWithDates.length > 0) {
        const totalDays = completedWithDates.reduce((sum, p) => {
          const handoff = new Date(p.handoffDate)
          const completed = new Date(p.updatedAt)
          return sum + (completed.getTime() - handoff.getTime()) / (1000 * 60 * 60 * 24)
        }, 0)
        avgDays = Math.round(totalDays / completedWithDates.length)
      }

      return {
        id: member.id,
        name: member.name,
        activeProjects: activeProjects.length,
        completedThisMonth: completedThisMonth.length,
        pastFoc: pastFoc.length,
        atRisk: atRisk.length,
        installingToday: installingToday.length,
        avgDaysToComplete: avgDays,
      }
    })
  }, [state.projects])

  const totalStats = useMemo(() => {
    return {
      totalActive: teamStats.reduce((sum, m) => sum + m.activeProjects, 0),
      totalCompleted: teamStats.reduce((sum, m) => sum + m.completedThisMonth, 0),
      totalPastFoc: teamStats.reduce((sum, m) => sum + m.pastFoc, 0),
      totalAtRisk: teamStats.reduce((sum, m) => sum + m.atRisk, 0),
    }
  }, [teamStats])

  // Get escalated projects
  const escalatedProjects = state.projects.filter(p => p.isEscalated && p.status !== 'completed')

  // Get at-risk projects (close to FOC, not scheduled)
  const atRiskProjects = useMemo(() => {
    const now = new Date()
    return state.projects.filter(p => {
      if (p.status === 'completed' || p.status === 'scheduled' || p.status === 'confirmed' || p.status === 'installing') return false
      const foc = new Date(p.focDate)
      const daysUntilFoc = (foc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return daysUntilFoc <= 3 && daysUntilFoc > 0
    })
  }, [state.projects])

  const teamColumns = [
    {
      key: 'name',
      label: 'Team Member',
      width: '2fr',
      render: (row: TeamMemberStats) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      )
    },
    {
      key: 'active',
      label: 'Active',
      width: '1fr',
      render: (row: TeamMemberStats) => (
        <span className="text-gray-700">{row.activeProjects}</span>
      )
    },
    {
      key: 'completed',
      label: 'Completed (MTD)',
      width: '1fr',
      render: (row: TeamMemberStats) => (
        <span className="text-green-600 font-medium">{row.completedThisMonth}</span>
      )
    },
    {
      key: 'pastFoc',
      label: 'Past FOC',
      width: '1fr',
      render: (row: TeamMemberStats) => (
        row.pastFoc > 0 ? (
          <span className="text-red-600 font-medium">{row.pastFoc}</span>
        ) : (
          <span className="text-gray-400">0</span>
        )
      )
    },
    {
      key: 'atRisk',
      label: 'At Risk',
      width: '1fr',
      render: (row: TeamMemberStats) => (
        row.atRisk > 0 ? (
          <span className="text-yellow-600 font-medium">{row.atRisk}</span>
        ) : (
          <span className="text-gray-400">0</span>
        )
      )
    },
    {
      key: 'today',
      label: 'Installing Today',
      width: '1fr',
      render: (row: TeamMemberStats) => (
        row.installingToday > 0 ? (
          <span className="text-blue-600 font-medium">{row.installingToday}</span>
        ) : (
          <span className="text-gray-400">0</span>
        )
      )
    },
    {
      key: 'avgDays',
      label: 'Avg Days',
      width: '1fr',
      render: (row: TeamMemberStats) => (
        row.avgDaysToComplete !== null ? (
          <span className="text-gray-700">{row.avgDaysToComplete}d</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Workload</h1>
        <p className="text-gray-600">Monitor team capacity and project distribution</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalActive}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed (MTD)</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCompleted}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Past FOC</p>
              <p className="text-2xl font-bold text-red-600">{totalStats.totalPastFoc}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{totalStats.totalAtRisk}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h2>
        <Table
          columns={teamColumns}
          data={teamStats}
          emptyMessage="No team members found"
        />
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Escalated Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Escalated Projects
            </h2>
            {escalatedProjects.length > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {escalatedProjects.length}
              </span>
            )}
          </div>
          {escalatedProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No escalated projects</p>
          ) : (
            <ul className="space-y-3">
              {escalatedProjects.slice(0, 5).map(project => {
                const customer = getCustomer(project.customerId)
                return (
                  <li
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{customer?.companyName}</p>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.escalationReason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned: {project.cxAssignee || 'Unassigned'}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* At Risk Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              At Risk (FOC within 3 days)
            </h2>
            {atRiskProjects.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {atRiskProjects.length}
              </span>
            )}
          </div>
          {atRiskProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No at-risk projects</p>
          ) : (
            <ul className="space-y-3">
              {atRiskProjects.slice(0, 5).map(project => {
                const customer = getCustomer(project.customerId)
                const daysUntilFoc = Math.ceil(
                  (new Date(project.focDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <li
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{customer?.companyName}</p>
                      <span className="text-sm text-yellow-700 font-medium">
                        {daysUntilFoc}d to FOC
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <StatusBadge status={project.status} size="sm" />
                      <p className="text-xs text-gray-500">
                        {project.cxAssignee || 'Unassigned'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
