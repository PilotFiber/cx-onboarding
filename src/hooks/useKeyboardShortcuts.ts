import { useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette: () => void
  onOpenNewProject: () => void
  onOpenShortcutsHelp: () => void
  onOpenEmailTemplates?: () => void
  onTabChange?: (tab: string) => void
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onOpenNewProject,
  onOpenShortcutsHelp,
  onOpenEmailTemplates,
  onTabChange,
}: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate()
  const location = useLocation()
  const pendingKey = useRef<string | null>(null)
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement
    if (!activeElement) return false
    const tagName = activeElement.tagName.toLowerCase()
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      (activeElement as HTMLElement).isContentEditable
    )
  }, [])

  const isProjectView = location.pathname.startsWith('/projects/') &&
    location.pathname !== '/projects'

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (isInputFocused()) {
      // But allow Escape to blur inputs
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur()
      }
      return
    }

    // CMD/Ctrl + K: Command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      onOpenCommandPalette()
      return
    }

    // CMD/Ctrl + N: New project
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault()
      onOpenNewProject()
      return
    }

    // ?: Show shortcuts help
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      onOpenShortcutsHelp()
      return
    }

    // Handle two-key sequences (g + letter for navigation)
    if (pendingKey.current === 'g') {
      // Clear the pending key
      pendingKey.current = null
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current)
        pendingTimeout.current = null
      }

      switch (e.key.toLowerCase()) {
        case 'd':
          e.preventDefault()
          navigate('/')
          return
        case 'p':
          e.preventDefault()
          navigate('/projects')
          return
        case 'c':
          e.preventDefault()
          navigate('/calendar')
          return
        case 'r':
          e.preventDefault()
          navigate('/reports')
          return
        case 't':
          e.preventDefault()
          navigate('/tickets')
          return
      }
    }

    // Start a two-key sequence
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      pendingKey.current = 'g'
      // Clear pending key after 1 second
      pendingTimeout.current = setTimeout(() => {
        pendingKey.current = null
      }, 1000)
      return
    }

    // Project view shortcuts (number keys for tabs)
    if (isProjectView && onTabChange) {
      switch (e.key) {
        case '1':
          e.preventDefault()
          onTabChange('overview')
          return
        case '2':
          e.preventDefault()
          onTabChange('tickets')
          return
        case '3':
          e.preventDefault()
          onTabChange('tasks')
          return
        case '4':
          e.preventDefault()
          onTabChange('activity')
          return
        case '5':
          e.preventDefault()
          onTabChange('report')
          return
      }
    }

    // E: Open email templates (in project view)
    if (e.key === 'e' && !e.metaKey && !e.ctrlKey && isProjectView && onOpenEmailTemplates) {
      e.preventDefault()
      onOpenEmailTemplates()
      return
    }
  }, [
    isInputFocused,
    onOpenCommandPalette,
    onOpenNewProject,
    onOpenShortcutsHelp,
    onOpenEmailTemplates,
    onTabChange,
    navigate,
    isProjectView,
  ])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current)
      }
    }
  }, [handleKeyDown])
}
