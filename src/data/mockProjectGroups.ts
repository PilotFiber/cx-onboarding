import { ProjectGroup } from '../types'

const today = new Date()

const formatDate = (daysOffset: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString()
}

export const mockProjectGroups: ProjectGroup[] = [
  {
    id: 'group-001',
    name: 'DataFlow Analytics Multi-Site Rollout',
    description: 'Enterprise deployment across 3 NYC locations - primary data center, HQ, and DR site',
    customerId: 'cust-005',
    color: '#8B5CF6', // Purple
    createdAt: formatDate(-15),
    updatedAt: formatDate(-1),
    createdBy: 'Alex Chen',
  },
  {
    id: 'group-002',
    name: 'Manhattan Media Group Campus Expansion',
    description: 'Wavelength and dark fiber services for new media production facility',
    customerId: 'cust-006',
    color: '#EC4899', // Pink
    createdAt: formatDate(-50),
    updatedAt: formatDate(-3),
    createdBy: 'Maria Santos',
  },
  {
    id: 'group-003',
    name: 'Acme Corp Q1 Build-out',
    description: 'Phase 1 connectivity for new Acme Corp headquarters floors',
    customerId: 'cust-001',
    color: '#10B981', // Emerald
    createdAt: formatDate(-5),
    updatedAt: formatDate(-1),
    createdBy: 'Sarah Chen',
  },
]

// Predefined colors for project groups
export const projectGroupColors = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
]
