import { Playbook, PlaybookExecution, PlaybookStep } from '../types'

// Helper to generate steps
function createSteps(steps: Array<Omit<PlaybookStep, 'id'>>): PlaybookStep[] {
  return steps.map((step, idx) => ({
    ...step,
    id: `step-${idx + 1}`,
  }))
}

export const mockPlaybooks: Playbook[] = [
  {
    id: 'playbook-1',
    name: 'New Customer Welcome',
    description: 'Standard onboarding flow for new customers from handoff to first contact',
    category: 'onboarding',
    triggerConditions: ['New project created', 'First project for customer'],
    estimatedDuration: '2-3 days',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: 'system',
    timesUsed: 145,
    avgCompletionDays: 2.3,
    steps: createSteps([
      {
        order: 1,
        type: 'task',
        title: 'Review Sales Handoff',
        description: 'Review handoff notes and understand customer requirements',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 2,
        type: 'email',
        title: 'Send Welcome Email',
        description: 'Introduce yourself and outline next steps',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 3,
        type: 'wait',
        title: 'Wait for Customer Response',
        description: 'Allow time for customer to review and respond',
        waitHours: 24,
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 4,
        type: 'call',
        title: 'Initial Discovery Call',
        description: 'Confirm requirements and set expectations',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 5,
        type: 'task',
        title: 'Document Call Notes',
        description: 'Update project with any new information from discovery call',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
    ]),
  },
  {
    id: 'playbook-2',
    name: 'Escalation Response',
    description: 'Standard response process for escalated projects',
    category: 'escalation',
    triggerConditions: ['Project escalated', 'Customer complaint received'],
    estimatedDuration: '1-2 days',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
    createdBy: 'system',
    timesUsed: 32,
    avgCompletionDays: 1.5,
    steps: createSteps([
      {
        order: 1,
        type: 'task',
        title: 'Acknowledge Escalation',
        description: 'Review escalation details and assign priority',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 2,
        type: 'call',
        title: 'Customer Callback',
        description: 'Contact customer within 2 hours to acknowledge concern',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 3,
        type: 'task',
        title: 'Root Cause Analysis',
        description: 'Identify cause of issue and document findings',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 4,
        type: 'decision',
        title: 'Resolution Path',
        description: 'Determine appropriate resolution',
        decisionOptions: [
          { label: 'Schedule priority install', nextStepId: 'step-5a' },
          { label: 'Provide compensation', nextStepId: 'step-5b' },
          { label: 'Technical solution', nextStepId: 'step-5c' },
        ],
        isOptional: false,
        requiresApproval: true,
      },
      {
        order: 5,
        type: 'email',
        title: 'Resolution Communication',
        description: 'Send resolution details and timeline to customer',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 6,
        type: 'task',
        title: 'De-escalation Verification',
        description: 'Confirm issue is resolved and de-escalate project',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: true,
      },
    ]),
  },
  {
    id: 'playbook-3',
    name: 'VIP Customer Treatment',
    description: 'Enhanced service protocol for VIP tier customers',
    category: 'vip',
    triggerConditions: ['VIP customer project', 'Gold or Platinum tier'],
    estimatedDuration: 'Ongoing',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: 'system',
    timesUsed: 28,
    avgCompletionDays: 0,
    steps: createSteps([
      {
        order: 1,
        type: 'task',
        title: 'Assign Dedicated Support',
        description: 'Ensure project has senior CX assignee',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 2,
        type: 'call',
        title: 'Executive Introduction',
        description: 'Personal call from CX lead to introduce dedicated support',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 3,
        type: 'automation',
        title: 'Enable Priority Scheduling',
        description: 'Flag project for priority install slots',
        automationAction: 'set_priority_flag',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 4,
        type: 'task',
        title: 'Weekly Status Updates',
        description: 'Set up weekly status update cadence',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
    ]),
  },
  {
    id: 'playbook-4',
    name: 'Post-Install Follow-up',
    description: 'Standard follow-up sequence after successful installation',
    category: 'post-install',
    triggerConditions: ['Project completed', 'Install marked successful'],
    estimatedDuration: '7-14 days',
    isActive: true,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-04-20T00:00:00Z',
    createdBy: 'system',
    timesUsed: 89,
    avgCompletionDays: 10,
    steps: createSteps([
      {
        order: 1,
        type: 'automation',
        title: 'Send NPS Survey',
        description: 'Automatically trigger NPS survey email',
        automationAction: 'send_nps_survey',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 2,
        type: 'wait',
        title: 'Wait for Survey',
        description: 'Allow 3 days for survey response',
        waitDays: 3,
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 3,
        type: 'call',
        title: '7-Day Check-in Call',
        description: 'Call customer to verify service is working well',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 4,
        type: 'task',
        title: 'Request Testimonial',
        description: 'If satisfaction is high, request testimonial for marketing',
        assignTo: 'owner',
        isOptional: true,
        requiresApproval: false,
      },
      {
        order: 5,
        type: 'task',
        title: 'Handoff to Account Management',
        description: 'Transfer customer relationship to AM team',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
    ]),
  },
  {
    id: 'playbook-5',
    name: 'Delay Mitigation',
    description: 'Steps to take when a project is at risk of missing FOC',
    category: 'delay',
    triggerConditions: ['FOC approaching with blockers', 'Project past FOC'],
    estimatedDuration: '1-3 days',
    isActive: true,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    createdBy: 'system',
    timesUsed: 45,
    avgCompletionDays: 2,
    steps: createSteps([
      {
        order: 1,
        type: 'task',
        title: 'Assess Delay Impact',
        description: 'Determine how many days delay is expected',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 2,
        type: 'call',
        title: 'Proactive Customer Contact',
        description: 'Inform customer of delay before they need to ask',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 3,
        type: 'email',
        title: 'Send Delay Notification',
        description: 'Formal email with new timeline and reason',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 4,
        type: 'task',
        title: 'Update FOC Date',
        description: 'Set realistic new FOC date in system',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 5,
        type: 'decision',
        title: 'Compensation Decision',
        description: 'Determine if compensation is warranted',
        decisionOptions: [
          { label: 'No compensation needed', nextStepId: 'step-7' },
          { label: 'Credit first month', nextStepId: 'step-6a' },
          { label: 'Waive NRC', nextStepId: 'step-6b' },
        ],
        isOptional: false,
        requiresApproval: true,
      },
      {
        order: 6,
        type: 'email',
        title: 'Send Compensation Offer',
        description: 'If warranted, send compensation details',
        assignTo: 'owner',
        isOptional: true,
        requiresApproval: true,
      },
      {
        order: 7,
        type: 'task',
        title: 'Schedule Priority Install',
        description: 'Ensure project gets next available install slot',
        assignTo: 'owner',
        isOptional: false,
        requiresApproval: false,
      },
    ]),
  },
  {
    id: 'playbook-6',
    name: 'At-Risk Customer Recovery',
    description: 'Intervention for customers showing churn risk indicators',
    category: 'at-risk',
    triggerConditions: ['Churn risk: High', 'Multiple escalations', 'Low NPS score'],
    estimatedDuration: '5-7 days',
    isActive: true,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: 'system',
    timesUsed: 12,
    avgCompletionDays: 5,
    steps: createSteps([
      {
        order: 1,
        type: 'task',
        title: 'Review Customer History',
        description: 'Analyze all interactions and identify pain points',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 2,
        type: 'call',
        title: 'Executive Check-in',
        description: 'Manager call to understand concerns directly',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 3,
        type: 'task',
        title: 'Develop Recovery Plan',
        description: 'Create specific action plan addressing concerns',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: true,
      },
      {
        order: 4,
        type: 'email',
        title: 'Send Recovery Proposal',
        description: 'Present improvement plan to customer',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: true,
      },
      {
        order: 5,
        type: 'wait',
        title: 'Implementation Period',
        description: 'Execute recovery plan and monitor',
        waitDays: 14,
        isOptional: false,
        requiresApproval: false,
      },
      {
        order: 6,
        type: 'call',
        title: 'Follow-up Assessment',
        description: 'Verify improvement and gather feedback',
        assignTo: 'manager',
        isOptional: false,
        requiresApproval: false,
      },
    ]),
  },
]

// Mock active playbook executions
export const mockPlaybookExecutions: PlaybookExecution[] = [
  {
    id: 'exec-1',
    playbookId: 'playbook-1',
    projectId: 'p1',
    customerId: 'c1',
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    currentStepId: 'step-4',
    status: 'in-progress',
    stepCompletions: [
      { stepId: 'step-1', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Sarah Chen' },
      { stepId: 'step-2', completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Sarah Chen' },
      { stepId: 'step-3', completedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'system' },
    ],
  },
  {
    id: 'exec-2',
    playbookId: 'playbook-4',
    projectId: 'p5',
    customerId: 'c5',
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    currentStepId: 'step-3',
    status: 'in-progress',
    stepCompletions: [
      { stepId: 'step-1', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'system' },
      { stepId: 'step-2', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'system' },
    ],
  },
]

export function getPlaybookById(id: string): Playbook | undefined {
  return mockPlaybooks.find(p => p.id === id)
}

export function getPlaybooksByCategory(category: string): Playbook[] {
  return mockPlaybooks.filter(p => p.category === category && p.isActive)
}

export function getActiveExecutionsForProject(projectId: string): PlaybookExecution[] {
  return mockPlaybookExecutions.filter(e => e.projectId === projectId && e.status === 'in-progress')
}

export function getSuggestedPlaybooks(project: {
  isEscalated?: boolean
  status: string
  customerId: string
}, customer: { vipTier?: string }): Playbook[] {
  const suggestions: Playbook[] = []

  // Suggest escalation playbook if escalated
  if (project.isEscalated) {
    const escalation = mockPlaybooks.find(p => p.category === 'escalation')
    if (escalation) suggestions.push(escalation)
  }

  // Suggest VIP playbook for VIP customers
  if (customer.vipTier && customer.vipTier !== 'standard') {
    const vip = mockPlaybooks.find(p => p.category === 'vip')
    if (vip) suggestions.push(vip)
  }

  // Suggest post-install for completed projects
  if (project.status === 'completed') {
    const postInstall = mockPlaybooks.find(p => p.category === 'post-install')
    if (postInstall) suggestions.push(postInstall)
  }

  return suggestions
}
