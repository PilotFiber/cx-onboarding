import { ProjectType } from '../../types'
import { projectTypeConfigs } from '../../data/projectTypes'

interface ProjectTypeBadgeProps {
  type: ProjectType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProjectTypeBadge({
  type,
  size = 'md',
  className = ''
}: ProjectTypeBadgeProps) {
  const config = projectTypeConfigs[type]

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeStyles[size]} ${config.color} ${className}`}>
      {config.name}
    </span>
  )
}
