import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Calendar,
} from 'lucide-react'
import { Project, Customer } from '../../types'
import Card from '../ui/Card'
import {
  calculateRevenueForecasting,
  getConfidenceColor,
  getConfidenceBgColor,
  MonthlyForecast,
} from '../../utils/revenueForecasting'

interface RevenueForecastProps {
  projects: Project[]
  customers: Customer[]
  showDetails?: boolean
}

export default function RevenueForecast({
  projects,
  customers,
  showDetails = true,
}: RevenueForecastProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const forecast = calculateRevenueForecasting(projects, customers)

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedMonths(newExpanded)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Total Sold</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(forecast.totalSoldMRC)}
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Activated</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(forecast.activatedMRC)}
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {forecast.activationRate}% activation rate
          </p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Pending</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(forecast.pendingActivationMRC)}
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Avg {forecast.avgDaysToActivate} days to activate
          </p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(forecast.atRiskMRC)}
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Escalated or delayed
          </p>
        </Card>
      </div>

      {showDetails && (
        <>
          {/* Activation Progress Bar */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Activation Progress</h3>
              <span className="text-sm text-gray-500">
                {formatCurrency(forecast.activatedMRC)} of {formatCurrency(forecast.totalSoldMRC)}
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${forecast.activationRate}%` }}
                  title={`Activated: ${formatCurrency(forecast.activatedMRC)}`}
                />
                {forecast.atRiskMRC > 0 && (
                  <div
                    className="bg-red-400 transition-all duration-500"
                    style={{ width: `${(forecast.atRiskMRC / forecast.totalSoldMRC) * 100}%` }}
                    title={`At Risk: ${formatCurrency(forecast.atRiskMRC)}`}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                Activated
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded" />
                At Risk
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded" />
                Pending
              </span>
            </div>
          </Card>

          {/* Monthly Forecast */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">6-Month Activation Forecast</h3>
            </div>

            <div className="space-y-2">
              {forecast.forecast.map((month) => (
                <MonthForecastRow
                  key={month.month}
                  month={month}
                  isExpanded={expandedMonths.has(month.month)}
                  onToggle={() => toggleMonth(month.month)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>

            {/* Cumulative Chart (Simple) */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Cumulative Activated MRC
              </p>
              <div className="flex items-end gap-2 h-24">
                {forecast.forecast.map((month) => {
                  const maxMRC = Math.max(...forecast.forecast.map(m => m.cumulativeActivatedMRC))
                  const height = maxMRC > 0 ? (month.cumulativeActivatedMRC / maxMRC) * 100 : 0
                  return (
                    <div
                      key={month.month}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-green-500 rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                        title={`${month.month}: ${formatCurrency(month.cumulativeActivatedMRC)}`}
                      />
                      <span className="text-xs text-gray-500 mt-1">{month.month.split(' ')[0]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

interface MonthForecastRowProps {
  month: MonthlyForecast
  isExpanded: boolean
  onToggle: () => void
  formatCurrency: (amount: number) => string
}

function MonthForecastRow({
  month,
  isExpanded,
  onToggle,
  formatCurrency,
}: MonthForecastRowProps) {
  if (month.projects.length === 0) {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm text-gray-600">{month.month}</span>
        <span className="text-sm text-gray-400">No activations forecasted</span>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{month.month}</span>
          <span className="text-sm text-gray-500">
            {month.projects.length} project{month.projects.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-green-600">
            +{formatCurrency(month.projectedActivationMRC)}/mo
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left pb-2">Customer</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Expected</th>
                <th className="text-left pb-2">Confidence</th>
                <th className="text-right pb-2">MRC</th>
              </tr>
            </thead>
            <tbody>
              {month.projects.map((project) => (
                <tr key={project.projectId} className="border-t border-gray-200">
                  <td className="py-2 text-gray-900">{project.customerName}</td>
                  <td className="py-2 text-gray-600 capitalize">{project.status}</td>
                  <td className="py-2 text-gray-600">
                    {project.expectedActivationDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getConfidenceBgColor(project.confidence)} ${getConfidenceColor(project.confidence)}`}
                    >
                      {project.confidence}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatCurrency(project.mrc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
