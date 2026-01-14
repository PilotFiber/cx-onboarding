import { createContext, useContext, useState, ReactNode } from 'react'

interface TicketDrawerContextValue {
  isOpen: boolean
  ticketId: string | null
  openDrawer: (ticketId: string) => void
  closeDrawer: () => void
}

const TicketDrawerContext = createContext<TicketDrawerContextValue | null>(null)

export function TicketDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const openDrawer = (id: string) => {
    setTicketId(id)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    // Delay clearing ticket ID to allow for closing animation
    setTimeout(() => setTicketId(null), 300)
  }

  return (
    <TicketDrawerContext.Provider value={{ isOpen, ticketId, openDrawer, closeDrawer }}>
      {children}
    </TicketDrawerContext.Provider>
  )
}

export function useTicketDrawer() {
  const context = useContext(TicketDrawerContext)
  if (!context) {
    throw new Error('useTicketDrawer must be used within TicketDrawerProvider')
  }
  return context
}
