import { useState } from 'react'
import {
  Zap,
  Phone,
  Mail,
  Users,
  MessageSquare,
  StickyNote,
  AlertOctagon,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Project, ProjectStatus, CommunicationType, CommunicationDirection, BlockerType } from '../../types'
import Button from '../ui/Button'
import MentionTextarea, { extractMentions } from '../ui/MentionTextarea'

interface QuickActionsPanelProps {
  project: Project
  onLogCommunication: (type: CommunicationType, direction: CommunicationDirection, contactName: string, summary: string) => void
  onAddNote: (content: string, mentions?: string[]) => void
  onAddBlocker: (type: BlockerType, description: string) => void
  onChangeStatus: (status: ProjectStatus) => void
  onToggleEscalation: () => void
  onOpenEmailTemplates: () => void
  onOpenAIComposer?: () => void
  onScheduleInstall?: () => void
}

type QuickActionMode = 'menu' | 'log-comm' | 'add-note' | 'add-blocker' | 'change-status'

const statusOptions: { value: ProjectStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'new', label: 'New', icon: <Clock className="w-4 h-4" />, color: 'text-blue-600' },
  { value: 'reviewing', label: 'Reviewing', icon: <PlayCircle className="w-4 h-4" />, color: 'text-yellow-600' },
  { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" />, color: 'text-cyan-600' },
  { value: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600' },
  { value: 'installing', label: 'Installing', icon: <Zap className="w-4 h-4" />, color: 'text-orange-600' },
  { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-gray-600' },
]

const blockerTypes: { value: BlockerType; label: string }[] = [
  { value: 'waiting_customer', label: 'Waiting on Customer' },
  { value: 'waiting_permit', label: 'Waiting on Permit' },
  { value: 'waiting_equipment', label: 'Waiting on Equipment' },
  { value: 'waiting_scheduling', label: 'Waiting on Scheduling' },
  { value: 'waiting_internal', label: 'Waiting on Internal' },
  { value: 'waiting_vendor', label: 'Waiting on Vendor' },
  { value: 'waiting_joe', label: 'Waiting on Joe' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'other', label: 'Other' },
]

export default function QuickActionsPanel({
  project,
  onLogCommunication,
  onAddNote,
  onAddBlocker,
  onChangeStatus,
  onToggleEscalation,
  onOpenEmailTemplates,
  onOpenAIComposer,
}: QuickActionsPanelProps) {
  const [mode, setMode] = useState<QuickActionMode>('menu')
  const [commType, setCommType] = useState<CommunicationType>('call')
  const [commDirection, setCommDirection] = useState<CommunicationDirection>('outbound')
  const [commContact, setCommContact] = useState('')
  const [commSummary, setCommSummary] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [blockerType, setBlockerType] = useState<BlockerType>('waiting_customer')
  const [blockerDesc, setBlockerDesc] = useState('')

  const handleLogComm = () => {
    if (!commContact || !commSummary) return
    onLogCommunication(commType, commDirection, commContact, commSummary)
    setCommContact('')
    setCommSummary('')
    setMode('menu')
  }

  const handleAddNote = () => {
    if (!noteContent) return
    const mentions = extractMentions(noteContent)
    onAddNote(noteContent, mentions.length > 0 ? mentions : undefined)
    setNoteContent('')
    setMode('menu')
  }

  const handleAddBlocker = () => {
    if (!blockerDesc) return
    onAddBlocker(blockerType, blockerDesc)
    setBlockerDesc('')
    setMode('menu')
  }

  const handleStatusChange = (status: ProjectStatus) => {
    onChangeStatus(status)
    setMode('menu')
  }

  const renderMenu = () => (
    <div className="space-y-1">
      <button
        onClick={() => setMode('log-comm')}
        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Phone className="w-4 h-4 text-green-600" />
        <span className="flex-1">Log Communication</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      <button
        onClick={onOpenEmailTemplates}
        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Mail className="w-4 h-4 text-blue-600" />
        <span className="flex-1">Email Templates</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      {onOpenAIComposer && (
        <button
          onClick={onOpenAIComposer}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="flex-1">AI Compose</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      )}

      <button
        onClick={() => setMode('add-note')}
        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
      >
        <StickyNote className="w-4 h-4 text-yellow-600" />
        <span className="flex-1">Add Note</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      <button
        onClick={() => setMode('add-blocker')}
        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
      >
        <AlertOctagon className="w-4 h-4 text-red-600" />
        <span className="flex-1">Add Blocker</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      <button
        onClick={() => setMode('change-status')}
        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
      >
        <CheckCircle2 className="w-4 h-4 text-cyan-600" />
        <span className="flex-1">Change Status</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      <div className="border-t border-gray-200 my-2" />

      <button
        onClick={onToggleEscalation}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
          project.isEscalated ? 'text-red-600' : ''
        }`}
      >
        {project.isEscalated ? (
          <>
            <ArrowDownCircle className="w-4 h-4" />
            <span className="flex-1">De-escalate</span>
          </>
        ) : (
          <>
            <ArrowUpCircle className="w-4 h-4 text-orange-600" />
            <span className="flex-1">Escalate</span>
          </>
        )}
      </button>
    </div>
  )

  const renderLogComm = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Log Communication</h4>
        <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { type: 'call' as CommunicationType, icon: <Phone className="w-3.5 h-3.5" />, label: 'Call' },
          { type: 'email' as CommunicationType, icon: <Mail className="w-3.5 h-3.5" />, label: 'Email' },
          { type: 'meeting' as CommunicationType, icon: <Users className="w-3.5 h-3.5" />, label: 'Meeting' },
          { type: 'text' as CommunicationType, icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Text' },
        ].map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => setCommType(type)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors ${
              commType === type
                ? 'bg-pilot-primary text-pilot-secondary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCommDirection('outbound')}
          className={`flex-1 py-1.5 text-xs rounded-lg border ${
            commDirection === 'outbound'
              ? 'bg-pilot-primary text-pilot-secondary border-pilot-primary'
              : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Outbound
        </button>
        <button
          onClick={() => setCommDirection('inbound')}
          className={`flex-1 py-1.5 text-xs rounded-lg border ${
            commDirection === 'inbound'
              ? 'bg-pilot-primary text-pilot-secondary border-pilot-primary'
              : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Inbound
        </button>
      </div>

      <input
        type="text"
        placeholder="Contact name"
        value={commContact}
        onChange={(e) => setCommContact(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
      />

      <input
        type="text"
        placeholder="Quick summary"
        value={commSummary}
        onChange={(e) => setCommSummary(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
      />

      <Button size="sm" onClick={handleLogComm} disabled={!commContact || !commSummary} className="w-full">
        Log Communication
      </Button>
    </div>
  )

  const renderAddNote = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Add Note</h4>
        <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <MentionTextarea
        placeholder="Write a note... Use @ to mention"
        value={noteContent}
        onChange={setNoteContent}
        rows={3}
        className="text-sm"
      />

      <Button size="sm" onClick={handleAddNote} disabled={!noteContent} className="w-full">
        Add Note
      </Button>
    </div>
  )

  const renderAddBlocker = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Add Blocker</h4>
        <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <select
        value={blockerType}
        onChange={(e) => setBlockerType(e.target.value as BlockerType)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
      >
        {blockerTypes.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Describe the blocker..."
        value={blockerDesc}
        onChange={(e) => setBlockerDesc(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
      />

      <Button size="sm" onClick={handleAddBlocker} disabled={!blockerDesc} className="w-full">
        Add Blocker
      </Button>
    </div>
  )

  const renderChangeStatus = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Change Status</h4>
        <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {statusOptions.map(({ value, label, icon, color }) => (
          <button
            key={value}
            onClick={() => handleStatusChange(value)}
            disabled={project.status === value}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
              project.status === value
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
          >
            <span className={color}>{icon}</span>
            <span className="flex-1">{label}</span>
            {project.status === value && (
              <span className="text-xs text-gray-400">Current</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-pilot-primary" />
        <h3 className="font-semibold text-gray-900">Quick Actions</h3>
      </div>

      {mode === 'menu' && renderMenu()}
      {mode === 'log-comm' && renderLogComm()}
      {mode === 'add-note' && renderAddNote()}
      {mode === 'add-blocker' && renderAddBlocker()}
      {mode === 'change-status' && renderChangeStatus()}
    </div>
  )
}
