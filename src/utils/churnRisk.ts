import { Customer, Project } from '../types'
import { calculateCustomerHealthScore } from './customerHealthScore'

export type ChurnRiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface ChurnRiskAssessment {
  level: ChurnRiskLevel
  score: number // 0-100 (higher = more likely to churn)
  factors: ChurnRiskFactor[]
  recommendation: string
}

export interface ChurnRiskFactor {
  name: string
  weight: number // How much this contributes to churn risk
  description: string
  severity: 'low' | 'medium' | 'high'
}

export function calculateChurnRisk(
  customer: Customer,
  projects: Project[]
): ChurnRiskAssessment {
  const factors: ChurnRiskFactor[] = []
  let riskScore = 0

  const now = new Date()

  // Get health score - inverse correlation with churn risk
  const healthData = calculateCustomerHealthScore(customer, projects)

  // 1. Health score factor (most significant)
  if (healthData.score < 40) {
    riskScore += 35
    factors.push({
      name: 'Critical Health Score',
      weight: 35,
      description: `Health score is ${healthData.score} (Critical)`,
      severity: 'high',
    })
  } else if (healthData.score < 60) {
    riskScore += 25
    factors.push({
      name: 'Low Health Score',
      weight: 25,
      description: `Health score is ${healthData.score} (At Risk)`,
      severity: 'high',
    })
  } else if (healthData.score < 75) {
    riskScore += 10
    factors.push({
      name: 'Health Needs Attention',
      weight: 10,
      description: `Health score is ${healthData.score}`,
      severity: 'medium',
    })
  }

  // 2. Communication gap
  const allContactDates = projects.map(p => new Date(p.lastCustomerContact))
  const mostRecentContact = allContactDates.length > 0
    ? Math.max(...allContactDates.map(d => d.getTime()))
    : now.getTime() - 60 * 24 * 60 * 60 * 1000

  const daysSinceContact = Math.floor(
    (now.getTime() - mostRecentContact) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceContact > 30) {
    riskScore += 25
    factors.push({
      name: 'No Recent Contact',
      weight: 25,
      description: `No contact in ${daysSinceContact} days`,
      severity: 'high',
    })
  } else if (daysSinceContact > 14) {
    riskScore += 15
    factors.push({
      name: 'Communication Gap',
      weight: 15,
      description: `Last contact ${daysSinceContact} days ago`,
      severity: 'medium',
    })
  }

  // 3. Multiple escalations
  const escalatedProjects = projects.filter(p => p.isEscalated)
  if (escalatedProjects.length >= 2) {
    riskScore += 20
    factors.push({
      name: 'Multiple Escalations',
      weight: 20,
      description: `${escalatedProjects.length} projects escalated`,
      severity: 'high',
    })
  } else if (escalatedProjects.length === 1) {
    riskScore += 10
    factors.push({
      name: 'Active Escalation',
      weight: 10,
      description: '1 project escalated',
      severity: 'medium',
    })
  }

  // 4. Projects delayed past FOC
  const delayedProjects = projects.filter(p => {
    const focDate = new Date(p.focDate)
    return focDate < now && p.status !== 'completed'
  })

  if (delayedProjects.length >= 2) {
    riskScore += 15
    factors.push({
      name: 'Multiple Delayed Projects',
      weight: 15,
      description: `${delayedProjects.length} projects past FOC date`,
      severity: 'high',
    })
  } else if (delayedProjects.length === 1) {
    riskScore += 8
    factors.push({
      name: 'Project Delayed',
      weight: 8,
      description: '1 project past FOC date',
      severity: 'medium',
    })
  }

  // 5. High blocker count
  const totalBlockers = projects.reduce(
    (sum, p) => sum + p.blockers.filter(b => !b.resolvedAt).length,
    0
  )

  if (totalBlockers >= 3) {
    riskScore += 15
    factors.push({
      name: 'Multiple Blockers',
      weight: 15,
      description: `${totalBlockers} unresolved blockers`,
      severity: 'high',
    })
  } else if (totalBlockers >= 1) {
    riskScore += 8
    factors.push({
      name: 'Active Blockers',
      weight: 8,
      description: `${totalBlockers} unresolved blocker${totalBlockers > 1 ? 's' : ''}`,
      severity: 'medium',
    })
  }

  // 6. Declining engagement (trend)
  if (healthData.trend === 'declining') {
    riskScore += 10
    factors.push({
      name: 'Declining Engagement',
      weight: 10,
      description: 'Relationship health is declining',
      severity: 'medium',
    })
  }

  // 7. No active projects (customer may be disengaging)
  const activeProjects = projects.filter(p => p.status !== 'completed')
  if (projects.length > 0 && activeProjects.length === 0) {
    riskScore += 10
    factors.push({
      name: 'No Active Projects',
      weight: 10,
      description: 'All projects completed, no new activity',
      severity: 'low',
    })
  }

  // Clamp risk score
  riskScore = Math.min(100, Math.max(0, riskScore))

  // Determine risk level
  let level: ChurnRiskLevel
  if (riskScore >= 70) {
    level = 'critical'
  } else if (riskScore >= 50) {
    level = 'high'
  } else if (riskScore >= 30) {
    level = 'medium'
  } else if (riskScore >= 10) {
    level = 'low'
  } else {
    level = 'none'
  }

  // Generate recommendation
  let recommendation: string
  switch (level) {
    case 'critical':
      recommendation = 'Immediate executive outreach required. Schedule customer success call within 24 hours.'
      break
    case 'high':
      recommendation = 'Priority attention needed. Reach out to understand concerns and develop retention plan.'
      break
    case 'medium':
      recommendation = 'Monitor closely. Schedule proactive check-in call within the week.'
      break
    case 'low':
      recommendation = 'Continue regular engagement. Consider sending satisfaction survey.'
      break
    default:
      recommendation = 'Customer relationship is healthy. Maintain current engagement level.'
  }

  return { level, score: riskScore, factors, recommendation }
}

export function getChurnRiskColor(level: ChurnRiskLevel): string {
  switch (level) {
    case 'critical':
      return 'text-red-700'
    case 'high':
      return 'text-orange-600'
    case 'medium':
      return 'text-yellow-600'
    case 'low':
      return 'text-blue-600'
    case 'none':
      return 'text-green-600'
  }
}

export function getChurnRiskBgColor(level: ChurnRiskLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100'
    case 'high':
      return 'bg-orange-100'
    case 'medium':
      return 'bg-yellow-100'
    case 'low':
      return 'bg-blue-100'
    case 'none':
      return 'bg-green-100'
  }
}

export function getChurnRiskLabel(level: ChurnRiskLevel): string {
  switch (level) {
    case 'critical':
      return 'Critical Risk'
    case 'high':
      return 'High Risk'
    case 'medium':
      return 'Medium Risk'
    case 'low':
      return 'Low Risk'
    case 'none':
      return 'No Risk'
  }
}
