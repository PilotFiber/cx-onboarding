import { useState } from 'react'
import {
  BookOpen,
  Plus,
  Play,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  PhoneCall,
  Mail,
  Timer,
  GitBranch,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Crown,
  Shield,
  UserPlus,
  Workflow,
  Copy,
  ToggleLeft,
  ToggleRight,
  Settings,
} from 'lucide-react'
import {
  Playbook,
  PlaybookCategory,
  PlaybookStepType,
  playbookCategoryConfig,
} from '../types'
import { mockPlaybooks, mockPlaybookExecutions } from '../data/mockPlaybooks'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const categoryIcons: Record<PlaybookCategory, React.ElementType> = {
  onboarding: UserPlus,
  escalation: AlertTriangle,
  delay: Clock,
  vip: Crown,
  'post-install': CheckCircle,
  'at-risk': Shield,
  custom: Workflow,
}

const stepTypeIcons: Record<PlaybookStepType, React.ElementType> = {
  task: CheckCircle,
  email: Mail,
  call: PhoneCall,
  wait: Timer,
  decision: GitBranch,
  automation: Zap,
}

const stepTypeLabels: Record<PlaybookStepType, string> = {
  task: 'Task',
  email: 'Send Email',
  call: 'Phone Call',
  wait: 'Wait Period',
  decision: 'Decision Point',
  automation: 'Automation',
}

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks)
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<PlaybookCategory | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null)

  // Group playbooks by category
  const filteredPlaybooks = selectedCategory === 'all'
    ? playbooks
    : playbooks.filter(p => p.category === selectedCategory)

  // Stats
  const totalPlaybooks = playbooks.length
  const activePlaybooks = playbooks.filter(p => p.isActive).length
  const totalExecutions = mockPlaybookExecutions.length
  const totalUsage = playbooks.reduce((sum, p) => sum + p.timesUsed, 0)

  const togglePlaybook = (id: string) => {
    setExpandedPlaybook(prev => (prev === id ? null : id))
  }

  const handleToggleActive = (playbookId: string) => {
    setPlaybooks(prev =>
      prev.map(p =>
        p.id === playbookId ? { ...p, isActive: !p.isActive } : p
      )
    )
  }

  const handleDuplicate = (playbook: Playbook) => {
    const newPlaybook: Playbook = {
      ...playbook,
      id: `playbook-${Date.now()}`,
      name: `${playbook.name} (Copy)`,
      timesUsed: 0,
      avgCompletionDays: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPlaybooks(prev => [...prev, newPlaybook])
  }

  const handleDelete = (playbookId: string) => {
    if (confirm('Are you sure you want to delete this playbook?')) {
      setPlaybooks(prev => prev.filter(p => p.id !== playbookId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playbooks</h1>
          <p className="text-gray-600">
            Automated workflows for common CX scenarios
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Playbook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900">{totalPlaybooks}</p>
          <p className="text-sm text-gray-600">Total Playbooks</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{activePlaybooks}</p>
          <p className="text-sm text-gray-600">Active</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{totalExecutions}</p>
          <p className="text-sm text-gray-600">Running Now</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">{totalUsage}</p>
          <p className="text-sm text-gray-600">Total Executions</p>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-pilot-secondary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {Object.entries(playbookCategoryConfig).map(([key, config]) => {
          const Icon = categoryIcons[key as PlaybookCategory]
          const count = playbooks.filter(p => p.category === key).length
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as PlaybookCategory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? `${config.bgColor} ${config.color}`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Playbook List */}
      <div className="space-y-4">
        {filteredPlaybooks.map(playbook => {
          const config = playbookCategoryConfig[playbook.category]
          const Icon = categoryIcons[playbook.category]
          const isExpanded = expandedPlaybook === playbook.id

          return (
            <Card key={playbook.id} className="overflow-hidden">
              {/* Playbook Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => togglePlaybook(playbook.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{playbook.name}</h3>
                      {!playbook.isActive && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{playbook.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{playbook.steps.length} steps</span>
                      <span>•</span>
                      <span>{playbook.estimatedDuration}</span>
                      <span>•</span>
                      <span>Used {playbook.timesUsed}x</span>
                      {playbook.avgCompletionDays > 0 && (
                        <>
                          <span>•</span>
                          <span>Avg {playbook.avgCompletionDays} days</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleActive(playbook.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        playbook.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={playbook.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {playbook.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingPlaybook(playbook)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(playbook)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(playbook.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Trigger Conditions */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Trigger Conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {playbook.triggerConditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Steps:</p>
                    <div className="space-y-2">
                      {playbook.steps.map((step, idx) => {
                        const StepIcon = stepTypeIcons[step.type]
                        return (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <StepIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                  {stepTypeLabels[step.type]}
                                </span>
                                <p className="font-medium text-gray-900">{step.title}</p>
                                {step.isOptional && (
                                  <span className="text-xs text-gray-500">(optional)</span>
                                )}
                                {step.requiresApproval && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                    Requires Approval
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                              {step.assignTo && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Assigned to: {step.assignTo}
                                </p>
                              )}
                              {step.waitHours && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Wait: {step.waitHours} hours
                                </p>
                              )}
                              {step.waitDays && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Wait: {step.waitDays} days
                                </p>
                              )}
                              {step.decisionOptions && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {step.decisionOptions.map((opt, optIdx) => (
                                    <span
                                      key={optIdx}
                                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                                    >
                                      {opt.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingPlaybook(playbook)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Run on Project
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {filteredPlaybooks.length === 0 && (
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No playbooks found</p>
          <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Playbook
          </Button>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlaybook) && (
        <PlaybookEditorModal
          playbook={editingPlaybook}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPlaybook(null)
          }}
          onSave={(playbook) => {
            if (editingPlaybook) {
              setPlaybooks(prev =>
                prev.map(p => (p.id === playbook.id ? playbook : p))
              )
            } else {
              setPlaybooks(prev => [...prev, playbook])
            }
            setShowCreateModal(false)
            setEditingPlaybook(null)
          }}
        />
      )}
    </div>
  )
}

interface PlaybookEditorModalProps {
  playbook: Playbook | null
  onClose: () => void
  onSave: (playbook: Playbook) => void
}

function PlaybookEditorModal({ playbook, onClose, onSave }: PlaybookEditorModalProps) {
  const isEditing = !!playbook
  const [name, setName] = useState(playbook?.name || '')
  const [description, setDescription] = useState(playbook?.description || '')
  const [category, setCategory] = useState<PlaybookCategory>(playbook?.category || 'custom')
  const [triggerConditions, setTriggerConditions] = useState<string[]>(
    playbook?.triggerConditions || []
  )
  const [estimatedDuration, setEstimatedDuration] = useState(playbook?.estimatedDuration || '1-2 days')
  const [newCondition, setNewCondition] = useState('')

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setTriggerConditions(prev => [...prev, newCondition.trim()])
      setNewCondition('')
    }
  }

  const handleRemoveCondition = (idx: number) => {
    setTriggerConditions(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    const updatedPlaybook: Playbook = {
      id: playbook?.id || `playbook-${Date.now()}`,
      name,
      description,
      category,
      triggerConditions,
      estimatedDuration,
      isActive: playbook?.isActive ?? true,
      createdAt: playbook?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: playbook?.createdBy || 'current-user',
      timesUsed: playbook?.timesUsed || 0,
      avgCompletionDays: playbook?.avgCompletionDays || 0,
      steps: playbook?.steps || [],
    }
    onSave(updatedPlaybook)
  }

  const config = playbookCategoryConfig[category]
  const Icon = categoryIcons[category]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${config.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900">
              {isEditing ? 'Edit Playbook' : 'Create New Playbook'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-lg"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Playbook Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., New Customer Welcome"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what this playbook does..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as PlaybookCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            >
              {Object.entries(playbookCategoryConfig).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration
            </label>
            <input
              type="text"
              value={estimatedDuration}
              onChange={e => setEstimatedDuration(e.target.value)}
              placeholder="e.g., 2-3 days"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Conditions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                placeholder="e.g., Project escalated"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                onKeyPress={e => e.key === 'Enter' && handleAddCondition()}
              />
              <Button onClick={handleAddCondition}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {triggerConditions.map((condition, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {condition}
                  <button
                    onClick={() => handleRemoveCondition(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {isEditing && playbook?.steps && playbook.steps.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                This playbook has {playbook.steps.length} steps. Step editing coming soon.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? 'Save Changes' : 'Create Playbook'}
          </Button>
        </div>
      </div>
    </div>
  )
}
