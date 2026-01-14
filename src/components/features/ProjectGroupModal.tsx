import { useState, useEffect } from 'react'
import { X, Layers } from 'lucide-react'
import { ProjectGroup } from '../../types'
import { useApp } from '../../context/AppContext'
import { projectGroupColors } from '../../data/mockProjectGroups'
import Button from '../ui/Button'

interface ProjectGroupModalProps {
  isOpen: boolean
  onClose: () => void
  editGroup?: ProjectGroup | null
  defaultCustomerId?: string
  onGroupCreated?: (groupId: string) => void
}

export default function ProjectGroupModal({
  isOpen,
  onClose,
  editGroup,
  defaultCustomerId,
  onGroupCreated
}: ProjectGroupModalProps) {
  const { state, dispatch } = useApp()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerId: '',
    color: projectGroupColors[0].value,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editGroup) {
      setFormData({
        name: editGroup.name,
        description: editGroup.description || '',
        customerId: editGroup.customerId,
        color: editGroup.color,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        customerId: defaultCustomerId || '',
        color: projectGroupColors[0].value,
      })
    }
    setErrors({})
  }, [editGroup, defaultCustomerId, isOpen])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    }
    if (!formData.customerId) {
      newErrors.customerId = 'Please select a customer'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const now = new Date().toISOString()

    if (editGroup) {
      const updatedGroup: ProjectGroup = {
        ...editGroup,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        customerId: formData.customerId,
        color: formData.color,
        updatedAt: now,
      }
      dispatch({ type: 'UPDATE_PROJECT_GROUP', payload: updatedGroup })
      onClose()
    } else {
      const newGroup: ProjectGroup = {
        id: `group-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        customerId: formData.customerId,
        color: formData.color,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Current User', // In production, this would come from auth context
      }
      dispatch({ type: 'ADD_PROJECT_GROUP', payload: newGroup })
      onGroupCreated?.(newGroup.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                {editGroup ? 'Edit Project Group' : 'Create Project Group'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Q1 Multi-Site Rollout"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the project group..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleChange('customerId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-500 ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a customer...</option>
                {state.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {projectGroupColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange('color', color.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editGroup ? 'Save Changes' : 'Create Group'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
