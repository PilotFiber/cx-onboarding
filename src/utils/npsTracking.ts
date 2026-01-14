import { NPSSurveyResponse, NPSCategory, Customer } from '../types'

export interface NPSMetrics {
  score: number // -100 to +100
  totalResponses: number
  promoters: number
  passives: number
  detractors: number
  promoterPercentage: number
  passivePercentage: number
  detractorPercentage: number
  responseRate: number // percentage of surveys sent that received responses
  averageScore: number // 0-10
  trend: 'improving' | 'stable' | 'declining'
}

export interface NPSByPeriod {
  period: string // "Jan 2026", "Q1 2026", etc.
  metrics: NPSMetrics
}

export interface NPSInsight {
  type: 'positive' | 'negative' | 'neutral'
  title: string
  description: string
  actionable: boolean
  suggestedAction?: string
}

export function calculateNPSMetrics(responses: NPSSurveyResponse[]): NPSMetrics {
  if (responses.length === 0) {
    return {
      score: 0,
      totalResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promoterPercentage: 0,
      passivePercentage: 0,
      detractorPercentage: 0,
      responseRate: 0,
      averageScore: 0,
      trend: 'stable',
    }
  }

  const promoters = responses.filter(r => r.category === 'promoter').length
  const passives = responses.filter(r => r.category === 'passive').length
  const detractors = responses.filter(r => r.category === 'detractor').length
  const total = responses.length

  const promoterPercentage = (promoters / total) * 100
  const passivePercentage = (passives / total) * 100
  const detractorPercentage = (detractors / total) * 100

  // NPS = % Promoters - % Detractors
  const score = Math.round(promoterPercentage - detractorPercentage)

  const averageScore = responses.reduce((sum, r) => sum + r.score, 0) / total

  // Calculate trend by comparing recent responses to older ones
  const sortedResponses = [...responses].sort(
    (a, b) => new Date(b.respondedAt).getTime() - new Date(a.respondedAt).getTime()
  )

  let trend: 'improving' | 'stable' | 'declining' = 'stable'
  if (sortedResponses.length >= 4) {
    const recentHalf = sortedResponses.slice(0, Math.floor(sortedResponses.length / 2))
    const olderHalf = sortedResponses.slice(Math.floor(sortedResponses.length / 2))

    const recentAvg = recentHalf.reduce((sum, r) => sum + r.score, 0) / recentHalf.length
    const olderAvg = olderHalf.reduce((sum, r) => sum + r.score, 0) / olderHalf.length

    if (recentAvg - olderAvg > 0.5) trend = 'improving'
    else if (olderAvg - recentAvg > 0.5) trend = 'declining'
  }

  return {
    score,
    totalResponses: total,
    promoters,
    passives,
    detractors,
    promoterPercentage: Math.round(promoterPercentage),
    passivePercentage: Math.round(passivePercentage),
    detractorPercentage: Math.round(detractorPercentage),
    responseRate: 85, // Mock value - in real app would calculate from sent vs responded
    averageScore: Math.round(averageScore * 10) / 10,
    trend,
  }
}

export function calculateNPSByMonth(responses: NPSSurveyResponse[]): NPSByPeriod[] {
  const byMonth = new Map<string, NPSSurveyResponse[]>()

  responses.forEach(response => {
    const date = new Date(response.respondedAt)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, [])
    }
    byMonth.get(monthKey)!.push(response)
  })

  // Sort by date and get last 6 months
  const sortedMonths = Array.from(byMonth.entries())
    .sort((a, b) => {
      const dateA = new Date(a[1][0].respondedAt)
      const dateB = new Date(b[1][0].respondedAt)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-6)

  return sortedMonths.map(([period, monthResponses]) => ({
    period,
    metrics: calculateNPSMetrics(monthResponses),
  }))
}

export function generateNPSInsights(
  metrics: NPSMetrics,
  responses: NPSSurveyResponse[],
  _customers: Customer[] // Reserved for future customer-specific insights
): NPSInsight[] {
  const insights: NPSInsight[] = []

  // Score-based insights
  if (metrics.score >= 50) {
    insights.push({
      type: 'positive',
      title: 'Excellent NPS Score',
      description: `Your NPS of ${metrics.score} is considered excellent. Most customers are highly satisfied.`,
      actionable: true,
      suggestedAction: 'Consider asking promoters for testimonials or referrals.',
    })
  } else if (metrics.score >= 0) {
    insights.push({
      type: 'neutral',
      title: 'Good NPS Score',
      description: `Your NPS of ${metrics.score} is positive but has room for improvement.`,
      actionable: true,
      suggestedAction: 'Focus on converting passives to promoters through proactive outreach.',
    })
  } else {
    insights.push({
      type: 'negative',
      title: 'NPS Needs Attention',
      description: `Your NPS of ${metrics.score} indicates more detractors than promoters.`,
      actionable: true,
      suggestedAction: 'Prioritize following up with detractors to understand and address their concerns.',
    })
  }

  // Trend insights
  if (metrics.trend === 'improving') {
    insights.push({
      type: 'positive',
      title: 'Improving Trend',
      description: 'Customer satisfaction is trending upward based on recent responses.',
      actionable: false,
    })
  } else if (metrics.trend === 'declining') {
    insights.push({
      type: 'negative',
      title: 'Declining Trend',
      description: 'Recent responses show lower scores than older ones.',
      actionable: true,
      suggestedAction: 'Review recent changes in process or service that may have impacted customer experience.',
    })
  }

  // Detractor insights
  const recentDetractors = responses
    .filter(r => r.category === 'detractor')
    .filter(r => {
      const daysAgo = (Date.now() - new Date(r.respondedAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= 30
    })

  if (recentDetractors.length > 0) {
    const pendingFollowups = recentDetractors.filter(r => r.followUpRequired && !r.followUpCompletedAt)
    if (pendingFollowups.length > 0) {
      insights.push({
        type: 'negative',
        title: 'Pending Detractor Follow-ups',
        description: `${pendingFollowups.length} detractor(s) require follow-up within the last 30 days.`,
        actionable: true,
        suggestedAction: 'Reach out to these customers to address their concerns.',
      })
    }
  }

  // Response rate insight
  if (metrics.responseRate < 50) {
    insights.push({
      type: 'neutral',
      title: 'Low Response Rate',
      description: `Only ${metrics.responseRate}% of surveys are being completed.`,
      actionable: true,
      suggestedAction: 'Consider shorter surveys or better timing for survey delivery.',
    })
  }

  // Passive conversion opportunity
  if (metrics.passivePercentage > 30) {
    insights.push({
      type: 'neutral',
      title: 'Passive Conversion Opportunity',
      description: `${metrics.passivePercentage}% of responses are passive (7-8). These customers could become promoters.`,
      actionable: true,
      suggestedAction: 'Proactively engage passive customers to understand what would make them promoters.',
    })
  }

  return insights
}

export function getNPSScoreColor(score: number): string {
  if (score >= 50) return 'text-green-600'
  if (score >= 0) return 'text-yellow-600'
  return 'text-red-600'
}

export function getNPSScoreBgColor(score: number): string {
  if (score >= 50) return 'bg-green-100'
  if (score >= 0) return 'bg-yellow-100'
  return 'bg-red-100'
}

export function getNPSScoreLabel(score: number): string {
  if (score >= 70) return 'World Class'
  if (score >= 50) return 'Excellent'
  if (score >= 30) return 'Good'
  if (score >= 0) return 'Okay'
  if (score >= -30) return 'Needs Work'
  return 'Critical'
}

export function getCategoryColor(category: NPSCategory): string {
  switch (category) {
    case 'promoter':
      return 'text-green-600'
    case 'passive':
      return 'text-yellow-600'
    case 'detractor':
      return 'text-red-600'
  }
}

export function getCategoryBgColor(category: NPSCategory): string {
  switch (category) {
    case 'promoter':
      return 'bg-green-100'
    case 'passive':
      return 'bg-yellow-100'
    case 'detractor':
      return 'bg-red-100'
  }
}
