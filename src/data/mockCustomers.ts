import { Customer } from '../types'

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    companyName: 'Acme Corp',
    contacts: [
      { id: 'cont-001-1', name: 'John Smith', email: 'john.smith@acmecorp.com', phone: '(212) 555-0101', role: 'primary', isPrimary: true },
      { id: 'cont-001-2', name: 'Emily Davis', email: 'emily.davis@acmecorp.com', phone: '(212) 555-0111', role: 'technical' },
    ],
    vipTier: 'gold',
    linkedInUrl: 'https://www.linkedin.com/company/acmecorp',
  },
  {
    id: 'cust-002',
    companyName: 'TechStart Inc',
    contacts: [
      { id: 'cont-002-1', name: 'Sarah Johnson', email: 'sarah@techstart.io', phone: '(212) 555-0102', role: 'primary', isPrimary: true },
      { id: 'cont-002-2', name: 'James Wilson', email: 'james@techstart.io', phone: '(212) 555-0112', role: 'it' },
    ],
    linkedInUrl: 'https://www.linkedin.com/company/techstart',
  },
  {
    id: 'cust-003',
    companyName: 'Metro Design Studio',
    contacts: [
      { id: 'cont-003-1', name: 'Michael Chen', email: 'mchen@metrodesign.com', phone: '(212) 555-0103', role: 'primary', isPrimary: true },
    ],
    vipTier: 'silver',
    linkedInUrl: 'https://www.linkedin.com/company/metrodesign',
  },
  {
    id: 'cust-004',
    companyName: 'Brooklyn Law Offices',
    contacts: [
      { id: 'cont-004-1', name: 'Amanda Torres', email: 'atorres@brooklynlaw.com', phone: '(718) 555-0104', role: 'primary', isPrimary: true },
      { id: 'cont-004-2', name: 'Robert Kim', email: 'rkim@brooklynlaw.com', phone: '(718) 555-0114', role: 'it' },
    ],
    linkedInUrl: 'https://www.linkedin.com/company/brooklyn-law-offices',
  },
  {
    id: 'cust-005',
    companyName: 'DataFlow Analytics',
    contacts: [
      { id: 'cont-005-1', name: 'David Park', email: 'dpark@dataflow.co', phone: '(212) 555-0105', role: 'primary', isPrimary: true },
      { id: 'cont-005-2', name: 'Nina Patel', email: 'npatel@dataflow.co', phone: '(212) 555-0115', role: 'technical' },
      { id: 'cont-005-3', name: 'Chris Lee', email: 'clee@dataflow.co', phone: '(212) 555-0125', role: 'onsite' },
    ],
    vipTier: 'platinum',
    linkedInUrl: 'https://www.linkedin.com/company/dataflow-analytics',
  },
  {
    id: 'cust-006',
    companyName: 'Manhattan Media Group',
    contacts: [
      { id: 'cont-006-1', name: 'Lisa Wong', email: 'lwong@mmg.com', phone: '(212) 555-0106', role: 'primary', isPrimary: true },
      { id: 'cont-006-2', name: 'Tom Martinez', email: 'tmartinez@mmg.com', phone: '(212) 555-0116', role: 'technical' },
    ],
    vipTier: 'gold',
    linkedInUrl: 'https://www.linkedin.com/company/manhattan-media-group',
  },
]

// Helper to get primary contact (for backward compatibility)
export const getPrimaryContact = (customer: Customer) => {
  const primary = customer.contacts.find(c => c.isPrimary)
  return primary || customer.contacts[0]
}
