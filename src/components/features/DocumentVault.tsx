import { useState } from 'react'
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  FolderOpen,
  File,
  Camera,
  Shield,
  GitBranch,
  ClipboardList,
  Receipt,
  Mail,
  Tag,
  Calendar,
  User,
  MoreVertical,
  Eye,
  Trash2,
  Archive,
  ChevronDown,
} from 'lucide-react'
import { Document, DocumentCategory, documentCategoryConfig } from '../../types'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { formatFileSize } from '../../data/mockDocuments'

interface DocumentVaultProps {
  documents: Document[]
  projectId?: string
  customerId?: string
  buildingId?: string
  title?: string
  compact?: boolean
  onUpload?: () => void
}

const categoryIcons: Record<DocumentCategory, React.ElementType> = {
  contract: FileText,
  sow: File,
  permit: Shield,
  'install-photo': Camera,
  'riser-diagram': GitBranch,
  'site-survey': ClipboardList,
  invoice: Receipt,
  correspondence: Mail,
  other: File,
}

export default function DocumentVault({
  documents,
  title = 'Document Vault',
  compact = false,
  onUpload,
}: DocumentVaultProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Filter documents
  const filteredDocuments = documents
    .filter(doc => {
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.tags?.some(t => t.toLowerCase().includes(query))
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.fileSize - a.fileSize
        default:
          return 0
      }
    })

  // Group documents by category for compact view
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<DocumentCategory, Document[]>)

  if (compact) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">{title}</h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {documents.length}
            </span>
          </div>
          {onUpload && (
            <Button size="sm" variant="secondary" onClick={onUpload}>
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No documents yet</p>
            {onUpload && (
              <Button variant="link" size="sm" onClick={onUpload} className="mt-2">
                Upload your first document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(documentsByCategory).map(([category, docs]) => {
              const config = documentCategoryConfig[category as DocumentCategory]
              const Icon = categoryIcons[category as DocumentCategory]
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    <span className="text-xs text-gray-500">({docs.length})</span>
                  </div>
                  <div className="space-y-1 ml-6">
                    {docs.slice(0, 3).map(doc => (
                      <DocumentRow key={doc.id} document={doc} compact />
                    ))}
                    {docs.length > 3 && (
                      <button className="text-sm text-blue-600 hover:underline">
                        +{docs.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            {documents.length} documents
          </span>
        </div>
        {onUpload && (
          <Button onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | 'all')}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {Object.entries(documentCategoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pilot-primary"
          >
            <option value="date">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Largest First</option>
          </select>
        </div>
      </Card>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <Card className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">
            {searchQuery || categoryFilter !== 'all'
              ? 'No documents match your filters'
              : 'No documents uploaded yet'}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-100">
            {filteredDocuments.map(doc => (
              <DocumentRow
                key={doc.id}
                document={doc}
                onSelect={() => setSelectedDocument(doc)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  )
}

interface DocumentRowProps {
  document: Document
  compact?: boolean
  onSelect?: () => void
}

function DocumentRow({ document, compact = false, onSelect }: DocumentRowProps) {
  const config = documentCategoryConfig[document.category]
  const Icon = categoryIcons[document.category]

  if (compact) {
    return (
      <div className="flex items-center justify-between py-1 group">
        <button
          onClick={onSelect}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
        >
          <span className="truncate max-w-[200px]">{document.name}</span>
        </button>
        <span className="text-xs text-gray-400">{formatFileSize(document.fileSize)}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg group">
      {/* Icon */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config.bgColor}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <button
          onClick={onSelect}
          className="font-medium text-gray-900 hover:text-blue-600 truncate block text-left"
        >
          {document.name}
        </button>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span className={`px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
            {config.label}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(document.uploadedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {document.uploadedBy}
          </span>
          <span>{formatFileSize(document.fileSize)}</span>
        </div>
        {document.tags && document.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Tag className="w-3 h-3 text-gray-400" />
            {document.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onSelect}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Preview"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="More"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface DocumentDetailModalProps {
  document: Document
  onClose: () => void
}

function DocumentDetailModal({ document, onClose }: DocumentDetailModalProps) {
  const config = documentCategoryConfig[document.category]
  const Icon = categoryIcons[document.category]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{document.name}</h3>
              <span className={`text-sm ${config.color}`}>{config.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {document.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{document.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">File Type</p>
              <p className="text-gray-700 uppercase">{document.fileType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">File Size</p>
              <p className="text-gray-700">{formatFileSize(document.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Uploaded By</p>
              <p className="text-gray-700">{document.uploadedBy}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Upload Date</p>
              <p className="text-gray-700">
                {new Date(document.uploadedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preview placeholder */}
          <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Document preview not available</p>
            <p className="text-sm text-gray-400">Click Download to view the full document</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <button className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
