import { useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Target,
  DollarSign
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { teamMembers } from '../data/teamMembers'
import Card from '../components/ui/Card'
import StatsCard from '../components/features/StatsCard'
import RevenueForecast from '../components/features/RevenueForecast'
import CapacityPlanning from '../components/features/CapacityPlanning'
import NPSTracking from '../components/features/NPSTracking'
import { mockNPSResponses } from '../data/mockNPSData'

export default function Reports() {
  const { state } = useApp()

  const metrics = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    // Projects completed this month
    const completedThisMonth = state.projects.filter(p => {
      if (p.status !== 'completed') return false
      const updated = new Date(p.updatedAt)
      return updated.getMonth() === thisMonth && updated.getFullYear() === thisYear
    })

    // Active projects
    const activeProjects = state.projects.filter(p => p.status !== 'completed')

    // Projects past FOC
    const pastFoc = activeProjects.filter(p => new Date(p.focDate) < now)

    // Escalated projects
    const escalated = activeProjects.filter(p => p.isEscalated)

    // Average days from handoff to completion (completed projects)
    const completedWithTimes = state.projects.filter(p => p.status === 'completed')
    const avgDaysToComplete = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, p) => {
          const handoff = new Date(p.handoffDate)
          const completed = new Date(p.updatedAt)
          return sum + Math.ceil((completed.getTime() - handoff.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / completedWithTimes.length
      : 0

    // On-time rate (completed before or on FOC)
    const onTime = completedWithTimes.filter(p => {
      const foc = new Date(p.focDate)
      const completed = new Date(p.updatedAt)
      return completed <= foc
    })
    const onTimeRate = completedWithTimes.length > 0
      ? (onTime.length / completedWithTimes.length) * 100
      : 0

    // Projects by status
    const byStatus = {
      new: state.projects.filter(p => p.status === 'new').length,
      reviewing: state.projects.filter(p => p.status === 'reviewing').length,
      scheduled: state.projects.filter(p => p.status === 'scheduled').length,
      confirmed: state.projects.filter(p => p.status === 'confirmed').length,
      installing: state.projects.filter(p => p.status === 'installing').length,
      completed: state.projects.filter(p => p.status === 'completed').length,
    }

    // Projects by type
    const byType: Record<string, number> = {}
    state.projects.forEach(p => {
      byType[p.projectType] = (byType[p.projectType] || 0) + 1
    })

    // Team member stats
    const teamStats = teamMembers.map(member => {
      const memberProjects = state.projects.filter(p => p.cxAssignee === member.name)
      const active = memberProjects.filter(p => p.status !== 'completed').length
      const completed = memberProjects.filter(p => p.status === 'completed').length
      const escalatedCount = memberProjects.filter(p => p.isEscalated && p.status !== 'completed').length
      return {
        name: member.name,
        active,
        completed,
        escalated: escalatedCount,
        total: memberProjects.length
      }
    }).sort((a, b) => b.active - a.active)

    // Recent completions (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentCompletions = state.projects.filter(p => {
      if (p.status !== 'completed') return false
      return new Date(p.updatedAt) >= sevenDaysAgo
    })

    // Installed MRR this month (sum of MRC from completed projects this month)
    const installedMrrThisMonth = completedThisMonth.reduce((sum, p) => sum + (p.mrc || 0), 0)

    return {
      completedThisMonth: completedThisMonth.length,
      activeProjects: activeProjects.length,
      pastFoc: pastFoc.length,
      escalated: escalated.length,
      avgDaysToComplete: Math.round(avgDaysToComplete),
      onTimeRate: Math.round(onTimeRate),
      byStatus,
      byType,
      teamStats,
      recentCompletions: recentCompletions.length,
      totalProjects: state.projects.length,
      installedMrrThisMonth
    }
  }, [state.projects])

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    reviewing: 'bg-yellow-500',
    scheduled: 'bg-cyan-500',
    confirmed: 'bg-green-500',
    installing: 'bg-orange-500',
    completed: 'bg-gray-400',
  }

  const typeLabels: Record<string, string> = {
    'standard-on-net': 'Standard On-Net',
    'new-build': 'New Build',
    'contract-labor': 'Contract Labor',
    'montgomery': 'Montgomery',
    'coex': 'Co-Ex',
    'after-hours': 'After Hours',
    'dark-fiber': 'Dark Fiber',
    'wavelength': 'Wavelength',
    'ethernet-transport': 'Ethernet Transport',
    'ip-transit': 'IP Transit',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-6">
        <StatsCard
          title="Completed This Month"
          value={metrics.completedThisMonth}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Installed MRR (This Month)"
          value={`$${metrics.installedMrrThisMonth.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Active Projects"
          value={metrics.activeProjects}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Avg Days to Install"
          value={metrics.avgDaysToComplete}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatsCard
          title="On-Time Rate"
          value={`${metrics.onTimeRate}%`}
          icon={<Target className="w-6 h-6" />}
          color={metrics.onTimeRate >= 80 ? 'green' : metrics.onTimeRate >= 60 ? 'yellow' : 'red'}
        />
      </div>

      {/* Revenue Forecast */}
      <RevenueForecast projects={state.projects} customers={state.customers} />

      {/* Capacity Planning */}
      <CapacityPlanning projects={state.projects} customers={state.customers} />

      {/* NPS Tracking */}
      <NPSTracking responses={mockNPSResponses} customers={state.customers} />

      <div className="grid grid-cols-3 gap-6">
        {/* Projects by Status */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Projects by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                <span className="flex-1 capitalize text-gray-700">{status}</span>
                <span className="font-medium text-gray-900">{count}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[status]}`}
                    style={{ width: `${(count / metrics.totalProjects) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Projects by Type */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Projects by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics.byType)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="flex-1 text-gray-700 text-sm">{typeLabels[type] || type}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pilot-primary"
                      style={{ width: `${(count / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Alerts Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Attention Required
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-gray-700">Escalated</span>
              </div>
              <span className="text-xl font-bold text-red-600">{metrics.escalated}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">Past FOC</span>
              </div>
              <span className="text-xl font-bold text-orange-600">{metrics.pastFoc}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Completed (7 days)</span>
              </div>
              <span className="text-xl font-bold text-green-600">{metrics.recentCompletions}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-pilot-primary text-pilot-secondary text-sm">
                <th className="text-left px-4 py-3 font-semibold">Team Member</th>
                <th className="text-center px-4 py-3 font-semibold">Active</th>
                <th className="text-center px-4 py-3 font-semibold">Completed</th>
                <th className="text-center px-4 py-3 font-semibold">Escalated</th>
                <th className="text-center px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.teamStats.map((member) => (
                <tr key={member.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {member.active}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-medium">
                      {member.completed}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {member.escalated > 0 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full font-medium">
                        {member.escalated}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{member.total}</td>
                  <td className="px-4 py-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          member.active > 8 ? 'bg-red-500' : member.active > 5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((member.active / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
