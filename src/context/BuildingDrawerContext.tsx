import { createContext, useContext, useState, ReactNode } from 'react'
import { Building } from '../types'

interface BuildingDrawerContextValue {
  isOpen: boolean
  building: Building | null
  openDrawer: (building: Building) => void
  closeDrawer: () => void
}

const BuildingDrawerContext = createContext<BuildingDrawerContextValue | null>(null)

export function BuildingDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [building, setBuilding] = useState<Building | null>(null)

  const openDrawer = (building: Building) => {
    setBuilding(building)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    // Delay clearing building data to allow for closing animation
    setTimeout(() => setBuilding(null), 300)
  }

  return (
    <BuildingDrawerContext.Provider value={{ isOpen, building, openDrawer, closeDrawer }}>
      {children}
    </BuildingDrawerContext.Provider>
  )
}

export function useBuildingDrawer() {
  const context = useContext(BuildingDrawerContext)
  if (!context) {
    throw new Error('useBuildingDrawer must be used within BuildingDrawerProvider')
  }
  return context
}
