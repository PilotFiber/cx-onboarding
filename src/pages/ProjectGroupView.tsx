import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Layers, Edit2, Trash2, Plus, Clock, AlertTriangle, Building2, Unlink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProjectTypeBadge from '../components/ui/ProjectTypeBadge'
import HealthScoreBadge from '../components/features/HealthScoreBadge'
import ProjectGroupModal from '../components/features/ProjectGroupModal'
import StatusBadge from '../components/ui/StatusBadge'

export default function ProjectGroupView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, getProjectGroup, getProjectsInGroup, getCustomer, getBuilding, dispatch } = useApp()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const group = id ? getProjectGroup(id) : undefined
  const linkedProjects = id ? getProjectsInGroup(id) : []
  const customer = group ? getCustomer(group.customerId) : undefined

  // Get unlinked projects for the same customer (for linking)
  const unlinkableProjects = state.projects.filter(
    p => p.customerId === group?.customerId && !p.projectGroupId
  )

  if (!group) {
    return (
      <div className="text-center py-12">
        <Layers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
        <p className="text-gray-600 mb-4">The project group you're looking for doesn't exist.</p>
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    )
  }

  const handleDeleteGroup = () => {
    dispatch({ type: 'DELETE_PROJECT_GROUP', payload: group.id })
    navigate('/projects')
  }

  const handleUnlinkProject = (projectId: string) => {
    dispatch({
      type: 'LINK_PROJECT_TO_GROUP',
      payload: { projectId, groupId: undefined }
    })
  }

  const handleLinkProject = (projectId: string) => {
    dispatch({
      type: 'LINK_PROJECT_TO_GROUP',
      payload: { projectId, groupId: group.id }
    })
  }

  // Calculate group stats
  const stats = {
    total: linkedProjects.length,
    completed: linkedProjects.filter(p => p.status === 'completed').length,
    inProgress: linkedProjects.filter(p => ['scheduled', 'confirmed', 'installing'].includes(p.status)).length,
    pending: linkedProjects.filter(p => ['new', 'reviewing'].includes(p.status)).length,
    escalated: linkedProjects.filter(p => p.isEscalated).length,
    totalMrc: linkedProjects.reduce((sum, p) => sum + p.mrc, 0),
    totalNrc: linkedProjects.reduce((sum, p) => sum + p.nrc, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: group.color }}
              >
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600">
                  {customer?.companyName} • {linkedProjects.length} linked project{linkedProjects.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {group.description && (
              <p className="mt-2 text-gray-600 max-w-2xl">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="secondary"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total MRC</p>
          <p className="text-2xl font-bold text-gray-900">${stats.totalMrc.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total NRC</p>
          <p className="text-2xl font-bold text-gray-900">${stats.totalNrc.toLocaleString()}</p>
        </Card>
      </div>

      {/* Linked Projects */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Linked Projects</h2>
        {unlinkableProjects.length > 0 && (
          <Button variant="secondary" onClick={() => setShowLinkModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Link Project
          </Button>
        )}
      </div>

      {linkedProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <Layers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects linked yet</h3>
          <p className="text-gray-600 mb-4">Link projects to this group to track them together.</p>
          {unlinkableProjects.length > 0 && (
            <Button onClick={() => setShowLinkModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Link Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {linkedProjects.map(project => {
            const building = getBuilding(project.buildingId)
            return (
              <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex-1 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{project.product}</span>
                        <ProjectTypeBadge type={project.projectType} size="sm" />
                        {project.isEscalated && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Escalated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {building?.address || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          FOC: {new Date(project.focDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">MRC</p>
                        <p className="font-medium">${project.mrc.toLocaleString()}</p>
                      </div>
                      <StatusBadge status={project.status} />
                      <HealthScoreBadge project={project} size="sm" />
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnlinkProject(project.id)
                    }}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Unlink from group"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      <ProjectGroupModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editGroup={group}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowDeleteConfirm(false)} />
            <Card className="relative max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project Group?</h3>
              <p className="text-gray-600 mb-4">
                This will delete the group "{group.name}" and unlink all {linkedProjects.length} project{linkedProjects.length !== 1 ? 's' : ''}.
                The projects themselves will not be deleted.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteGroup}
                >
                  Delete Group
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Link Project Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowLinkModal(false)} />
            <Card className="relative max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Projects to Group</h3>
              <p className="text-gray-600 mb-4">
                Select projects to link to "{group.name}". Only unlinked projects for {customer?.companyName} are shown.
              </p>
              {unlinkableProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No unlinked projects available for this customer.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {unlinkableProjects.map(project => {
                    const building = getBuilding(project.buildingId)
                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{project.product}</p>
                          <p className="text-sm text-gray-600">{building?.address || 'Unknown address'}</p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            handleLinkProject(project.id)
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Link
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="secondary" onClick={() => setShowLinkModal(false)}>
                  Done
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
