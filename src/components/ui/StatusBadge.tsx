import { ReactNode } from 'react'
import { ProjectStatus, ProjectPriority } from '../../types'

type BadgeType = 'status' | 'priority'

interface StatusBadgeProps {
  type?: BadgeType
  status: ProjectStatus | ProjectPriority | string
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StatusBadge({
  type: _type = 'status',
  status,
  icon,
  size = 'md',
  className = ''
}: StatusBadgeProps) {
  // _type reserved for future use (different styling per badge type)
  void _type
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const baseStyles = `inline-flex items-center rounded-full font-medium ${sizeStyles[size]}`

  const statusStyles: Record<string, string> = {
    // Project statuses
    new: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-cyan-100 text-cyan-800',
    confirmed: 'bg-green-100 text-green-800',
    installing: 'bg-orange-100 text-orange-800',
    completed: 'bg-gray-100 text-gray-800',
    // Priority
    normal: 'bg-gray-100 text-gray-700',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  const statusStyle = statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
  const badgeClasses = `${baseStyles} ${statusStyle} ${className}`

  const formatStatus = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <span className={badgeClasses}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {formatStatus(status)}
    </span>
  )
}
