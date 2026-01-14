import { Router, Request, Response } from 'express'
import { generateEmailDraft, generateMultipleDrafts, EmailSuggestion } from '../services/claude'
import { SCENARIOS, EmailScenario } from '../prompts/brandVoice'

const router = Router()

// In-memory cache for pre-generated suggestions
interface CacheEntry {
  generatedAt: Date
  suggestions: EmailSuggestion[]
}

const suggestionsCache: Map<string, CacheEntry> = new Map()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function getCacheKey(scenario: string, variables: Record<string, string>): string {
  // Create a deterministic cache key from scenario and key variables
  const sortedVars = Object.keys(variables)
    .sort()
    .map((k) => `${k}:${variables[k]}`)
    .join('|')
  return `${scenario}::${sortedVars}`
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.generatedAt.getTime() < CACHE_TTL_MS
}

interface SuggestionsRequest {
  scenario: EmailScenario
  variables: Record<string, string>
  tone?: 'formal' | 'friendly' | 'urgent'
  useCache?: boolean
}

// Get suggestions (with optional caching)
router.post('/', async (req: Request<object, object, SuggestionsRequest>, res: Response) => {
  try {
    const { scenario, variables, tone, useCache = true } = req.body

    if (!scenario || !SCENARIOS[scenario]) {
      res.status(400).json({
        error: 'Invalid scenario',
        validScenarios: Object.keys(SCENARIOS),
      })
      return
    }

    if (!variables || typeof variables !== 'object') {
      res.status(400).json({ error: 'variables object is required' })
      return
    }

    // Check cache if enabled
    if (useCache) {
      const cacheKey = getCacheKey(scenario, variables)
      const cached = suggestionsCache.get(cacheKey)

      if (cached && isCacheValid(cached)) {
        res.json({
          suggestions: cached.suggestions,
          cached: true,
        })
        return
      }
    }

    // Generate new suggestions
    let suggestions: EmailSuggestion[]

    if (tone) {
      // Single suggestion with specific tone
      const suggestion = await generateEmailDraft(scenario, variables, tone)
      suggestions = [suggestion]
    } else {
      // Multiple suggestions with different tones
      suggestions = await generateMultipleDrafts(scenario, variables)
    }

    // Cache the results
    const cacheKey = getCacheKey(scenario, variables)
    suggestionsCache.set(cacheKey, {
      generatedAt: new Date(),
      suggestions,
    })

    res.json({
      suggestions,
      cached: false,
    })
  } catch (error) {
    console.error('Suggestions error:', error)
    res.status(500).json({ error: 'Failed to generate suggestions' })
  }
})

// Get available scenarios
router.get('/scenarios', (_req: Request, res: Response) => {
  const scenarios = Object.entries(SCENARIOS).map(([key, value]) => ({
    id: key,
    description: value.description,
  }))

  res.json({ scenarios })
})

// Warm the cache for common scenarios (called on server startup)
export async function warmCache(variables: Record<string, string>): Promise<void> {
  console.log('Warming suggestions cache...')

  const scenarios = Object.keys(SCENARIOS) as EmailScenario[]

  for (const scenario of scenarios) {
    try {
      const suggestions = await generateMultipleDrafts(scenario, variables)
      const cacheKey = getCacheKey(scenario, variables)
      suggestionsCache.set(cacheKey, {
        generatedAt: new Date(),
        suggestions,
      })
      console.log(`  Cached ${scenario}`)
    } catch (error) {
      console.error(`  Failed to cache ${scenario}:`, error)
    }
  }

  console.log('Cache warming complete')
}

// Clear expired cache entries
export function cleanCache(): void {
  const now = Date.now()
  for (const [key, entry] of suggestionsCache.entries()) {
    if (now - entry.generatedAt.getTime() > CACHE_TTL_MS) {
      suggestionsCache.delete(key)
    }
  }
}

export default router
