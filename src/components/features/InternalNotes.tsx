import { useState } from 'react'
import { StickyNote, Pin, Trash2, Plus } from 'lucide-react'
import { InternalNote } from '../../types'
import Button from '../ui/Button'
import MentionTextarea, { MentionText, extractMentions } from '../ui/MentionTextarea'

interface InternalNotesProps {
  notes: InternalNote[]
  onAddNote: (content: string, mentions?: string[]) => void
  onDeleteNote: (noteId: string) => void
  onTogglePin: (noteId: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function InternalNotes({ notes, onAddNote, onDeleteNote, onTogglePin }: InternalNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      const mentions = extractMentions(newNote.trim())
      onAddNote(newNote.trim(), mentions.length > 0 ? mentions : undefined)
      setNewNote('')
      setIsAdding(false)
    }
  }

  // Sort: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Internal Notes
        </h3>
        {!isAdding && (
          <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4">
          <MentionTextarea
            value={newNote}
            onChange={setNewNote}
            placeholder="Add a note... Use @ to mention team members"
            rows={3}
            autoFocus
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              Type @ to mention someone
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setIsAdding(false); setNewNote('') }}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={!newNote.trim()}>
                Save Note
              </Button>
            </div>
          </div>
        </form>
      )}

      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <StickyNote className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No internal notes yet</p>
          <p className="text-sm">Add notes for your team to see</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedNotes.map((note) => (
            <li
              key={note.id}
              className={`p-3 rounded-lg border ${
                note.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm text-gray-700 whitespace-pre-wrap flex-1">
                  <MentionText text={note.content} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      note.isPinned ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {note.author} • {formatDate(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
