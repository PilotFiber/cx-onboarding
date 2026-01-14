import { useState, useCallback, useRef, useEffect } from 'react'
import { getCompletion, ComposeContext } from '../services/aiService'

interface UseSmartComposeOptions {
  context: ComposeContext
  debounceMs?: number
  minChars?: number
  enabled?: boolean
}

interface UseSmartComposeReturn {
  suggestion: string | null
  isLoading: boolean
  error: string | null
  fetchSuggestion: (text: string) => void
  acceptSuggestion: () => string
  dismissSuggestion: () => void
  clearSuggestion: () => void
}

export function useSmartCompose({
  context,
  debounceMs = 300,
  minChars = 10,
  enabled = true,
}: UseSmartComposeOptions): UseSmartComposeReturn {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<number | null>(null)
  const currentTextRef = useRef<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const fetchSuggestion = useCallback(
    (text: string) => {
      currentTextRef.current = text

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Clear suggestion if text is too short
      if (!enabled || text.trim().length < minChars) {
        setSuggestion(null)
        setIsLoading(false)
        return
      }

      // Clear suggestion if text ends with certain characters that indicate user is still typing
      const lastChar = text.slice(-1)
      if (['.', '!', '?', '\n'].includes(lastChar)) {
        // User just finished a sentence - wait for more input
        setIsLoading(true)
      }

      // Set up debounced API call
      debounceTimerRef.current = window.setTimeout(async () => {
        // Cancel any in-flight request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        setIsLoading(true)
        setError(null)

        try {
          const response = await getCompletion(text, context)

          // Only update if this is still the current text
          if (currentTextRef.current === text) {
            if (response.suggestion && response.confidence > 0.5) {
              setSuggestion(response.suggestion)
            } else {
              setSuggestion(null)
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError('Failed to get suggestion')
            setSuggestion(null)
          }
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)
    },
    [context, debounceMs, minChars, enabled]
  )

  const acceptSuggestion = useCallback((): string => {
    const accepted = suggestion || ''
    setSuggestion(null)
    return accepted
  }, [suggestion])

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null)
  }, [])

  const clearSuggestion = useCallback(() => {
    setSuggestion(null)
    setIsLoading(false)
    setError(null)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  return {
    suggestion,
    isLoading,
    error,
    fetchSuggestion,
    acceptSuggestion,
    dismissSuggestion,
    clearSuggestion,
  }
}

export default useSmartCompose
