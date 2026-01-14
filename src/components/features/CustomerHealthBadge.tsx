import { useState } from 'react'
import {
  Activity,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  FolderOpen,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { Customer, Project } from '../../types'
import {
  calculateCustomerHealthScore,
  getCustomerHealthColor,
  getCustomerHealthBgColor,
  getCustomerHealthLabel,
  CustomerHealthFactor,
} from '../../utils/customerHealthScore'

interface CustomerHealthBadgeProps {
  customer: Customer
  projects: Project[]
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const categoryIcons = {
  engagement: MessageSquare,
  project: FolderOpen,
  revenue: DollarSign,
  risk: AlertTriangle,
}

export default function CustomerHealthBadge({
  customer,
  projects,
  showDetails = false,
  size = 'md',
}: CustomerHealthBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { score, level, factors, trend } = calculateCustomerHealthScore(customer, projects)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const getFactorIcon = (factor: CustomerHealthFactor) => {
    switch (factor.impact) {
      case 'positive':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-3 h-3 text-red-500" />
      default:
        return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: CustomerHealthFactor['category']) => {
    const Icon = categoryIcons[category]
    return <Icon className="w-3 h-3" />
  }

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus

  if (!showDetails) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${getCustomerHealthBgColor(level)} ${getCustomerHealthColor(level)}`}
        title={`Customer Health: ${getCustomerHealthLabel(level)} (${score})`}
      >
        <Activity className={iconSizes[size]} />
        {score}
      </span>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${getCustomerHealthBgColor(level)}`}
          >
            <span className={`text-lg font-bold ${getCustomerHealthColor(level)}`}>{score}</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Customer Health</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getCustomerHealthColor(level)}`}>
                {getCustomerHealthLabel(level)}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-xs ${
                  trend === 'improving'
                    ? 'text-green-600'
                    : trend === 'declining'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                <TrendIcon className="w-3 h-3" />
                {trend}
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Health Factors</p>

          {/* Group factors by category */}
          {(['engagement', 'project', 'revenue', 'risk'] as const).map((category) => {
            const categoryFactors = factors.filter((f) => f.category === category)
            if (categoryFactors.length === 0) return null

            return (
              <div key={category} className="mb-3 last:mb-0">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category}</span>
                </div>
                <div className="space-y-1 ml-4">
                  {categoryFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getFactorIcon(factor)}
                        <span className="text-gray-700">{factor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">{factor.description}</span>
                        {factor.points !== 0 && (
                          <span
                            className={`font-medium ${
                              factor.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {factor.points > 0 ? '+' : ''}
                            {factor.points}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Health Score Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Critical</span>
              <span>Excellent</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  level === 'excellent'
                    ? 'bg-green-500'
                    : level === 'good'
                    ? 'bg-blue-500'
                    : level === 'needs-attention'
                    ? 'bg-yellow-500'
                    : level === 'at-risk'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
