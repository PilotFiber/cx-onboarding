import { useState } from 'react'
import {
  Users,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle,
} from 'lucide-react'
import { Project, Customer } from '../../types'
import Card from '../ui/Card'
import {
  calculateCapacityPlanning,
  getCapacityStatusColor,
  getCapacityStatusBgColor,
  getUtilizationColor,
  TeamMemberCapacity,
  DayCapacity,
} from '../../utils/capacityPlanning'

interface CapacityPlanningProps {
  projects: Project[]
  customers: Customer[]
}

export default function CapacityPlanning({ projects, customers }: CapacityPlanningProps) {
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [showAllDays, setShowAllDays] = useState(false)

  const customerMap = new Map(customers.map(c => [c.id, c.companyName]))
  const getCustomerName = (customerId: string) => customerMap.get(customerId) || 'Unknown'

  const capacity = calculateCapacityPlanning(projects, getCustomerName)

  const toggleMember = (memberId: string) => {
    setExpandedMember(prev => (prev === memberId ? null : memberId))
  }

  const displayedDays = showAllDays ? capacity.dailySchedule : capacity.dailySchedule.slice(0, 7)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Active Projects</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{capacity.summary.totalActiveProjects}</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Scheduled (14d)</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{capacity.summary.totalScheduledInstalls}</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Available Slots</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{capacity.summary.availableSlots}</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Overloaded</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{capacity.summary.overloadedMembers}</p>
          <p className="text-xs text-gray-500">team members</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Busiest Day</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{capacity.summary.busiestDay}</p>
          <p className="text-xs text-gray-500">{capacity.summary.busiestDayCount} installs</p>
        </Card>
      </div>

      {/* Recommendations */}
      {capacity.recommendations.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-medium text-gray-900">Recommendations</h3>
          </div>
          <div className="space-y-2">
            {capacity.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-yellow-500">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Capacity */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Team Capacity</h3>
        </div>

        <div className="space-y-3">
          {capacity.teamCapacity.map(member => (
            <TeamMemberRow
              key={member.member.id}
              capacity={member}
              isExpanded={expandedMember === member.member.id}
              onToggle={() => toggleMember(member.member.id)}
            />
          ))}
        </div>
      </Card>

      {/* Schedule Calendar */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Installation Schedule</h3>
          </div>
          <button
            onClick={() => setShowAllDays(!showAllDays)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showAllDays ? 'Show 7 days' : 'Show 14 days'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {displayedDays.map(day => (
            <DayCell key={day.dateString} day={day} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 rounded" />
            Busy
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded" />
            Over Capacity
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded" />
            Weekend
          </span>
        </div>
      </Card>

      {/* Conflicts */}
      {capacity.conflicts.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-gray-900">Scheduling Conflicts</h3>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {capacity.conflicts.length}
            </span>
          </div>

          <div className="space-y-2">
            {capacity.conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-900">{conflict.dateString}</div>
                  <div className="text-sm text-red-600">{conflict.message}</div>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                  {conflict.count} installs
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

interface TeamMemberRowProps {
  capacity: TeamMemberCapacity
  isExpanded: boolean
  onToggle: () => void
}

function TeamMemberRow({ capacity, isExpanded, onToggle }: TeamMemberRowProps) {
  const { member, activeProjects, utilizationPercent, status, upcomingInstalls } = capacity

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-500">{member.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-900">{activeProjects}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">{capacity.scheduledThisWeek}</p>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">{capacity.scheduledNextWeek}</p>
              <p className="text-xs text-gray-500">Next Week</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="w-24">
            <div className="flex justify-between text-xs mb-1">
              <span className={getCapacityStatusColor(status)}>{utilizationPercent}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getUtilizationColor(utilizationPercent)}`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`px-2 py-1 text-xs font-medium rounded capitalize ${getCapacityStatusBgColor(status)} ${getCapacityStatusColor(status)}`}
          >
            {status}
          </span>

          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && upcomingInstalls.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Upcoming Installs</p>
          <div className="space-y-2">
            {upcomingInstalls.map(install => (
              <div
                key={install.projectId}
                className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{install.customerName}</p>
                  <p className="text-xs text-gray-500">
                    {install.product} - {install.bandwidth}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {install.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && upcomingInstalls.length === 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">No upcoming installs scheduled</p>
        </div>
      )}
    </div>
  )
}

interface DayCellProps {
  day: DayCapacity
}

function DayCell({ day }: DayCellProps) {
  const isWeekend = day.dayOfWeek === 'Sat' || day.dayOfWeek === 'Sun'

  let bgColor = 'bg-green-50'
  if (isWeekend && day.totalInstalls === 0) {
    bgColor = 'bg-gray-50'
  } else if (day.isOverCapacity) {
    bgColor = 'bg-red-100'
  } else if (day.totalInstalls >= 4) {
    bgColor = 'bg-yellow-100'
  } else if (day.totalInstalls > 0) {
    bgColor = 'bg-blue-50'
  }

  return (
    <div
      className={`p-2 rounded-lg border ${day.isOverCapacity ? 'border-red-300' : 'border-gray-200'} ${bgColor}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">{day.dayOfWeek}</span>
        <span className="text-xs text-gray-600">{day.dateString}</span>
      </div>

      {day.totalInstalls > 0 ? (
        <div>
          <p className={`text-lg font-bold ${day.isOverCapacity ? 'text-red-600' : 'text-gray-900'}`}>
            {day.totalInstalls}
          </p>
          <p className="text-xs text-gray-500">
            install{day.totalInstalls !== 1 ? 's' : ''}
          </p>
          {/* Show assignees */}
          <div className="mt-1 space-y-0.5">
            {day.installs.slice(0, 3).map((install, idx) => (
              <p key={idx} className="text-xs text-gray-600 truncate" title={install.customerName}>
                {install.cxAssignee.split(' ')[0]}
              </p>
            ))}
            {day.installs.length > 3 && (
              <p className="text-xs text-gray-400">+{day.installs.length - 3} more</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-lg font-bold text-gray-300">-</p>
          <p className="text-xs text-gray-400">{isWeekend ? 'weekend' : 'available'}</p>
        </div>
      )}
    </div>
  )
}
