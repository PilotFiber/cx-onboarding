import { useState, useRef, useEffect, useCallback } from 'react'
import { teamMembers, TeamMember } from '../../data/teamMembers'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  autoFocus?: boolean
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  autoFocus = false
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [mentionStart, setMentionStart] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const findMentionPosition = useCallback((text: string, cursorPos: number) => {
    // Look backwards from cursor to find @ symbol
    let searchPos = cursorPos - 1
    while (searchPos >= 0) {
      const char = text[searchPos]
      if (char === '@') {
        return searchPos
      }
      // Stop if we hit whitespace before finding @
      if (char === ' ' || char === '\n') {
        return -1
      }
      searchPos--
    }
    return -1
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart

    onChange(newValue)

    // Check if we're in the middle of typing a mention
    const atPosition = findMentionPosition(newValue, cursorPos)

    if (atPosition >= 0) {
      const searchText = newValue.slice(atPosition + 1, cursorPos).toLowerCase()
      const matches = teamMembers.filter(m =>
        m.isActive && (
          m.name.toLowerCase().includes(searchText) ||
          m.name.toLowerCase().split(' ').some(part => part.startsWith(searchText))
        )
      )

      if (matches.length > 0) {
        setFilteredMembers(matches)
        setMentionStart(atPosition)
        setShowSuggestions(true)
        setSuggestionIndex(0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const insertMention = (member: TeamMember) => {
    if (!textareaRef.current || mentionStart < 0) return

    const cursorPos = textareaRef.current.selectionStart
    const before = value.slice(0, mentionStart)
    const after = value.slice(cursorPos)
    const newValue = `${before}@${member.name} ${after}`

    onChange(newValue)
    setShowSuggestions(false)

    // Set cursor position after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + member.name.length + 2 // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex(i => Math.min(i + 1, filteredMembers.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filteredMembers.length > 0) {
        e.preventDefault()
        insertMention(filteredMembers[suggestionIndex])
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary resize-none ${className}`}
      />

      {showSuggestions && filteredMembers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredMembers.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onClick={() => insertMention(member)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                index === suggestionIndex
                  ? 'bg-pilot-primary/10 text-pilot-secondary'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-pilot-secondary text-white flex items-center justify-center text-xs font-medium">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">{member.title}</p>
              </div>
            </button>
          ))}
          <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100">
            Use <kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to select
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to extract mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([A-Za-z]+ [A-Za-z]+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    const name = match[1]
    const member = teamMembers.find(m => m.name === name)
    if (member) {
      mentions.push(member.id)
    }
  }

  return [...new Set(mentions)] // Remove duplicates
}

// Helper component to render text with highlighted mentions
export function MentionText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(@[A-Za-z]+ [A-Za-z]+)/g)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const name = part.slice(1)
          const member = teamMembers.find(m => m.name === name)
          if (member) {
            return (
              <span
                key={index}
                className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-blue-100 text-blue-700 rounded font-medium text-sm"
                title={`${member.title} - ${member.email}`}
              >
                @{member.name}
              </span>
            )
          }
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
