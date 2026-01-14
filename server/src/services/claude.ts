import Anthropic from '@anthropic-ai/sdk'
import {
  COMPLETION_SYSTEM_PROMPT,
  EMAIL_GENERATION_SYSTEM_PROMPT,
  SCENARIOS,
  EmailScenario,
} from '../prompts/brandVoice'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

function formatContext(context: ComposeContext): string {
  const parts: string[] = []

  if (context.customerName) parts.push(`Customer contact: ${context.customerName}`)
  if (context.companyName) parts.push(`Company: ${context.companyName}`)
  if (context.projectType) parts.push(`Project type: ${context.projectType}`)
  if (context.status) parts.push(`Status: ${context.status}`)
  if (context.product) parts.push(`Product: ${context.product}`)
  if (context.bandwidth) parts.push(`Bandwidth: ${context.bandwidth}`)
  if (context.scheduledDate) parts.push(`Scheduled date: ${context.scheduledDate}`)
  if (context.focDate) parts.push(`FOC date: ${context.focDate}`)
  if (context.buildingAddress) parts.push(`Building address: ${context.buildingAddress}`)
  if (context.cxName) parts.push(`CX Associate name: ${context.cxName}`)

  return parts.length > 0 ? `\n\nCONTEXT:\n${parts.join('\n')}` : ''
}

export async function generateCompletion(
  currentText: string,
  context: ComposeContext
): Promise<ComposeResponse> {
  if (!currentText || currentText.trim().length < 10) {
    return { suggestion: '', confidence: 0 }
  }

  try {
    const contextStr = formatContext(context)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: COMPLETION_SYSTEM_PROMPT + contextStr,
      messages: [
        {
          role: 'user',
          content: `Continue this email naturally:\n\n${currentText}`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const suggestion = textBlock?.type === 'text' ? textBlock.text.trim() : ''

    // Calculate confidence based on response
    const confidence = suggestion.length > 0 ? 0.8 : 0

    return { suggestion, confidence }
  } catch (error) {
    console.error('Error generating completion:', error)
    return { suggestion: '', confidence: 0 }
  }
}

export async function generateEmailDraft(
  scenario: EmailScenario,
  variables: Record<string, string>,
  tone: 'formal' | 'friendly' | 'urgent' = 'friendly'
): Promise<EmailSuggestion> {
  const scenarioConfig = SCENARIOS[scenario]

  const variablesList = Object.entries(variables)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n')

  const toneInstructions = {
    formal: 'Use a more formal, business-like tone.',
    friendly: 'Use a warm, approachable tone while remaining professional.',
    urgent: 'Convey urgency appropriately while remaining professional and helpful.',
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: EMAIL_GENERATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${scenarioConfig.prompt}

TONE: ${toneInstructions[tone]}

VARIABLES TO USE:
${variablesList}

Format your response as:
SUBJECT: [subject line]

BODY:
[email body]`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const text = textBlock?.type === 'text' ? textBlock.text : ''

    // Parse subject and body from response
    const subjectMatch = text.match(/SUBJECT:\s*(.+?)(?:\n|$)/i)
    const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i)

    const subject = subjectMatch?.[1]?.trim() || 'Pilot Fiber - Your Service Update'
    const body = bodyMatch?.[1]?.trim() || text

    return {
      id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subject,
      body,
      tone,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error generating email draft:', error)
    throw error
  }
}

export async function generateMultipleDrafts(
  scenario: EmailScenario,
  variables: Record<string, string>
): Promise<EmailSuggestion[]> {
  // Generate three variations with different tones
  const tones: Array<'formal' | 'friendly' | 'urgent'> = ['friendly', 'formal', 'urgent']

  const drafts = await Promise.all(
    tones.map((tone) => generateEmailDraft(scenario, variables, tone))
  )

  return drafts
}
