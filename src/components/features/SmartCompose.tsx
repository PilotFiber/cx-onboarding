import { useRef, useEffect, useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useSmartCompose } from '../../hooks/useSmartCompose'
import { ComposeContext } from '../../services/aiService'

interface SmartComposeProps {
  value: string
  onChange: (value: string) => void
  context: ComposeContext
  placeholder?: string
  rows?: number
  className?: string
  disabled?: boolean
  aiEnabled?: boolean
}

export default function SmartCompose({
  value,
  onChange,
  context,
  placeholder = 'Start typing...',
  rows = 6,
  className = '',
  disabled = false,
  aiEnabled = true,
}: SmartComposeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const [showHint, setShowHint] = useState(false)

  const {
    suggestion,
    isLoading,
    fetchSuggestion,
    acceptSuggestion,
    dismissSuggestion,
  } = useSmartCompose({
    context,
    enabled: aiEnabled && !disabled,
    debounceMs: 400,
    minChars: 15,
  })

  // Fetch suggestion when value changes
  useEffect(() => {
    if (aiEnabled && !disabled) {
      fetchSuggestion(value)
    }
  }, [value, aiEnabled, disabled, fetchSuggestion])

  // Show hint briefly when suggestion appears
  useEffect(() => {
    if (suggestion) {
      setShowHint(true)
      const timer = setTimeout(() => setShowHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [suggestion])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestion) {
      if (e.key === 'Tab') {
        e.preventDefault()
        const accepted = acceptSuggestion()
        onChange(value + accepted)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        dismissSuggestion()
      } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        // Any other key dismisses the suggestion
        dismissSuggestion()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // Calculate where to show the suggestion (after the last character)
  const getTextBeforeCursor = () => {
    return value
  }

  return (
    <div className={`relative ${className}`}>
      {/* Hidden mirror div for measuring text position */}
      <div
        ref={mirrorRef}
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words px-3 py-2 text-sm"
        style={{ visibility: 'hidden' }}
        aria-hidden="true"
      >
        {getTextBeforeCursor()}
      </div>

      {/* Main textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-pilot-primary
            resize-none transition-colors
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
          style={{ caretColor: 'black' }}
        />

        {/* Suggestion overlay */}
        {suggestion && !disabled && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div className="px-3 py-2 text-sm whitespace-pre-wrap break-words">
              {/* Invisible text to position suggestion */}
              <span className="invisible">{value}</span>
              {/* Suggestion text in gray */}
              <span className="text-gray-400">{suggestion}</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Status indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        {isLoading && (
          <div className="flex items-center gap-1 text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        )}

        {suggestion && showHint && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 animate-fade-in">
            <span>Press</span>
            <kbd className="px-1 bg-white border border-gray-200 rounded text-gray-600">Tab</kbd>
            <span>to accept</span>
          </div>
        )}

        {aiEnabled && !disabled && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              suggestion
                ? 'bg-pilot-primary/20 text-pilot-secondary'
                : 'bg-gray-100 text-gray-400'
            }`}
            title="AI Smart Compose enabled"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">AI</span>
          </div>
        )}
      </div>

      {/* Screen reader announcement */}
      {suggestion && (
        <div className="sr-only" role="status" aria-live="polite">
          Suggestion available: {suggestion}. Press Tab to accept.
        </div>
      )}
    </div>
  )
}
