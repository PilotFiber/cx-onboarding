import { Project } from '../types'

export interface HealthScoreBreakdown {
  score: number // 0-100
  level: 'critical' | 'at-risk' | 'needs-attention' | 'healthy'
  factors: HealthFactor[]
}

export interface HealthFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  points: number
  description: string
}

export function calculateHealthScore(project: Project): HealthScoreBreakdown {
  const factors: HealthFactor[] = []
  let score = 100 // Start at 100 and deduct points

  const now = new Date()
  const focDate = new Date(project.focDate)
  const lastContact = new Date(project.lastCustomerContact)

  // 1. FOC Date Factor (-30 to +10 points)
  const daysUntilFoc = Math.floor((focDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilFoc < 0) {
    // Past FOC - critical
    const daysPast = Math.abs(daysUntilFoc)
    const deduction = Math.min(30, daysPast * 5)
    score -= deduction
    factors.push({
      name: 'FOC Date',
      impact: 'negative',
      points: -deduction,
      description: `${daysPast} day${daysPast !== 1 ? 's' : ''} past FOC date`
    })
  } else if (daysUntilFoc <= 2) {
    // FOC approaching (0-2 days)
    score -= 15
    factors.push({
      name: 'FOC Date',
      impact: 'negative',
      points: -15,
      description: `FOC date is ${daysUntilFoc === 0 ? 'today' : `in ${daysUntilFoc} day${daysUntilFoc !== 1 ? 's' : ''}`}`
    })
  } else if (daysUntilFoc <= 5) {
    // FOC within a week
    score -= 5
    factors.push({
      name: 'FOC Date',
      impact: 'negative',
      points: -5,
      description: `FOC date in ${daysUntilFoc} days`
    })
  } else {
    // Plenty of time
    factors.push({
      name: 'FOC Date',
      impact: 'positive',
      points: 0,
      description: `FOC date in ${daysUntilFoc} days`
    })
  }

  // 2. Last Customer Contact (-25 points max)
  const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceContact > 7) {
    const deduction = Math.min(25, (daysSinceContact - 7) * 5)
    score -= deduction
    factors.push({
      name: 'Customer Contact',
      impact: 'negative',
      points: -deduction,
      description: `No contact in ${daysSinceContact} days`
    })
  } else if (daysSinceContact > 3) {
    score -= 5
    factors.push({
      name: 'Customer Contact',
      impact: 'negative',
      points: -5,
      description: `Last contact ${daysSinceContact} days ago`
    })
  } else {
    factors.push({
      name: 'Customer Contact',
      impact: 'positive',
      points: 0,
      description: daysSinceContact === 0 ? 'Contacted today' : `Last contact ${daysSinceContact} day${daysSinceContact !== 1 ? 's' : ''} ago`
    })
  }

  // 3. Active Blockers (-20 points max)
  const activeBlockers = project.blockers.filter(b => !b.resolvedAt).length

  if (activeBlockers > 0) {
    const deduction = Math.min(20, activeBlockers * 10)
    score -= deduction
    factors.push({
      name: 'Blockers',
      impact: 'negative',
      points: -deduction,
      description: `${activeBlockers} active blocker${activeBlockers !== 1 ? 's' : ''}`
    })
  } else {
    factors.push({
      name: 'Blockers',
      impact: 'positive',
      points: 0,
      description: 'No active blockers'
    })
  }

  // 4. Task Completion (-15 points max)
  const totalTasks = project.tasks.length
  const completedTasks = project.tasks.filter(t => t.completed).length
  const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100

  if (taskCompletion < 25) {
    score -= 15
    factors.push({
      name: 'Task Progress',
      impact: 'negative',
      points: -15,
      description: `Only ${Math.round(taskCompletion)}% tasks complete`
    })
  } else if (taskCompletion < 50) {
    score -= 10
    factors.push({
      name: 'Task Progress',
      impact: 'negative',
      points: -10,
      description: `${Math.round(taskCompletion)}% tasks complete`
    })
  } else if (taskCompletion < 75) {
    score -= 5
    factors.push({
      name: 'Task Progress',
      impact: 'neutral',
      points: -5,
      description: `${Math.round(taskCompletion)}% tasks complete`
    })
  } else {
    factors.push({
      name: 'Task Progress',
      impact: 'positive',
      points: 0,
      description: `${Math.round(taskCompletion)}% tasks complete`
    })
  }

  // 5. Readiness Tasks (Critical) (-15 points max)
  const criticalReadiness = project.readinessTasks.filter(t => t.critical)
  const completedCritical = criticalReadiness.filter(t => t.completed).length
  const criticalCompletion = criticalReadiness.length > 0
    ? (completedCritical / criticalReadiness.length) * 100
    : 100

  if (criticalCompletion < 50) {
    score -= 15
    factors.push({
      name: 'Install Readiness',
      impact: 'negative',
      points: -15,
      description: `Only ${completedCritical}/${criticalReadiness.length} critical items ready`
    })
  } else if (criticalCompletion < 100) {
    score -= 8
    factors.push({
      name: 'Install Readiness',
      impact: 'negative',
      points: -8,
      description: `${completedCritical}/${criticalReadiness.length} critical items ready`
    })
  } else {
    factors.push({
      name: 'Install Readiness',
      impact: 'positive',
      points: 0,
      description: 'All critical items ready'
    })
  }

  // 6. Escalation Status (-10 points)
  if (project.isEscalated) {
    score -= 10
    factors.push({
      name: 'Escalation',
      impact: 'negative',
      points: -10,
      description: 'Project is escalated'
    })
  }

  // 7. Project Status Bonus
  if (project.status === 'confirmed' || project.status === 'installing') {
    score += 5
    factors.push({
      name: 'Status',
      impact: 'positive',
      points: 5,
      description: `Project is ${project.status}`
    })
  } else if (project.status === 'completed') {
    score = 100
    factors.length = 0
    factors.push({
      name: 'Status',
      impact: 'positive',
      points: 100,
      description: 'Project completed'
    })
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))

  // Determine health level
  let level: HealthScoreBreakdown['level']
  if (score >= 80) {
    level = 'healthy'
  } else if (score >= 60) {
    level = 'needs-attention'
  } else if (score >= 40) {
    level = 'at-risk'
  } else {
    level = 'critical'
  }

  return { score, level, factors }
}

export function getHealthColor(level: HealthScoreBreakdown['level']): string {
  switch (level) {
    case 'healthy':
      return 'text-green-600'
    case 'needs-attention':
      return 'text-yellow-600'
    case 'at-risk':
      return 'text-orange-600'
    case 'critical':
      return 'text-red-600'
  }
}

export function getHealthBgColor(level: HealthScoreBreakdown['level']): string {
  switch (level) {
    case 'healthy':
      return 'bg-green-100'
    case 'needs-attention':
      return 'bg-yellow-100'
    case 'at-risk':
      return 'bg-orange-100'
    case 'critical':
      return 'bg-red-100'
  }
}

export function getHealthLabel(level: HealthScoreBreakdown['level']): string {
  switch (level) {
    case 'healthy':
      return 'Healthy'
    case 'needs-attention':
      return 'Needs Attention'
    case 'at-risk':
      return 'At Risk'
    case 'critical':
      return 'Critical'
  }
}
