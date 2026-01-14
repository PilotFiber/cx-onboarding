import { CheckCircle2, Circle, User, Calendar, ChevronDown } from 'lucide-react'
import { Task } from '../../types'
import { teamMembers } from '../../data/teamMembers'
import { useState, useRef, useEffect } from 'react'

interface TaskListProps {
  tasks: Task[]
  onToggle?: (taskId: string, completed: boolean) => void
  onAssigneeChange?: (taskId: string, assignee: string) => void
  onDueDateChange?: (taskId: string, dueDate: string) => void
  readonly?: boolean
  groupBySection?: boolean
  editable?: boolean
}

export default function TaskList({
  tasks,
  onToggle,
  onAssigneeChange,
  onDueDateChange,
  readonly = false,
  groupBySection = true,
  editable = false
}: TaskListProps) {
  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  // Group tasks by section
  const tasksBySection = tasks.reduce((acc, task) => {
    const section = task.section || 'General'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const sections = Object.keys(tasksBySection)

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr)
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return { text: 'Invalid date', className: 'text-gray-400 bg-gray-50' }
    }
    date.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, className: 'text-red-600 bg-red-50' }
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'text-orange-600 bg-orange-50' }
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600 bg-yellow-50' }
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays}d`, className: 'text-gray-600 bg-gray-100' }
    } else {
      return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-gray-500 bg-gray-50' }
    }
  }

  const renderTask = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      readonly={readonly}
      editable={editable}
      onToggle={onToggle}
      onAssigneeChange={onAssigneeChange}
      onDueDateChange={onDueDateChange}
      formatDueDate={formatDueDate}
    />
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {completedCount} of {tasks.length} tasks completed
        </span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {groupBySection && sections.length > 1 ? (
        <div className="space-y-6">
          {sections.map((section) => {
            const sectionTasks = tasksBySection[section]
            const sectionCompleted = sectionTasks.filter(t => t.completed).length
            const allCompleted = sectionCompleted === sectionTasks.length

            return (
              <div key={section}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`text-sm font-semibold uppercase tracking-wide ${allCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                    {section}
                  </h4>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${allCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {sectionCompleted}/{sectionTasks.length}
                  </span>
                </div>
                <ul className="space-y-1">
                  {sectionTasks.map(renderTask)}
                </ul>
              </div>
            )
          })}
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map(renderTask)}
        </ul>
      )}
    </div>
  )
}

interface TaskItemProps {
  task: Task
  readonly: boolean
  editable: boolean
  onToggle?: (taskId: string, completed: boolean) => void
  onAssigneeChange?: (taskId: string, assignee: string) => void
  onDueDateChange?: (taskId: string, dueDate: string) => void
  formatDueDate: (dateStr: string) => { text: string; className: string }
}

function TaskItem({ task, readonly, editable, onToggle, onAssigneeChange, onDueDateChange, formatDueDate }: TaskItemProps) {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const assigneeRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAssigneeSelect = (assignee: string) => {
    onAssigneeChange?.(task.id, assignee)
    setShowAssigneeDropdown(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDueDateChange?.(task.id, e.target.value)
    setShowDatePicker(false)
  }

  return (
    <li className={`
      flex items-start gap-3 p-3 rounded-lg transition-colors
      ${task.completed ? 'bg-gray-50' : 'bg-white'}
    `}>
      <button
        onClick={() => !readonly && onToggle?.(task.id, !task.completed)}
        disabled={readonly}
        className={`flex-shrink-0 mt-0.5 ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-70'}`}
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {task.title}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Assignee */}
          {editable ? (
            <div className="relative" ref={assigneeRef}>
              <button
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <User className="w-3 h-3 text-gray-400" />
                <span className={task.assignee ? 'text-gray-700' : 'text-gray-400'}>
                  {task.assignee || 'Assign'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showAssigneeDropdown && (
                <div className="absolute z-10 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <button
                    onClick={() => handleAssigneeSelect('')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 text-gray-400"
                  >
                    Unassigned
                  </button>
                  {teamMembers.map(tm => (
                    <button
                      key={tm.id}
                      onClick={() => handleAssigneeSelect(tm.name)}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${task.assignee === tm.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      {tm.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : task.assignee ? (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              {task.assignee}
            </span>
          ) : null}

          {/* Due Date */}
          {editable ? (
            <div className="relative" ref={dateRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                  task.dueDate && !task.completed
                    ? `border-transparent ${formatDueDate(task.dueDate).className}`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span className={task.dueDate ? '' : 'text-gray-400'}>
                  {task.dueDate ? formatDueDate(task.dueDate).text : 'Set date'}
                </span>
              </button>

              {showDatePicker && (
                <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                  <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={handleDateChange}
                    className="text-sm border border-gray-200 rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
          ) : task.dueDate && !task.completed ? (
            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${formatDueDate(task.dueDate).className}`}>
              <Calendar className="w-3 h-3" />
              {formatDueDate(task.dueDate).text}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  )
}
