import { useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertOctagon,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react'
import { Customer, Project } from '../../types'
import {
  calculateChurnRisk,
  getChurnRiskColor,
  getChurnRiskBgColor,
  getChurnRiskLabel,
  ChurnRiskLevel,
} from '../../utils/churnRisk'

interface ChurnRiskBadgeProps {
  customer: Customer
  projects: Project[]
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const riskIcons: Record<ChurnRiskLevel, React.ElementType> = {
  critical: AlertOctagon,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Shield,
  none: CheckCircle,
}

export default function ChurnRiskBadge({
  customer,
  projects,
  showDetails = false,
  size = 'md',
}: ChurnRiskBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { level, score, factors, recommendation } = calculateChurnRisk(customer, projects)

  const Icon = riskIcons[level]

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

  // Don't show badge for no risk unless showDetails is true
  if (level === 'none' && !showDetails) {
    return null
  }

  if (!showDetails) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${getChurnRiskBgColor(level)} ${getChurnRiskColor(level)}`}
        title={`Churn Risk: ${getChurnRiskLabel(level)}`}
      >
        <Icon className={iconSizes[size]} />
        {level !== 'none' && <span>{getChurnRiskLabel(level)}</span>}
      </span>
    )
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        level === 'critical'
          ? 'border-red-300 bg-red-50'
          : level === 'high'
          ? 'border-orange-300 bg-orange-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-opacity-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${getChurnRiskBgColor(level)}`}
          >
            <Icon className={`w-5 h-5 ${getChurnRiskColor(level)}`} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Churn Risk</p>
            <p className={`text-sm font-medium ${getChurnRiskColor(level)}`}>
              {getChurnRiskLabel(level)}
              {level !== 'none' && (
                <span className="text-gray-500 font-normal ml-2">({score}%)</span>
              )}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-white">
          {/* Recommendation */}
          <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-700 mb-0.5">Recommended Action</p>
              <p className="text-sm text-blue-800">{recommendation}</p>
            </div>
          </div>

          {/* Risk factors */}
          {factors.length > 0 && (
            <>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Risk Factors</p>
              <div className="space-y-2">
                {factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded ${
                      factor.severity === 'high'
                        ? 'bg-red-50'
                        : factor.severity === 'medium'
                        ? 'bg-yellow-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          factor.severity === 'high'
                            ? 'bg-red-500'
                            : factor.severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-700">{factor.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{factor.description}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {factors.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No risk factors identified
            </p>
          )}

          {/* Risk meter */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  level === 'critical'
                    ? 'bg-red-500'
                    : level === 'high'
                    ? 'bg-orange-500'
                    : level === 'medium'
                    ? 'bg-yellow-500'
                    : level === 'low'
                    ? 'bg-blue-500'
                    : 'bg-green-500'
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
