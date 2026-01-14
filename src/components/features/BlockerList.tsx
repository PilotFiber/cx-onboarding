import { useState } from 'react'
import { AlertCircle, CheckCircle, Plus, Clock } from 'lucide-react'
import { Blocker, BlockerType } from '../../types'
import Button from '../ui/Button'
import Select from '../ui/Select'

interface BlockerListProps {
  blockers: Blocker[]
  onAddBlocker: (type: BlockerType, description: string) => void
  onResolveBlocker: (blockerId: string) => void
}

const blockerTypeLabels: Record<BlockerType, string> = {
  waiting_customer: 'Waiting on Customer',
  waiting_permit: 'Waiting on Permit',
  waiting_equipment: 'Waiting on Equipment',
  waiting_scheduling: 'Waiting on Scheduling',
  waiting_internal: 'Waiting on Internal Team',
  waiting_vendor: 'Waiting on Vendor',
  waiting_joe: 'Waiting on Joe',
  technical_issue: 'Technical Issue',
  other: 'Other',
}

const blockerTypeOptions = Object.entries(blockerTypeLabels).map(([value, label]) => ({
  value,
  label,
}))

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export default function BlockerList({ blockers, onAddBlocker, onResolveBlocker }: BlockerListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newType, setNewType] = useState<BlockerType>('waiting_customer')
  const [newDescription, setNewDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDescription.trim()) {
      onAddBlocker(newType, newDescription.trim())
      setNewDescription('')
      setNewType('waiting_customer')
      setIsAdding(false)
    }
  }

  // Separate active and resolved blockers
  const activeBlockers = blockers.filter(b => !b.resolvedAt)
  const resolvedBlockers = blockers.filter(b => b.resolvedAt)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Blockers
          {activeBlockers.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
              {activeBlockers.length} active
            </span>
          )}
        </h3>
        {!isAdding && (
          <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Blocker
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Type</label>
              <Select
                options={blockerTypeOptions}
                value={newType}
                onChange={(val) => setNewType(val as BlockerType)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What's blocking this project?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary resize-none"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="secondary" size="sm" onClick={() => { setIsAdding(false); setNewDescription('') }}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={!newDescription.trim()}>
              Add Blocker
            </Button>
          </div>
        </form>
      )}

      {activeBlockers.length === 0 && resolvedBlockers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
          <p>No blockers</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Blockers */}
          {activeBlockers.length > 0 && (
            <ul className="space-y-2">
              {activeBlockers.map((blocker) => {
                const days = daysSince(blocker.createdAt)
                return (
                  <li
                    key={blocker.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          {blockerTypeLabels[blocker.type]}
                        </span>
                        <p className="text-sm text-gray-700 mt-2">{blocker.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Added {formatDate(blocker.createdAt)} ({days}d ago) by {blocker.createdBy}</span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onResolveBlocker(blocker.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Resolved Blockers */}
          {resolvedBlockers.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Resolved</p>
              <ul className="space-y-2">
                {resolvedBlockers.slice(0, 3).map((blocker) => (
                  <li
                    key={blocker.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-500">
                        {blockerTypeLabels[blocker.type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-through">{blocker.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Resolved {formatDate(blocker.resolvedAt!)} by {blocker.resolvedBy}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
