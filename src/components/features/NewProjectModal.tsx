import { useState } from 'react'
import { X } from 'lucide-react'
import { ProjectType, ProjectPriority, IPType, BuildingType } from '../../types'
import { useApp } from '../../context/AppContext'
import { teamMembers } from '../../data/teamMembers'
import Button from '../ui/Button'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: (projectId: string) => void
}

const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: 'standard-on-net', label: 'Standard On-Net' },
  { value: 'new-build', label: 'New Build' },
  { value: 'contract-labor', label: 'Contract Labor' },
  { value: 'montgomery', label: 'Montgomery' },
  { value: 'coex', label: 'Co-Ex' },
  { value: 'after-hours', label: 'After Hours' },
  { value: 'dark-fiber', label: 'Dark Fiber' },
  { value: 'wavelength', label: 'Wavelength' },
  { value: 'ethernet-transport', label: 'Ethernet Transport' },
  { value: 'ip-transit', label: 'IP Transit' },
]

const priorityOptions: { value: ProjectPriority; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const ipTypeOptions: { value: IPType; label: string }[] = [
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'static', label: 'Static' },
  { value: 'bgp', label: 'BGP' },
]

const buildingTypeOptions: { value: BuildingType; label: string }[] = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'residential', label: 'Residential' },
  { value: 'mdu', label: 'MDU' },
  { value: 'data-center', label: 'Data Center' },
]

export default function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const { state, dispatch } = useApp()

  const [formData, setFormData] = useState({
    projectType: 'standard-on-net' as ProjectType,
    customerId: '',
    newCustomerName: '',
    buildingId: '',
    newBuildingAddress: '',
    serviceOrderId: '',
    priority: 'normal' as ProjectPriority,
    product: 'Dedicated Internet',
    serviceBandwidth: '1 Gbps',
    ipType: 'dynamic' as IPType,
    mrc: 0,
    nrc: 0,
    focDate: '',
    cxAssignee: '',
    salesRep: '',
    buildingType: 'commercial' as BuildingType,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerId && !formData.newCustomerName) {
      newErrors.customer = 'Select an existing customer or enter a new customer name'
    }
    if (!formData.buildingId && !formData.newBuildingAddress) {
      newErrors.building = 'Select an existing building or enter a new address'
    }
    if (!formData.serviceOrderId) {
      newErrors.serviceOrderId = 'Service Order ID is required'
    }
    if (!formData.focDate) {
      newErrors.focDate = 'FOC Date is required'
    }
    if (!formData.salesRep) {
      newErrors.salesRep = 'Sales Rep is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    // Create new customer if needed
    let customerId = formData.customerId
    if (!customerId && formData.newCustomerName) {
      customerId = `cust-${Date.now()}`
      // Note: In a real app, you'd dispatch an action to add the customer
    }

    // Create new building if needed
    let buildingId = formData.buildingId
    if (!buildingId && formData.newBuildingAddress) {
      buildingId = `bldg-${Date.now()}`
      // Note: In a real app, you'd dispatch an action to add the building
    }

    const projectId = `proj-${Date.now()}`
    const now = new Date().toISOString()

    // Generate default readiness tasks
    const readinessTasks = [
      { id: `ready-${projectId}-1`, label: 'Customer contact confirmed', completed: false, critical: true },
      { id: `ready-${projectId}-2`, label: 'Install date scheduled', completed: false, critical: true },
      { id: `ready-${projectId}-3`, label: 'Customer confirmed install date', completed: false, critical: true },
      { id: `ready-${projectId}-4`, label: 'Building access instructions available', completed: false },
      { id: `ready-${projectId}-5`, label: 'Device assigned', completed: false },
      { id: `ready-${projectId}-6`, label: 'Install crew assigned', completed: false },
      { id: `ready-${projectId}-7`, label: 'No active blockers', completed: true, critical: true },
      { id: `ready-${projectId}-8`, label: 'FOC date confirmed', completed: true },
    ]

    // Generate default tasks based on project type
    const defaultTasks = [
      { id: `task-${projectId}-1`, title: 'Check sales order email for details', section: 'Sales Hand Off', completed: false },
      { id: `task-${projectId}-2`, title: 'Confirm all customer details', section: 'Sales Hand Off', completed: false },
      { id: `task-${projectId}-3`, title: 'Mark yourself as the CXA in Flight Deck', section: 'Sales Hand Off', completed: false },
      { id: `task-${projectId}-4`, title: 'Verify port availability', section: 'Scheduling', completed: false },
      { id: `task-${projectId}-5`, title: 'Propose install date to customer', section: 'Scheduling', completed: false },
      { id: `task-${projectId}-6`, title: 'Create network provisioning ticket', section: 'Network Provisioning', completed: false },
    ]

    const newProject = {
      id: projectId,
      projectType: formData.projectType,
      customerId: customerId || formData.customerId,
      buildingId: buildingId || formData.buildingId,
      serviceOrderId: formData.serviceOrderId,
      status: 'new' as const,
      priority: formData.priority,
      handoffDate: now,
      handoffEmailId: `email-${Date.now()}`,
      salesRep: formData.salesRep,
      cxAssignee: formData.cxAssignee || undefined,
      focDate: new Date(formData.focDate).toISOString(),
      product: formData.product,
      ipType: formData.ipType,
      serviceBandwidth: formData.serviceBandwidth,
      mrc: formData.mrc,
      nrc: formData.nrc,
      buildingOnNet: true,
      buildingType: formData.buildingType,
      quotedLeadTime: 14,
      surveyRequired: false,
      afterHoursRequired: formData.projectType === 'after-hours',
      riserDiagramRequired: false,
      serviceType: `${formData.serviceBandwidth} ${formData.product}`,
      staticIp: formData.ipType === 'static' || formData.ipType === 'bgp',
      customerOwnRouter: false,
      isWholesale: false,
      tasks: defaultTasks,
      readinessTasks,
      approvals: [],
      slaDeadline: new Date(formData.focDate).toISOString(),
      lastCustomerContact: now,
      internalNotes: [],
      activityLog: [
        {
          id: `act-${projectId}-1`,
          projectId,
          type: 'created' as const,
          description: 'Project created from new project form',
          author: formData.cxAssignee || 'System',
          createdAt: now,
        }
      ],
      communicationLog: [],
      blockers: [],
      isEscalated: false,
      createdAt: now,
      updatedAt: now,
    }

    dispatch({ type: 'ADD_PROJECT', payload: newProject })

    if (onProjectCreated) {
      onProjectCreated(projectId)
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Project Type & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleChange('projectType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                >
                  {projectTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleChange('customerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              >
                <option value="">Select existing customer...</option>
                {state.customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.companyName}</option>
                ))}
              </select>
              {!formData.customerId && (
                <input
                  type="text"
                  placeholder="Or enter new customer name..."
                  value={formData.newCustomerName}
                  onChange={(e) => handleChange('newCustomerName', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              )}
              {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
            </div>

            {/* Building */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <select
                value={formData.buildingId}
                onChange={(e) => handleChange('buildingId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
              >
                <option value="">Select existing building...</option>
                {state.buildings.map(building => (
                  <option key={building.id} value={building.id}>{building.address}, {building.city}</option>
                ))}
              </select>
              {!formData.buildingId && (
                <>
                  <input
                    type="text"
                    placeholder="Or enter new building address..."
                    value={formData.newBuildingAddress}
                    onChange={(e) => handleChange('newBuildingAddress', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                  />
                  <select
                    value={formData.buildingType}
                    onChange={(e) => handleChange('buildingType', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                  >
                    {buildingTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </>
              )}
              {errors.building && <p className="text-red-500 text-sm mt-1">{errors.building}</p>}
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Order ID *</label>
                <input
                  type="text"
                  value={formData.serviceOrderId}
                  onChange={(e) => handleChange('serviceOrderId', e.target.value)}
                  placeholder="e.g., so-12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
                {errors.serviceOrderId && <p className="text-red-500 text-sm mt-1">{errors.serviceOrderId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FOC Date *</label>
                <input
                  type="date"
                  value={formData.focDate}
                  onChange={(e) => handleChange('focDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
                {errors.focDate && <p className="text-red-500 text-sm mt-1">{errors.focDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => handleChange('product', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bandwidth</label>
                <input
                  type="text"
                  value={formData.serviceBandwidth}
                  onChange={(e) => handleChange('serviceBandwidth', e.target.value)}
                  placeholder="e.g., 1 Gbps"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Type</label>
                <select
                  value={formData.ipType}
                  onChange={(e) => handleChange('ipType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                >
                  {ipTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRC ($)</label>
                <input
                  type="number"
                  value={formData.mrc}
                  onChange={(e) => handleChange('mrc', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NRC ($)</label>
                <input
                  type="number"
                  value={formData.nrc}
                  onChange={(e) => handleChange('nrc', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rep *</label>
                <input
                  type="text"
                  value={formData.salesRep}
                  onChange={(e) => handleChange('salesRep', e.target.value)}
                  placeholder="Sales rep name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
                {errors.salesRep && <p className="text-red-500 text-sm mt-1">{errors.salesRep}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CX Assignee</label>
                <select
                  value={formData.cxAssignee}
                  onChange={(e) => handleChange('cxAssignee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
