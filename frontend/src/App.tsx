import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import PlantPage from './pages/PlantPage'
import NewPlantPage from './pages/NewPlantPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="plants/new" element={<ProtectedRoute><NewPlantPage /></ProtectedRoute>} />
        <Route path="plants/:id" element={<ProtectedRoute><PlantPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
