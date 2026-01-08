import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navigation } from './components/Navigation'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CustomerServicesPage } from './pages/CustomerServicesPage'
import { CustomerRentalsPage } from './pages/CustomerRentalsPage'
import { AdminJobsPage } from './pages/AdminJobsPage'
import { AdminFleetPage } from './pages/AdminFleetPage'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading, userRole } = useAuth()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/dashboard" />

  return <>{children}</>
}

function AppContent() {
  const { user } = useAuth()

  return (
    <>
      {user && <Navigation />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/customer/services" element={
            <ProtectedRoute>
              <CustomerServicesPage />
            </ProtectedRoute>
          } />

          <Route path="/customer/rentals" element={
            <ProtectedRoute>
              <CustomerRentalsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/jobs" element={
            <ProtectedRoute requiredRole="admin">
              <AdminJobsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/fleet" element={
            <ProtectedRoute requiredRole="admin">
              <AdminFleetPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
