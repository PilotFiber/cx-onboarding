import { Customer, Project } from '../types'
import { getUnreadAlertsCount } from '../data/mockNewsAlerts'

export interface CustomerHealthBreakdown {
  score: number // 0-100
  level: 'excellent' | 'good' | 'needs-attention' | 'at-risk' | 'critical'
  factors: CustomerHealthFactor[]
  trend: 'improving' | 'stable' | 'declining'
}

export interface CustomerHealthFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  points: number
  description: string
  category: 'engagement' | 'project' | 'revenue' | 'risk'
}

export function calculateCustomerHealthScore(
  customer: Customer,
  projects: Project[]
): CustomerHealthBreakdown {
  const factors: CustomerHealthFactor[] = []
  let score = 100

  const now = new Date()

  // === ENGAGEMENT FACTORS ===

  // 1. Communication recency across all projects (-25 points max)
  const allContactDates = projects.map(p => new Date(p.lastCustomerContact))
  const mostRecentContact = allContactDates.length > 0
    ? Math.max(...allContactDates.map(d => d.getTime()))
    : now.getTime() - 30 * 24 * 60 * 60 * 1000 // 30 days ago if no projects

  const daysSinceLastContact = Math.floor(
    (now.getTime() - mostRecentContact) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceLastContact > 14) {
    const deduction = Math.min(25, (daysSinceLastContact - 14) * 3)
    score -= deduction
    factors.push({
      name: 'Communication Gap',
      impact: 'negative',
      points: -deduction,
      description: `No contact in ${daysSinceLastContact} days`,
      category: 'engagement',
    })
  } else if (daysSinceLastContact > 7) {
    score -= 8
    factors.push({
      name: 'Communication',
      impact: 'negative',
      points: -8,
      description: `Last contact ${daysSinceLastContact} days ago`,
      category: 'engagement',
    })
  } else {
    factors.push({
      name: 'Communication',
      impact: 'positive',
      points: 0,
      description: `Recent contact (${daysSinceLastContact} days ago)`,
      category: 'engagement',
    })
  }

  // 2. Unread news alerts - may indicate lack of engagement (-10 points max)
  const unreadAlerts = getUnreadAlertsCount(customer.id)
  if (unreadAlerts > 3) {
    score -= 10
    factors.push({
      name: 'Unread Alerts',
      impact: 'negative',
      points: -10,
      description: `${unreadAlerts} unread news alerts`,
      category: 'engagement',
    })
  } else if (unreadAlerts > 0) {
    score -= 3
    factors.push({
      name: 'News Alerts',
      impact: 'neutral',
      points: -3,
      description: `${unreadAlerts} unread news alerts`,
      category: 'engagement',
    })
  }

  // === PROJECT FACTORS ===

  // 3. Active vs completed projects
  const activeProjects = projects.filter(p => p.status !== 'completed')
  const completedProjects = projects.filter(p => p.status === 'completed')

  if (projects.length === 0) {
    score -= 15
    factors.push({
      name: 'No Projects',
      impact: 'negative',
      points: -15,
      description: 'No projects on record',
      category: 'project',
    })
  } else if (completedProjects.length > 0) {
    const bonus = Math.min(10, completedProjects.length * 3)
    score += bonus
    factors.push({
      name: 'Completed Projects',
      impact: 'positive',
      points: bonus,
      description: `${completedProjects.length} successful project${completedProjects.length > 1 ? 's' : ''}`,
      category: 'project',
    })
  }

  // 4. Active blockers across all projects (-20 points max)
  const totalActiveBlockers = projects.reduce(
    (sum, p) => sum + p.blockers.filter(b => !b.resolvedAt).length,
    0
  )

  if (totalActiveBlockers > 0) {
    const deduction = Math.min(20, totalActiveBlockers * 8)
    score -= deduction
    factors.push({
      name: 'Active Blockers',
      impact: 'negative',
      points: -deduction,
      description: `${totalActiveBlockers} blocker${totalActiveBlockers > 1 ? 's' : ''} across projects`,
      category: 'project',
    })
  } else if (activeProjects.length > 0) {
    factors.push({
      name: 'Blockers',
      impact: 'positive',
      points: 0,
      description: 'No active blockers',
      category: 'project',
    })
  }

  // 5. Escalated projects (-15 points per escalation)
  const escalatedProjects = projects.filter(p => p.isEscalated)
  if (escalatedProjects.length > 0) {
    const deduction = Math.min(30, escalatedProjects.length * 15)
    score -= deduction
    factors.push({
      name: 'Escalations',
      impact: 'negative',
      points: -deduction,
      description: `${escalatedProjects.length} escalated project${escalatedProjects.length > 1 ? 's' : ''}`,
      category: 'risk',
    })
  }

  // 6. Projects past FOC date (-15 points max)
  const projectsPastFoc = projects.filter(p => {
    const focDate = new Date(p.focDate)
    return focDate < now && p.status !== 'completed'
  })

  if (projectsPastFoc.length > 0) {
    const deduction = Math.min(15, projectsPastFoc.length * 8)
    score -= deduction
    factors.push({
      name: 'Delayed Projects',
      impact: 'negative',
      points: -deduction,
      description: `${projectsPastFoc.length} project${projectsPastFoc.length > 1 ? 's' : ''} past FOC date`,
      category: 'project',
    })
  }

  // === REVENUE FACTORS ===

  // 7. Total MRC (bonus for high-value customers)
  const totalMRC = projects.reduce((sum, p) => sum + p.mrc, 0)

  if (totalMRC >= 5000) {
    score += 10
    factors.push({
      name: 'High Value',
      impact: 'positive',
      points: 10,
      description: `$${totalMRC.toLocaleString()}/mo MRC`,
      category: 'revenue',
    })
  } else if (totalMRC >= 2000) {
    score += 5
    factors.push({
      name: 'Good Value',
      impact: 'positive',
      points: 5,
      description: `$${totalMRC.toLocaleString()}/mo MRC`,
      category: 'revenue',
    })
  }

  // 8. VIP tier bonus
  if (customer.vipTier === 'platinum') {
    score += 10
    factors.push({
      name: 'Platinum VIP',
      impact: 'positive',
      points: 10,
      description: 'Strategic customer relationship',
      category: 'revenue',
    })
  } else if (customer.vipTier === 'gold') {
    score += 7
    factors.push({
      name: 'Gold VIP',
      impact: 'positive',
      points: 7,
      description: 'Premium customer tier',
      category: 'revenue',
    })
  } else if (customer.vipTier === 'silver') {
    score += 4
    factors.push({
      name: 'Silver VIP',
      impact: 'positive',
      points: 4,
      description: 'Enhanced customer tier',
      category: 'revenue',
    })
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  // Determine health level
  let level: CustomerHealthBreakdown['level']
  if (score >= 90) {
    level = 'excellent'
  } else if (score >= 75) {
    level = 'good'
  } else if (score >= 60) {
    level = 'needs-attention'
  } else if (score >= 40) {
    level = 'at-risk'
  } else {
    level = 'critical'
  }

  // Determine trend (simplified - in a real app this would compare historical data)
  let trend: CustomerHealthBreakdown['trend'] = 'stable'
  const negativeFactors = factors.filter(f => f.impact === 'negative')
  const positiveFactors = factors.filter(f => f.impact === 'positive')

  if (negativeFactors.length > positiveFactors.length + 1) {
    trend = 'declining'
  } else if (positiveFactors.length > negativeFactors.length + 1) {
    trend = 'improving'
  }

  return { score, level, factors, trend }
}

export function getCustomerHealthColor(level: CustomerHealthBreakdown['level']): string {
  switch (level) {
    case 'excellent':
      return 'text-green-600'
    case 'good':
      return 'text-blue-600'
    case 'needs-attention':
      return 'text-yellow-600'
    case 'at-risk':
      return 'text-orange-600'
    case 'critical':
      return 'text-red-600'
  }
}

export function getCustomerHealthBgColor(level: CustomerHealthBreakdown['level']): string {
  switch (level) {
    case 'excellent':
      return 'bg-green-100'
    case 'good':
      return 'bg-blue-100'
    case 'needs-attention':
      return 'bg-yellow-100'
    case 'at-risk':
      return 'bg-orange-100'
    case 'critical':
      return 'bg-red-100'
  }
}

export function getCustomerHealthLabel(level: CustomerHealthBreakdown['level']): string {
  switch (level) {
    case 'excellent':
      return 'Excellent'
    case 'good':
      return 'Good'
    case 'needs-attention':
      return 'Needs Attention'
    case 'at-risk':
      return 'At Risk'
    case 'critical':
      return 'Critical'
  }
}
