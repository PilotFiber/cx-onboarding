import { NPSSurveyResponse, getNPSCategory } from '../types'

// Generate mock NPS survey responses
function generateMockNPSResponses(): NPSSurveyResponse[] {
  const responses: NPSSurveyResponse[] = []

  // Sample data representing various customer feedback
  const mockData: Array<{
    customerId: string
    projectId?: string
    score: number
    feedback?: string
    contactName: string
    contactEmail: string
    surveyType: 'post-install' | 'quarterly' | 'annual' | 'ad-hoc'
    daysAgo: number
    followUpRequired: boolean
  }> = [
    // Promoters (9-10)
    {
      customerId: 'c1',
      projectId: 'p1',
      score: 10,
      feedback: 'Excellent service! The installation team was professional and efficient. Would highly recommend Pilot Fiber.',
      contactName: 'John Smith',
      contactEmail: 'jsmith@acmecorp.com',
      surveyType: 'post-install',
      daysAgo: 5,
      followUpRequired: false,
    },
    {
      customerId: 'c2',
      projectId: 'p2',
      score: 9,
      feedback: 'Great experience overall. Very happy with the speed and reliability.',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah@techstartup.io',
      surveyType: 'post-install',
      daysAgo: 12,
      followUpRequired: false,
    },
    {
      customerId: 'c3',
      score: 10,
      feedback: 'Best ISP we have ever worked with. The support team is amazing!',
      contactName: 'Mike Chen',
      contactEmail: 'mchen@globalretail.com',
      surveyType: 'quarterly',
      daysAgo: 30,
      followUpRequired: false,
    },
    {
      customerId: 'c4',
      projectId: 'p4',
      score: 9,
      feedback: 'Smooth installation process. Very pleased with the service quality.',
      contactName: 'Emily Davis',
      contactEmail: 'emily@creativestudio.com',
      surveyType: 'post-install',
      daysAgo: 18,
      followUpRequired: false,
    },
    // Passives (7-8)
    {
      customerId: 'c5',
      projectId: 'p5',
      score: 8,
      feedback: 'Good service, but the scheduling process could be improved.',
      contactName: 'Robert Wilson',
      contactEmail: 'rwilson@lawfirm.com',
      surveyType: 'post-install',
      daysAgo: 8,
      followUpRequired: true,
    },
    {
      customerId: 'c6',
      score: 7,
      feedback: 'Service is reliable but pricing could be more competitive.',
      contactName: 'Lisa Anderson',
      contactEmail: 'landerson@healthcare.org',
      surveyType: 'quarterly',
      daysAgo: 45,
      followUpRequired: true,
    },
    {
      customerId: 'c7',
      projectId: 'p7',
      score: 8,
      contactName: 'David Martinez',
      contactEmail: 'david@restaurant.com',
      surveyType: 'post-install',
      daysAgo: 22,
      followUpRequired: false,
    },
    // Detractors (0-6)
    {
      customerId: 'c8',
      projectId: 'p8',
      score: 5,
      feedback: 'Installation was delayed multiple times. Very frustrating experience.',
      contactName: 'Jennifer Brown',
      contactEmail: 'jbrown@consulting.com',
      surveyType: 'post-install',
      daysAgo: 3,
      followUpRequired: true,
    },
    {
      customerId: 'c9',
      score: 4,
      feedback: 'Communication needs improvement. Had to chase for updates constantly.',
      contactName: 'Chris Taylor',
      contactEmail: 'ctaylor@mediacompany.com',
      surveyType: 'quarterly',
      daysAgo: 60,
      followUpRequired: true,
    },
    {
      customerId: 'c10',
      projectId: 'p10',
      score: 6,
      feedback: 'The service itself is good, but the onboarding experience was poor.',
      contactName: 'Amanda White',
      contactEmail: 'awhite@finance.com',
      surveyType: 'post-install',
      daysAgo: 15,
      followUpRequired: true,
    },
    // More promoters to keep NPS positive
    {
      customerId: 'c1',
      score: 9,
      contactName: 'John Smith',
      contactEmail: 'jsmith@acmecorp.com',
      surveyType: 'quarterly',
      daysAgo: 90,
      followUpRequired: false,
    },
    {
      customerId: 'c2',
      score: 10,
      feedback: 'Still very happy with the service after several months!',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah@techstartup.io',
      surveyType: 'quarterly',
      daysAgo: 85,
      followUpRequired: false,
    },
    {
      customerId: 'c3',
      score: 10,
      contactName: 'Mike Chen',
      contactEmail: 'mchen@globalretail.com',
      surveyType: 'annual',
      daysAgo: 365,
      followUpRequired: false,
    },
  ]

  const now = new Date()

  mockData.forEach((data, index) => {
    const respondedAt = new Date(now)
    respondedAt.setDate(respondedAt.getDate() - data.daysAgo)

    const sentAt = new Date(respondedAt)
    sentAt.setDate(sentAt.getDate() - 2) // Sent 2 days before response

    responses.push({
      id: `nps-${index + 1}`,
      customerId: data.customerId,
      projectId: data.projectId,
      score: data.score,
      category: getNPSCategory(data.score),
      feedback: data.feedback,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      surveyType: data.surveyType,
      sentAt: sentAt.toISOString(),
      respondedAt: respondedAt.toISOString(),
      followUpRequired: data.followUpRequired,
      followUpCompletedAt: data.followUpRequired && data.daysAgo > 30
        ? new Date(respondedAt.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    })
  })

  return responses
}

export const mockNPSResponses = generateMockNPSResponses()

export function getNPSResponsesByCustomer(customerId: string): NPSSurveyResponse[] {
  return mockNPSResponses.filter(r => r.customerId === customerId)
}

export function getNPSResponsesRequiringFollowUp(): NPSSurveyResponse[] {
  return mockNPSResponses.filter(r => r.followUpRequired && !r.followUpCompletedAt)
}
