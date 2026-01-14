import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { ProjectGroup } from '../../types'

interface ProjectGroupBadgeProps {
  group: ProjectGroup
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  clickable?: boolean
  className?: string
}

export default function ProjectGroupBadge({
  group,
  size = 'md',
  showIcon = true,
  clickable = true,
  className = ''
}: ProjectGroupBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  const content = (
    <>
      {showIcon && <Layers className={iconSizes[size]} />}
      <span className="truncate max-w-[150px]">{group.name}</span>
    </>
  )

  const baseClasses = `inline-flex items-center rounded-full font-medium text-white ${sizeStyles[size]} ${className}`

  if (clickable) {
    return (
      <Link
        to={`/groups/${group.id}`}
        className={`${baseClasses} hover:opacity-90 transition-opacity`}
        style={{ backgroundColor: group.color }}
        title={group.description || group.name}
      >
        {content}
      </Link>
    )
  }

  return (
    <span
      className={baseClasses}
      style={{ backgroundColor: group.color }}
      title={group.description || group.name}
    >
      {content}
    </span>
  )
}
