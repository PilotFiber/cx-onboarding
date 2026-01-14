import { useState } from 'react'
import { Mail, Copy, Check } from 'lucide-react'
import { getTemplatesByCategory } from '../../data/emailTemplates'
import { EmailTemplate, EmailTemplateCategory } from '../../types'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface EmailTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  variables?: Record<string, string>
}

const categoryLabels: Record<EmailTemplateCategory, string> = {
  intro: 'Introduction',
  scheduling: 'Scheduling',
  confirmation: 'Confirmation',
  follow_up: 'Follow-up',
  delay: 'Delay',
  completion: 'Completion',
}

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`)
  })
  // Replace any remaining unreplaced variables with placeholders
  result = result.replace(/{{(\w+)}}/g, '[$1]')
  return result
}

export default function EmailTemplateModal({ isOpen, onClose, variables = {} }: EmailTemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<EmailTemplateCategory>('intro')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [copied, setCopied] = useState<'subject' | 'body' | null>(null)

  const templates = getTemplatesByCategory(selectedCategory)

  const handleCopy = async (type: 'subject' | 'body') => {
    if (!selectedTemplate) return
    const text = type === 'subject'
      ? replaceVariables(selectedTemplate.subject, variables)
      : replaceVariables(selectedTemplate.body, variables)

    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Email Templates" size="lg">
      <div className="flex h-[500px]">
        {/* Left: Category & Template List */}
        <div className="w-64 border-r border-gray-200 pr-4 overflow-y-auto">
          <div className="space-y-1 mb-4">
            {(Object.keys(categoryLabels) as EmailTemplateCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setSelectedTemplate(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-pilot-primary text-pilot-secondary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Templates</p>
            <ul className="space-y-1">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {template.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Template Preview */}
        <div className="flex-1 pl-4 overflow-y-auto">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Subject</label>
                  <button
                    onClick={() => handleCopy('subject')}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copied === 'subject' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'subject' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {replaceVariables(selectedTemplate.subject, variables)}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Body</label>
                  <button
                    onClick={() => handleCopy('body')}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copied === 'body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'body' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {replaceVariables(selectedTemplate.body, variables)}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Variables Used</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <span
                      key={variable}
                      className={`text-xs px-2 py-1 rounded ${
                        variables[variable]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {variable}: {variables[variable] || 'Not set'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a template to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
