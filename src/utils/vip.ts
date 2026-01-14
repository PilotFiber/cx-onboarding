import { Project, Customer, VIPTier, vipTierConfig, VIPSLARules } from '../types'

/**
 * Get the effective VIP tier for a project
 * Project-level override takes precedence over customer-level tier
 */
export function getEffectiveVIPTier(project: Project, customer: Customer | null | undefined): VIPTier {
  // Project override takes precedence
  if (project.vipTierOverride) {
    return project.vipTierOverride
  }
  // Fall back to customer tier
  if (customer?.vipTier) {
    return customer.vipTier
  }
  // Default to standard
  return 'standard'
}

/**
 * Get the VIP SLA rules for a project
 */
export function getVIPRules(project: Project, customer: Customer | null | undefined): VIPSLARules {
  const tier = getEffectiveVIPTier(project, customer)
  return vipTierConfig[tier]
}

/**
 * Calculate adjusted SLA deadline based on VIP tier
 */
export function calculateVIPAdjustedSLA(
  baseDeadlineHours: number,
  project: Project,
  customer: Customer | null | undefined
): number {
  const rules = getVIPRules(project, customer)
  return baseDeadlineHours * rules.slaMultiplier
}

/**
 * Calculate adjusted lead time based on VIP tier
 */
export function calculateVIPAdjustedLeadTime(
  baseLeadTimeDays: number,
  project: Project,
  customer: Customer | null | undefined
): number {
  const rules = getVIPRules(project, customer)
  return Math.max(1, baseLeadTimeDays - rules.leadTimeReductionDays)
}

/**
 * Check if a project/customer is VIP (any tier above standard)
 */
export function isVIP(project: Project, customer: Customer | null | undefined): boolean {
  return getEffectiveVIPTier(project, customer) !== 'standard'
}

/**
 * Get VIP priority boost for sorting
 */
export function getVIPPriorityBoost(project: Project, customer: Customer | null | undefined): number {
  const rules = getVIPRules(project, customer)
  return rules.priorityBoost
}

/**
 * Generate LinkedIn URL suggestion from company name or email domain
 */
export function suggestLinkedInUrl(companyName: string, contactEmail?: string): string {
  // Try to extract domain from email first
  if (contactEmail) {
    const domain = contactEmail.split('@')[1]
    if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail') && !domain.includes('outlook')) {
      // Remove common TLDs and clean up
      const companyFromDomain = domain.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      return `https://www.linkedin.com/company/${companyFromDomain}`
    }
  }

  // Fall back to company name
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `https://www.linkedin.com/company/${slug}`
}
