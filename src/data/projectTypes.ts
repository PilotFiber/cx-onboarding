import { ProjectType, ProjectTypeConfig } from '../types'

export const projectTypeConfigs: Record<ProjectType, ProjectTypeConfig> = {
  'standard-on-net': {
    id: 'standard-on-net',
    name: 'Standard On-Net',
    description: 'Standard installation in existing network building',
    leadTimeDays: 10,
    color: 'bg-blue-100 text-blue-800',
    taskTemplates: [
      // Sales Hand Off
      { id: 'std-1', title: 'Check sales order email for details', section: 'Sales Hand Off' },
      { id: 'std-2', title: 'Confirm all customer details and fill out the Description section', section: 'Sales Hand Off' },
      { id: 'std-3', title: 'Mark yourself as the CXA for the subscriber in Flight Deck', section: 'Sales Hand Off' },

      // Survey or Riser Diagram Required (conditional)
      { id: 'std-4', title: 'Check if customer is on ground floor or space is retail/fitness (requires survey)', section: 'Survey Required', conditional: true },
      { id: 'std-5', title: 'Add survey to install calendar (Mon/Wed/Fri at 9am or 11am)', section: 'Survey Required', conditional: true },
      { id: 'std-6', title: 'Create a CX-FO request in Site Tracker', section: 'Survey Required', conditional: true },
      { id: 'std-7', title: 'Complete the Riser Diagram & Survey Request form', section: 'Survey Required', conditional: true },
      { id: 'std-8', title: 'Coordinate access with the customer (if needed)', section: 'Survey Required', conditional: true },
      { id: 'std-9', title: 'Send reminder to customer the day before by 9:30am', section: 'Survey Required', conditional: true },
      { id: 'std-10', title: 'PE confirms install can be scheduled in Slack thread and CX-FO request', section: 'Survey Required', conditional: true, assignee: 'PE' },
      { id: 'std-11', title: 'Share SOW with customer/building for approval (if needed)', section: 'Survey Required', conditional: true },
      { id: 'std-12', title: 'SOW is approved', section: 'Survey Required', conditional: true },
      { id: 'std-13', title: 'Attach SOW to the install card', section: 'Survey Required', conditional: true },
      { id: 'std-14', title: 'Mark CX-FO project in Site Tracker as Complete after PE moves to Closeout', section: 'Survey Required', conditional: true },

      // Scheduling
      { id: 'std-15', title: 'Verify port availability', section: 'Scheduling' },
      { id: 'std-16', title: 'Propose install date to customer', section: 'Scheduling' },
      { id: 'std-17', title: 'Customer confirms install date', section: 'Scheduling' },
      { id: 'std-18', title: 'Add install to calendar', section: 'Scheduling' },

      // Network Provisioning
      { id: 'std-19', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'std-20', title: 'Assign IP address', section: 'Network Provisioning', assignee: 'Network Ops' },

      // Installation
      { id: 'std-21', title: 'Send reminder to customer the day before by 9:30am', section: 'Installation' },
      { id: 'std-22', title: 'Dispatch crew', section: 'Installation' },
      { id: 'std-23', title: 'Receive install report', section: 'Installation' },

      // Post-Install
      { id: 'std-24', title: 'Verify service is active', section: 'Post-Install' },
      { id: 'std-25', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [],
  },

  'new-build': {
    id: 'new-build',
    name: 'New Build',
    description: 'New building construction installation',
    leadTimeDays: 21,
    color: 'bg-amber-100 text-amber-800',
    requiresSurvey: true,
    taskTemplates: [
      // Sales Hand Off
      { id: 'nb-1', title: 'Check sales order email for details', section: 'Sales Hand Off' },
      { id: 'nb-2', title: 'Confirm all customer details and fill out the Description section', section: 'Sales Hand Off' },
      { id: 'nb-3', title: 'Mark yourself as the CXA for the subscriber in Flight Deck', section: 'Sales Hand Off' },

      // New Build
      { id: 'nb-4', title: 'Check if customer is on ground floor or space is retail/fitness (requires survey)', section: 'New Build' },
      { id: 'nb-5', title: 'Add survey to install calendar (Mon/Wed/Fri at 9am or 11am) and change install type to Survey', section: 'New Build' },
      { id: 'nb-6', title: 'Create a CX-FO request in Site Tracker', section: 'New Build' },
      { id: 'nb-7', title: 'Complete the Riser Diagram & Survey Request form', section: 'New Build' },
      { id: 'nb-8', title: 'Coordinate access with the customer (if needed)', section: 'New Build' },
      { id: 'nb-9', title: 'Send reminder to customer the day before by 9:30am', section: 'New Build' },
      { id: 'nb-10', title: 'PE confirms install can be scheduled in Slack thread and CX-FO request', section: 'New Build', assignee: 'PE' },
      { id: 'nb-11', title: 'Share SOW with customer/building for approval (if needed)', section: 'New Build' },
      { id: 'nb-12', title: 'SOW is approved', section: 'New Build' },
      { id: 'nb-13', title: 'Attach SOW to the install card', section: 'New Build' },
      { id: 'nb-14', title: 'Mark CX-FO project in Site Tracker as Complete after PE moves to Closeout', section: 'New Build' },

      // After Hours Process (conditional)
      { id: 'nb-15', title: 'If customer requests after-hours but building doesn\'t require it, request more information', section: 'After Hours Process', conditional: true },
      { id: 'nb-16', title: 'Ask customer for two available dates (Mon-Thu only) for after-hours install', section: 'After Hours Process', conditional: true },
      { id: 'nb-17', title: 'Complete the After Hours Install Request form', section: 'After Hours Process', conditional: true },

      // Scheduling
      { id: 'nb-18', title: 'Verify port availability', section: 'Scheduling' },
      { id: 'nb-19', title: 'Propose install date to customer', section: 'Scheduling' },
      { id: 'nb-20', title: 'Customer confirms install date', section: 'Scheduling' },
      { id: 'nb-21', title: 'Add install to calendar', section: 'Scheduling' },

      // Network Provisioning
      { id: 'nb-22', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'nb-23', title: 'Assign IP address', section: 'Network Provisioning', assignee: 'Network Ops' },

      // Installation
      { id: 'nb-24', title: 'Send reminder to customer the day before by 9:30am', section: 'Installation' },
      { id: 'nb-25', title: 'Dispatch crew', section: 'Installation' },
      { id: 'nb-26', title: 'Receive install report', section: 'Installation' },

      // Post-Install
      { id: 'nb-27', title: 'Verify service is active', section: 'Post-Install' },
      { id: 'nb-28', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'nb-appr-1', name: 'SOW Approval', role: 'Customer/Building', required: false },
    ],
  },

  'after-hours': {
    id: 'after-hours',
    name: 'After Hours',
    description: 'Installation requiring after-hours access',
    leadTimeDays: 12,
    color: 'bg-gray-700 text-white',
    taskTemplates: [
      // Sales Hand Off
      { id: 'ah-1', title: 'Check sales order email for details', section: 'Sales Hand Off' },
      { id: 'ah-2', title: 'Confirm all customer details and fill out the Description section', section: 'Sales Hand Off' },
      { id: 'ah-3', title: 'Mark yourself as the CXA for the subscriber in Flight Deck', section: 'Sales Hand Off' },

      // After Hours Process
      { id: 'ah-4', title: 'Verify building requires after-hours install (or customer request)', section: 'After Hours Process' },
      { id: 'ah-5', title: 'Ask customer for two available dates (Mon-Thu only)', section: 'After Hours Process' },
      { id: 'ah-6', title: 'Verify no other after-hours installs scheduled for those days', section: 'After Hours Process' },
      { id: 'ah-7', title: 'Complete the After Hours Install Request form', section: 'After Hours Process' },
      { id: 'ah-8', title: 'Submit after-hours access request to building', section: 'After Hours Process' },
      { id: 'ah-9', title: 'Receive building approval for after-hours access', section: 'After Hours Process' },

      // Scheduling
      { id: 'ah-10', title: 'Verify port availability', section: 'Scheduling' },
      { id: 'ah-11', title: 'Confirm after-hours install date with customer', section: 'Scheduling' },
      { id: 'ah-12', title: 'Add install to calendar (after-hours slot)', section: 'Scheduling' },

      // Network Provisioning
      { id: 'ah-13', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'ah-14', title: 'Assign IP address', section: 'Network Provisioning', assignee: 'Network Ops' },

      // Installation
      { id: 'ah-15', title: 'Confirm crew availability for after-hours', section: 'Installation' },
      { id: 'ah-16', title: 'Send reminder to customer the day before', section: 'Installation' },
      { id: 'ah-17', title: 'Dispatch crew', section: 'Installation' },
      { id: 'ah-18', title: 'Receive install report', section: 'Installation' },

      // Post-Install
      { id: 'ah-19', title: 'Verify service is active', section: 'Post-Install' },
      { id: 'ah-20', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'ah-appr-1', name: 'After Hours Access Approval', role: 'Building Management', required: true },
    ],
  },

  'contract-labor': {
    id: 'contract-labor',
    name: 'Contract Labor Required',
    description: 'Installation requiring external contractor',
    leadTimeDays: 15,
    color: 'bg-orange-100 text-orange-800',
    requiresContractLabor: true,
    taskTemplates: [
      // Sales Hand Off
      { id: 'cl-1', title: 'Check sales order email for details', section: 'Sales Hand Off' },
      { id: 'cl-2', title: 'Confirm all customer details and fill out the Description section', section: 'Sales Hand Off' },
      { id: 'cl-3', title: 'Mark yourself as the CXA for the subscriber in Flight Deck', section: 'Sales Hand Off' },

      // Contractor Coordination
      { id: 'cl-4', title: 'Request contractor quote', section: 'Contractor Coordination', assignee: 'Operations' },
      { id: 'cl-5', title: 'Review contractor quote', section: 'Contractor Coordination' },
      { id: 'cl-6', title: 'Approve contractor cost', section: 'Contractor Coordination', assignee: 'Manager' },
      { id: 'cl-7', title: 'Schedule contractor availability', section: 'Contractor Coordination' },

      // Scheduling
      { id: 'cl-8', title: 'Verify port availability', section: 'Scheduling' },
      { id: 'cl-9', title: 'Coordinate install date with contractor & customer', section: 'Scheduling' },
      { id: 'cl-10', title: 'Confirm install date with all parties', section: 'Scheduling' },
      { id: 'cl-11', title: 'Add install to calendar', section: 'Scheduling' },

      // Network Provisioning
      { id: 'cl-12', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'cl-13', title: 'Assign IP address', section: 'Network Provisioning', assignee: 'Network Ops' },

      // Installation
      { id: 'cl-14', title: 'Send reminder to customer and contractor', section: 'Installation' },
      { id: 'cl-15', title: 'Dispatch / confirm contractor', section: 'Installation' },
      { id: 'cl-16', title: 'Receive install report', section: 'Installation' },

      // Post-Install
      { id: 'cl-17', title: 'Verify service is active', section: 'Post-Install' },
      { id: 'cl-18', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'cl-appr-1', name: 'Contractor Cost Approval', role: 'Operations Manager', required: true },
    ],
  },

  'montgomery': {
    id: 'montgomery',
    name: 'Montgomery',
    description: 'Montgomery building installation',
    leadTimeDays: 12,
    color: 'bg-purple-100 text-purple-800',
    taskTemplates: [
      // Sales Hand Off
      { id: 'mont-1', title: 'Check sales order email for details', section: 'Sales Hand Off' },
      { id: 'mont-2', title: 'Confirm all customer details and fill out the Description section', section: 'Sales Hand Off' },
      { id: 'mont-3', title: 'Mark yourself as the CXA for the subscriber in Flight Deck', section: 'Sales Hand Off' },

      // Building Access
      { id: 'mont-4', title: 'Submit Montgomery building access request', section: 'Building Access' },
      { id: 'mont-5', title: 'Receive building approval', section: 'Building Access' },

      // Scheduling
      { id: 'mont-6', title: 'Verify port availability', section: 'Scheduling' },
      { id: 'mont-7', title: 'Propose install date to customer', section: 'Scheduling' },
      { id: 'mont-8', title: 'Customer confirms install date', section: 'Scheduling' },
      { id: 'mont-9', title: 'Add install to calendar', section: 'Scheduling' },

      // Network Provisioning
      { id: 'mont-10', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'mont-11', title: 'Assign IP address', section: 'Network Provisioning', assignee: 'Network Ops' },

      // Installation
      { id: 'mont-12', title: 'Send reminder to customer the day before', section: 'Installation' },
      { id: 'mont-13', title: 'Dispatch crew', section: 'Installation' },
      { id: 'mont-14', title: 'Receive install report', section: 'Installation' },

      // Post-Install
      { id: 'mont-15', title: 'Verify service is active', section: 'Post-Install' },
      { id: 'mont-16', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'mont-appr-1', name: 'Building Access Approval', role: 'Building Management', required: true },
    ],
  },

  'coex': {
    id: 'coex',
    name: 'Coex',
    description: 'Coexistence / co-location installation',
    leadTimeDays: 20,
    color: 'bg-cyan-100 text-cyan-800',
    requiresEngineering: true,
    taskTemplates: [
      // Sales Hand Off
      { id: 'coex-1', title: 'Check sales order email for details', section: 'Sales Hand Off' },
      { id: 'coex-2', title: 'Confirm all customer details', section: 'Sales Hand Off' },

      // Engineering
      { id: 'coex-3', title: 'Engineering site survey', section: 'Engineering', assignee: 'Engineering' },
      { id: 'coex-4', title: 'Design coex solution', section: 'Engineering', assignee: 'Engineering' },
      { id: 'coex-5', title: 'Engineering approval', section: 'Engineering', assignee: 'Engineering Manager' },
      { id: 'coex-6', title: 'Order special equipment', section: 'Engineering' },
      { id: 'coex-7', title: 'Verify equipment received', section: 'Engineering' },

      // Scheduling & Install
      { id: 'coex-8', title: 'Schedule install with customer', section: 'Scheduling' },
      { id: 'coex-9', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'coex-10', title: 'Assign IP address', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'coex-11', title: 'Dispatch crew', section: 'Installation' },
      { id: 'coex-12', title: 'Receive install report', section: 'Installation' },
      { id: 'coex-13', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'coex-appr-1', name: 'Engineering Design Approval', role: 'Engineering Manager', required: true },
    ],
  },

  'dark-fiber': {
    id: 'dark-fiber',
    name: 'Dark Fiber',
    description: 'Unlit fiber service delivery',
    leadTimeDays: 30,
    color: 'bg-gray-900 text-white',
    requiresEngineering: true,
    taskTemplates: [
      { id: 'df-1', title: 'Review sales order details', section: 'Sales Hand Off' },
      { id: 'df-2', title: 'Engineering fiber path review', section: 'Engineering', assignee: 'Engineering' },
      { id: 'df-3', title: 'Verify fiber availability', section: 'Engineering' },
      { id: 'df-4', title: 'Create splice plan', section: 'Engineering', assignee: 'Engineering' },
      { id: 'df-5', title: 'Engineering approval', section: 'Engineering', assignee: 'Engineering Manager' },
      { id: 'df-6', title: 'Schedule fiber splicing', section: 'Scheduling' },
      { id: 'df-7', title: 'Complete A-side termination', section: 'Installation' },
      { id: 'df-8', title: 'Complete Z-side termination', section: 'Installation' },
      { id: 'df-9', title: 'OTDR testing', section: 'Testing', assignee: 'Engineering' },
      { id: 'df-10', title: 'Customer acceptance testing', section: 'Testing' },
      { id: 'df-11', title: 'Receive install report', section: 'Post-Install' },
      { id: 'df-12', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'df-appr-1', name: 'Fiber Path Approval', role: 'Engineering Manager', required: true },
      { id: 'df-appr-2', name: 'Customer Acceptance', role: 'Customer', required: true },
    ],
  },

  'wavelength': {
    id: 'wavelength',
    name: 'Wavelength',
    description: 'Wavelength / DWDM service',
    leadTimeDays: 45,
    color: 'bg-indigo-100 text-indigo-800',
    requiresEngineering: true,
    requiresSpecialEquipment: true,
    taskTemplates: [
      { id: 'wl-1', title: 'Review sales order details', section: 'Sales Hand Off' },
      { id: 'wl-2', title: 'Engineering wavelength design', section: 'Engineering', assignee: 'Engineering' },
      { id: 'wl-3', title: 'Verify DWDM capacity', section: 'Engineering' },
      { id: 'wl-4', title: 'Order transponder equipment', section: 'Equipment' },
      { id: 'wl-5', title: 'Engineering approval', section: 'Engineering', assignee: 'Engineering Manager' },
      { id: 'wl-6', title: 'Verify equipment received', section: 'Equipment' },
      { id: 'wl-7', title: 'Schedule transponder installation', section: 'Scheduling' },
      { id: 'wl-8', title: 'A-side transponder install', section: 'Installation' },
      { id: 'wl-9', title: 'Z-side transponder install', section: 'Installation' },
      { id: 'wl-10', title: 'Wavelength turn-up', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'wl-11', title: 'End-to-end testing', section: 'Testing' },
      { id: 'wl-12', title: 'Customer acceptance testing', section: 'Testing' },
      { id: 'wl-13', title: 'Receive install report', section: 'Post-Install' },
      { id: 'wl-14', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'wl-appr-1', name: 'Wavelength Design Approval', role: 'Engineering Manager', required: true },
      { id: 'wl-appr-2', name: 'Equipment Order Approval', role: 'Operations Manager', required: true },
      { id: 'wl-appr-3', name: 'Customer Acceptance', role: 'Customer', required: true },
    ],
  },

  'ethernet-transport': {
    id: 'ethernet-transport',
    name: 'Ethernet Transport',
    description: 'Point-to-point Ethernet service',
    leadTimeDays: 20,
    color: 'bg-emerald-100 text-emerald-800',
    requiresEngineering: true,
    taskTemplates: [
      { id: 'et-1', title: 'Review sales order details', section: 'Sales Hand Off' },
      { id: 'et-2', title: 'Engineering circuit design', section: 'Engineering', assignee: 'Engineering' },
      { id: 'et-3', title: 'Verify path availability', section: 'Engineering' },
      { id: 'et-4', title: 'Engineering approval', section: 'Engineering', assignee: 'Engineering Manager' },
      { id: 'et-5', title: 'Create network provisioning ticket', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'et-6', title: 'A-side handoff configuration', section: 'Installation' },
      { id: 'et-7', title: 'Z-side handoff configuration', section: 'Installation' },
      { id: 'et-8', title: 'End-to-end circuit testing', section: 'Testing' },
      { id: 'et-9', title: 'Customer acceptance testing', section: 'Testing' },
      { id: 'et-10', title: 'Receive install report', section: 'Post-Install' },
      { id: 'et-11', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [
      { id: 'et-appr-1', name: 'Circuit Design Approval', role: 'Engineering Manager', required: true },
    ],
  },

  'ip-transit': {
    id: 'ip-transit',
    name: 'IP Transit',
    description: 'IP Transit / Internet service',
    leadTimeDays: 15,
    color: 'bg-rose-100 text-rose-800',
    taskTemplates: [
      { id: 'ip-1', title: 'Review sales order details', section: 'Sales Hand Off' },
      { id: 'ip-2', title: 'Verify cross-connect availability', section: 'Cross-Connect' },
      { id: 'ip-3', title: 'Request customer LOA', section: 'Cross-Connect' },
      { id: 'ip-4', title: 'Submit cross-connect order', section: 'Cross-Connect' },
      { id: 'ip-5', title: 'Assign IP block', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'ip-6', title: 'Configure BGP session', section: 'Network Provisioning', assignee: 'Network Ops' },
      { id: 'ip-7', title: 'Verify cross-connect complete', section: 'Installation' },
      { id: 'ip-8', title: 'BGP session testing', section: 'Testing' },
      { id: 'ip-9', title: 'Traffic verification', section: 'Testing' },
      { id: 'ip-10', title: 'Receive install report', section: 'Post-Install' },
      { id: 'ip-11', title: 'Send customer survey', section: 'Post-Install' },
    ],
    approvals: [],
  },
}

export const getProjectTypeConfig = (type: ProjectType): ProjectTypeConfig => {
  return projectTypeConfigs[type]
}

export const getAllProjectTypes = (): ProjectTypeConfig[] => {
  return Object.values(projectTypeConfigs)
}

export const getTasksForProjectType = (type: ProjectType, options?: { includeSurvey?: boolean; includeAfterHours?: boolean }) => {
  const config = projectTypeConfigs[type]
  return config.taskTemplates
    .filter(template => {
      // Filter out conditional tasks based on options
      if (template.conditional) {
        if (template.section === 'Survey Required' && !options?.includeSurvey) return false
        if (template.section === 'After Hours Process' && !options?.includeAfterHours) return false
      }
      return true
    })
    .map((template, index) => ({
      id: `${type}-task-${index}`,
      title: template.title,
      section: template.section,
      completed: false,
      assignee: template.assignee,
      conditional: template.conditional,
    }))
}

export const getApprovalsForProjectType = (type: ProjectType) => {
  const config = projectTypeConfigs[type]
  return config.approvals.map((req) => ({
    id: `${type}-approval-${req.id}`,
    requirementId: req.id,
    status: 'pending' as const,
  }))
}

export const getTaskSections = (tasks: { section: string }[]): string[] => {
  const sections: string[] = []
  tasks.forEach(task => {
    if (!sections.includes(task.section)) {
      sections.push(task.section)
    }
  })
  return sections
}
