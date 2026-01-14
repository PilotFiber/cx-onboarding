# CX Onboarding Tool - Feature Documentation

## Overview

The CX Onboarding Tool is a React application built for Pilot Fiber's Customer Experience (CX) team to manage customer onboarding projects from sales handoff through installation completion.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Pilot Design System colors
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Data Persistence**: localStorage with version-based migration
- **Routing**: React Router v6

## How CX Onboarding Works

### The Onboarding Process

1. **Sales Handoff**: Sales team closes a deal and creates a handoff email with service details
2. **CX Review**: CXA (Customer Experience Associate) reviews the order and confirms details
3. **Scheduling**: CXA coordinates with customer to schedule installation
4. **Confirmation**: Customer confirms the installation date
5. **Installation**: Field crew performs the installation
6. **Completion**: Post-install verification and customer survey

### Project Types

The system supports multiple project types, each with different workflows:

| Type | Description | Lead Time |
|------|-------------|-----------|
| Standard On-Net | Building already has Pilot infrastructure | 14 days |
| New Build | Requires new construction/infrastructure | 90 days |
| Contract Labor | Uses third-party installation contractors | 30 days |
| Montgomery | Montgomery County specific requirements | 21 days |
| Co-Ex | Coexistence with other providers | 21 days |
| After Hours | Installation outside business hours | 14 days |
| Dark Fiber | Unlit fiber service | 45 days |
| Wavelength | Dedicated wavelength service | 60 days |
| Ethernet Transport | Point-to-point ethernet | 30 days |
| IP Transit | Internet transit service | 21 days |

### Key Dates

- **Handoff Date**: When sales hands off to CX
- **FOC Date**: Firm Order Commitment - the target completion date
- **SLA Deadline**: Based on lead time from handoff

---

## Feature Set

### 1. Dashboard (`/`)

The main landing page providing an at-a-glance view of all activity.

**Components:**
- **Stats Cards**: Active Projects, Open Tickets, Installing Today, Escalated, Past FOC
- **Needs Attention Section**: Projects with critical/at-risk health scores
- **Recent Handoffs**: Latest projects from the past 7 days
- **Escalated Projects**: Projects requiring urgent attention
- **FOC Alerts**: Projects past their FOC date
- **Open Tickets**: Tickets requiring response

---

### 2. Projects List (`/projects`)

Complete list of all onboarding projects with filtering and bulk actions.

**Features:**
- **View Toggle**: All Projects / My Projects
- **Filters**: Project Type, Status, Priority, Assignee
- **Bulk Actions**:
  - Select multiple projects
  - Change status in bulk
  - Assign to team member
  - Export to CSV
- **Health Score Column**: Visual health indicator for each project
- **Inline Status Change**: Quick status updates without opening project

---

### 3. Project Detail View (`/projects/:id`)

Comprehensive view of a single project with all related information.

**Tabs:**

#### Overview Tab
- **Customer Info**: Company name, contacts with role selection (Primary, Technical, Billing, Onsite, IT)
- **Service Details**: Product, bandwidth, IP type, MRC/NRC, device assignment
- **Installation Schedule**: Scheduled date and time slot (compact view)
- **Internal Notes**: Add, pin, and delete internal team notes
- **Quick Actions Panel**: Fast access to common actions
- **Health Score**: Expandable breakdown of project health
- **Install Readiness Checklist**: Editable tasks with assignees and due dates
- **Building Info**: Address, deployment type, access instructions, install notes

#### Tickets Tab
- List of all tickets associated with the project
- Status, priority, and response indicators
- Click to view ticket details

#### Tasks Tab
- Project task checklist organized by section
- Inline editing of assignees and due dates
- Completion tracking

#### Activity Tab
- **Activity Timeline**: Chronological log of all project events
- **Communication Log**: Log calls, emails, meetings, texts
  - Direction (inbound/outbound)
  - Contact name and summary
  - Duration tracking
  - Follow-up scheduling
- **Blockers**: Add and resolve project blockers

#### Install Report Tab
- Post-installation details
- Device serial numbers
- Power status
- Installer notes

---

### 4. Quick Actions Panel

Floating panel on project overview for fast actions:

- **Log Communication**: Quick form for calls/emails/meetings
- **Send Email**: Opens email template selector
- **Add Note**: Quick internal note creation
- **Add Blocker**: Create blockers with type selection
- **Change Status**: One-click status transitions
- **Escalate/De-escalate**: Toggle escalation status

---

### 5. Health Score System

Automated project health calculation based on multiple factors:

**Scoring Factors:**
| Factor | Impact |
|--------|--------|
| FOC Date (past due) | Up to -30 points |
| Last Customer Contact | Up to -25 points |
| Active Blockers | Up to -20 points |
| Task Completion | Up to -15 points |
| Critical Readiness Tasks | Up to -15 points |
| Escalation Status | -10 points |
| Confirmed/Installing Status | +5 points |

**Health Levels:**
- **Healthy** (80-100): Green - On track
- **Needs Attention** (60-79): Yellow - Monitor closely
- **At Risk** (40-59): Orange - Action needed
- **Critical** (0-39): Red - Immediate attention required

---

### 6. Command Palette (`Cmd+K`)

Global search and quick navigation:

**Search Capabilities:**
- Search projects by customer name, address, service order ID
- Search customers by company name or contact
- Search tasks by title
- Navigate to any project instantly

**Quick Actions:**
- Create new project
- View dashboard
- Access reports
- Navigate to any page

---

### 7. Notification Center

Real-time alerts for important events:

**Notification Types:**
- FOC date approaching/overdue
- Escalated projects
- No customer contact (5+ days)
- Follow-ups due
- Tasks overdue
- Low health scores
- Tickets requiring response

**Features:**
- Priority-based sorting (Urgent > High > Normal)
- Dismiss individual or all notifications
- Click to navigate to relevant project
- Persisted dismissals in localStorage

---

### 8. Keyboard Shortcuts

Full keyboard navigation support:

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Cmd+N` | Create new project |
| `?` | Show keyboard shortcuts |
| `Esc` | Close modal / Cancel |
| `G` then `D` | Go to Dashboard |
| `G` then `P` | Go to Projects |
| `G` then `C` | Go to Calendar |
| `G` then `R` | Go to Reports |
| `G` then `T` | Go to Tickets |
| `1-5` | Switch tabs (in project view) |
| `E` | Open email templates (in project view) |

---

### 9. Reports Dashboard (`/reports`)

Analytics and team performance metrics:

**Metrics:**
- Projects completed this month
- Installed MRR (This Month): Sum of MRC from completed projects
- Active projects count
- Average days to install
- On-time completion rate

**Visualizations:**
- Projects by status (pie chart style breakdown)
- Projects by type distribution
- Attention required alerts (Escalated, Past FOC, Recent completions)
- Team member performance table with workload indicators

---

### 10. Communication Log

Track all customer interactions:

**Communication Types:**
- Phone calls
- Emails
- Meetings
- Text messages
- Other

**Tracked Information:**
- Direction (inbound/outbound)
- Contact name
- Summary and detailed notes
- Duration (for calls)
- Follow-up required flag
- Follow-up due date

---

### 11. Install Readiness Checklist

Pre-installation verification system:

**Critical Items:**
- Customer contact confirmed
- Install date scheduled
- Customer confirmed install date
- No active blockers
- FOC date confirmed

**Standard Items:**
- Building access instructions available
- Device assigned
- Install crew assigned

**Features:**
- Mark items complete/incomplete
- Assign team members to items
- Set due dates
- Critical items highlighted

---

### 12. Email Templates

Pre-built email templates for common communications:

**Categories:**
- Introduction emails
- Scheduling requests
- Confirmation messages
- Follow-up communications
- Delay notifications
- Completion notices

**Features:**
- Variable substitution (customer name, date, address)
- Copy to clipboard
- Open in email client

---

### 13. New Project Creation

Full project creation workflow:

**Required Fields:**
- Project type
- Customer (select existing or create new)
- Building (select existing or create new)
- Service Order ID
- FOC Date
- Sales Rep

**Optional Fields:**
- Priority level
- Product and bandwidth
- IP type
- MRC/NRC amounts
- CX Assignee

**Auto-Generated:**
- Default readiness tasks
- Default project tasks based on type
- Initial activity log entry

---

### 14. Calendar View (`/calendar`)

Advanced installation scheduling with multiple views and drag-and-drop support.

**View Modes:**
- **Week View**: 7-day calendar with daily columns
- **Month View**: Full month overview with compact cards

**Filter Options:**
- All Installs: View all scheduled installations
- My Installs: Filter to current user's assignments
- By Crew: Filter by specific team member

**Features:**
- **Capacity Planning**: Visual indicators showing daily capacity (X/6 per day)
  - Green: Under 80% capacity
  - Amber: 80-99% capacity
  - Red: At or over capacity
- **Drag-and-Drop Scheduling**: Drag unscheduled projects from sidebar to calendar days
- **Schedule Modal**: Click to edit date and time slot for any project
- **Building Notes Tooltips**: Hover to see install notes for buildings
- **Unscheduled Projects Sidebar**: Collapsible panel showing projects awaiting scheduling
  - FOC date displayed for prioritization
  - Building notes indicators
  - Quick schedule button

**Time Slots:**
- Early (7 AM)
- Morning (9 AM, 11 AM)
- All Day
- After Hours (6 PM)

**Visual Indicators:**
- Color-coded time slot badges
- Today highlighting
- Drag-over visual feedback

---

### 15. My Day View (`/my-day`)

Personal daily dashboard:

- Projects assigned to current user
- Tasks due today
- Follow-ups scheduled
- Quick access to priority items

---

### 16. Team Workload (`/team`)

Team capacity and assignment overview:

- Projects per team member
- Workload distribution
- Assignment quick actions

---

### 17. Building Details Drawer

Clickable addresses throughout the application that open a slide-out drawer with building details.

**Accessible From:**
- Project detail view (header address)
- Projects list table (building column)
- Any location where an address is displayed

**Displayed Information:**
- **Building Status**: On-Net, Anchor, Near-Net, Off-Net, In Construction
- **Building Type**: Commercial, Residential, MDU, Data Center
- **Deployment Type**: GPON, XGS, GPON+XGS, Fixed Wireless
- **Flags**:
  - After Hours Required
  - Contract Work Required
  - Survey Required
- **Active Outages**: Current service issues with affected services
- **Scheduled Maintenance**: Upcoming planned maintenance windows
- **Recent History**: Recently resolved outages/maintenance
- **Access Instructions**: Building entry and access information
- **Install Notes**: Important installation considerations
- **ISP Notes**: Provider-specific information
- **Recommended Device**: Suggested equipment based on deployment type
- **Flight Deck Link**: Direct link to building in Flight Deck (external system)

**Features:**
- Mobile-friendly slide-out drawer (not popup)
- Closes on backdrop click or X button
- Animation on open/close
- Stops click propagation (won't navigate away from current view)

---

### 18. Tickets System (`/tickets`)

Full-featured ticket management for customer support requests.

**Sidebar Navigation:**
The Tickets section in the sidebar expands to show:
- **All Tickets**: View all non-closed tickets
- **My Tickets**: Tickets assigned to current user
- **Unassigned**: Tickets without an assignee
- **Urgent**: High-priority tickets requiring immediate attention
- **Categories**: Expandable section with category filters
  - Billing
  - Technical
  - Scheduling
  - General
  - Complaint
  - Change Request

**Ticket Views:**
- URL-based filtering (e.g., `/tickets?view=mine`, `/tickets?category=billing`)
- Badge counts in sidebar showing ticket quantities
- Dynamic page titles based on current view

**Ticket Detail Drawer:**
- Slide-out drawer for viewing/editing tickets
- Internal notes with timestamps
- Status and priority management
- **Create Task from Ticket**: When a ticket is linked to a project, you can:
  - Create a task directly from the ticket
  - Select task section (Pre-Install, Installation, Post-Install)
  - Auto-assigns to ticket assignee
  - Adds internal note documenting task creation

---

### 19. User Profile (`/profile`)

Personal settings and notification preferences.

**User Information:**
- Name and email display
- Role display

**Email Notification Preferences:**
- Enable/disable all email notifications
- Individual toggles for:
  - New project assignments
  - Ticket responses
  - Escalation alerts
  - FOC date reminders
  - Task mentions

**Slack Notification Preferences:**
- Enable/disable Slack notifications
- Individual toggles for:
  - New project assignments
  - Ticket responses
  - Escalation alerts
  - FOC date reminders
  - Mentions (@mentions)

---

### 20. Header Profile Dropdown

Quick access to user settings from the header.

**Features:**
- User avatar and name display
- Role badge
- Quick links to:
  - Profile settings
  - Application settings
  - Logout action
- Click outside to close

---

### 21. AI Smart Compose

AI-powered email composition using Claude's API with Pilot's brand voice.

**Architecture:**
- Express.js backend service (port 3001)
- Claude API integration via Anthropic SDK
- Real-time inline suggestions + pre-generated email drafts

**Smart Compose (Gmail-style):**
- Inline gray text suggestions as you type
- Press Tab to accept, keep typing to dismiss
- Debounced API calls (400ms delay)
- Minimum 15 characters before suggestions appear
- Visual AI indicator in textarea corner

**Email Composer Modal:**
- Access via "AI Compose" in Quick Actions Panel
- Scenario-based email generation:
  - Introduction (new customer welcome)
  - Scheduling (installation request)
  - Confirmation (date confirmation)
  - Delay (notification of delays)
  - Completion (post-install follow-up)
  - Follow-up (general check-in)
- Tone selection: Formal / Friendly / Urgent
- Multiple AI-generated suggestions to choose from
- SmartCompose enabled in body field
- Copy to clipboard or open in email client

**Brand Voice System:**
- Professional yet approachable tone
- Clear and concise communication
- Solution-oriented messaging
- Pilot Fiber terminology
- Consistent sign-off format

**Backend Endpoints:**
- `POST /api/compose` - Real-time completion suggestions
- `POST /api/suggestions` - Full email generation
- `GET /api/suggestions/scenarios` - Available scenarios

**Caching:**
- Pre-generated suggestions cached in memory
- 24-hour TTL with automatic refresh
- Scenario + variables based cache keys

---

### 22. VIP Projects & Customers

Special handling for high-value customers with enhanced SLA tracking.

**VIP Tiers:**
- **Platinum**: 24-hour response SLA, priority scheduling, dedicated support
- **Gold**: 48-hour response SLA, expedited scheduling
- **Silver**: 72-hour response SLA, standard priority
- **Standard**: Default SLA based on project type

**Features:**
- VIP badge displayed on projects and customers
- SLA countdown indicators with color-coded urgency
- VIP tier selection on customer profile
- Automatic tier inheritance (projects inherit customer VIP status)
- Priority sorting in project lists (VIP projects appear first)

**SLA Indicator:**
- Green: Within SLA window
- Yellow: Approaching SLA deadline
- Red: SLA at risk or breached
- Shows time remaining or time overdue

---

### 23. @Mentions in Notes

Tag team members in internal notes for notifications.

**Features:**
- Type `@` to trigger user autocomplete
- Mention any team member by name
- Mentioned users receive notifications
- Clickable mentions highlighting
- Mention history tracking

**Implementation:**
- Real-time autocomplete dropdown
- Click or Enter to select user
- Mentions stored as structured data
- Rendered with highlight styling

---

### 24. Customer Timeline

Comprehensive activity history for each customer across all projects.

**Location:** Customer View > Timeline Tab

**Timeline Events:**
- Project creation and completion
- Status changes
- Escalations and de-escalations
- Communication logs
- Blocker additions and resolutions
- VIP tier changes
- Contact updates

**Features:**
- Chronological view with date grouping
- Filter by event type
- Click to navigate to related project
- Expandable event details

---

### 25. Customer News Alerts + LinkedIn Integration

Stay informed about customer company news and updates.

**Location:** Customer View > News Tab

**News Sources:**
- Company news and press releases
- Industry updates
- Leadership changes
- Funding announcements
- Mergers and acquisitions

**LinkedIn Integration:**
- Link customer LinkedIn company page
- Suggested LinkedIn URL based on company name
- Quick access button to LinkedIn profile
- Company information display

**Alert Types:**
- Leadership Change (high priority)
- Funding/Investment
- Expansion/Growth
- Product Launch
- Partnership Announcement
- Industry News

**Features:**
- Unread count badge on News tab
- Mark as read/dismiss actions
- Priority-based sorting
- Date filtering

---

### 26. Customer Health Score

Automated assessment of overall customer relationship health.

**Location:** Customer View header, Dashboard

**Health Factors:**
- Active project success rate
- Response time patterns
- Escalation history
- NPS scores (if available)
- Communication frequency
- Payment status

**Health Levels:**
- **Excellent** (80-100): Strong relationship
- **Good** (60-79): Healthy with minor concerns
- **Fair** (40-59): Needs attention
- **Poor** (0-39): At risk, immediate action needed

**Display:**
- Color-coded badge with score
- Expandable breakdown of factors
- Trend indicator (improving/declining/stable)

---

### 27. Churn Risk Flags

Identify customers at risk of churning.

**Location:** Customer View, Dashboard alerts

**Risk Indicators:**
- Multiple escalations in short period
- Declining NPS scores
- Reduced communication
- Project delays or failures
- Support ticket patterns
- Contract renewal approaching

**Risk Levels:**
- **High Risk**: Multiple strong indicators
- **Medium Risk**: Some concerning patterns
- **Low Risk**: Minor indicators present
- **No Risk**: Healthy engagement

**Features:**
- Visual risk badge on customer cards
- Dashboard section for at-risk customers
- Detailed risk factor breakdown
- Recommended actions

---

### 28. Revenue Forecasting

Track and forecast Monthly Recurring Revenue (MRC).

**Location:** Reports page

**Metrics:**
- Total Sold MRC: All contracted revenue
- Activated MRC: Revenue from completed installs
- Pending MRC: Revenue from in-progress projects
- At-Risk MRC: Revenue from escalated/delayed projects

**Forecast View:**
- 6-month projection based on FOC dates
- Confidence levels (High/Medium/Low)
- Project-by-project breakdown
- Cumulative revenue chart

**Confidence Levels:**
- **High**: Confirmed or installing projects
- **Medium**: Scheduled projects
- **Low**: New or reviewing projects

---

### 29. Capacity Planning

Team workload management and installation scheduling optimization.

**Location:** Reports page

**Team Capacity View:**
- Projects per team member
- Utilization percentage
- Status: Available, At Capacity, Overloaded
- Max capacity threshold (configurable)

**Installation Schedule:**
- 14-day lookahead calendar
- Daily install counts
- Scheduling conflicts identification
- Team member availability

**Recommendations:**
- Auto-generated suggestions for workload balancing
- Conflict resolution options
- Optimal scheduling suggestions

---

### 30. NPS Tracking

Net Promoter Score tracking and analysis.

**Location:** Reports page

**Metrics:**
- Current NPS Score (-100 to +100)
- Response rate percentage
- Promoters / Passives / Detractors breakdown
- Trend over time

**Survey Types:**
- Post-Install surveys
- Quarterly check-ins
- Annual reviews
- Ad-hoc surveys

**Features:**
- Individual response details
- Follow-up tracking for detractors
- Customer-level NPS history
- Actionable insights and recommendations

**Score Categories:**
- Promoters (9-10): Loyal enthusiasts
- Passives (7-8): Satisfied but unenthusiastic
- Detractors (0-6): Unhappy customers

---

### 31. Document Vault

Centralized document management for projects and customers.

**Location:** Project View > Overview Tab

**Document Categories:**
- Contracts
- Statements of Work (SOW)
- Permits
- Install Photos
- Riser Diagrams
- Site Surveys
- Invoices
- Correspondence

**Features:**
- Upload and organize documents
- Category-based filtering
- Full-text search
- Preview modal for common file types
- Version tracking
- File size display
- Upload history with timestamps

**Associations:**
- Project-level documents
- Customer-level documents
- Building-level documents

---

### 32. Smart Reminders

Intelligent reminder system with auto-generation.

**Location:** My Day page

**Auto-Generated Reminders:**
- FOC date approaching (3 days out)
- No customer contact in 7+ days
- Escalated project follow-ups
- Overdue tasks
- Scheduled follow-ups from communication log

**Manual Reminders:**
- Custom reminder creation
- Assignee selection
- Priority levels
- Due date/time setting

**Reminder Types:**
- Follow-up
- Deadline
- Check-in
- Escalation
- Custom

**Features:**
- Snooze options (1 hour, 4 hours, 1 day)
- Multi-channel delivery (Email, SMS, In-App, Slack)
- Grouped by: Overdue, Today, Upcoming
- Quick complete/dismiss actions

---

### 33. Automated Playbooks (`/playbooks`)

Workflow automation for common CX scenarios.

**Playbook Categories:**
- **Onboarding**: New customer welcome flows
- **Escalation**: Response process for escalated projects
- **VIP**: Enhanced service protocol for VIP customers
- **Post-Install**: Follow-up sequence after installation
- **Delay**: Steps for projects missing FOC
- **At-Risk**: Intervention for churn risk customers

**Step Types:**
- Task: Manual action items
- Email: Send templated emails
- Call: Scheduled phone calls
- Wait: Timed delays between steps
- Decision: Branch points with options
- Automation: System-triggered actions

**Features:**
- Start playbook on any project
- Track progress through steps
- Complete steps with confirmation
- Approval workflows for sensitive steps
- Usage statistics and completion rates

**Management (`/playbooks`):**
- View all playbooks by category
- Create new playbooks
- Edit playbook details and steps
- Duplicate existing playbooks
- Activate/deactivate playbooks
- Delete unused playbooks

---

### 34. Slack Integration

Real-time Slack notifications and workspace integration.

**Location:** Profile page > Slack Workspace Integration

**Connection:**
- OAuth-based workspace connection
- User authentication
- Workspace and channel selection

**Default Channel:**
- Set default notification channel
- Fallback for uncategorized notifications

**Notification Types by Category:**

*Project Notifications:*
- Project created
- Project escalated
- Project completed
- FOC approaching
- Blocker added

*Customer Notifications:*
- VIP activity
- Customer news alerts
- NPS response received

*Team Notifications:*
- @Mentions
- Task assignments
- Reminders

**Features:**
- Per-notification enable/disable
- DM vs Channel routing options
- Channel selection per notification type
- Quick tips for Slack commands
- `/pilot status [project-id]` slash command

---

## Data Model

### Project
Core entity containing all onboarding information:
- Customer and building references
- Service details (product, bandwidth, IP type)
- Schedule information
- Task lists and readiness checklists
- Communication and activity logs
- Blockers and escalation status

### Customer
- Company name
- Multiple contacts with roles
- Email and phone information

### Building
- Address and location
- Building status (On-Net, Anchor, Near-Net, Off-Net, In Construction)
- Deployment type (GPON, XGS, GPON+XGS, Fixed Wireless)
- Building type (Commercial, Residential, MDU, Data Center)
- Access instructions and install notes
- Flags: After hours required, Contract work required, Survey required
- Outage/maintenance history
- Flight Deck integration ID

### Ticket
- Associated project
- Status and priority
- Subject and description
- Response tracking

### VIP Configuration
- Tier levels (Platinum, Gold, Silver, Standard)
- SLA hours per tier
- Response time requirements
- Priority scheduling rules

### NPS Survey Response
- Customer and project association
- Score (0-10)
- Category (Promoter/Passive/Detractor)
- Feedback text
- Follow-up tracking

### Document
- File metadata (name, type, size)
- Category classification
- Project/Customer/Building association
- Upload history
- Tags and search indexing

### Reminder
- Type and priority
- Due date/time
- Assignee
- Auto-generation rules
- Multi-channel delivery settings

### Playbook
- Name and description
- Category
- Steps with types and configuration
- Trigger conditions
- Usage statistics

### Playbook Execution
- Active playbook instance
- Current step tracking
- Step completion history
- Project/Customer association

### Slack Integration
- Connection status
- Workspace information
- Default channel
- Notification preferences per type

---

## State Management

The application uses React Context with useReducer for state management:

**Actions:**
- Project CRUD operations
- Task management (complete, assign, set due date)
- Note management (add, delete, pin)
- Blocker management (add, resolve)
- Communication logging
- Status changes
- Escalation toggling

**Persistence:**
- All state saved to localStorage
- Version-based migration for data structure changes
- Automatic loading on app start

---

## Design System

Built on Pilot Fiber's brand guidelines:

**Colors:**
- Primary: `#FFE200` (Pilot Yellow)
- Secondary: `#18284F` (Pilot Navy)
- Accent colors for status indicators

**Components:**
- Button (primary, secondary, link variants)
- Card
- StatusBadge
- ProjectTypeBadge
- Table
- Select
- Modal

---

## File Structure

```
cx-onboarding/
├── server/                          # AI Backend Service
│   ├── src/
│   │   ├── index.ts                 # Express server entry
│   │   ├── routes/
│   │   │   ├── compose.ts           # Real-time completion endpoint
│   │   │   └── suggestions.ts       # Email generation endpoint
│   │   ├── services/
│   │   │   └── claude.ts            # Claude API wrapper
│   │   └── prompts/
│   │       └── brandVoice.ts        # Pilot brand voice system prompt
│   ├── package.json
│   └── tsconfig.json
│
├── src/
│   ├── components/
│   │   ├── features/        # Feature-specific components
│   │   │   ├── BuildingDetailsDrawer.tsx
│   │   │   ├── CapacityPlanning.tsx     # Team workload visualization
│   │   │   ├── ChurnRiskBadge.tsx       # Customer churn risk indicator
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── CommunicationLog.tsx
│   │   │   ├── CustomerHealthBadge.tsx  # Customer health score
│   │   │   ├── CustomerNewsPanel.tsx    # News alerts display
│   │   │   ├── CustomerTimeline.tsx     # Activity timeline
│   │   │   ├── DocumentVault.tsx        # Document management
│   │   │   ├── EmailComposer.tsx        # AI email composer modal
│   │   │   ├── HealthScoreBadge.tsx
│   │   │   ├── KeyboardShortcutsModal.tsx
│   │   │   ├── MentionInput.tsx         # @mentions autocomplete
│   │   │   ├── NewProjectModal.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NPSTracking.tsx          # NPS dashboard
│   │   │   ├── PlaybookPanel.tsx        # Playbook execution UI
│   │   │   ├── QuickActionsPanel.tsx
│   │   │   ├── ReadinessChecklist.tsx
│   │   │   ├── RevenueForecast.tsx      # MRC forecasting
│   │   │   ├── SLAIndicator.tsx         # VIP SLA countdown
│   │   │   ├── SlackIntegration.tsx     # Slack workspace connection
│   │   │   ├── SmartCompose.tsx         # Gmail-style smart compose
│   │   │   ├── SmartReminders.tsx       # Reminder management
│   │   │   ├── TicketDetailDrawer.tsx
│   │   │   └── ...
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx   # Includes profile dropdown
│   │   │   ├── Sidebar.tsx  # Expandable ticket views
│   │   │   └── PageLayout.tsx
│   │   └── ui/              # Reusable UI components
│   │       ├── AddressLink.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ...
│   ├── context/
│   │   ├── AppContext.tsx   # Global state management
│   │   ├── BuildingDrawerContext.tsx  # Building drawer state
│   │   └── TicketDrawerContext.tsx    # Ticket drawer state
│   ├── data/
│   │   ├── mockProjects.ts       # Sample project data
│   │   ├── mockCustomers.ts      # Sample customer data
│   │   ├── mockBuildings.ts      # Sample building data
│   │   ├── mockTickets.ts        # Sample ticket data
│   │   ├── mockDocuments.ts      # Sample document data
│   │   ├── mockNewsAlerts.ts     # Sample customer news
│   │   ├── mockNPSData.ts        # Sample NPS survey responses
│   │   ├── mockPlaybooks.ts      # Playbook definitions
│   │   ├── mockReminders.ts      # Sample reminders + auto-generation
│   │   ├── teamMembers.ts        # Team member data
│   │   └── projectTypes.ts       # Project type configurations
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useSmartCompose.ts       # Smart compose logic hook
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx          # With customer filter support
│   │   ├── ProjectView.tsx       # With playbooks and documents
│   │   ├── CustomerView.tsx      # Timeline, news, health, churn risk
│   │   ├── Calendar.tsx          # Week/Month views with drag-and-drop
│   │   ├── MyDay.tsx             # Personal dashboard with reminders
│   │   ├── Reports.tsx           # Revenue, capacity, NPS analytics
│   │   ├── Playbooks.tsx         # Playbook management
│   │   ├── Tickets.tsx           # Ticket list with URL-based filtering
│   │   ├── Profile.tsx           # User profile + Slack integration
│   │   └── ...
│   ├── services/
│   │   └── aiService.ts     # AI backend API client
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── healthScore.ts        # Project health score calculation
│   │   ├── customerHealth.ts     # Customer health score calculation
│   │   ├── churnRisk.ts          # Churn risk assessment
│   │   ├── capacityPlanning.ts   # Team workload calculations
│   │   ├── npsTracking.ts        # NPS metrics calculation
│   │   ├── revenueForecasting.ts # MRC forecasting logic
│   │   ├── vip.ts                # VIP tier and SLA logic
│   │   └── notifications.ts      # Notification generation
│   ├── App.tsx
│   └── main.tsx
```

---

## Running the Application

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend runs at `http://localhost:5173` (or next available port).

### AI Backend (for Smart Compose)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with your Anthropic API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start development server
npm run dev
```

The AI backend runs at `http://localhost:3001`.

**Note:** The AI Smart Compose features require the backend server to be running. Without it, email composition will work but AI suggestions will be disabled.
