import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { BuildingDrawerProvider } from './context/BuildingDrawerContext'
import { TicketDrawerProvider } from './context/TicketDrawerContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import PageLayout from './components/layout/PageLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectView from './pages/ProjectView'
import ProjectGroupView from './pages/ProjectGroupView'
import CustomerView from './pages/CustomerView'
import Tasks from './pages/Tasks'
import Tickets from './pages/Tickets'
import Calendar from './pages/Calendar'
import MyDay from './pages/MyDay'
import TeamWorkload from './pages/TeamWorkload'
import Reports from './pages/Reports'
import Playbooks from './pages/Playbooks'
import Profile from './pages/Profile'
import CommandPalette from './components/features/CommandPalette'
import KeyboardShortcutsModal from './components/features/KeyboardShortcutsModal'
import NewProjectModal from './components/features/NewProjectModal'
import BuildingDetailsDrawer from './components/features/BuildingDetailsDrawer'
import TicketDetailDrawer from './components/features/TicketDetailDrawer'

function AppContent() {
  const navigate = useNavigate()
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)

  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onOpenNewProject: () => setIsNewProjectModalOpen(true),
    onOpenShortcutsHelp: () => setIsShortcutsModalOpen(true),
  })

  return (
    <>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-day" element={<MyDay />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectView />} />
          <Route path="/groups/:id" element={<ProjectGroupView />} />
          <Route path="/customers/:id" element={<CustomerView />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/team" element={<TeamWorkload />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </PageLayout>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={(projectId) => navigate(`/projects/${projectId}`)}
      />

      <BuildingDetailsDrawer />
      <TicketDetailDrawer />
    </>
  )
}

function App() {
  return (
    <AppProvider>
      <BuildingDrawerProvider>
        <TicketDrawerProvider>
          <AppContent />
        </TicketDrawerProvider>
      </BuildingDrawerProvider>
    </AppProvider>
  )
}

export default App
