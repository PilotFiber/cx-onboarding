import { Crown, Star, Gem } from 'lucide-react'
import { VIPTier, vipTierConfig } from '../../types'

interface VIPBadgeProps {
  tier: VIPTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const tierIcons = {
  standard: null,
  silver: Star,
  gold: Crown,
  platinum: Gem,
}

export default function VIPBadge({
  tier,
  size = 'md',
  showLabel = true,
  className = ''
}: VIPBadgeProps) {
  // Don't render anything for standard tier
  if (tier === 'standard') return null

  const config = vipTierConfig[tier]
  const Icon = tierIcons[tier]

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizeStyles[size]} ${className}`}
      title={`${config.label} VIP - ${config.firstResponseHours}h response time`}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

// Helper component to show VIP perks
export function VIPPerks({ tier }: { tier: VIPTier }) {
  if (tier === 'standard') return null

  const config = vipTierConfig[tier]

  return (
    <div className="text-xs text-gray-600 space-y-1">
      <p className="font-medium">{config.label} VIP Benefits:</p>
      <ul className="list-disc list-inside space-y-0.5 text-gray-500">
        <li>{config.firstResponseHours}h first response SLA</li>
        {config.leadTimeReductionDays > 0 && (
          <li>{config.leadTimeReductionDays} days faster lead time</li>
        )}
        {config.priorityScheduling && <li>Priority scheduling</li>}
        {config.dedicatedSupport && <li>Dedicated support contact</li>}
        {config.executiveEscalation && <li>Executive escalation path</li>}
      </ul>
    </div>
  )
}
