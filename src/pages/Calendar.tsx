import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Users,
  User,
  Calendar as CalendarIcon,
  List,
  MapPin,
  Info,
  Wrench,
  X,
  Check,
  Filter,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { teamMembers, currentUser } from '../data/teamMembers'
import { Project, ScheduleSlot } from '../types'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

type ViewMode = 'week' | 'month'
type FilterMode = 'all' | 'my' | 'crew'

const DAILY_CAPACITY = 6 // Maximum installs per day

const slotLabels: Record<string, string> = {
  'early-7': '7 AM',
  'morning-9': '9 AM',
  'morning-11': '11 AM',
  'all-day': 'All Day',
  'after-hours': '6 PM',
}

const slotColors: Record<string, string> = {
  'early-7': 'bg-purple-100 border-purple-300 text-purple-800',
  'morning-9': 'bg-blue-100 border-blue-300 text-blue-800',
  'morning-11': 'bg-green-100 border-green-300 text-green-800',
  'all-day': 'bg-orange-100 border-orange-300 text-orange-800',
  'after-hours': 'bg-gray-100 border-gray-300 text-gray-800',
}

interface ScheduleModalProps {
  project: Project | null
  onClose: () => void
  onSave: (projectId: string, date: string, slot: ScheduleSlot) => void
}

function ScheduleModal({ project, onClose, onSave }: ScheduleModalProps) {
  const { getCustomer, getBuilding } = useApp()
  const [selectedDate, setSelectedDate] = useState(
    project?.scheduledDate || new Date().toISOString().split('T')[0]
  )
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot>(
    project?.scheduledSlot || 'morning-9'
  )

  if (!project) return null

  const customer = getCustomer(project.customerId)
  const building = getBuilding(project.buildingId)

  const handleSave = () => {
    onSave(project.id, selectedDate, selectedSlot)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Schedule Installation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-900">{customer?.companyName}</p>
            <p className="text-sm text-gray-500">{building?.address}</p>
            <p className="text-xs text-gray-400 mt-1">{project.product} - {project.serviceBandwidth}</p>
          </div>

          {building && building.installNotes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Building Notes</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    {building.installNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(slotLabels) as [ScheduleSlot, string][]).map(([slot, label]) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${selectedSlot === slot
                      ? 'border-pilot-secondary bg-pilot-secondary text-white'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Save Schedule
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
}

function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<number>()

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), 300)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal shadow-lg">
            {content}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

export default function Calendar() {
  const navigate = useNavigate()
  const { state, getCustomer, getBuilding, dispatch } = useApp()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedCrew, setSelectedCrew] = useState<string>('')
  const [showUnscheduled, setShowUnscheduled] = useState(true)
  const [scheduleModalProject, setScheduleModalProject] = useState<Project | null>(null)
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)

  // Get team members who can be assigned (CXAs and Senior CXAs)
  const crewMembers = teamMembers.filter(
    m => m.role === 'cxa' || m.role === 'senior_cxa'
  )

  // Week view helpers
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }

  // Month view helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startOffset = firstDay.getDay()

    const days: (Date | null)[] = []
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const weekStart = getWeekStart(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const monthDays = getMonthDays(currentDate)

  const getProjectsForDate = (date: Date) => {
    return state.projects.filter(p => {
      if (!p.scheduledDate) return false

      // Apply filters
      if (filterMode === 'my' && p.cxAssignee !== currentUser.name) return false
      if (filterMode === 'crew' && selectedCrew && p.cxAssignee !== selectedCrew) return false

      const scheduled = new Date(p.scheduledDate)
      return (
        scheduled.getDate() === date.getDate() &&
        scheduled.getMonth() === date.getMonth() &&
        scheduled.getFullYear() === date.getFullYear()
      )
    })
  }

  const unscheduledProjects = state.projects.filter(
    p => !p.scheduledDate && p.status !== 'completed'
  )

  const myScheduledCount = state.projects.filter(p =>
    p.scheduledDate && p.cxAssignee === currentUser.name
  ).length

  const goToPrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setMonth(d.getMonth() - 1)
    }
    setCurrentDate(d)
  }

  const goToNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'week') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setMonth(d.getMonth() + 1)
    }
    setCurrentDate(d)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatWeekRange = () => {
    const endDate = new Date(weekStart)
    endDate.setDate(endDate.getDate() + 6)

    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })
    const startDay = weekStart.getDate()
    const endDay = endDate.getDate()
    const year = weekStart.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
  }

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const handleScheduleSave = (projectId: string, date: string, slot: ScheduleSlot) => {
    const project = state.projects.find(p => p.id === projectId)
    if (!project) return

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: {
        ...project,
        scheduledDate: date,
        scheduledSlot: slot,
        status: 'scheduled',
        updatedAt: new Date().toISOString(),
      },
    })
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
    // Add a drag image
    const elem = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(elem, 10, 10)
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
    setDragOverDate(null)
  }

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(dateStr)
  }

  const handleDragLeave = () => {
    setDragOverDate(null)
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (draggedProject) {
      // Set the date for the schedule modal
      const dateStr = date.toISOString().split('T')[0]
      // Open modal with the project and pre-filled date
      setScheduleModalProject({ ...draggedProject, scheduledDate: dateStr })
    }
    setDraggedProject(null)
    setDragOverDate(null)
  }

  const getCapacityColor = (count: number) => {
    const ratio = count / DAILY_CAPACITY
    if (ratio >= 1) return 'text-red-600 bg-red-50'
    if (ratio >= 0.8) return 'text-amber-600 bg-amber-50'
    return 'text-green-600 bg-green-50'
  }

  const renderProjectCard = (project: Project, compact = false) => {
    const customer = getCustomer(project.customerId)
    const building = getBuilding(project.buildingId)
    const hasNotes = building && building.installNotes.length > 0

    const card = (
      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        className={`
          p-2 rounded border cursor-pointer transition-all hover:shadow-md w-full overflow-hidden
          ${project.scheduledSlot ? slotColors[project.scheduledSlot] : 'bg-gray-50 border-gray-200'}
        `}
      >
        {!compact && (
          <div className="flex items-center gap-1 text-xs font-medium">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{project.scheduledSlot ? slotLabels[project.scheduledSlot] : 'TBD'}</span>
          </div>
        )}
        <p className={`font-semibold truncate ${compact ? 'text-xs' : 'text-sm mt-1'}`}>
          {customer?.companyName}
        </p>
        {!compact && (
          <>
            <p className="text-xs truncate opacity-75">
              {building?.address}
            </p>
            {project.cxAssignee && (
              <p className="text-xs mt-1 truncate">
                <User className="w-3 h-3 inline mr-1 flex-shrink-0" />
                <span className="truncate">{project.cxAssignee}</span>
              </p>
            )}
          </>
        )}
        {hasNotes && (
          <div className={compact ? 'inline ml-1' : 'mt-1'}>
            <AlertCircle className="w-3 h-3 text-amber-600 inline flex-shrink-0" />
          </div>
        )}
      </div>
    )

    if (hasNotes) {
      return (
        <Tooltip
          key={project.id}
          content={
            <div>
              <p className="font-medium mb-1">Install Notes:</p>
              <ul className="space-y-1">
                {building.installNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>-</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          {card}
        </Tooltip>
      )
    }

    return <div key={project.id}>{card}</div>
  }

  return (
    <div className="flex gap-6">
      {/* Main Calendar */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Installation Calendar</h1>
            <p className="text-gray-600">
              {viewMode === 'week' ? formatWeekRange() : formatMonthYear()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
                Month
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <Button variant="secondary" size="sm" onClick={goToPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setFilterMode('my')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'my'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              My Installs
              {myScheduledCount > 0 && (
                <span className="bg-pilot-primary text-pilot-secondary text-xs px-1.5 py-0.5 rounded-full">
                  {myScheduledCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterMode('crew')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'crew'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              By Crew
            </button>
          </div>

          {filterMode === 'crew' && (
            <select
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            >
              <option value="">All Crew</option>
              {crewMembers.map(member => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowUnscheduled(!showUnscheduled)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showUnscheduled
                ? 'bg-pilot-primary text-pilot-secondary'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Unscheduled ({unscheduledProjects.length})
          </button>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const projects = getProjectsForDate(date)
              const dayIsToday = isToday(date)
              const capacityClass = getCapacityColor(projects.length)
              const dateStr = date.toISOString().split('T')[0]
              const isDragOver = dragOverDate === dateStr

              return (
                <div
                  key={date.toISOString()}
                  className="min-h-[250px] min-w-0 overflow-hidden"
                  onDragOver={(e) => handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, date)}
                >
                  <div className={`
                    text-center p-2 rounded-t-lg
                    ${dayIsToday ? 'bg-pilot-primary' : 'bg-gray-100'}
                  `}>
                    <p className={`text-xs uppercase tracking-wide ${dayIsToday ? 'text-pilot-secondary' : 'text-gray-500'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-xl font-bold ${dayIsToday ? 'text-pilot-secondary' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </p>
                    <div className={`text-xs px-2 py-0.5 rounded mt-1 ${capacityClass}`}>
                      {projects.length}/{DAILY_CAPACITY}
                    </div>
                  </div>

                  <Card className={`rounded-t-none p-2 min-h-[200px] overflow-hidden transition-colors ${
                    isDragOver ? 'bg-pilot-primary/10 border-pilot-primary ring-2 ring-pilot-primary' : ''
                  }`}>
                    {projects.length === 0 ? (
                      <div className={`text-center py-4 text-sm ${isDragOver ? 'text-pilot-secondary' : 'text-gray-400'}`}>
                        {isDragOver ? 'Drop to schedule' : 'No installs'}
                      </div>
                    ) : (
                      <ul className="space-y-2 overflow-hidden">
                        {projects.map((project) => (
                          <li key={project.id} className="min-w-0">{renderProjectCard(project)}</li>
                        ))}
                        {isDragOver && (
                          <li className="p-2 border-2 border-dashed border-pilot-primary rounded text-center text-sm text-pilot-secondary">
                            Drop to schedule
                          </li>
                        )}
                      </ul>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="min-h-[100px] bg-gray-50 rounded" />
                }

                const projects = getProjectsForDate(date)
                const dayIsToday = isToday(date)
                const capacityClass = getCapacityColor(projects.length)

                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      min-h-[100px] p-1 border rounded
                      ${dayIsToday ? 'border-pilot-primary bg-pilot-primary/5' : 'border-gray-200'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${dayIsToday ? 'text-pilot-secondary' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </span>
                      {projects.length > 0 && (
                        <span className={`text-xs px-1.5 rounded ${capacityClass}`}>
                          {projects.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {projects.slice(0, 3).map(project => renderProjectCard(project, true))}
                      {projects.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{projects.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Time Slots</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(slotLabels).map(([slot, label]) => (
              <div key={slot} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${slotColors[slot]}`} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Unscheduled Projects Sidebar */}
      {showUnscheduled && (
        <div className="w-80 flex-shrink-0">
          <Card className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Unscheduled</h3>
                <p className="text-xs text-gray-400">Drag to calendar to schedule</p>
              </div>
              <span className="text-sm text-gray-500">{unscheduledProjects.length}</span>
            </div>

            {unscheduledProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">All projects are scheduled</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {unscheduledProjects.map(project => {
                  const customer = getCustomer(project.customerId)
                  const building = getBuilding(project.buildingId)
                  const isDragging = draggedProject?.id === project.id

                  return (
                    <li
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing ${
                        isDragging ? 'opacity-50 ring-2 ring-pilot-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {customer?.companyName}
                          </p>
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {building?.address}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            FOC: {new Date(project.focDate).toLocaleDateString()}
                          </p>
                          {building && building.installNotes.length > 0 && (
                            <Tooltip
                              content={
                                <ul className="space-y-1">
                                  {building.installNotes.map((note, i) => (
                                    <li key={i}>- {note}</li>
                                  ))}
                                </ul>
                              }
                            >
                              <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                <Info className="w-3 h-3" />
                                {building.installNotes.length} note{building.installNotes.length > 1 ? 's' : ''}
                              </div>
                            </Tooltip>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setScheduleModalProject(project)
                          }}
                          className="px-2 py-1 bg-pilot-secondary text-white text-xs rounded hover:bg-pilot-secondary/90 transition-colors"
                        >
                          Schedule
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalProject && (
        <ScheduleModal
          project={scheduleModalProject}
          onClose={() => setScheduleModalProject(null)}
          onSave={handleScheduleSave}
        />
      )}
    </div>
  )
}
