import { useState } from 'react'
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Bell,
  Clock,
  Save,
  Check,
  MessageSquare,
} from 'lucide-react'
import {
  currentUser,
  roleLabels,
  getUserPermissions,
  NotificationPreferences,
  defaultNotificationPreferences,
} from '../data/teamMembers'
import {
  SlackIntegration as SlackIntegrationType,
  SlackNotificationPreference,
  slackNotificationTypeConfig,
  SlackNotificationType,
} from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SlackIntegration from '../components/features/SlackIntegration'

// Mock initial Slack integration state
const initialSlackIntegration: SlackIntegrationType = {
  isConnected: true,
  workspaceName: 'Pilot Fiber',
  userId: 'U123456',
  userName: currentUser.name,
  defaultChannelId: 'ch-1',
  notifications: Object.keys(slackNotificationTypeConfig).map(type => ({
    type: type as SlackNotificationType,
    enabled: slackNotificationTypeConfig[type as SlackNotificationType].defaultEnabled,
    directMessage: true,
  })),
}

export default function Profile() {
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    currentUser.notificationPreferences
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [slackIntegration, setSlackIntegration] = useState<SlackIntegrationType>(initialSlackIntegration)

  const permissions = getUserPermissions(currentUser)

  const handleSlackConnect = () => {
    // Simulate OAuth connection
    setSlackIntegration({
      ...slackIntegration,
      isConnected: true,
      workspaceName: 'Pilot Fiber',
      userId: 'U123456',
      userName: currentUser.name,
    })
  }

  const handleSlackDisconnect = () => {
    setSlackIntegration({
      ...slackIntegration,
      isConnected: false,
      workspaceName: undefined,
      userId: undefined,
      userName: undefined,
      defaultChannelId: undefined,
    })
  }

  const handleSlackPreferencesUpdate = (preferences: SlackNotificationPreference[]) => {
    setSlackIntegration({
      ...slackIntegration,
      notifications: preferences,
    })
  }

  const handleSlackDefaultChannel = (channelId: string) => {
    setSlackIntegration({
      ...slackIntegration,
      defaultChannelId: channelId,
    })
  }

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }, 500)
  }

  const handleResetToDefaults = () => {
    setNotifications(defaultNotificationPreferences)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and notification preferences</p>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-pilot-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-pilot-secondary">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
            <p className="text-gray-600">{currentUser.title}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              currentUser.role === 'manager' ? 'bg-blue-100 text-blue-700' :
              currentUser.role === 'senior_cxa' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {roleLabels[currentUser.role]}
            </span>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
              {currentUser.department && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{currentUser.department}</span>
                </div>
              )}
              {currentUser.startDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(currentUser.startDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Your permissions are determined by your role ({roleLabels[currentUser.role]})
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(permissions).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                value ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {value ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <span className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
              <span className={`text-sm ${value ? 'text-gray-700' : 'text-gray-400'}`}>
                {formatPermissionName(key)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>
          <button
            onClick={handleResetToDefaults}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset to defaults
          </button>
        </div>

        {/* Email Notifications */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Email Notifications
          </h4>
          <div className="space-y-3">
            <NotificationToggle
              label="New project assignments"
              description="Get notified when you're assigned to a new project"
              checked={notifications.emailNewAssignment}
              onChange={(v) => handleNotificationChange('emailNewAssignment', v)}
            />
            <NotificationToggle
              label="Ticket responses"
              description="Get notified when a customer responds to a ticket"
              checked={notifications.emailTicketResponse}
              onChange={(v) => handleNotificationChange('emailTicketResponse', v)}
            />
            <NotificationToggle
              label="Escalations"
              description="Get notified when a project is escalated"
              checked={notifications.emailEscalation}
              onChange={(v) => handleNotificationChange('emailEscalation', v)}
            />
            <NotificationToggle
              label="FOC date reminders"
              description="Get reminders when FOC dates are approaching"
              checked={notifications.emailFocReminder}
              onChange={(v) => handleNotificationChange('emailFocReminder', v)}
            />
            <NotificationToggle
              label="Daily digest"
              description="Receive a daily summary of activity"
              checked={notifications.emailDailyDigest}
              onChange={(v) => handleNotificationChange('emailDailyDigest', v)}
            />
          </div>
        </div>

        {/* Slack Notifications */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Slack Notifications
          </h4>
          <div className="space-y-3">
            <NotificationToggle
              label="Enable Slack notifications"
              description="Send notifications to your Slack DMs"
              checked={notifications.slackEnabled}
              onChange={(v) => handleNotificationChange('slackEnabled', v)}
            />
            {notifications.slackEnabled && (
              <>
                <NotificationToggle
                  label="New project assignments"
                  description="Get Slack message when assigned to a project"
                  checked={notifications.slackNewAssignment}
                  onChange={(v) => handleNotificationChange('slackNewAssignment', v)}
                />
                <NotificationToggle
                  label="Ticket responses"
                  description="Get Slack message when tickets receive responses"
                  checked={notifications.slackTicketResponse}
                  onChange={(v) => handleNotificationChange('slackTicketResponse', v)}
                />
                <NotificationToggle
                  label="Escalations"
                  description="Get Slack message for escalated projects"
                  checked={notifications.slackEscalation}
                  onChange={(v) => handleNotificationChange('slackEscalation', v)}
                />
                <NotificationToggle
                  label="FOC date reminders"
                  description="Get Slack reminder for approaching FOC dates"
                  checked={notifications.slackFocReminder}
                  onChange={(v) => handleNotificationChange('slackFocReminder', v)}
                />
                <NotificationToggle
                  label="Mentions"
                  description="Get Slack message when mentioned in notes"
                  checked={notifications.slackMentions}
                  onChange={(v) => handleNotificationChange('slackMentions', v)}
                />
              </>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            In-App Notifications
          </h4>
          <div className="space-y-3">
            <NotificationToggle
              label="New project assignments"
              description="Show notification when assigned to a project"
              checked={notifications.inAppNewAssignment}
              onChange={(v) => handleNotificationChange('inAppNewAssignment', v)}
            />
            <NotificationToggle
              label="Ticket responses"
              description="Show notification when tickets receive responses"
              checked={notifications.inAppTicketResponse}
              onChange={(v) => handleNotificationChange('inAppTicketResponse', v)}
            />
            <NotificationToggle
              label="Escalations"
              description="Show notification for escalated projects"
              checked={notifications.inAppEscalation}
              onChange={(v) => handleNotificationChange('inAppEscalation', v)}
            />
            <NotificationToggle
              label="FOC date reminders"
              description="Show alerts for approaching FOC dates"
              checked={notifications.inAppFocReminder}
              onChange={(v) => handleNotificationChange('inAppFocReminder', v)}
            />
            <NotificationToggle
              label="Status changes"
              description="Show notifications when project status changes"
              checked={notifications.inAppStatusChange}
              onChange={(v) => handleNotificationChange('inAppStatusChange', v)}
            />
            <NotificationToggle
              label="Mentions"
              description="Show notifications when you're mentioned in notes"
              checked={notifications.inAppMentions}
              onChange={(v) => handleNotificationChange('inAppMentions', v)}
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Quiet Hours
          </h4>
          <div className="space-y-3">
            <NotificationToggle
              label="Enable quiet hours"
              description="Pause non-urgent notifications during specific hours"
              checked={notifications.quietHoursEnabled}
              onChange={(v) => handleNotificationChange('quietHoursEnabled', v)}
            />
            {notifications.quietHoursEnabled && (
              <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <label className="text-sm text-gray-600">From</label>
                  <input
                    type="time"
                    value={notifications.quietHoursStart}
                    onChange={(e) => handleNotificationChange('quietHoursStart', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">To</label>
                  <input
                    type="time"
                    value={notifications.quietHoursEnd}
                    onChange={(e) => handleNotificationChange('quietHoursEnd', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Digest Time */}
        {notifications.emailDailyDigest && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Daily Digest Time
            </h4>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <label className="text-sm text-gray-600">Send digest at</label>
              <input
                type="time"
                value={notifications.digestTime}
                onChange={(e) => handleNotificationChange('digestTime', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : showSaved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
          {showSaved && (
            <span className="text-sm text-green-600">
              Your preferences have been saved.
            </span>
          )}
        </div>
      </Card>

      {/* Slack Workspace Integration */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Slack Workspace Integration</h3>
        </div>
        <SlackIntegration
          integration={slackIntegration}
          onConnect={handleSlackConnect}
          onDisconnect={handleSlackDisconnect}
          onUpdatePreferences={handleSlackPreferencesUpdate}
          onSetDefaultChannel={handleSlackDefaultChannel}
        />
      </div>
    </div>
  )
}

interface NotificationToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="mt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`
          w-10 h-6 rounded-full transition-colors relative
          ${checked ? 'bg-pilot-secondary' : 'bg-gray-300'}
        `}>
          <div className={`
            absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
            ${checked ? 'left-5' : 'left-1'}
          `} />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  )
}

function formatPermissionName(key: string): string {
  return key
    .replace(/^can/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}
