import { useState } from 'react'
import {
  Bell,
  ExternalLink,
  Check,
  X,
  DollarSign,
  Trophy,
  Newspaper,
  Users,
  Building2,
  Package,
  Heart,
  Award,
  FileText,
  Linkedin,
  Globe,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { NewsAlert, NewsAlertCategory, newsAlertCategoryConfig } from '../../types'

interface CustomerNewsPanelProps {
  alerts: NewsAlert[]
  onMarkRead?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  showDismissed?: boolean
  compact?: boolean
}

const categoryIcons: Record<NewsAlertCategory, React.ElementType> = {
  funding: DollarSign,
  milestone: Trophy,
  press: Newspaper,
  leadership: Users,
  expansion: Building2,
  product: Package,
  partnership: Heart,
  award: Award,
  general: FileText,
}

const sourceIcons = {
  linkedin: Linkedin,
  news: Globe,
  'press-release': FileText,
  social: Users,
}

export default function CustomerNewsPanel({
  alerts,
  onMarkRead,
  onDismiss,
  showDismissed = false,
  compact = false,
}: CustomerNewsPanelProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<NewsAlertCategory | 'all'>('all')

  const filteredAlerts = alerts.filter((alert) => {
    if (!showDismissed && alert.isDismissed) return false
    if (filter !== 'all' && alert.category !== filter) return false
    return true
  })

  // Sort by date, unread first
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  const toggleExpand = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts)
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId)
    } else {
      newExpanded.add(alertId)
    }
    setExpandedAlerts(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const unreadCount = alerts.filter((a) => !a.isRead && !a.isDismissed).length

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No news alerts</p>
        <p className="text-sm">News about this customer will appear here</p>
      </div>
    )
  }

  const categories = Array.from(new Set(alerts.map((a) => a.category)))

  return (
    <div>
      {/* Header with filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">News Alerts</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {!compact && categories.length > 1 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as NewsAlertCategory | 'all')}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-pilot-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {newsAlertCategoryConfig[cat].label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Alerts list */}
      <ul className="space-y-3">
        {sortedAlerts.map((alert) => {
          const config = newsAlertCategoryConfig[alert.category]
          const Icon = categoryIcons[alert.category]
          const SourceIcon = sourceIcons[alert.source]
          const isExpanded = expandedAlerts.has(alert.id)

          return (
            <li
              key={alert.id}
              className={`border rounded-lg overflow-hidden transition-colors ${
                alert.isRead
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-blue-200 shadow-sm'
              }`}
            >
              <div className="p-3">
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.bgColor}`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <SourceIcon className="w-3 h-3" />
                        {formatDate(alert.publishedAt)}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" title="Unread" />
                      )}
                    </div>
                    <h4
                      className={`font-medium mt-1 ${
                        alert.isRead ? 'text-gray-700' : 'text-gray-900'
                      }`}
                    >
                      {alert.title}
                    </h4>
                    {!compact && (
                      <p
                        className={`text-sm mt-1 ${
                          isExpanded ? '' : 'line-clamp-2'
                        } ${alert.isRead ? 'text-gray-500' : 'text-gray-600'}`}
                      >
                        {alert.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand/collapse for long content */}
                {!compact && alert.summary.length > 100 && (
                  <button
                    onClick={() => toggleExpand(alert.id)}
                    className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-0.5 ml-11"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show more
                      </>
                    )}
                  </button>
                )}

                {/* Suggested action */}
                {!compact && (alert.suggestedAction || config.defaultAction) && (
                  <div className="mt-3 ml-11 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-amber-800">
                      {alert.suggestedAction || config.defaultAction}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2 ml-11">
                  {alert.sourceUrl && (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </a>
                  )}
                  {!alert.isRead && onMarkRead && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Mark Read
                    </button>
                  )}
                  {!alert.isDismissed && onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {sortedAlerts.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No alerts match your filter
        </div>
      )}
    </div>
  )
}
