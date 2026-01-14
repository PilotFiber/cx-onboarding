import { useState } from 'react'
import { Activity, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Project } from '../../types'
import {
  calculateHealthScore,
  getHealthColor,
  getHealthBgColor,
  getHealthLabel,
  HealthFactor
} from '../../utils/healthScore'

interface HealthScoreBadgeProps {
  project: Project
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function HealthScoreBadge({ project, showDetails = false, size = 'md' }: HealthScoreBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { score, level, factors } = calculateHealthScore(project)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const getFactorIcon = (factor: HealthFactor) => {
    switch (factor.impact) {
      case 'positive':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-3 h-3 text-red-500" />
      default:
        return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  if (!showDetails) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${getHealthBgColor(level)} ${getHealthColor(level)}`}
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
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getHealthBgColor(level)}`}>
            <span className={`text-lg font-bold ${getHealthColor(level)}`}>{score}</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Health Score</p>
            <p className={`text-sm font-medium ${getHealthColor(level)}`}>{getHealthLabel(level)}</p>
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
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Score Breakdown</p>
          <div className="space-y-2">
            {factors.map((factor, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getFactorIcon(factor)}
                  <span className="text-gray-700">{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">{factor.description}</span>
                  {factor.points !== 0 && (
                    <span className={`font-medium ${factor.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {factor.points > 0 ? '+' : ''}{factor.points}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Health Score Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Critical</span>
              <span>Healthy</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  level === 'healthy' ? 'bg-green-500' :
                  level === 'needs-attention' ? 'bg-yellow-500' :
                  level === 'at-risk' ? 'bg-orange-500' : 'bg-red-500'
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
