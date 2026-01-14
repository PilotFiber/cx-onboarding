import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  User,
} from 'lucide-react'
import { NPSSurveyResponse, Customer, npsCategoryConfig } from '../../types'
import Card from '../ui/Card'
import {
  calculateNPSMetrics,
  calculateNPSByMonth,
  generateNPSInsights,
  getNPSScoreColor,
  getNPSScoreBgColor,
  getNPSScoreLabel,
  getCategoryColor,
  getCategoryBgColor,
  NPSInsight,
} from '../../utils/npsTracking'

interface NPSTrackingProps {
  responses: NPSSurveyResponse[]
  customers: Customer[]
  showDetails?: boolean
}

export default function NPSTracking({
  responses,
  customers,
  showDetails = true,
}: NPSTrackingProps) {
  const [showAllResponses, setShowAllResponses] = useState(false)
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null)

  const metrics = calculateNPSMetrics(responses)
  const monthlyData = calculateNPSByMonth(responses)
  const insights = generateNPSInsights(metrics, responses, customers)

  const customerMap = new Map(customers.map(c => [c.id, c]))

  const recentResponses = [...responses]
    .sort((a, b) => new Date(b.respondedAt).getTime() - new Date(a.respondedAt).getTime())
    .slice(0, showAllResponses ? 20 : 5)

  const pendingFollowups = responses.filter(
    r => r.followUpRequired && !r.followUpCompletedAt
  )

  const TrendIcon =
    metrics.trend === 'improving' ? TrendingUp :
    metrics.trend === 'declining' ? TrendingDown : Minus

  const trendColor =
    metrics.trend === 'improving' ? 'text-green-600' :
    metrics.trend === 'declining' ? 'text-red-600' : 'text-gray-500'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="text-center col-span-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">NPS Score</span>
          </div>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getNPSScoreBgColor(metrics.score)} mb-2`}>
            <span className={`text-3xl font-bold ${getNPSScoreColor(metrics.score)}`}>
              {metrics.score > 0 ? '+' : ''}{metrics.score}
            </span>
          </div>
          <p className={`text-sm font-medium ${getNPSScoreColor(metrics.score)}`}>
            {getNPSScoreLabel(metrics.score)}
          </p>
          <div className={`flex items-center justify-center gap-1 mt-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs capitalize">{metrics.trend}</span>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ThumbsUp className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Promoters</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{metrics.promoters}</p>
          <p className="text-xs text-gray-500">{metrics.promoterPercentage}%</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Minus className="w-5 h-5 text-yellow-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Passives</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{metrics.passives}</p>
          <p className="text-xs text-gray-500">{metrics.passivePercentage}%</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ThumbsDown className="w-5 h-5 text-red-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Detractors</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{metrics.detractors}</p>
          <p className="text-xs text-gray-500">{metrics.detractorPercentage}%</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Responses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalResponses}</p>
          <p className="text-xs text-gray-500">Avg: {metrics.averageScore}/10</p>
        </Card>
      </div>

      {showDetails && (
        <>
          {/* Category Breakdown Bar */}
          <Card>
            <h3 className="font-medium text-gray-900 mb-3">Response Distribution</h3>
            <div className="h-8 flex rounded-lg overflow-hidden">
              {metrics.promoterPercentage > 0 && (
                <div
                  className="bg-green-500 flex items-center justify-center transition-all"
                  style={{ width: `${metrics.promoterPercentage}%` }}
                  title={`Promoters: ${metrics.promoterPercentage}%`}
                >
                  {metrics.promoterPercentage >= 10 && (
                    <span className="text-white text-xs font-medium">{metrics.promoterPercentage}%</span>
                  )}
                </div>
              )}
              {metrics.passivePercentage > 0 && (
                <div
                  className="bg-yellow-400 flex items-center justify-center transition-all"
                  style={{ width: `${metrics.passivePercentage}%` }}
                  title={`Passives: ${metrics.passivePercentage}%`}
                >
                  {metrics.passivePercentage >= 10 && (
                    <span className="text-gray-800 text-xs font-medium">{metrics.passivePercentage}%</span>
                  )}
                </div>
              )}
              {metrics.detractorPercentage > 0 && (
                <div
                  className="bg-red-500 flex items-center justify-center transition-all"
                  style={{ width: `${metrics.detractorPercentage}%` }}
                  title={`Detractors: ${metrics.detractorPercentage}%`}
                >
                  {metrics.detractorPercentage >= 10 && (
                    <span className="text-white text-xs font-medium">{metrics.detractorPercentage}%</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                Promoters (9-10)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                Passives (7-8)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                Detractors (0-6)
              </span>
            </div>
          </Card>

          {/* Monthly Trend */}
          {monthlyData.length > 1 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">NPS Trend</h3>
              </div>
              <div className="flex items-end gap-4 h-32">
                {monthlyData.map((month) => {
                  const maxScore = Math.max(...monthlyData.map(m => Math.abs(m.metrics.score)), 50)
                  const barHeight = Math.abs(month.metrics.score) / maxScore * 100
                  const isPositive = month.metrics.score >= 0

                  return (
                    <div key={month.period} className="flex-1 flex flex-col items-center">
                      <span className="text-xs text-gray-600 mb-1">
                        {month.metrics.score > 0 ? '+' : ''}{month.metrics.score}
                      </span>
                      <div className="w-full h-20 flex items-end justify-center bg-gray-50 rounded">
                        <div
                          className={`w-full rounded-t transition-all ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{month.period.split(' ')[0]}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-medium text-gray-900">Insights & Recommendations</h3>
              </div>
              <div className="space-y-2">
                {insights.map((insight, idx) => (
                  <InsightRow
                    key={idx}
                    insight={insight}
                    isExpanded={expandedInsight === idx}
                    onToggle={() => setExpandedInsight(expandedInsight === idx ? null : idx)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Pending Follow-ups */}
          {pendingFollowups.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-gray-900">Pending Follow-ups</h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  {pendingFollowups.length}
                </span>
              </div>
              <div className="space-y-2">
                {pendingFollowups.map(response => {
                  const customer = customerMap.get(response.customerId)
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(response.respondedAt).getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getCategoryBgColor(response.category)}`}>
                          <span className={`text-lg font-bold ${getCategoryColor(response.category)}`}>
                            {response.score}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer?.companyName || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{response.contactName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600 font-medium">{daysAgo} days ago</p>
                        <p className="text-xs text-gray-500">{response.surveyType}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Recent Responses */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Recent Responses</h3>
              </div>
              <button
                onClick={() => setShowAllResponses(!showAllResponses)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showAllResponses ? 'Show less' : 'Show more'}
              </button>
            </div>

            <div className="space-y-3">
              {recentResponses.map(response => {
                const customer = customerMap.get(response.customerId)
                const config = npsCategoryConfig[response.category]

                return (
                  <div
                    key={response.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor} flex-shrink-0`}>
                      <span className={`text-lg font-bold ${config.color}`}>{response.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{customer?.companyName || 'Unknown'}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                        {response.followUpRequired && !response.followUpCompletedAt && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
                            Follow-up needed
                          </span>
                        )}
                        {response.followUpCompletedAt && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <User className="w-3 h-3" />
                        <span>{response.contactName}</span>
                        <span>•</span>
                        <span>{new Date(response.respondedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}</span>
                        <span>•</span>
                        <span className="capitalize">{response.surveyType.replace('-', ' ')}</span>
                      </div>
                      {response.feedback && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{response.feedback}"</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

interface InsightRowProps {
  insight: NPSInsight
  isExpanded: boolean
  onToggle: () => void
}

function InsightRow({ insight, isExpanded, onToggle }: InsightRowProps) {
  const bgColor =
    insight.type === 'positive' ? 'bg-green-50 border-green-200' :
    insight.type === 'negative' ? 'bg-red-50 border-red-200' :
    'bg-yellow-50 border-yellow-200'

  const iconColor =
    insight.type === 'positive' ? 'text-green-600' :
    insight.type === 'negative' ? 'text-red-600' :
    'text-yellow-600'

  const Icon =
    insight.type === 'positive' ? CheckCircle :
    insight.type === 'negative' ? AlertTriangle :
    Lightbulb

  return (
    <div className={`border rounded-lg overflow-hidden ${bgColor}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-opacity-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="font-medium text-gray-900">{insight.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-white">
          <p className="text-sm text-gray-600">{insight.description}</p>
          {insight.suggestedAction && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">Suggested Action</p>
              <p className="text-sm text-blue-800">{insight.suggestedAction}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
