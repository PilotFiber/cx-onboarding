import {
  X,
  Building2,
  MapPin,
  Wifi,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react'
import { useBuildingDrawer } from '../../context/BuildingDrawerContext'
import { BuildingStatus, DeploymentType, BuildingOutage } from '../../types'

const buildingStatusLabels: Record<BuildingStatus, string> = {
  'on-net': 'On-Net',
  'anchor': 'Anchor',
  'near-net': 'Near-Net',
  'off-net': 'Off-Net',
  'in-construction': 'In Construction',
}

const buildingStatusColors: Record<BuildingStatus, string> = {
  'on-net': 'bg-green-100 text-green-800',
  'anchor': 'bg-blue-100 text-blue-800',
  'near-net': 'bg-yellow-100 text-yellow-800',
  'off-net': 'bg-gray-100 text-gray-800',
  'in-construction': 'bg-orange-100 text-orange-800',
}

const deploymentTypeLabels: Record<DeploymentType, string> = {
  'gpon': 'GPON',
  'xgs': 'XGS-PON',
  'gpon-xgs': 'GPON + XGS',
  'fixed-wireless': 'Fixed Wireless',
}

const buildingTypeLabels: Record<string, string> = {
  'commercial': 'Commercial',
  'residential': 'Residential',
  'mdu': 'MDU',
  'data-center': 'Data Center',
}

function OutageCard({ outage }: { outage: BuildingOutage }) {
  const isActive = outage.status === 'active'
  const isScheduled = outage.status === 'scheduled'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`p-3 rounded-lg border ${
        isActive
          ? 'bg-red-50 border-red-200'
          : isScheduled
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2">
        {isActive ? (
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
        ) : isScheduled ? (
          <Calendar className="w-4 h-4 text-yellow-600 mt-0.5" />
        ) : (
          <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isActive ? 'text-red-800' : isScheduled ? 'text-yellow-800' : 'text-gray-600'}`}>
              {outage.title}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              outage.type === 'outage' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {outage.type === 'outage' ? 'Outage' : 'Maintenance'}
            </span>
          </div>
          {outage.description && (
            <p className="text-xs text-gray-600 mt-1">{outage.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{formatDate(outage.startTime)}</span>
            {outage.endTime && (
              <>
                <span>→</span>
                <span>{formatDate(outage.endTime)}</span>
              </>
            )}
          </div>
          {outage.affectedServices && outage.affectedServices.length > 0 && (
            <div className="flex gap-1 mt-2">
              {outage.affectedServices.map((service) => (
                <span key={service} className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BuildingDetailsDrawer() {
  const { isOpen, building, closeDrawer } = useBuildingDrawer()

  if (!building) return null

  const activeOutages = building.outages?.filter(o => o.status === 'active') || []
  const scheduledOutages = building.outages?.filter(o => o.status === 'scheduled') || []
  const recentOutages = building.outages?.filter(o => o.status === 'resolved').slice(0, 3) || []

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pilot-primary rounded-lg">
              <Building2 className="w-5 h-5 text-pilot-secondary" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Building Details</h2>
              <p className="text-xs text-gray-500">From Flight Deck</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-6">
          {/* Address */}
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{building.address}</p>
                <p className="text-sm text-gray-500">{building.city}, {building.state} {building.zip}</p>
              </div>
            </div>
          </div>

          {/* Status & Type */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Building Status</span>
              <div className="mt-1">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${buildingStatusColors[building.buildingStatus]}`}>
                  {buildingStatusLabels[building.buildingStatus]}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Building Type</span>
              <p className="mt-1 font-medium text-gray-900">{buildingTypeLabels[building.buildingType]}</p>
            </div>
          </div>

          {/* Deployment Type */}
          <div className="mb-6">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Deployment Type</span>
            <div className="mt-1 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900">{deploymentTypeLabels[building.deploymentType]}</span>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {building.requiresAfterHours && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm">
                <Clock className="w-4 h-4" />
                After Hours Required
              </div>
            )}
            {building.requiresContractWork && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm">
                <Wrench className="w-4 h-4" />
                Contract Work Required
              </div>
            )}
            {building.requiresSurvey && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm">
                <FileText className="w-4 h-4" />
                Survey Required
              </div>
            )}
          </div>

          {/* Active Outages */}
          {activeOutages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700">Active Issues</span>
              </div>
              <div className="space-y-2">
                {activeOutages.map((outage) => (
                  <OutageCard key={outage.id} outage={outage} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Maintenance */}
          {scheduledOutages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">Scheduled Maintenance</span>
              </div>
              <div className="space-y-2">
                {scheduledOutages.map((outage) => (
                  <OutageCard key={outage.id} outage={outage} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Outages */}
          {recentOutages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">Recent History</span>
              </div>
              <div className="space-y-2">
                {recentOutages.map((outage) => (
                  <OutageCard key={outage.id} outage={outage} />
                ))}
              </div>
            </div>
          )}

          {/* Access Instructions */}
          {building.accessInstructions && (
            <div className="mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Access Instructions</span>
              <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {building.accessInstructions}
              </p>
            </div>
          )}

          {/* Install Notes */}
          {building.installNotes && building.installNotes.length > 0 && (
            <div className="mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Install Notes</span>
              <ul className="mt-2 space-y-1">
                {building.installNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ISP Notes */}
          {building.ispNotes && (
            <div className="mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">ISP Notes</span>
              <p className="mt-1 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                {building.ispNotes}
              </p>
            </div>
          )}

          {/* Recommended Device */}
          <div className="mb-6">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Recommended Device</span>
            <p className="mt-1 font-medium text-gray-900">{building.recommendedDevice}</p>
          </div>

          {/* Flight Deck Link */}
          {building.flightDeckId && (
            <div className="pt-4 border-t border-gray-200">
              <a
                href={`https://flightdeck.pilot.com/buildings/${building.flightDeckId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-pilot-secondary text-white rounded-lg hover:bg-pilot-secondary/90 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Flight Deck
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
