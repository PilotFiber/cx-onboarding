import { useState } from 'react'
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  PhoneCall,
  Mail,
  Timer,
  GitBranch,
  Zap,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Crown,
  Shield,
  UserPlus,
  Workflow,
} from 'lucide-react'
import {
  Playbook,
  PlaybookExecution,
  PlaybookCategory,
  PlaybookStepType,
  playbookCategoryConfig,
  Customer,
} from '../../types'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface PlaybookPanelProps {
  playbooks: Playbook[]
  executions: PlaybookExecution[]
  customers: Customer[]
  projectId?: string
  customerId?: string
  onStartPlaybook?: (playbookId: string) => void
  onCompleteStep?: (executionId: string, stepId: string) => void
  compact?: boolean
}

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

export default function PlaybookPanel({
  playbooks,
  executions,
  customers,
  projectId,
  onStartPlaybook,
  onCompleteStep,
  compact = false,
}: PlaybookPanelProps) {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<PlaybookCategory | null>(null)

  const customerMap = new Map(customers.map(c => [c.id, c]))

  // Active executions for this project
  const activeExecutions = projectId
    ? executions.filter(e => e.projectId === projectId && e.status === 'in-progress')
    : executions.filter(e => e.status === 'in-progress')

  // Group playbooks by category
  const playbooksByCategory = playbooks.reduce((acc, playbook) => {
    if (!acc[playbook.category]) acc[playbook.category] = []
    acc[playbook.category].push(playbook)
    return acc
  }, {} as Record<PlaybookCategory, Playbook[]>)

  const toggleCategory = (category: PlaybookCategory) => {
    setExpandedCategory(prev => (prev === category ? null : category))
  }

  if (compact) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Playbooks</h3>
            {activeExecutions.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {activeExecutions.length} active
              </span>
            )}
          </div>
        </div>

        {/* Active Executions */}
        {activeExecutions.length > 0 && (
          <div className="space-y-2 mb-4">
            {activeExecutions.map(execution => {
              const playbook = playbooks.find(p => p.id === execution.playbookId)
              if (!playbook) return null
              const currentStepIndex = playbook.steps.findIndex(s => s.id === execution.currentStepId)
              const progress = ((execution.stepCompletions.length) / playbook.steps.length) * 100

              return (
                <div key={execution.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{playbook.name}</span>
                    <span className="text-xs text-blue-600">
                      Step {currentStepIndex + 1}/{playbook.steps.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-blue-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Next: {playbook.steps[currentStepIndex]?.title}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Start */}
        <div className="space-y-2">
          {playbooks.slice(0, 3).map(playbook => {
            const config = playbookCategoryConfig[playbook.category]
            const Icon = categoryIcons[playbook.category]
            return (
              <button
                key={playbook.id}
                onClick={() => onStartPlaybook?.(playbook.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{playbook.name}</p>
                  <p className="text-xs text-gray-500">{playbook.steps.length} steps</p>
                </div>
                <Play className="w-4 h-4 text-gray-400" />
              </button>
            )
          })}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Automated Playbooks</h3>
        </div>
      </div>

      {/* Active Executions */}
      {activeExecutions.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">Active Playbooks</h4>
          </div>
          <div className="space-y-4">
            {activeExecutions.map(execution => {
              const playbook = playbooks.find(p => p.id === execution.playbookId)
              if (!playbook) return null
              const customer = customerMap.get(execution.customerId)

              return (
                <ActiveExecutionCard
                  key={execution.id}
                  execution={execution}
                  playbook={playbook}
                  customerName={customer?.companyName}
                  onCompleteStep={onCompleteStep}
                />
              )
            })}
          </div>
        </Card>
      )}

      {/* Playbook Library */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Playbook Library</h4>
        </div>

        <div className="space-y-2">
          {Object.entries(playbooksByCategory).map(([category, categoryPlaybooks]) => {
            const config = playbookCategoryConfig[category as PlaybookCategory]
            const Icon = categoryIcons[category as PlaybookCategory]
            const isExpanded = expandedCategory === category

            return (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category as PlaybookCategory)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{config.label}</p>
                      <p className="text-xs text-gray-500">{categoryPlaybooks.length} playbook(s)</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-2">
                    {categoryPlaybooks.map(playbook => (
                      <div
                        key={playbook.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{playbook.name}</p>
                          <p className="text-sm text-gray-500">{playbook.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{playbook.steps.length} steps</span>
                            <span>•</span>
                            <span>{playbook.estimatedDuration}</span>
                            <span>•</span>
                            <span>Used {playbook.timesUsed}x</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedPlaybook(playbook)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onStartPlaybook?.(playbook.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Playbook Detail Modal */}
      {selectedPlaybook && (
        <PlaybookDetailModal
          playbook={selectedPlaybook}
          onClose={() => setSelectedPlaybook(null)}
          onStart={() => {
            onStartPlaybook?.(selectedPlaybook.id)
            setSelectedPlaybook(null)
          }}
        />
      )}
    </div>
  )
}

interface ActiveExecutionCardProps {
  execution: PlaybookExecution
  playbook: Playbook
  customerName?: string
  onCompleteStep?: (executionId: string, stepId: string) => void
}

function ActiveExecutionCard({
  execution,
  playbook,
  customerName,
  onCompleteStep,
}: ActiveExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = playbookCategoryConfig[playbook.category]
  const Icon = categoryIcons[playbook.category]

  const completedStepIds = new Set(execution.stepCompletions.map(s => s.stepId))
  const currentStepIndex = playbook.steps.findIndex(s => s.id === execution.currentStepId)
  const progress = (execution.stepCompletions.length / playbook.steps.length) * 100

  return (
    <div className={`border rounded-lg overflow-hidden ${config.bgColor.replace('bg-', 'border-').replace('100', '200')}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 ${config.bgColor} hover:bg-opacity-80 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">{playbook.name}</p>
            {customerName && <p className="text-sm text-gray-600">{customerName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-sm font-medium ${config.color}`}>
              Step {currentStepIndex + 1} of {playbook.steps.length}
            </p>
            <div className="w-24 h-1.5 bg-white rounded-full mt-1">
              <div
                className={`h-full rounded-full ${config.bgColor.replace('100', '500')}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="space-y-3">
            {playbook.steps.map((step, idx) => {
              const isCompleted = completedStepIds.has(step.id)
              const isCurrent = step.id === execution.currentStepId
              const StepIcon = stepTypeIcons[step.type]

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    isCurrent ? 'bg-blue-50 border border-blue-200' :
                    isCompleted ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StepIcon className="w-4 h-4 text-gray-400" />
                      <p className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {step.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                  {isCurrent && onCompleteStep && (
                    <Button
                      size="sm"
                      onClick={() => onCompleteStep(execution.id, step.id)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface PlaybookDetailModalProps {
  playbook: Playbook
  onClose: () => void
  onStart: () => void
}

function PlaybookDetailModal({ playbook, onClose, onStart }: PlaybookDetailModalProps) {
  const config = playbookCategoryConfig[playbook.category]
  const Icon = categoryIcons[playbook.category]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${config.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{playbook.name}</h3>
              <span className={`text-sm ${config.color}`}>{config.label}</span>
            </div>
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
          <p className="text-gray-600">{playbook.description}</p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{playbook.steps.length}</p>
              <p className="text-xs text-gray-500">Steps</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{playbook.estimatedDuration}</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{playbook.timesUsed}</p>
              <p className="text-xs text-gray-500">Times Used</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Trigger Conditions:</p>
            <div className="flex flex-wrap gap-2">
              {playbook.triggerConditions.map((condition, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {condition}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Steps:</p>
            <div className="space-y-2">
              {playbook.steps.map((step, idx) => {
                const StepIcon = stepTypeIcons[step.type]
                return (
                  <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-sm font-medium text-gray-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StepIcon className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{step.title}</p>
                        {step.isOptional && (
                          <span className="text-xs text-gray-500">(optional)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onStart}>
            <Play className="w-4 h-4 mr-2" />
            Start Playbook
          </Button>
        </div>
      </div>
    </div>
  )
}
