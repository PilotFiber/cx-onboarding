import { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Loader2,
  Mail,
  ChevronDown,
} from 'lucide-react'
import {
  getSuggestions,
  getScenarios,
  EmailScenario,
  EmailSuggestion,
  ScenarioInfo,
  ComposeContext,
} from '../../services/aiService'
import SmartCompose from './SmartCompose'
import Button from '../ui/Button'
import { Project, Customer, Building } from '../../types'
import { currentUser } from '../../data/teamMembers'

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  customer: Customer
  building: Building
}

type ToneOption = 'formal' | 'friendly' | 'urgent'

const toneLabels: Record<ToneOption, { label: string; description: string }> = {
  friendly: { label: 'Friendly', description: 'Warm and approachable' },
  formal: { label: 'Formal', description: 'Professional and business-like' },
  urgent: { label: 'Urgent', description: 'Time-sensitive communication' },
}

const slotLabels: Record<string, string> = {
  'early-7': '7:00 AM',
  'morning-9': '9:00 AM',
  'morning-11': '11:00 AM',
  'all-day': 'All Day',
  'after-hours': '6:00 PM',
}

export default function EmailComposer({
  isOpen,
  onClose,
  project,
  customer,
  building,
}: EmailComposerProps) {
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([])
  const [selectedScenario, setSelectedScenario] = useState<EmailScenario>('intro')
  const [selectedTone, setSelectedTone] = useState<ToneOption>('friendly')
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)

  // Editable fields
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')

  // Copy states
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  // Build context for AI
  const primaryContact = customer.contacts.find((c) => c.isPrimary) || customer.contacts[0]
  const composeContext: ComposeContext = {
    customerName: primaryContact?.name || '',
    companyName: customer.companyName,
    projectType: project.projectType,
    status: project.status,
    product: project.product,
    bandwidth: project.serviceBandwidth,
    scheduledDate: project.scheduledDate
      ? new Date(project.scheduledDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : undefined,
    focDate: new Date(project.focDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    buildingAddress: building.address,
    cxName: currentUser.name,
  }

  // Variables for AI generation
  const variables: Record<string, string> = {
    contactName: primaryContact?.name || 'Valued Customer',
    companyName: customer.companyName,
    cxName: currentUser.name,
    address: building.address,
    product: project.product,
    bandwidth: project.serviceBandwidth,
    focDate: composeContext.focDate || '',
    scheduledDate: composeContext.scheduledDate || 'TBD',
    scheduledTime: project.scheduledSlot ? slotLabels[project.scheduledSlot] : 'TBD',
    device: project.device || 'appropriate equipment',
    accessRequirements:
      building.accessInstructions || 'Please coordinate access with building management',
  }

  // Load scenarios on mount
  useEffect(() => {
    getScenarios().then(setScenarios)
  }, [])

  // Set initial recipient email
  useEffect(() => {
    if (isOpen && primaryContact?.email) {
      setRecipientEmail(primaryContact.email)
    }
  }, [isOpen, primaryContact])

  // Load suggestions when scenario or tone changes
  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true)
    try {
      const response = await getSuggestions(selectedScenario, variables)
      setSuggestions(response.suggestions)

      // Auto-select first suggestion
      if (response.suggestions.length > 0) {
        const firstSuggestion = response.suggestions[0]
        setSelectedSuggestionId(firstSuggestion.id)
        setSubject(firstSuggestion.subject)
        setBody(firstSuggestion.body)
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Load suggestions when modal opens or scenario changes
  useEffect(() => {
    if (isOpen) {
      loadSuggestions()
    }
  }, [isOpen, selectedScenario])

  const handleSelectSuggestion = (suggestion: EmailSuggestion) => {
    setSelectedSuggestionId(suggestion.id)
    setSubject(suggestion.subject)
    setBody(suggestion.body)
  }

  const handleCopy = async (type: 'subject' | 'body' | 'all') => {
    let textToCopy = ''
    if (type === 'subject') {
      textToCopy = subject
    } else if (type === 'body') {
      textToCopy = body
    } else {
      textToCopy = `Subject: ${subject}\n\n${body}`
    }

    await navigator.clipboard.writeText(textToCopy)

    if (type === 'subject') {
      setCopiedSubject(true)
      setTimeout(() => setCopiedSubject(false), 2000)
    } else if (type === 'body') {
      setCopiedBody(true)
      setTimeout(() => setCopiedBody(false), 2000)
    } else {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  const handleOpenInEmailClient = () => {
    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pilot-secondary" />
            <h2 className="text-lg font-semibold text-gray-900">AI Email Composer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Scenario & Suggestions */}
          <div className="w-72 border-r border-gray-200 flex flex-col">
            {/* Scenario Selector */}
            <div className="p-4 border-b border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                EMAIL TYPE
              </label>
              <div className="relative">
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as EmailScenario)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                >
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tone Selector */}
            <div className="p-4 border-b border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-2">TONE</label>
              <div className="flex gap-2">
                {(Object.keys(toneLabels) as ToneOption[]).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      selectedTone === tone
                        ? 'bg-pilot-secondary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={toneLabels[tone].description}
                  >
                    {toneLabels[tone].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-500">SUGGESTIONS</label>
                <button
                  onClick={loadSuggestions}
                  disabled={isLoadingSuggestions}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Regenerate suggestions"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoadingSuggestions ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No suggestions available
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedSuggestionId === suggestion.id
                          ? 'border-pilot-secondary bg-pilot-primary/10'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            suggestion.tone === 'formal'
                              ? 'bg-blue-100 text-blue-700'
                              : suggestion.tone === 'urgent'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {toneLabels[suggestion.tone].label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {suggestion.subject}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {suggestion.body.slice(0, 100)}...
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Email Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">TO</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500">SUBJECT</label>
                  <button
                    onClick={() => handleCopy('subject')}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {copiedSubject ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>

              {/* Body with Smart Compose */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500">MESSAGE</label>
                  <button
                    onClick={() => handleCopy('body')}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {copiedBody ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <SmartCompose
                  value={body}
                  onChange={setBody}
                  context={composeContext}
                  placeholder="Compose your email..."
                  rows={12}
                  aiEnabled={true}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI-powered suggestions · Press Tab to accept inline completions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy('all')}
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </>
                  )}
                </Button>
                <Button size="sm" onClick={handleOpenInEmailClient}>
                  <Mail className="w-4 h-4 mr-1" />
                  Open in Email
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
