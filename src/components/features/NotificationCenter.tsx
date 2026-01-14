import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  CheckSquare,
  Activity,
  UserX,
  X,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  generateNotifications,
  Notification,
  NotificationType,
  getNotificationColor
} from '../../utils/notifications'

const iconMap: Record<NotificationType, React.ReactNode> = {
  foc_approaching: <Calendar className="w-4 h-4" />,
  foc_overdue: <Calendar className="w-4 h-4" />,
  ticket_needs_response: <Mail className="w-4 h-4" />,
  follow_up_due: <Phone className="w-4 h-4" />,
  escalated: <AlertTriangle className="w-4 h-4" />,
  task_overdue: <CheckSquare className="w-4 h-4" />,
  low_health: <Activity className="w-4 h-4" />,
  no_contact: <UserX className="w-4 h-4" />,
}

export default function NotificationCenter() {
  const navigate = useNavigate()
  const { state, getCustomer } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dismissed-notifications')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getCustomerName = (customerId: string) => {
    const customer = getCustomer(customerId)
    return customer?.companyName || 'Unknown Customer'
  }

  const allNotifications = generateNotifications(state.projects, state.tickets, getCustomerName)
  const notifications = allNotifications.filter(n => !dismissedIds.has(n.id))

  const urgentCount = notifications.filter(n => n.priority === 'urgent').length
  const highCount = notifications.filter(n => n.priority === 'high').length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Save dismissed notifications to localStorage
  useEffect(() => {
    localStorage.setItem('dismissed-notifications', JSON.stringify([...dismissedIds]))
  }, [dismissedIds])

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissedIds(prev => new Set([...prev, id]))
  }

  const handleDismissAll = () => {
    setDismissedIds(new Set(allNotifications.map(n => n.id)))
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
    setIsOpen(false)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold rounded-full ${
              urgentCount > 0
                ? 'bg-red-500 text-white'
                : highCount > 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleDismissAll}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Dismiss all
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No notifications at this time.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 20).map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.priority)}`}
                      >
                        {iconMap[notification.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.projectName}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              {notification.title}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDismiss(notification.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                            aria-label="Dismiss"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.actionLabel && (
                            <span className="text-xs text-blue-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {notification.actionLabel}
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 20 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
              <span className="text-sm text-gray-500">
                +{notifications.length - 20} more notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
