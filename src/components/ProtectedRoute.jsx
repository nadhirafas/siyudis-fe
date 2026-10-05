import { Navigate, Outlet } from 'react-router-dom'
import { getUser } from '../services/auth'

function ProtectedRoute({ allowedRole }) {
  const user = getUser()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }

    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute