import { EmailTemplate } from '../types'

export const emailTemplates: EmailTemplate[] = [
  // Intro Templates
  {
    id: 'intro-1',
    name: 'Welcome - New Customer',
    category: 'intro',
    subject: 'Welcome to Pilot Fiber - {{companyName}} Installation',
    body: `Hi {{contactName}},

Welcome to Pilot Fiber! I'm {{cxName}} and I'll be your dedicated point of contact throughout your installation process.

Here's what happens next:
1. We'll review your service order and building requirements
2. I'll reach out to schedule your installation appointment
3. Our technician will complete the installation at the scheduled time

Your service details:
- Service: {{product}} - {{bandwidth}}
- Location: {{address}}
- Target Install Date: {{focDate}}

Please don't hesitate to reach out if you have any questions. I'm here to make this process as smooth as possible.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'cxName', 'product', 'bandwidth', 'address', 'focDate']
  },
  {
    id: 'intro-2',
    name: 'Welcome - Wholesale/Carrier',
    category: 'intro',
    subject: 'Pilot Fiber Installation - {{companyName}} / {{endUserCompany}}',
    body: `Hi {{contactName}},

Thank you for choosing Pilot Fiber. I'm {{cxName}} and I'll be coordinating the installation for your end user.

End User Details:
- Company: {{endUserCompany}}
- Location: {{address}}
- Service: {{product}} - {{bandwidth}}

Please confirm the end user contact for scheduling coordination, or let me know if you'd prefer we work directly through you.

Target Install Date: {{focDate}}

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'cxName', 'endUserCompany', 'product', 'bandwidth', 'address', 'focDate']
  },

  // Scheduling Templates
  {
    id: 'schedule-1',
    name: 'Schedule Request',
    category: 'scheduling',
    subject: 'Schedule Your Pilot Fiber Installation - {{companyName}}',
    body: `Hi {{contactName}},

We're ready to schedule your Pilot Fiber installation at {{address}}.

Available time slots:
- Morning: 9:00 AM - 12:00 PM
- Afternoon: 12:00 PM - 5:00 PM

The installation typically takes 1-2 hours. A technician will need access to:
{{accessRequirements}}

Please reply with your preferred date and time slot, and we'll get you on the calendar.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'address', 'accessRequirements', 'cxName']
  },
  {
    id: 'schedule-2',
    name: 'After Hours Schedule Request',
    category: 'scheduling',
    subject: 'After Hours Installation - {{companyName}}',
    body: `Hi {{contactName}},

Based on your building's requirements, your installation will need to be scheduled during after-hours (typically 6 PM - 10 PM or weekends).

Location: {{address}}
Service: {{product}} - {{bandwidth}}

Please let me know which of the following works best for you:
- Weekday evening (6 PM - 10 PM)
- Saturday morning (8 AM - 12 PM)
- Saturday afternoon (12 PM - 4 PM)

Note: After-hours installations may require building management coordination. Please confirm if you need assistance with this.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'address', 'product', 'bandwidth', 'cxName']
  },

  // Confirmation Templates
  {
    id: 'confirm-1',
    name: 'Installation Confirmed',
    category: 'confirmation',
    subject: 'Installation Confirmed - {{scheduledDate}} - {{companyName}}',
    body: `Hi {{contactName}},

Great news! Your Pilot Fiber installation is confirmed:

Date: {{scheduledDate}}
Time: {{scheduledTime}}
Location: {{address}}

What to expect:
- Our technician will arrive during your scheduled window
- Installation typically takes 1-2 hours
- Please ensure access to the telecom room/IDF

Someone will need to be on-site to provide access and sign off on the installation.

If you need to reschedule, please let me know at least 24 hours in advance.

See you soon!
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'scheduledDate', 'scheduledTime', 'address', 'cxName']
  },
  {
    id: 'confirm-2',
    name: 'Installation Reminder - 1 Day',
    category: 'confirmation',
    subject: 'Reminder: Pilot Fiber Installation Tomorrow - {{companyName}}',
    body: `Hi {{contactName}},

This is a friendly reminder that your Pilot Fiber installation is scheduled for tomorrow:

Date: {{scheduledDate}}
Time: {{scheduledTime}}
Location: {{address}}

Please remember:
- Someone must be on-site to provide access
- Have your router ready if you're providing your own equipment
- Our technician will call when they're on their way

If anything has changed, please let me know ASAP.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'scheduledDate', 'scheduledTime', 'address', 'cxName']
  },

  // Follow-up Templates
  {
    id: 'followup-1',
    name: 'Follow-up - No Response',
    category: 'follow_up',
    subject: 'Following Up - Pilot Fiber Installation - {{companyName}}',
    body: `Hi {{contactName}},

I wanted to follow up on my previous email regarding your Pilot Fiber installation.

We're ready to get you connected at {{address}}. Please let me know your availability so we can schedule your installation.

Your service details:
- Service: {{product}} - {{bandwidth}}
- Target Date: {{focDate}}

Is there anything holding you up or any questions I can answer?

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'address', 'product', 'bandwidth', 'focDate', 'cxName']
  },
  {
    id: 'followup-2',
    name: 'Follow-up - Post-Install Check-in',
    category: 'follow_up',
    subject: 'How\'s Everything Working? - {{companyName}}',
    body: `Hi {{contactName}},

It's been a few days since your Pilot Fiber installation, and I wanted to check in.

How's everything working? Is your internet performing as expected?

If you have any questions or are experiencing any issues, please don't hesitate to reach out. We're here to help!

For technical support, you can also reach our NOC at support@pilotfiber.com or (212) 555-0199.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'cxName']
  },

  // Delay Templates
  {
    id: 'delay-1',
    name: 'Delay Notification - General',
    category: 'delay',
    subject: 'Update on Your Pilot Fiber Installation - {{companyName}}',
    body: `Hi {{contactName}},

I wanted to give you an update on your Pilot Fiber installation at {{address}}.

Unfortunately, we've encountered a delay: {{delayReason}}

New estimated timeline: {{newEstimate}}

I apologize for any inconvenience this may cause. We're working to resolve this as quickly as possible, and I'll keep you updated on our progress.

Please don't hesitate to reach out if you have any questions.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'address', 'delayReason', 'newEstimate', 'cxName']
  },
  {
    id: 'delay-2',
    name: 'Reschedule Required',
    category: 'delay',
    subject: 'Reschedule Needed - Pilot Fiber Installation - {{companyName}}',
    body: `Hi {{contactName}},

I'm reaching out because we need to reschedule your installation that was planned for {{originalDate}}.

Reason: {{rescheduleReason}}

I'd like to get you rescheduled as soon as possible. Please let me know your availability for the following dates:
{{availableDates}}

Again, I apologize for any inconvenience. We'll make sure your rescheduled installation goes smoothly.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'originalDate', 'rescheduleReason', 'availableDates', 'cxName']
  },

  // Completion Templates
  {
    id: 'complete-1',
    name: 'Installation Complete',
    category: 'completion',
    subject: 'Welcome to Pilot Fiber! Installation Complete - {{companyName}}',
    body: `Hi {{contactName}},

Congratulations! Your Pilot Fiber installation is complete, and you're now connected to NYC's fastest fiber network.

Installation Summary:
- Service: {{product}} - {{bandwidth}}
- Location: {{address}}
- Device Installed: {{device}}
- Completed: {{completedDate}}

Important Information:
- For technical support: support@pilotfiber.com or (212) 555-0199
- Your first bill will arrive within 30 days
- Service agreement and welcome packet will be emailed separately

Thank you for choosing Pilot Fiber! If you have any questions, I'm always here to help.

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'product', 'bandwidth', 'address', 'device', 'completedDate', 'cxName']
  },
  {
    id: 'complete-2',
    name: 'Survey Request',
    category: 'completion',
    subject: 'How Did We Do? - {{companyName}}',
    body: `Hi {{contactName}},

Now that your Pilot Fiber installation is complete, we'd love to hear about your experience.

Would you take 2 minutes to complete a brief survey?
{{surveyLink}}

Your feedback helps us improve our service and ensures we're delivering the best possible experience.

Thank you for choosing Pilot Fiber!

Best regards,
{{cxName}}
Pilot Fiber Customer Experience`,
    variables: ['companyName', 'contactName', 'surveyLink', 'cxName']
  },
]

export const getTemplatesByCategory = (category: EmailTemplate['category']) => {
  return emailTemplates.filter(t => t.category === category)
}

export const getTemplateById = (id: string) => {
  return emailTemplates.find(t => t.id === id)
}
