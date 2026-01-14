// API base URL - in production, this would be an environment variable
const API_BASE = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001/api'

export interface ComposeContext {
  customerName?: string
  companyName?: string
  projectType?: string
  status?: string
  product?: string
  bandwidth?: string
  scheduledDate?: string
  focDate?: string
  buildingAddress?: string
  cxName?: string
}

export interface ComposeResponse {
  suggestion: string
  confidence: number
}

export interface EmailSuggestion {
  id: string
  subject: string
  body: string
  tone: 'formal' | 'friendly' | 'urgent'
  generatedAt: string
}

export interface SuggestionsResponse {
  suggestions: EmailSuggestion[]
  cached: boolean
}

export type EmailScenario =
  | 'intro'
  | 'scheduling'
  | 'confirmation'
  | 'delay'
  | 'completion'
  | 'follow_up'

export interface ScenarioInfo {
  id: EmailScenario
  description: string
}

/**
 * Get real-time completion suggestion for text being typed
 */
export async function getCompletion(
  currentText: string,
  context: ComposeContext
): Promise<ComposeResponse> {
  try {
    const response = await fetch(`${API_BASE}/compose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentText, context }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get completion:', error)
    return { suggestion: '', confidence: 0 }
  }
}

/**
 * Get email suggestions for a specific scenario
 */
export async function getSuggestions(
  scenario: EmailScenario,
  variables: Record<string, string>,
  options?: {
    tone?: 'formal' | 'friendly' | 'urgent'
    useCache?: boolean
  }
): Promise<SuggestionsResponse> {
  try {
    const response = await fetch(`${API_BASE}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        variables,
        tone: options?.tone,
        useCache: options?.useCache ?? true,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get suggestions:', error)
    return { suggestions: [], cached: false }
  }
}

/**
 * Get available email scenarios
 */
export async function getScenarios(): Promise<ScenarioInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/suggestions/scenarios`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.scenarios
  } catch (error) {
    console.error('Failed to get scenarios:', error)
    // Return default scenarios if API fails
    return [
      { id: 'intro', description: 'Welcome email for new customer onboarding' },
      { id: 'scheduling', description: 'Request to schedule installation appointment' },
      { id: 'confirmation', description: 'Confirm scheduled installation date' },
      { id: 'delay', description: 'Notify customer of installation delay' },
      { id: 'completion', description: 'Post-installation follow-up and survey request' },
      { id: 'follow_up', description: 'General follow-up on outstanding items' },
    ]
  }
}

/**
 * Check if the AI service is available
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/health`)
    return response.ok
  } catch {
    return false
  }
}
