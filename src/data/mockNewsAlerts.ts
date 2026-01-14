import { NewsAlert } from '../types'

// Generate dates relative to today for more realistic demo data
const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const mockNewsAlerts: NewsAlert[] = [
  // Acme Corp (cust-001) - Gold VIP
  {
    id: 'news-001',
    customerId: 'cust-001',
    category: 'funding',
    title: 'Acme Corp Closes $50M Series C Round',
    summary: 'Acme Corp announced today it has raised $50 million in Series C funding led by Sequoia Capital. The company plans to use the funds to expand its product line and enter new markets.',
    source: 'news',
    sourceUrl: 'https://techcrunch.com/example',
    publishedAt: daysAgo(2),
    isRead: false,
    isDismissed: false,
    suggestedAction: 'Great opportunity to discuss bandwidth upgrade for expansion',
  },
  {
    id: 'news-002',
    customerId: 'cust-001',
    category: 'leadership',
    title: 'Acme Corp Appoints New CTO',
    summary: 'Dr. Jennifer Park joins Acme Corp as Chief Technology Officer, bringing 15 years of experience from Google and Microsoft.',
    source: 'linkedin',
    sourceUrl: 'https://linkedin.com/example',
    publishedAt: daysAgo(7),
    isRead: true,
    isDismissed: false,
    suggestedAction: 'Reach out to introduce Pilot Fiber to new CTO',
  },

  // TechStart Inc (cust-002)
  {
    id: 'news-003',
    customerId: 'cust-002',
    category: 'milestone',
    title: 'TechStart Inc Reaches 1 Million Users',
    summary: 'TechStart Inc celebrated a major milestone this week, announcing they have surpassed 1 million active users on their platform.',
    source: 'press-release',
    publishedAt: daysAgo(1),
    isRead: false,
    isDismissed: false,
    suggestedAction: 'Send congratulations and check if increased traffic requires bandwidth review',
  },
  {
    id: 'news-004',
    customerId: 'cust-002',
    category: 'product',
    title: 'TechStart Launches AI-Powered Analytics Suite',
    summary: 'TechStart Inc has unveiled its new AI-powered analytics suite, featuring real-time data processing and predictive insights.',
    source: 'news',
    publishedAt: daysAgo(14),
    isRead: true,
    isDismissed: false,
  },

  // Metro Design Studio (cust-003) - Silver VIP
  {
    id: 'news-005',
    customerId: 'cust-003',
    category: 'award',
    title: 'Metro Design Studio Wins Best Agency Award',
    summary: 'Metro Design Studio was named Best Creative Agency at the NYC Design Awards ceremony.',
    source: 'social',
    publishedAt: daysAgo(3),
    isRead: false,
    isDismissed: false,
    suggestedAction: 'Send congratulations gift or note',
  },
  {
    id: 'news-006',
    customerId: 'cust-003',
    category: 'expansion',
    title: 'Metro Design Opens Brooklyn Office',
    summary: 'Metro Design Studio announced the opening of their second location in Brooklyn to better serve their growing client base.',
    source: 'linkedin',
    publishedAt: daysAgo(10),
    isRead: false,
    isDismissed: false,
    suggestedAction: 'Explore connectivity opportunity for new Brooklyn office',
  },

  // DataFlow Analytics (cust-005) - Platinum VIP
  {
    id: 'news-007',
    customerId: 'cust-005',
    category: 'funding',
    title: 'DataFlow Analytics Secures $100M Series D',
    summary: 'DataFlow Analytics announced a $100M Series D round, valuing the company at $1.2 billion. The data analytics leader plans to double its engineering team.',
    source: 'news',
    sourceUrl: 'https://techcrunch.com/example',
    publishedAt: daysAgo(5),
    isRead: false,
    isDismissed: false,
    suggestedAction: 'Schedule executive review meeting to discuss expansion needs',
  },
  {
    id: 'news-008',
    customerId: 'cust-005',
    category: 'partnership',
    title: 'DataFlow Partners with Salesforce',
    summary: 'DataFlow Analytics and Salesforce announced a strategic partnership to integrate DataFlow\'s analytics directly into Salesforce CRM.',
    source: 'press-release',
    publishedAt: daysAgo(8),
    isRead: true,
    isDismissed: false,
    suggestedAction: 'Discuss potential increased data traffic from integration',
  },
  {
    id: 'news-009',
    customerId: 'cust-005',
    category: 'expansion',
    title: 'DataFlow Analytics Expands to 3 New Markets',
    summary: 'DataFlow is opening offices in Chicago, Austin, and Seattle as part of their aggressive expansion strategy.',
    source: 'news',
    publishedAt: daysAgo(21),
    isRead: true,
    isDismissed: true, // User dismissed this one
  },

  // Manhattan Media Group (cust-006) - Gold VIP
  {
    id: 'news-010',
    customerId: 'cust-006',
    category: 'milestone',
    title: 'Manhattan Media Group Celebrates 25 Years',
    summary: 'Manhattan Media Group is celebrating its 25th anniversary with a gala event and special programming throughout the month.',
    source: 'linkedin',
    publishedAt: daysAgo(4),
    isRead: false,
    isDismissed: false,
    suggestedAction: 'Send anniversary congratulations',
  },
  {
    id: 'news-011',
    customerId: 'cust-006',
    category: 'press',
    title: 'Manhattan Media Featured in Ad Age',
    summary: 'Ad Age profiled Manhattan Media Group in their "Agencies to Watch" issue, highlighting their innovative digital strategies.',
    source: 'news',
    publishedAt: daysAgo(12),
    isRead: true,
    isDismissed: false,
  },
]

// Helper function to get alerts for a specific customer
export function getCustomerNewsAlerts(customerId: string): NewsAlert[] {
  return mockNewsAlerts.filter(alert => alert.customerId === customerId)
}

// Helper function to get unread alerts count for a customer
export function getUnreadAlertsCount(customerId: string): number {
  return mockNewsAlerts.filter(
    alert => alert.customerId === customerId && !alert.isRead && !alert.isDismissed
  ).length
}

// Helper function to get all unread alerts across all customers
export function getAllUnreadAlerts(): NewsAlert[] {
  return mockNewsAlerts.filter(alert => !alert.isRead && !alert.isDismissed)
}
