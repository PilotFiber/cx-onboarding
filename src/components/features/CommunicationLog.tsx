import { useState } from 'react'
import { Phone, Mail, Users, MessageSquare, MoreHorizontal, Plus, ArrowDownLeft, ArrowUpRight, Clock, CalendarClock } from 'lucide-react'
import { CommunicationLogEntry, CommunicationType, CommunicationDirection } from '../../types'
import Button from '../ui/Button'

interface CommunicationLogProps {
  entries: CommunicationLogEntry[]
  onAddEntry: (entry: Omit<CommunicationLogEntry, 'id' | 'createdAt' | 'author'>) => void
}

const typeIcons: Record<CommunicationType, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
  text: <MessageSquare className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
}

const typeLabels: Record<CommunicationType, string> = {
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  text: 'Text Message',
  other: 'Other',
}

const typeColors: Record<CommunicationType, string> = {
  call: 'bg-green-100 text-green-700',
  email: 'bg-blue-100 text-blue-700',
  meeting: 'bg-purple-100 text-purple-700',
  text: 'bg-cyan-100 text-cyan-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function CommunicationLog({ entries, onAddEntry }: CommunicationLogProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newEntry, setNewEntry] = useState({
    type: 'call' as CommunicationType,
    direction: 'outbound' as CommunicationDirection,
    contactName: '',
    summary: '',
    notes: '',
    duration: 0,
    followUpRequired: false,
    followUpDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.contactName || !newEntry.summary) return

    onAddEntry({
      type: newEntry.type,
      direction: newEntry.direction,
      contactName: newEntry.contactName,
      summary: newEntry.summary,
      notes: newEntry.notes || undefined,
      duration: newEntry.duration || undefined,
      followUpRequired: newEntry.followUpRequired,
      followUpDate: newEntry.followUpDate ? new Date(newEntry.followUpDate).toISOString() : undefined,
    })

    setNewEntry({
      type: 'call',
      direction: 'outbound',
      contactName: '',
      summary: '',
      notes: '',
      duration: 0,
      followUpRequired: false,
      followUpDate: '',
    })
    setIsAdding(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Communication Log
        </h3>
        {!isAdding && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Log Communication
          </Button>
        )}
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value as CommunicationType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              >
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Direction</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewEntry(prev => ({ ...prev, direction: 'outbound' }))}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm border ${
                    newEntry.direction === 'outbound'
                      ? 'bg-pilot-primary text-pilot-secondary border-pilot-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Outbound
                </button>
                <button
                  type="button"
                  onClick={() => setNewEntry(prev => ({ ...prev, direction: 'inbound' }))}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm border ${
                    newEntry.direction === 'inbound'
                      ? 'bg-pilot-primary text-pilot-secondary border-pilot-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Inbound
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact Name *</label>
              <input
                type="text"
                value={newEntry.contactName}
                onChange={(e) => setNewEntry(prev => ({ ...prev, contactName: e.target.value }))}
                placeholder="Who did you speak with?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={newEntry.duration || ''}
                onChange={(e) => setNewEntry(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Summary *</label>
            <input
              type="text"
              value={newEntry.summary}
              onChange={(e) => setNewEntry(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Brief summary of the communication"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea
              value={newEntry.notes}
              onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional details..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newEntry.followUpRequired}
                onChange={(e) => setNewEntry(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-pilot-primary focus:ring-pilot-primary"
              />
              <span className="text-sm text-gray-700">Follow-up required</span>
            </label>
            {newEntry.followUpRequired && (
              <input
                type="date"
                value={newEntry.followUpDate}
                onChange={(e) => setNewEntry(prev => ({ ...prev, followUpDate: e.target.value }))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Log Communication
            </Button>
          </div>
        </form>
      )}

      {/* Entries List */}
      {(!entries || entries.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          <Phone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No communications logged yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Log Communication" to record a touchpoint</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${typeColors[entry.type]}`}>
                  {typeIcons[entry.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{entry.summary}</span>
                    {entry.direction === 'inbound' ? (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <ArrowDownLeft className="w-3 h-3" />
                        from
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <ArrowUpRight className="w-3 h-3" />
                        to
                      </span>
                    )}
                    <span className="text-sm text-gray-700">{entry.contactName}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.createdAt)}
                    </span>
                    {entry.duration && (
                      <span>{entry.duration} min</span>
                    )}
                    {entry.followUpRequired && entry.followUpDate && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <CalendarClock className="w-3 h-3" />
                        Follow-up: {new Date(entry.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="text-gray-400">by {entry.author}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
