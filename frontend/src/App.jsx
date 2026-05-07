import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { authAPI } from './utils/api'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Plans from './pages/Plans'
import TuitionInfo from './pages/TuitionInfo'
import FreeMaterials from './pages/FreeMaterials'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

function App() {
  const { token, setUser } = useAuthStore()

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe()
          setUser(response.data)
        } catch (error) {
          console.error('Failed to load user')
        }
      }
    }
    loadUser()
  }, [token, setUser])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/tuition-info" element={<TuitionInfo />} />
          <Route path="/free-materials" element={<FreeMaterials />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
