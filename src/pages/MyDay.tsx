import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun,
  CheckSquare,
  Calendar,
  Mail,
  AlertTriangle,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { currentUser } from '../data/teamMembers'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import Button from '../components/ui/Button'
import SmartReminders from '../components/features/SmartReminders'
import { mockReminders, generateAutoReminders } from '../data/mockReminders'

export default function MyDay() {
  const navigate = useNavigate()
  const { state, getCustomer, getBuilding } = useApp()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get my projects
  const myProjects = useMemo(() => {
    return state.projects.filter(p => p.cxAssignee === currentUser.name && p.status !== 'completed')
  }, [state.projects])

  // Tasks due today
  const tasksDueToday = useMemo(() => {
    const tasks: Array<{ projectId: string; projectName: string; task: typeof myProjects[0]['tasks'][0] }> = []
    myProjects.forEach(project => {
      const customer = getCustomer(project.customerId)
      project.tasks.forEach(task => {
        if (task.completed) return
        if (!task.dueDate) return
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        if (dueDate.getTime() === today.getTime()) {
          tasks.push({ projectId: project.id, projectName: customer?.companyName || 'Unknown', task })
        }
      })
    })
    return tasks
  }, [myProjects, getCustomer])

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    const tasks: Array<{ projectId: string; projectName: string; task: typeof myProjects[0]['tasks'][0]; daysOverdue: number }> = []
    myProjects.forEach(project => {
      const customer = getCustomer(project.customerId)
      project.tasks.forEach(task => {
        if (task.completed) return
        if (!task.dueDate) return
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        if (dueDate < today) {
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          tasks.push({ projectId: project.id, projectName: customer?.companyName || 'Unknown', task, daysOverdue })
        }
      })
    })
    return tasks.sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [myProjects, getCustomer])

  // Installs today
  const installsToday = useMemo(() => {
    return myProjects.filter(p => {
      if (!p.scheduledDate) return false
      const scheduled = new Date(p.scheduledDate)
      scheduled.setHours(0, 0, 0, 0)
      return scheduled.getTime() === today.getTime()
    })
  }, [myProjects])

  // Projects needing response (tickets)
  const projectsNeedingResponse = useMemo(() => {
    return state.tickets
      .filter(t => {
        const project = state.projects.find(p => p.id === t.projectId)
        return project?.cxAssignee === currentUser.name && t.requiresResponse && t.status !== 'resolved' && t.status !== 'closed'
      })
      .map(ticket => {
        const project = state.projects.find(p => p.id === ticket.projectId)!
        const customer = getCustomer(project.customerId)
        return { ticket, project, customerName: customer?.companyName || 'Unknown' }
      })
  }, [state.tickets, state.projects, getCustomer])

  // Projects with blockers
  const projectsWithBlockers = useMemo(() => {
    return myProjects.filter(p => p.blockers.some(b => !b.resolvedAt))
  }, [myProjects])

  // FOC approaching (within 3 days)
  const focApproaching = useMemo(() => {
    return myProjects.filter(p => {
      const foc = new Date(p.focDate)
      foc.setHours(0, 0, 0, 0)
      const daysUntil = Math.ceil((foc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 3
    }).map(p => {
      const foc = new Date(p.focDate)
      const daysUntil = Math.ceil((foc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { project: p, daysUntil }
    })
  }, [myProjects])

  const slotLabels: Record<string, string> = {
    'early-7': '7:00 AM',
    'morning-9': '9:00 AM',
    'morning-11': '11:00 AM',
    'all-day': '9 AM - 5 PM',
    'after-hours': '6:00 PM',
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sun className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-gray-600">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{myProjects.length}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{tasksDueToday.length}</p>
          <p className="text-sm text-gray-500">Tasks Due Today</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
          <p className="text-sm text-gray-500">Overdue Tasks</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{installsToday.length}</p>
          <p className="text-sm text-gray-500">Installs Today</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{projectsNeedingResponse.length}</p>
          <p className="text-sm text-gray-500">Need Response</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="border-l-4 border-red-500">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Overdue Tasks</h2>
              </div>
              <ul className="space-y-2">
                {overdueTasks.slice(0, 5).map(({ projectId, projectName, task, daysOverdue }) => (
                  <li
                    key={task.id}
                    onClick={() => navigate(`/projects/${projectId}?tab=tasks`)}
                    className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{task.title}</span>
                      <span className="text-xs text-red-600 font-medium">{daysOverdue}d overdue</span>
                    </div>
                    <p className="text-sm text-gray-500">{projectName}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Tasks Due Today */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">Tasks Due Today</h2>
              </div>
              <Button variant="link" size="sm" onClick={() => navigate('/tasks')}>
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {tasksDueToday.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No tasks due today</p>
            ) : (
              <ul className="space-y-2">
                {tasksDueToday.map(({ projectId, projectName, task }) => (
                  <li
                    key={task.id}
                    onClick={() => navigate(`/projects/${projectId}?tab=tasks`)}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{task.title}</span>
                    <p className="text-sm text-gray-500">{projectName}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Projects Needing Response */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Needs Response</h2>
            </div>
            {projectsNeedingResponse.length === 0 ? (
              <p className="text-gray-500 text-center py-6">All caught up!</p>
            ) : (
              <ul className="space-y-2">
                {projectsNeedingResponse.slice(0, 5).map(({ ticket, project, customerName }) => (
                  <li
                    key={ticket.id}
                    onClick={() => navigate(`/projects/${project.id}?tab=tickets`)}
                    className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{ticket.subject}</span>
                    <p className="text-sm text-gray-500">{customerName}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Installs Today */}
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Installs Today</h2>
            </div>
            {installsToday.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No installs scheduled today</p>
            ) : (
              <ul className="space-y-3">
                {installsToday.map(project => {
                  const customer = getCustomer(project.customerId)
                  const building = getBuilding(project.buildingId)
                  return (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{customer?.companyName}</span>
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{building?.address}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {project.scheduledSlot ? slotLabels[project.scheduledSlot] : 'TBD'}
                        </span>
                        {project.assignedCrew && (
                          <span className="text-gray-400">• {project.assignedCrew}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* FOC Approaching */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">FOC Approaching</h2>
            </div>
            {focApproaching.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No urgent FOC dates</p>
            ) : (
              <ul className="space-y-2">
                {focApproaching.map(({ project, daysUntil }) => {
                  const customer = getCustomer(project.customerId)
                  return (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        daysUntil === 0
                          ? 'bg-red-50 hover:bg-red-100'
                          : 'bg-orange-50 hover:bg-orange-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{customer?.companyName}</span>
                        <span className={`text-sm font-medium ${
                          daysUntil === 0 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {daysUntil === 0 ? 'TODAY' : `${daysUntil}d`}
                        </span>
                      </div>
                      <StatusBadge status={project.status} size="sm" />
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Active Blockers */}
          {projectsWithBlockers.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Active Blockers</h2>
              </div>
              <ul className="space-y-2">
                {projectsWithBlockers.slice(0, 5).map(project => {
                  const customer = getCustomer(project.customerId)
                  const activeBlocker = project.blockers.find(b => !b.resolvedAt)
                  return (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{customer?.companyName}</span>
                      <p className="text-sm text-gray-600 mt-1">{activeBlocker?.description}</p>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Smart Reminders - Full Width */}
      <SmartReminders
        reminders={[...mockReminders, ...generateAutoReminders(state.projects)].filter(
          r => r.assigneeId === currentUser.id
        )}
        customers={state.customers}
        projects={state.projects}
        currentUserId={currentUser.id}
        title="My Reminders"
        onComplete={(id) => console.log('Complete reminder:', id)}
        onDismiss={(id) => console.log('Dismiss reminder:', id)}
        onSnooze={(id, hours) => console.log('Snooze reminder:', id, 'for', hours, 'hours')}
        onCreate={() => console.log('Create new reminder')}
      />
    </div>
  )
}
