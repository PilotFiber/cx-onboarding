import { useState } from 'react'
import {
  MessageSquare,
  Link2,
  Unlink,
  Bell,
  BellOff,
  Hash,
  ChevronDown,
  ChevronUp,
  Check,
  Users,
  FolderOpen,
  Building2,
  Settings,
  Zap,
  ExternalLink,
} from 'lucide-react'
import {
  SlackIntegration as SlackIntegrationType,
  SlackChannel,
  SlackNotificationType,
  SlackNotificationPreference,
  slackNotificationTypeConfig,
} from '../../types'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface SlackIntegrationProps {
  integration: SlackIntegrationType
  onConnect?: () => void
  onDisconnect?: () => void
  onUpdatePreferences?: (preferences: SlackNotificationPreference[]) => void
  onSetDefaultChannel?: (channelId: string) => void
}

// Mock Slack channels
const mockChannels: SlackChannel[] = [
  { id: 'ch-1', name: 'cx-team', isPrivate: false, purpose: 'CX team discussions' },
  { id: 'ch-2', name: 'cx-escalations', isPrivate: false, purpose: 'Escalated project alerts' },
  { id: 'ch-3', name: 'vip-alerts', isPrivate: true, purpose: 'VIP customer notifications' },
  { id: 'ch-4', name: 'installs', isPrivate: false, purpose: 'Install coordination' },
  { id: 'ch-5', name: 'general', isPrivate: false, purpose: 'General discussion' },
]

export default function SlackIntegration({
  integration,
  onConnect,
  onDisconnect,
  onUpdatePreferences,
  onSetDefaultChannel,
}: SlackIntegrationProps) {
  const [expandedSection, setExpandedSection] = useState<'project' | 'customer' | 'team' | null>(null)
  const [preferences, setPreferences] = useState<SlackNotificationPreference[]>(
    integration.notifications.length > 0
      ? integration.notifications
      : Object.keys(slackNotificationTypeConfig).map(type => ({
          type: type as SlackNotificationType,
          enabled: slackNotificationTypeConfig[type as SlackNotificationType].defaultEnabled,
          directMessage: true,
        }))
  )

  const toggleSection = (section: 'project' | 'customer' | 'team') => {
    setExpandedSection(prev => (prev === section ? null : section))
  }

  const handleToggleNotification = (type: SlackNotificationType) => {
    const updated = preferences.map(p =>
      p.type === type ? { ...p, enabled: !p.enabled } : p
    )
    setPreferences(updated)
    onUpdatePreferences?.(updated)
  }

  const handleToggleDirectMessage = (type: SlackNotificationType) => {
    const updated = preferences.map(p =>
      p.type === type ? { ...p, directMessage: !p.directMessage } : p
    )
    setPreferences(updated)
    onUpdatePreferences?.(updated)
  }

  const handleSetChannel = (type: SlackNotificationType, channelId: string | undefined) => {
    const updated = preferences.map(p =>
      p.type === type ? { ...p, channelId } : p
    )
    setPreferences(updated)
    onUpdatePreferences?.(updated)
  }

  const projectNotifications = Object.entries(slackNotificationTypeConfig)
    .filter(([_, config]) => config.category === 'project')
  const customerNotifications = Object.entries(slackNotificationTypeConfig)
    .filter(([_, config]) => config.category === 'customer')
  const teamNotifications = Object.entries(slackNotificationTypeConfig)
    .filter(([_, config]) => config.category === 'team')

  const enabledCount = preferences.filter(p => p.enabled).length

  if (!integration.isConnected) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect to Slack</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get real-time notifications for project updates, escalations, and team mentions directly in Slack.
          </p>
          <Button onClick={onConnect}>
            <Link2 className="w-4 h-4 mr-2" />
            Connect Slack Workspace
          </Button>

          {/* Features Preview */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">What you'll get:</p>
            <div className="grid grid-cols-3 gap-4 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Instant Alerts</p>
                  <p className="text-xs text-gray-500">Real-time notifications</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Channel Integration</p>
                  <p className="text-xs text-gray-500">Route to channels</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Quick Actions</p>
                  <p className="text-xs text-gray-500">Act from Slack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{integration.workspaceName}</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <Check className="w-3 h-3" />
                  Connected
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Connected as <span className="font-medium">{integration.userName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onDisconnect}>
              <Unlink className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
            <a
              href={`https://slack.com/app_redirect?channel=${integration.defaultChannelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Card>

      {/* Default Channel */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Default Channel</h4>
          </div>
        </div>
        <select
          value={integration.defaultChannelId || ''}
          onChange={(e) => onSetDefaultChannel?.(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
        >
          <option value="">Select a default channel...</option>
          {mockChannels.map(channel => (
            <option key={channel.id} value={channel.id}>
              {channel.isPrivate ? '🔒' : '#'} {channel.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Notifications without a specific channel will be sent here
        </p>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Notification Preferences</h4>
          </div>
          <span className="text-sm text-gray-500">
            {enabledCount} of {preferences.length} enabled
          </span>
        </div>

        <div className="space-y-2">
          {/* Project Notifications */}
          <NotificationSection
            title="Project Notifications"
            icon={FolderOpen}
            isExpanded={expandedSection === 'project'}
            onToggle={() => toggleSection('project')}
            notifications={projectNotifications}
            preferences={preferences}
            channels={mockChannels}
            onToggleNotification={handleToggleNotification}
            onToggleDirectMessage={handleToggleDirectMessage}
            onSetChannel={handleSetChannel}
          />

          {/* Customer Notifications */}
          <NotificationSection
            title="Customer Notifications"
            icon={Building2}
            isExpanded={expandedSection === 'customer'}
            onToggle={() => toggleSection('customer')}
            notifications={customerNotifications}
            preferences={preferences}
            channels={mockChannels}
            onToggleNotification={handleToggleNotification}
            onToggleDirectMessage={handleToggleDirectMessage}
            onSetChannel={handleSetChannel}
          />

          {/* Team Notifications */}
          <NotificationSection
            title="Team Notifications"
            icon={Users}
            isExpanded={expandedSection === 'team'}
            onToggle={() => toggleSection('team')}
            notifications={teamNotifications}
            preferences={preferences}
            channels={mockChannels}
            onToggleNotification={handleToggleNotification}
            onToggleDirectMessage={handleToggleDirectMessage}
            onSetChannel={handleSetChannel}
          />
        </div>
      </Card>

      {/* Quick Tips */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h4 className="font-medium text-gray-900">Slack Tips</h4>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Use <code className="bg-gray-100 px-1 rounded">/pilot status [project-id]</code> to check project status</p>
          <p>• React with ✅ to mark reminders as complete</p>
          <p>• Mentions in the app will notify you in Slack</p>
          <p>• Click notification links to go directly to the project</p>
        </div>
      </Card>
    </div>
  )
}

interface NotificationSectionProps {
  title: string
  icon: React.ElementType
  isExpanded: boolean
  onToggle: () => void
  notifications: [string, typeof slackNotificationTypeConfig[SlackNotificationType]][]
  preferences: SlackNotificationPreference[]
  channels: SlackChannel[]
  onToggleNotification: (type: SlackNotificationType) => void
  onToggleDirectMessage: (type: SlackNotificationType) => void
  onSetChannel: (type: SlackNotificationType, channelId: string | undefined) => void
}

function NotificationSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  notifications,
  preferences,
  channels,
  onToggleNotification,
  onToggleDirectMessage,
  onSetChannel,
}: NotificationSectionProps) {
  const enabledInSection = notifications.filter(([type]) => {
    const pref = preferences.find(p => p.type === type)
    return pref?.enabled
  }).length

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-xs text-gray-500">
            ({enabledInSection}/{notifications.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
          {notifications.map(([type, config]) => {
            const pref = preferences.find(p => p.type === type)!

            return (
              <div key={type} className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleNotification(type as SlackNotificationType)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      pref.enabled
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {pref.enabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                  <div>
                    <p className={`font-medium ${pref.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                      {config.label}
                    </p>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                </div>

                {pref.enabled && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleDirectMessage(type as SlackNotificationType)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        pref.directMessage
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      title="Direct message"
                    >
                      DM
                    </button>
                    <select
                      value={pref.channelId || ''}
                      onChange={(e) => onSetChannel(
                        type as SlackNotificationType,
                        e.target.value || undefined
                      )}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pilot-primary"
                    >
                      <option value="">No channel</option>
                      {channels.map(channel => (
                        <option key={channel.id} value={channel.id}>
                          {channel.isPrivate ? '🔒' : '#'} {channel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
