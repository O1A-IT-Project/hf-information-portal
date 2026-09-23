//import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import ClinicianOnly from './pages/ClinicianOnly'
import RoleApplicationForm from './components/RoleApplicationForm'
import ContentPage from './pages/ContentPage'
import Survey from './pages/Survey'
import ContentDetailPage from './pages/ContentDetailPage'
import FindClinic from './pages/FindClinic'
import ArticlePage from './pages/ArticlePage'

import './Theme.css'

import { Route, Navigate, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { api } from './api'

export type User = {
  id: string
  email: string

  firstName?: string
  lastName?: string

  roles?: ('patient' | 'clinician' | 'doctor' | 'pharmacy' | 'custodian' | 'admin')[]

  requestedRole?: 'patient' | 'clinician' | 'doctor' | 'pharmacy' | 'custodian'

  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected'

  pendingApplications?: {
    requestedRole: string
    verificationStatus: string
    verificationData: Record<string, string>
  }[]
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const location = useLocation()

  const hideNavbarRoutes = ['/login', '/register']

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get('/api/auth/me')
        setUser(response.data)
      } catch (error) {
        setUser(null)
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar user={user} setUser={setUser} />
      )}

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/find-clinic" element={<FindClinic />} />
        <Route path="/search" element={<ContentPage />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/article/:articlePath" element={<ArticlePage />} />

        <Route path="/content" element={<ContentPage />} />
        <Route path="/content/*" element={<ContentDetailPage />} />

        <Route path="/register" element={<Register setUser={setUser} />} />

        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/admin_panel"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              {user ? <AdminPanel user={user} /> : null}
            </ProtectedRoute>
          }
        />

        <Route
          path="/ClinicianOnly"
          element={
            <ProtectedRoute user={user} allowedRoles={['doctor']}>
              <ClinicianOnly />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={user ? <Profile user={user} onUpdateUser={setUser} /> : <Navigate to="/login" />}
        />

        <Route
          path="/apply-role"
          element={
            user ? <RoleApplicationForm refreshUser={refreshUser} /> : <Navigate to="/login" />
          }
        />
      </Routes>
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Footer />
      )}
    </>
  )
}

export default App
