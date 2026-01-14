import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface SLAIndicatorProps {
  deadline: string
  className?: string
  showLabel?: boolean
}

export default function SLAIndicator({ deadline, className = '', showLabel = true }: SLAIndicatorProps) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  let label: string
  let colorClass: string
  let Icon: typeof Clock

  if (diffHours < 0) {
    const hoursOverdue = Math.abs(Math.floor(diffHours))
    label = hoursOverdue < 24
      ? `${hoursOverdue}h overdue`
      : `${Math.floor(hoursOverdue / 24)}d overdue`
    colorClass = 'text-red-600 bg-red-50'
    Icon = AlertTriangle
  } else if (diffHours <= 24) {
    label = diffHours < 1
      ? `${Math.floor(diffHours * 60)}m remaining`
      : `${Math.floor(diffHours)}h remaining`
    colorClass = 'text-yellow-700 bg-yellow-50'
    Icon = Clock
  } else {
    const daysRemaining = Math.floor(diffHours / 24)
    label = `${daysRemaining}d remaining`
    colorClass = 'text-green-600 bg-green-50'
    Icon = CheckCircle
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${colorClass} ${className}`}>
      <Icon className="w-4 h-4" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
