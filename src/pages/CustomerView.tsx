import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  ExternalLink,
  Linkedin,
  Clock,
  FolderOpen,
  Activity,
  Bell,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { VIPTier } from '../types'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import VIPBadge, { VIPPerks } from '../components/ui/VIPBadge'
import CustomerTimeline from '../components/features/CustomerTimeline'
import CustomerNewsPanel from '../components/features/CustomerNewsPanel'
import CustomerHealthBadge from '../components/features/CustomerHealthBadge'
import ChurnRiskBadge from '../components/features/ChurnRiskBadge'
import { suggestLinkedInUrl } from '../utils/vip'
import { getCustomerNewsAlerts, getUnreadAlertsCount } from '../data/mockNewsAlerts'

type TabType = 'overview' | 'timeline' | 'projects' | 'news'

export default function CustomerView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, dispatch, getBuilding } = useApp()

  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const customer = state.customers.find((c) => c.id === id)
  const customerProjects = state.projects.filter((p) => p.customerId === id)

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <Button variant="link" onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>
    )
  }

  const primaryContact = customer.contacts.find((c) => c.isPrimary) || customer.contacts[0]

  const activeProjects = customerProjects.filter((p) => p.status !== 'completed')
  const completedProjects = customerProjects.filter((p) => p.status === 'completed')

  // Calculate total MRC
  const totalMRC = customerProjects.reduce((sum, p) => sum + p.mrc, 0)

  const handleVipTierChange = (tier: VIPTier | undefined) => {
    dispatch({
      type: 'UPDATE_CUSTOMER_VIP_TIER',
      payload: {
        customerId: customer.id,
        vipTier: tier,
      },
    })
  }

  const handleLinkedInUpdate = (url: string) => {
    dispatch({
      type: 'UPDATE_CUSTOMER_LINKEDIN',
      payload: {
        customerId: customer.id,
        linkedInUrl: url || undefined,
      },
    })
  }

  const suggestedLinkedIn = suggestLinkedInUrl(customer.companyName, primaryContact?.email)

  // Get news alerts for this customer
  const newsAlerts = getCustomerNewsAlerts(customer.id)
  const unreadNewsCount = getUnreadAlertsCount(customer.id)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'news', label: 'News', icon: Bell, badge: unreadNewsCount },
    { id: 'projects', label: 'Projects', icon: FolderOpen, badge: customerProjects.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{customer.companyName}</h1>
              <VIPBadge tier={customer.vipTier || 'standard'} size="md" />
              <CustomerHealthBadge customer={customer} projects={customerProjects} size="md" />
              <ChurnRiskBadge customer={customer} projects={customerProjects} size="md" />
            </div>
            <div className="flex items-center gap-4 mt-1 text-gray-600">
              <span>{customerProjects.length} project{customerProjects.length !== 1 ? 's' : ''}</span>
              <span className="text-gray-300">|</span>
              <span className="text-green-600 font-medium">${totalMRC.toLocaleString()}/mo MRC</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {customer.linkedInUrl && (
            <a
              href={customer.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          )}
          <Button onClick={() => navigate(`/projects?customer=${customer.id}`)}>
            <FolderOpen className="w-4 h-4 mr-2" />
            View Projects
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                pb-4 text-sm font-medium transition-colors relative flex items-center gap-2
                ${activeTab === tab.id
                  ? 'text-pilot-secondary border-b-2 border-pilot-primary'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 bg-pilot-primary text-pilot-secondary text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Contacts */}
          <Card className="col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contacts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {customer.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-lg border ${
                    contact.isPrimary ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    {contact.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      <a href={`tel:${contact.phone}`} className="hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                    {contact.role && (
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        Role: {contact.role.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* VIP Status & LinkedIn */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">VIP Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">VIP Tier</label>
                  <select
                    value={customer.vipTier || 'standard'}
                    onChange={(e) =>
                      handleVipTierChange(
                        e.target.value === 'standard' ? undefined : (e.target.value as VIPTier)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                  >
                    <option value="standard">Standard</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                {customer.vipTier && <VIPPerks tier={customer.vipTier} />}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={customer.linkedInUrl || ''}
                  onChange={(e) => handleLinkedInUpdate(e.target.value)}
                  placeholder="Enter LinkedIn URL..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pilot-primary"
                />
                {!customer.linkedInUrl && (
                  <button
                    onClick={() => handleLinkedInUpdate(suggestedLinkedIn)}
                    className="w-full text-left text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Suggest: {suggestedLinkedIn}
                  </button>
                )}
                {customer.linkedInUrl && (
                  <a
                    href={customer.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open LinkedIn
                  </a>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Stats and Health */}
          <div className="col-span-3">
            <div className="grid grid-cols-5 gap-4">
              <Card className="text-center">
                <p className="text-3xl font-bold text-pilot-secondary">{activeProjects.length}</p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-green-600">{completedProjects.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-green-600">${totalMRC.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {customerProjects.length > 0
                    ? Math.floor(
                        (new Date().getTime() -
                          new Date(
                            customerProjects.sort(
                              (a, b) =>
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                            )[0].createdAt
                          ).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </p>
                <p className="text-sm text-gray-600">Days as Customer</p>
              </Card>
              <div className="col-span-1">
                <CustomerHealthBadge
                  customer={customer}
                  projects={customerProjects}
                  showDetails
                />
              </div>
            </div>
          </div>

          {/* Churn Risk Assessment */}
          <div className="col-span-3">
            <ChurnRiskBadge
              customer={customer}
              projects={customerProjects}
              showDetails
            />
          </div>

          {/* News Preview */}
          {newsAlerts.length > 0 && (
            <div className="col-span-3">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent News
                    {unreadNewsCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {unreadNewsCount} new
                      </span>
                    )}
                  </h3>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setActiveTab('news')}
                  >
                    View All
                  </Button>
                </div>
                <CustomerNewsPanel
                  alerts={newsAlerts.slice(0, 3)}
                  compact
                />
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Customer Timeline
          </h3>
          <CustomerTimeline customer={customer} projects={customerProjects} />
        </Card>
      )}

      {activeTab === 'news' && (
        <Card>
          <CustomerNewsPanel
            alerts={newsAlerts}
            onMarkRead={(alertId) => {
              // In a real app, this would dispatch an action to update state
              console.log('Mark read:', alertId)
            }}
            onDismiss={(alertId) => {
              // In a real app, this would dispatch an action to update state
              console.log('Dismiss:', alertId)
            }}
          />
        </Card>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          {customerProjects.length === 0 ? (
            <Card className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No projects yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {customerProjects.map((project) => {
                const building = getBuilding(project.buildingId)
                return (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{project.product}</p>
                          <span className="text-sm text-gray-500">-</span>
                          <span className="text-sm text-gray-600">{project.serviceBandwidth}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {building?.address}, {building?.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : project.status === 'installing'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {project.status}
                        </span>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          ${project.mrc.toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
