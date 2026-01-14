import { MapPin } from 'lucide-react'
import { Building } from '../../types'
import { useBuildingDrawer } from '../../context/BuildingDrawerContext'

interface AddressLinkProps {
  building: Building
  showIcon?: boolean
  className?: string
}

export default function AddressLink({ building, showIcon = false, className = '' }: AddressLinkProps) {
  const { openDrawer } = useBuildingDrawer()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openDrawer(building)
  }

  return (
    <button
      onClick={handleClick}
      className={`text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors inline-flex items-center gap-1 ${className}`}
    >
      {showIcon && <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{building.address}</span>
    </button>
  )
}
