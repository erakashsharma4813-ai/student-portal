import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
