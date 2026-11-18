import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  getRoleName,
  getToken,
  getUser,
  getUserCategory,
  homePathFor,
  isStafAkademik,
  isSuperAdmin,
} from '../services/auth'

// allowedRole: 'staf' | 'super_admin' | 'kaprodi' | 'kadep' | 'manit' | 'approver'
function ProtectedRoute({ allowedRole }) {
  const user = getUser()
  const { pathname } = useLocation()

  if (!user || !getToken()) {
    return <Navigate to="/" replace />
  }

  // Nama role belum bisa dibaca dari response /me -> jangan kunci pengguna
  if (!getRoleName(user)) {
    return <Outlet />
  }

  const category = getUserCategory(user)

  if (allowedRole === 'super_admin' && !isSuperAdmin(user)) {
    return <Navigate to={homePathFor(user)} replace />
  }

  if (allowedRole === 'staf') {
    if (isSuperAdmin(user)) {
      return <Navigate to={pathname.replace(/^\/admin/, '/super-admin')} replace />
    }
    if (!isStafAkademik(user)) {
      return <Navigate to={homePathFor(user)} replace />
    }
  }

  if (allowedRole === 'kaprodi' && category !== 'kaprodi') {
    return <Navigate to={homePathFor(user)} replace />
  }

  if (allowedRole === 'kadep' && category !== 'kadep') {
    return <Navigate to={homePathFor(user)} replace />
  }

  if (allowedRole === 'manit' && category !== 'manit') {
    return <Navigate to={homePathFor(user)} replace />
  }

  if (allowedRole === 'approver' && !['kaprodi', 'kadep', 'manit'].includes(category)) {
    return <Navigate to={homePathFor(user)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute