import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getRoleName, getToken, getUser, homePathFor, isStafAkademik, isSuperAdmin } from '../services/auth'

// allowedRole: 'staf' (/admin/*, khusus Staf Akademik) | 'super_admin' (/super-admin/*)
// Backend tetap menjadi penjaga utama; ini memastikan tiap role hanya melihat areanya.
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

  if (allowedRole === 'super_admin' && !isSuperAdmin(user)) {
    return <Navigate to={homePathFor(user)} replace />
  }

  if (allowedRole === 'staf') {
    // Super Admin punya area sendiri (/super-admin/*) dengan 7 menu
    if (isSuperAdmin(user)) {
      return <Navigate to={pathname.replace(/^\/admin/, '/super-admin')} replace />
    }
    if (!isStafAkademik(user)) {
      return <Navigate to={homePathFor(user)} replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
