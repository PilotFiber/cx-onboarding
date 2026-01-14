import { Document, DocumentCategory } from '../types'

// Generate mock documents
function generateMockDocuments(): Document[] {
  const documents: Document[] = []

  const mockData: Array<{
    name: string
    category: DocumentCategory
    description?: string
    fileType: string
    fileSize: number
    uploadedBy: string
    daysAgo: number
    projectId?: string
    customerId?: string
    buildingId?: string
    tags?: string[]
  }> = [
    // Project documents
    {
      name: 'Service Agreement - Acme Corp.pdf',
      category: 'contract',
      description: '3-year service agreement for 1 Gbps Dedicated Internet',
      fileType: 'pdf',
      fileSize: 245760, // ~240 KB
      uploadedBy: 'Sarah Chen',
      daysAgo: 45,
      projectId: 'p1',
      customerId: 'c1',
      tags: ['signed', '3-year'],
    },
    {
      name: 'SOW_AcmeCorp_Installation.pdf',
      category: 'sow',
      description: 'Statement of Work for fiber installation',
      fileType: 'pdf',
      fileSize: 189440, // ~185 KB
      uploadedBy: 'Mike Rodriguez',
      daysAgo: 40,
      projectId: 'p1',
      customerId: 'c1',
    },
    {
      name: 'Building_Permit_123Main.pdf',
      category: 'permit',
      description: 'NYC DOB permit for fiber installation',
      fileType: 'pdf',
      fileSize: 102400, // ~100 KB
      uploadedBy: 'James Wilson',
      daysAgo: 35,
      projectId: 'p1',
      buildingId: 'b1',
      tags: ['approved', 'DOB'],
    },
    {
      name: 'Install_Photo_MPOE.jpg',
      category: 'install-photo',
      description: 'MPOE installation completed',
      fileType: 'jpg',
      fileSize: 2097152, // ~2 MB
      uploadedBy: 'Install Tech 1',
      daysAgo: 5,
      projectId: 'p1',
      buildingId: 'b1',
    },
    {
      name: 'Install_Photo_Demarc.jpg',
      category: 'install-photo',
      description: 'Demarc point installation',
      fileType: 'jpg',
      fileSize: 1835008, // ~1.75 MB
      uploadedBy: 'Install Tech 1',
      daysAgo: 5,
      projectId: 'p1',
      buildingId: 'b1',
    },
    {
      name: 'Riser_Diagram_123Main.pdf',
      category: 'riser-diagram',
      description: 'Building riser diagram with fiber path',
      fileType: 'pdf',
      fileSize: 512000, // ~500 KB
      uploadedBy: 'Engineering Team',
      daysAgo: 60,
      buildingId: 'b1',
      tags: ['fiber-path', 'approved'],
    },
    // More project documents
    {
      name: 'Service Agreement - TechStartup.pdf',
      category: 'contract',
      description: '2-year agreement for 500 Mbps service',
      fileType: 'pdf',
      fileSize: 220160, // ~215 KB
      uploadedBy: 'Sarah Chen',
      daysAgo: 30,
      projectId: 'p2',
      customerId: 'c2',
      tags: ['signed', '2-year'],
    },
    {
      name: 'Site_Survey_Report.pdf',
      category: 'site-survey',
      description: 'Pre-installation site survey findings',
      fileType: 'pdf',
      fileSize: 358400, // ~350 KB
      uploadedBy: 'Survey Team',
      daysAgo: 25,
      projectId: 'p2',
      buildingId: 'b2',
    },
    {
      name: 'Invoice_001234.pdf',
      category: 'invoice',
      description: 'Installation invoice - $2,500 NRC',
      fileType: 'pdf',
      fileSize: 81920, // ~80 KB
      uploadedBy: 'Billing',
      daysAgo: 3,
      projectId: 'p1',
      customerId: 'c1',
      tags: ['paid'],
    },
    {
      name: 'Email_Thread_Scheduling.pdf',
      category: 'correspondence',
      description: 'Email correspondence about installation scheduling',
      fileType: 'pdf',
      fileSize: 143360, // ~140 KB
      uploadedBy: 'Sarah Chen',
      daysAgo: 15,
      projectId: 'p2',
      customerId: 'c2',
    },
    // Customer-level documents
    {
      name: 'MSA_GlobalRetail.pdf',
      category: 'contract',
      description: 'Master Service Agreement',
      fileType: 'pdf',
      fileSize: 409600, // ~400 KB
      uploadedBy: 'Legal',
      daysAgo: 180,
      customerId: 'c3',
      tags: ['MSA', 'enterprise'],
    },
    // Building-level documents
    {
      name: 'Building_Access_Policy.pdf',
      category: 'other',
      description: 'Building access requirements and procedures',
      fileType: 'pdf',
      fileSize: 122880, // ~120 KB
      uploadedBy: 'Operations',
      daysAgo: 90,
      buildingId: 'b1',
    },
    {
      name: 'Riser_Diagram_456Broadway.pdf',
      category: 'riser-diagram',
      description: 'Building riser diagram',
      fileType: 'pdf',
      fileSize: 491520, // ~480 KB
      uploadedBy: 'Engineering Team',
      daysAgo: 120,
      buildingId: 'b2',
    },
    // More varied documents
    {
      name: 'Amendment_1_AcmeCorp.pdf',
      category: 'contract',
      description: 'Bandwidth upgrade amendment',
      fileType: 'pdf',
      fileSize: 163840, // ~160 KB
      uploadedBy: 'Sarah Chen',
      daysAgo: 10,
      customerId: 'c1',
      projectId: 'p3',
      tags: ['amendment', 'upgrade'],
    },
    {
      name: 'Install_Completion_Report.pdf',
      category: 'other',
      description: 'Final installation completion report',
      fileType: 'pdf',
      fileSize: 286720, // ~280 KB
      uploadedBy: 'Operations',
      daysAgo: 2,
      projectId: 'p1',
    },
  ]

  const now = new Date()

  mockData.forEach((data, index) => {
    const uploadedAt = new Date(now)
    uploadedAt.setDate(uploadedAt.getDate() - data.daysAgo)

    documents.push({
      id: `doc-${index + 1}`,
      name: data.name,
      category: data.category,
      description: data.description,
      fileUrl: `/documents/${data.name}`, // Mock URL
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedBy: data.uploadedBy,
      uploadedAt: uploadedAt.toISOString(),
      projectId: data.projectId,
      customerId: data.customerId,
      buildingId: data.buildingId,
      tags: data.tags,
      isArchived: false,
    })
  })

  return documents
}

export const mockDocuments = generateMockDocuments()

export function getDocumentsByProject(projectId: string): Document[] {
  return mockDocuments.filter(d => d.projectId === projectId && !d.isArchived)
}

export function getDocumentsByCustomer(customerId: string): Document[] {
  return mockDocuments.filter(d => d.customerId === customerId && !d.isArchived)
}

export function getDocumentsByBuilding(buildingId: string): Document[] {
  return mockDocuments.filter(d => d.buildingId === buildingId && !d.isArchived)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
