import { Project, Customer } from '../types'

export interface RevenueBreakdown {
  // Current state
  totalSoldMRC: number // All project MRC
  activatedMRC: number // Completed projects only
  pendingActivationMRC: number // In-progress projects

  // By timeline
  forecast: MonthlyForecast[]

  // Aggregates
  activationRate: number // % of sold that's activated
  avgDaysToActivate: number
  atRiskMRC: number // From escalated or delayed projects
}

export interface MonthlyForecast {
  month: string // "Jan 2026"
  date: Date
  projectedActivationMRC: number
  cumulativeActivatedMRC: number
  projects: ProjectRevenueForecast[]
}

export interface ProjectRevenueForecast {
  projectId: string
  customerName: string
  mrc: number
  expectedActivationDate: Date
  confidence: 'high' | 'medium' | 'low'
  status: string
}

export function calculateRevenueForecasting(
  projects: Project[],
  customers: Customer[]
): RevenueBreakdown {
  const now = new Date()

  // Get customer lookup
  const customerMap = new Map(customers.map(c => [c.id, c]))

  // Calculate basic revenue metrics
  const totalSoldMRC = projects.reduce((sum, p) => sum + p.mrc, 0)

  const completedProjects = projects.filter(p => p.status === 'completed')
  const activatedMRC = completedProjects.reduce((sum, p) => sum + p.mrc, 0)

  const pendingProjects = projects.filter(p => p.status !== 'completed')
  const pendingActivationMRC = pendingProjects.reduce((sum, p) => sum + p.mrc, 0)

  // Calculate at-risk MRC
  const atRiskProjects = projects.filter(p => {
    if (p.status === 'completed') return false
    const focDate = new Date(p.focDate)
    return p.isEscalated || focDate < now
  })
  const atRiskMRC = atRiskProjects.reduce((sum, p) => sum + p.mrc, 0)

  // Calculate activation rate
  const activationRate = totalSoldMRC > 0
    ? Math.round((activatedMRC / totalSoldMRC) * 100)
    : 0

  // Calculate average days to activate
  const completedWithDates = completedProjects.filter(p => p.createdAt && p.scheduledDate)
  let avgDaysToActivate = 0
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((sum, p) => {
      const created = new Date(p.createdAt)
      const completed = new Date(p.scheduledDate!)
      return sum + Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)
    avgDaysToActivate = Math.round(totalDays / completedWithDates.length)
  }

  // Generate monthly forecast
  const forecast = generateMonthlyForecast(pendingProjects, customerMap, activatedMRC)

  return {
    totalSoldMRC,
    activatedMRC,
    pendingActivationMRC,
    forecast,
    activationRate,
    avgDaysToActivate,
    atRiskMRC,
  }
}

function generateMonthlyForecast(
  pendingProjects: Project[],
  customerMap: Map<string, Customer>,
  currentActivatedMRC: number
): MonthlyForecast[] {
  const now = new Date()
  const forecast: MonthlyForecast[] = []

  // Generate forecast for next 6 months
  for (let i = 0; i < 6; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0)

    const monthLabel = forecastDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })

    // Find projects expected to complete this month
    const monthProjects: ProjectRevenueForecast[] = pendingProjects
      .filter(p => {
        const expectedDate = getExpectedActivationDate(p)
        return expectedDate >= forecastDate && expectedDate <= monthEnd
      })
      .map(p => {
        const customer = customerMap.get(p.customerId)
        return {
          projectId: p.id,
          customerName: customer?.companyName || 'Unknown',
          mrc: p.mrc,
          expectedActivationDate: getExpectedActivationDate(p),
          confidence: getActivationConfidence(p),
          status: p.status,
        }
      })

    const projectedActivationMRC = monthProjects.reduce((sum, p) => sum + p.mrc, 0)

    // Calculate cumulative
    const previousCumulative = forecast.length > 0
      ? forecast[forecast.length - 1].cumulativeActivatedMRC
      : currentActivatedMRC

    forecast.push({
      month: monthLabel,
      date: forecastDate,
      projectedActivationMRC,
      cumulativeActivatedMRC: previousCumulative + projectedActivationMRC,
      projects: monthProjects,
    })
  }

  return forecast
}

function getExpectedActivationDate(project: Project): Date {
  // If scheduled, use that date
  if (project.scheduledDate) {
    return new Date(project.scheduledDate)
  }

  // Otherwise, estimate based on FOC date and status
  const focDate = new Date(project.focDate)
  const now = new Date()

  // Add buffer based on status
  const bufferDays: Record<string, number> = {
    'new': 14,
    'reviewing': 10,
    'scheduled': 0,
    'confirmed': 0,
    'installing': 2,
    'completed': 0,
  }

  const buffer = bufferDays[project.status] || 7
  const expectedDate = new Date(focDate)
  expectedDate.setDate(expectedDate.getDate() + buffer)

  // Don't forecast in the past
  if (expectedDate < now) {
    expectedDate.setDate(now.getDate() + 7)
  }

  return expectedDate
}

function getActivationConfidence(project: Project): 'high' | 'medium' | 'low' {
  // Determine confidence based on project state
  if (project.isEscalated) return 'low'
  if (project.blockers.filter(b => !b.resolvedAt).length > 0) return 'low'

  const focDate = new Date(project.focDate)
  const now = new Date()

  if (focDate < now) return 'low' // Past due

  if (project.status === 'confirmed' || project.status === 'installing') return 'high'
  if (project.status === 'scheduled') return 'medium'

  return 'medium'
}

// Helper for displaying confidence
export function getConfidenceColor(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return 'text-green-600'
    case 'medium':
      return 'text-yellow-600'
    case 'low':
      return 'text-red-600'
  }
}

export function getConfidenceBgColor(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return 'bg-green-100'
    case 'medium':
      return 'bg-yellow-100'
    case 'low':
      return 'bg-red-100'
  }
}
