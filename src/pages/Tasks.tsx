import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Calendar, Clock, Building2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { currentUser } from '../data/teamMembers'
import { Task, Project } from '../types'
import Card from '../components/ui/Card'

interface TaskWithProject extends Task {
  project: Project
  customerName: string
}

type FilterType = 'all' | 'overdue' | 'due-today' | 'upcoming' | 'completed'

export default function Tasks() {
  const navigate = useNavigate()
  const { state, getCustomer, dispatch } = useApp()
  const [filter, setFilter] = useState<FilterType>('all')

  // Get all tasks assigned to current user across all projects
  const myTasks: TaskWithProject[] = state.projects.flatMap(project => {
    const customer = getCustomer(project.customerId)
    return project.tasks
      .filter(task => task.assignee === currentUser.name)
      .map(task => ({
        ...task,
        project,
        customerName: customer?.companyName || 'Unknown'
      }))
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getDueDateInfo = (dateStr?: string) => {
    if (!dateStr) return { status: 'no-date', diffDays: Infinity }
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { status: 'overdue', diffDays }
    if (diffDays === 0) return { status: 'due-today', diffDays }
    if (diffDays <= 7) return { status: 'upcoming', diffDays }
    return { status: 'later', diffDays }
  }

  const filteredTasks = myTasks.filter(task => {
    if (filter === 'completed') return task.completed
    if (task.completed) return false // Don't show completed in other filters

    const { status } = getDueDateInfo(task.dueDate)
    if (filter === 'overdue') return status === 'overdue'
    if (filter === 'due-today') return status === 'due-today'
    if (filter === 'upcoming') return status === 'upcoming' || status === 'due-today'
    return true // 'all' shows all incomplete tasks
  }).sort((a, b) => {
    // Sort by: overdue first, then by due date, then no date last
    const aInfo = getDueDateInfo(a.dueDate)
    const bInfo = getDueDateInfo(b.dueDate)
    if (aInfo.status === 'overdue' && bInfo.status !== 'overdue') return -1
    if (bInfo.status === 'overdue' && aInfo.status !== 'overdue') return 1
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const overdueCount = myTasks.filter(t => !t.completed && getDueDateInfo(t.dueDate).status === 'overdue').length
  const dueTodayCount = myTasks.filter(t => !t.completed && getDueDateInfo(t.dueDate).status === 'due-today').length
  const upcomingCount = myTasks.filter(t => !t.completed && ['upcoming', 'due-today'].includes(getDueDateInfo(t.dueDate).status)).length
  const completedCount = myTasks.filter(t => t.completed).length
  const incompleteCount = myTasks.filter(t => !t.completed).length

  const handleTaskToggle = (task: TaskWithProject) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { projectId: task.project.id, taskId: task.id, completed: !task.completed }
    })
  }

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const { status, diffDays } = getDueDateInfo(dateStr)

    if (status === 'overdue') {
      return { text: `${Math.abs(diffDays)}d overdue`, className: 'text-red-600 bg-red-50' }
    } else if (status === 'due-today') {
      return { text: 'Due today', className: 'text-orange-600 bg-orange-50' }
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600 bg-yellow-50' }
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays}d`, className: 'text-gray-600 bg-gray-100' }
    } else {
      return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-gray-500 bg-gray-50' }
    }
  }

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All Tasks', count: incompleteCount },
    { value: 'overdue', label: 'Overdue', count: overdueCount },
    { value: 'due-today', label: 'Due Today', count: dueTodayCount },
    { value: 'upcoming', label: 'This Week', count: upcomingCount },
    { value: 'completed', label: 'Completed', count: completedCount },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">
          {incompleteCount} task{incompleteCount !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Incomplete</p>
                <p className="text-2xl font-bold text-gray-900">{incompleteCount}</p>
              </div>
              <Circle className="w-8 h-8 text-gray-200" />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('overdue')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('due-today')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Due Today</p>
                <p className="text-2xl font-bold text-orange-600">{dueTodayCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </Card>
        </div>
        <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('completed')}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-200" />
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === option.value
                ? 'border-pilot-primary text-pilot-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === option.value
                  ? 'bg-pilot-primary text-pilot-secondary'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <Card className="p-0 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No tasks</p>
            <p className="text-sm mt-1">
              {filter === 'completed'
                ? "You haven't completed any tasks yet"
                : filter === 'overdue'
                ? 'No overdue tasks!'
                : filter === 'due-today'
                ? 'No tasks due today'
                : 'No tasks assigned to you'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map(task => {
              const dueDateInfo = formatDueDate(task.dueDate)
              return (
                <li key={`${task.project.id}-${task.id}`} className="hover:bg-gray-50">
                  <div className="flex items-start gap-3 p-4">
                    <button
                      onClick={() => handleTaskToggle(task)}
                      className="flex-shrink-0 mt-0.5 hover:opacity-70"
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
                        {dueDateInfo && !task.completed && (
                          <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${dueDateInfo.className}`}>
                            <Calendar className="w-3 h-3" />
                            {dueDateInfo.text}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/projects/${task.project.id}?tab=tasks`)}
                        className="flex items-center gap-2 mt-1 text-sm text-gray-500 hover:text-blue-600"
                      >
                        <Building2 className="w-3 h-3" />
                        <span>{task.customerName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{task.section}</span>
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
