import { Ticket, ticketSlaTargets } from '../types'

const today = new Date()
const formatDate = (daysOffset: number, hoursOffset = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() + daysOffset)
  d.setHours(d.getHours() + hoursOffset)
  return d.toISOString()
}

// Helper to calculate SLA deadlines based on priority
const calculateSla = (createdAt: string, priority: 'low' | 'normal' | 'high' | 'urgent') => {
  const created = new Date(createdAt)
  const targets = ticketSlaTargets[priority]

  const firstResponseDue = new Date(created)
  firstResponseDue.setHours(firstResponseDue.getHours() + targets.firstResponse)

  const resolutionDue = new Date(created)
  resolutionDue.setHours(resolutionDue.getHours() + targets.resolution)

  return {
    firstResponseDue: firstResponseDue.toISOString(),
    resolutionDue: resolutionDue.toISOString(),
  }
}

export const mockTickets: Ticket[] = [
  // Project 1 - Acme Corp (new)
  {
    id: 'ticket-001',
    projectId: 'proj-001',
    type: 'email',
    category: 'general',
    status: 'open',
    priority: 'high',
    subject: 'New Customer Handoff - Acme Corp - 350 Fifth Ave',
    description: `Hi CX Team,

Please find below the details for our new customer Acme Corp:

Customer: Acme Corp
Contact: John Smith (john.smith@acmecorp.com)
Address: 350 Fifth Avenue, New York, NY 10118
Service: 1 Gig Dedicated
Static IP: Yes (/29 block)
Contract Term: 36 months

Customer is eager to get started. They're expanding their office and need connectivity ASAP.

Thanks,
Mike Reynolds
Account Executive`,
    from: 'mike.reynolds@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Alex Chen',
    createdAt: formatDate(-1, -4),
    updatedAt: formatDate(-1, -4),
    isRead: true,
    requiresResponse: true,
    responseDeadline: formatDate(1),
    ...calculateSla(formatDate(-1, -4), 'high'),
    firstRespondedAt: formatDate(-1, -2),
    replies: [
      {
        id: 'reply-001-1',
        author: 'Alex Chen',
        authorType: 'agent',
        content: 'Thanks for the handoff Mike! I\'ll reach out to John today to introduce myself and discuss next steps.',
        createdAt: formatDate(-1, -2),
        isInternal: false,
      }
    ],
    notes: [
      {
        id: 'note-001-1',
        author: 'Alex Chen',
        content: 'Reviewed handoff email. Building is on-net with XGS deployment. Will send welcome email today.',
        createdAt: formatDate(-1, -2),
        isInternal: true,
      }
    ]
  },

  // Project 2 - TechStart Inc (reviewing) - multiple tickets
  {
    id: 'ticket-002',
    projectId: 'proj-002',
    type: 'email',
    category: 'general',
    status: 'resolved',
    priority: 'normal',
    subject: 'New Customer Handoff - TechStart Inc - 200 Park Ave',
    description: `Hi Team,

New customer handoff for TechStart Inc.

Customer: TechStart Inc
Contact: Sarah Johnson (sarah@techstart.io)
Address: 200 Park Avenue, New York, NY 10166
Service: 500 Mbps Dedicated
Static IP: No
Contract Term: 24 months

Note: Customer has their own router and will manage WiFi.

Thanks,
Jennifer Lee
Account Executive`,
    from: 'jennifer.lee@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(-3, -6),
    updatedAt: formatDate(-2, -3),
    resolvedAt: formatDate(-2, -3),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-3, -6), 'normal'),
    firstRespondedAt: formatDate(-3, -4),
    replies: [
      {
        id: 'reply-002-1',
        author: 'Maria Santos',
        authorType: 'agent',
        content: 'Got it Jennifer! I\'ll send the welcome email to Sarah and start the onboarding process.',
        createdAt: formatDate(-3, -4),
        isInternal: false,
      },
      {
        id: 'reply-002-2',
        author: 'System',
        authorType: 'system',
        content: 'Ticket resolved - Welcome email sent and scheduling in progress.',
        createdAt: formatDate(-2, -3),
        isInternal: false,
      }
    ],
  },
  {
    id: 'ticket-003',
    projectId: 'proj-002',
    type: 'email',
    category: 'technical',
    status: 'open',
    priority: 'normal',
    subject: 'Re: Welcome to Pilot Fiber - Equipment Question',
    description: `Hi,

Thursday the 16th works great for us. I'll be onsite to meet the installer.

Quick question - will the installer bring the modem/ONT or do we need to purchase equipment separately?

Thanks,
Sarah`,
    from: 'sarah@techstart.io',
    to: ['am@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(-2, 2),
    updatedAt: formatDate(-2, 2),
    isRead: false,
    requiresResponse: true,
    responseDeadline: formatDate(0),
    ...calculateSla(formatDate(-2, 2), 'normal'),
    notes: [
      {
        id: 'note-003-1',
        author: 'Maria Santos',
        content: 'Customer asking about equipment. Need to confirm we provide ONT and they handle their own router.',
        createdAt: formatDate(-2, 3),
        isInternal: true,
      }
    ]
  },
  {
    id: 'ticket-004',
    projectId: 'proj-002',
    type: 'internal',
    category: 'scheduling',
    status: 'pending',
    priority: 'normal',
    subject: 'After-hours access request submitted',
    description: 'Submitted building access request for after-hours installation on Thursday 6pm. Waiting for building management approval.',
    assignee: 'Maria Santos',
    createdAt: formatDate(-2, -1),
    updatedAt: formatDate(-2, -1),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-2, -1), 'normal'),
    firstRespondedAt: formatDate(-2, -1),
  },

  // Project 3 - Metro Design Studio (scheduled)
  {
    id: 'ticket-005',
    projectId: 'proj-003',
    type: 'email',
    category: 'general',
    status: 'resolved',
    priority: 'normal',
    subject: 'New Customer Handoff - Metro Design Studio - 55 Water St',
    description: `CX Team,

New customer for 55 Water Street.

Customer: Metro Design Studio
Contact: Michael Chen (mchen@metrodesign.com)
Address: 55 Water Street, New York, NY 10041
Service: 1 Gig Dedicated
Static IP: Yes
Contract Term: 36 months

Thanks,
Mike`,
    from: 'mike.reynolds@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Alex Chen',
    createdAt: formatDate(-5, -8),
    updatedAt: formatDate(-1, -5),
    resolvedAt: formatDate(-1, -5),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-5, -8), 'normal'),
    firstRespondedAt: formatDate(-5, -6),
    notes: [
      {
        id: 'note-005-1',
        author: 'Alex Chen',
        content: 'Sent confirmation email to customer. Install scheduled for Saturday 7am.',
        createdAt: formatDate(-1, -5),
        isInternal: true,
      }
    ]
  },
  {
    id: 'ticket-006',
    projectId: 'proj-003',
    type: 'internal',
    category: 'scheduling',
    status: 'open',
    priority: 'high',
    subject: 'Contractor coordination - ABC Contractors',
    description: 'Need to confirm contractor arrival time and provide building access instructions. Contractor contact: Bob Smith (555-123-4567).',
    assignee: 'Alex Chen',
    createdAt: formatDate(-1, -3),
    updatedAt: formatDate(-1, -3),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-1, -3), 'high'),
    firstRespondedAt: formatDate(-1, -2),
  },

  // Project 4 - Brooklyn Law Offices (confirmed)
  {
    id: 'ticket-007',
    projectId: 'proj-004',
    type: 'email',
    category: 'general',
    status: 'resolved',
    priority: 'normal',
    subject: 'New Customer Handoff - Brooklyn Law Offices',
    description: `Hi CX,

Please welcome Brooklyn Law Offices to Pilot!

Customer: Brooklyn Law Offices
Contact: Amanda Torres (atorres@brooklynlaw.com)
Address: 1 Brooklyn Bridge Park, Brooklyn, NY 11201
Service: 250 Mbps Dedicated
Contract Term: 24 months

Jennifer`,
    from: 'jennifer.lee@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(-7, -4),
    updatedAt: formatDate(-6, -2),
    resolvedAt: formatDate(-6, -2),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-7, -4), 'normal'),
    firstRespondedAt: formatDate(-7, -2),
  },
  {
    id: 'ticket-008',
    projectId: 'proj-004',
    type: 'email',
    category: 'scheduling',
    status: 'closed',
    priority: 'normal',
    subject: 'Re: Installation Tomorrow - Brooklyn Law Offices',
    description: `Perfect, we're all set for tomorrow at 9 AM.

I'll be here to meet your technician. The building concierge knows to expect them.

Thanks for the great communication throughout this process!

Amanda Torres
Office Manager
Brooklyn Law Offices`,
    from: 'atorres@brooklynlaw.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(0, -2),
    updatedAt: formatDate(0, -1),
    resolvedAt: formatDate(0, -1),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(0, -2), 'normal'),
    firstRespondedAt: formatDate(0, -1),
    replies: [
      {
        id: 'reply-008-1',
        author: 'Maria Santos',
        authorType: 'agent',
        content: 'Perfect Amanda! Our technician will arrive at 9 AM sharp. If you have any questions on the day, feel free to call me directly.',
        createdAt: formatDate(0, -1),
        isInternal: false,
      }
    ],
  },

  // Project 5 - DataFlow Analytics (installing)
  {
    id: 'ticket-009',
    projectId: 'proj-005',
    type: 'email',
    category: 'general',
    status: 'resolved',
    priority: 'urgent',
    subject: 'URGENT: New Customer Handoff - DataFlow Analytics - 10 Gig',
    description: `Team,

High priority install for DataFlow Analytics - they're a data center customer needing 10 Gig service.

Customer: DataFlow Analytics
Contact: David Park (dpark@dataflow.co)
Address: 175 Varick Street, New York, NY 10014
Service: 10 Gig Dedicated
Static IP: Yes
Contract Term: 36 months

This is a big account - please prioritize.

Thanks,
Mike`,
    from: 'mike.reynolds@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Alex Chen',
    createdAt: formatDate(-10, -6),
    updatedAt: formatDate(-8, -4),
    resolvedAt: formatDate(-8, -4),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-10, -6), 'urgent'),
    firstRespondedAt: formatDate(-10, -5),
  },
  {
    id: 'ticket-010',
    projectId: 'proj-005',
    type: 'email',
    category: 'technical',
    status: 'open',
    priority: 'high',
    subject: 'Re: Installation Day - IP Block Assignment',
    description: `Hi Team,

Just wanted to confirm our install is still on for today. Our network team will be onsite all day.

Also, can you confirm the IP block assignment? We need to update our DNS ahead of the cutover.

Thanks,
David`,
    from: 'dpark@dataflow.co',
    to: ['am@pilotfiber.com'],
    assignee: 'Alex Chen',
    createdAt: formatDate(-1, 4),
    updatedAt: formatDate(-1, 4),
    isRead: true,
    requiresResponse: true,
    responseDeadline: formatDate(0),
    ...calculateSla(formatDate(-1, 4), 'high'),
    notes: [
      {
        id: 'note-010-1',
        author: 'Alex Chen',
        content: 'Need to get IP block from Network Ops before responding.',
        createdAt: formatDate(-1, 5),
        isInternal: true,
      }
    ]
  },
  {
    id: 'ticket-011',
    projectId: 'proj-005',
    type: 'phone',
    category: 'general',
    status: 'open',
    priority: 'normal',
    subject: 'Customer call - install progress update',
    description: 'David Park called asking for status on Z-side termination. Told him crew is on site and expects completion by end of day. Will call back when OTDR testing is complete.',
    assignee: 'Alex Chen',
    createdAt: formatDate(0, -1),
    updatedAt: formatDate(0, -1),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(0, -1), 'normal'),
    firstRespondedAt: formatDate(0, -1),
  },

  // Project 6 - Manhattan Media Group (completed)
  {
    id: 'ticket-012',
    projectId: 'proj-006',
    type: 'email',
    category: 'general',
    status: 'closed',
    priority: 'normal',
    subject: 'Re: Installation Complete - Manhattan Media Group',
    description: `Hi,

Everything is working great! The installer was professional and efficient. Thanks for making this so smooth.

Lisa Wong
IT Director
Manhattan Media Group`,
    from: 'lwong@mmg.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(-3, 3),
    updatedAt: formatDate(-3, 4),
    resolvedAt: formatDate(-3, 4),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-3, 3), 'normal'),
    firstRespondedAt: formatDate(-3, 4),
    notes: [
      {
        id: 'note-012-1',
        author: 'Maria Santos',
        content: 'Great feedback! Sent customer survey.',
        createdAt: formatDate(-3, 4),
        isInternal: true,
      }
    ]
  },

  // Project 7 - IP Transit (reviewing)
  {
    id: 'ticket-013',
    projectId: 'proj-007',
    type: 'email',
    category: 'technical',
    status: 'open',
    priority: 'normal',
    subject: 'New Customer Handoff - Acme Corp - IP Transit Service',
    description: `CX Team,

Acme Corp is adding IP Transit service to their existing location at 350 Fifth Ave.

Service: 10G IP Transit
BGP ASN: 64512
IP Block: /24 requested

Mike`,
    from: 'mike.reynolds@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Alex Chen',
    createdAt: formatDate(-2, -5),
    updatedAt: formatDate(-2, -5),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-2, -5), 'normal'),
    firstRespondedAt: formatDate(-2, -3),
  },
  {
    id: 'ticket-014',
    projectId: 'proj-007',
    type: 'customer-request',
    category: 'change-request',
    status: 'pending',
    priority: 'normal',
    subject: 'LOA request sent to customer',
    description: 'Sent Letter of Authorization request to customer for cross-connect. Waiting for signed document.',
    assignee: 'Alex Chen',
    createdAt: formatDate(-1, -3),
    updatedAt: formatDate(-1, -3),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-1, -3), 'normal'),
    firstRespondedAt: formatDate(-1, -3),
  },

  // Project 8 - Ethernet Transport (scheduled)
  {
    id: 'ticket-015',
    projectId: 'proj-008',
    type: 'email',
    category: 'general',
    status: 'resolved',
    priority: 'high',
    subject: 'New Customer Handoff - Metro Design - Ethernet Transport',
    description: `Team,

Metro Design is adding a point-to-point Ethernet circuit between their two locations.

A-side: 55 Water Street
Z-side: 100 Wall Street
Service: 1G Ethernet Transport

Jennifer`,
    from: 'jennifer.lee@pilotfiber.com',
    to: ['am@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(-8, -6),
    updatedAt: formatDate(-6, -2),
    resolvedAt: formatDate(-6, -2),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-8, -6), 'high'),
    firstRespondedAt: formatDate(-8, -4),
  },
  {
    id: 'ticket-016',
    projectId: 'proj-008',
    type: 'internal',
    category: 'technical',
    status: 'open',
    priority: 'normal',
    subject: 'Engineering approval received - ready for install',
    description: 'Tom Engineer approved circuit design. VLAN 2847 assigned. Ready to schedule A-side and Z-side handoffs.',
    assignee: 'Maria Santos',
    createdAt: formatDate(-4, -2),
    updatedAt: formatDate(-4, -2),
    isRead: true,
    requiresResponse: false,
    ...calculateSla(formatDate(-4, -2), 'normal'),
    firstRespondedAt: formatDate(-4, -2),
  },

  // Standalone ticket (no project)
  {
    id: 'ticket-017',
    customerId: 'cust-001',
    type: 'email',
    category: 'billing',
    status: 'open',
    priority: 'normal',
    subject: 'Invoice Question - Account #12345',
    description: `Hi,

I have a question about our latest invoice. There's a charge for "Network Services" that I don't recognize. Can you please explain what this is for?

Thanks,
John Smith
Acme Corp`,
    from: 'john.smith@acmecorp.com',
    to: ['billing@pilotfiber.com'],
    assignee: 'Maria Santos',
    createdAt: formatDate(-1, 2),
    updatedAt: formatDate(-1, 2),
    isRead: false,
    requiresResponse: true,
    ...calculateSla(formatDate(-1, 2), 'normal'),
  },

  // Complaint ticket
  {
    id: 'ticket-018',
    customerId: 'cust-003',
    type: 'phone',
    category: 'complaint',
    status: 'open',
    priority: 'urgent',
    subject: 'Service outage complaint - Metro Design Studio',
    description: 'Customer called very frustrated about intermittent connectivity issues over the past week. Promised to escalate to NOC and call back within 1 hour with update.',
    from: 'mchen@metrodesign.com',
    assignee: 'Alex Chen',
    createdAt: formatDate(0, -3),
    updatedAt: formatDate(0, -3),
    isRead: true,
    requiresResponse: true,
    ...calculateSla(formatDate(0, -3), 'urgent'),
    notes: [
      {
        id: 'note-018-1',
        author: 'Alex Chen',
        content: 'Escalated to NOC team. Ticket #NOC-4521 opened. They are investigating.',
        createdAt: formatDate(0, -2),
        isInternal: true,
      }
    ]
  },
]
