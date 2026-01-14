import { useState } from 'react'
import { CheckCircle2, Circle, AlertCircle, User, ChevronDown } from 'lucide-react'
import { Project, ReadinessTask } from '../../types'
import { teamMembers } from '../../data/teamMembers'

interface ReadinessChecklistProps {
  project: Project
  onUpdateTask?: (taskId: string, updates: Partial<ReadinessTask>) => void
}

export default function ReadinessChecklist({ project, onUpdateTask }: ReadinessChecklistProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const checklistItems = project.readinessTasks || []

  const completedItems = checklistItems.filter(item => item.completed)
  const criticalIncomplete = checklistItems.filter(item => item.critical && !item.completed)
  const progress = checklistItems.length > 0
    ? Math.round((completedItems.length / checklistItems.length) * 100)
    : 0

  const isReady = criticalIncomplete.length === 0

  const handleToggleComplete = (task: ReadinessTask) => {
    if (onUpdateTask) {
      onUpdateTask(task.id, { completed: !task.completed })
    }
  }

  const handleAssigneeChange = (taskId: string, assignee: string) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { assignee: assignee || undefined })
    }
    setExpandedTask(null)
  }

  const handleDueDateChange = (taskId: string, dueDate: string) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { dueDate: dueDate || undefined })
    }
  }

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return { label: 'Today', className: 'text-orange-600 bg-orange-50' }
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return { label: 'Tomorrow', className: 'text-blue-600 bg-blue-50' }
    }
    if (date < today) {
      return { label: 'Overdue', className: 'text-red-600 bg-red-50' }
    }
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      className: 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Install Readiness</h3>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isReady ? 'bg-green-500' : progress > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${isReady ? 'text-green-600' : 'text-gray-600'}`}>
            {progress}%
          </span>
        </div>
      </div>

      {!isReady && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {criticalIncomplete.length} critical item{criticalIncomplete.length > 1 ? 's' : ''} incomplete
            </span>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {checklistItems.map(task => {
          const isExpanded = expandedTask === task.id
          const dueDateInfo = formatDueDate(task.dueDate)

          return (
            <li
              key={task.id}
              className={`rounded-lg border transition-colors ${
                task.completed
                  ? 'bg-gray-50 border-gray-100'
                  : task.critical
                    ? 'bg-white border-red-200'
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 p-2">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="flex-shrink-0"
                  disabled={!onUpdateTask}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className={`w-5 h-5 ${task.critical ? 'text-red-400' : 'text-gray-300'} hover:text-gray-400`} />
                  )}
                </button>

                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.label}
                </span>

                {task.critical && !task.completed && (
                  <span className="text-xs text-red-600 font-medium px-1.5 py-0.5 bg-red-50 rounded">Required</span>
                )}

                {dueDateInfo && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${dueDateInfo.className}`}>
                    {dueDateInfo.label}
                  </span>
                )}

                {task.assignee && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {task.assignee}
                  </span>
                )}

                {onUpdateTask && (
                  <button
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Expanded edit section */}
              {isExpanded && onUpdateTask && (
                <div className="px-9 pb-3 pt-1 border-t border-gray-100 flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Assignee</label>
                    <select
                      value={task.assignee || ''}
                      onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-pilot-primary"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => handleDueDateChange(task.id, e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-pilot-primary"
                    />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {isReady && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Ready for installation</span>
          </div>
        </div>
      )}
    </div>
  )
}
