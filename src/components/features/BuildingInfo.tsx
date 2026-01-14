import { Building2, AlertCircle, Info } from 'lucide-react'
import { Building } from '../../types'
import Card from '../ui/Card'

interface BuildingInfoProps {
  building: Building
  className?: string
}

export default function BuildingInfo({ building, className = '' }: BuildingInfoProps) {
  const deploymentLabels: Record<string, string> = {
    gpon: 'G-PON',
    xgs: 'XGS-PON',
    'gpon-xgs': 'GPON + XGS',
    'fixed-wireless': 'Fixed Wireless',
    mixed: 'Mixed (G-PON/XGS)',
  }

  return (
    <Card className={className}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-pilot-primary rounded-lg">
          <Building2 className="w-6 h-6 text-pilot-secondary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{building.address}</h3>
          <p className="text-sm text-gray-600">
            {building.city}, {building.state} {building.zip}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Deployment</span>
              <p className="text-sm font-medium text-gray-900">
                {deploymentLabels[building.deploymentType]}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Recommended Device</span>
              <p className="text-sm font-medium text-gray-900 font-mono">
                {building.recommendedDevice}
              </p>
            </div>
          </div>

          {building.installNotes.length > 0 && (
            <div className="mt-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Install Notes
              </span>
              <ul className="mt-2 space-y-1">
                {building.installNotes.map((note, idx) => (
                  <li key={idx} className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {building.accessInstructions && (
            <div className="mt-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Info className="w-3 h-3" />
                Access Instructions
              </span>
              <p className="mt-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                {building.accessInstructions}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
