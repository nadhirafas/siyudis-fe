import { Navigate, Outlet } from 'react-router-dom'
import {
  getRoleName,
  getToken,
  getUser,
  getUserRoles,
  hasRole,
  homePathFor,
  isSuperAdmin,
} from '../services/auth'

// allowedRole: 'staf' (/admin/*) | 'super_admin' (/super-admin/*) | role tunggal lainnya
// Backend tetap menjadi penjaga utama; ini memastikan tiap role hanya melihat areanya.
function ProtectedRoute({ allowedRole }) {
  const user = getUser()

  if (!user || !getToken()) {
    return <Navigate to="/" replace />
  }

  const roles = getUserRoles(user)

  // Nama/daftar role belum bisa dibaca -> jangan kunci pengguna
  if (!getRoleName(user) && roles.length === 0) {
    return <Outlet />
  }

  // Area mahasiswa & approver (tidak mendukung multi-role)
  if (['mahasiswa', 'kaprodi', 'manit', 'kadep'].includes(allowedRole)) {
    if (!hasRole(user, allowedRole)) {
      return <Navigate to={homePathFor(user)} replace />
    }
    return <Outlet />
  }

  if (allowedRole === 'super_admin' && !isSuperAdmin(user)) {
    return <Navigate to={homePathFor(user)} replace />
  }

  if (allowedRole === 'staf') {
    // Boleh diakses jika memiliki role staf_akademik (termasuk super_admin yang merangkap staf_akademik)
    const canAccessStafArea =
      hasRole(user, 'staf_akademik') || isSuperAdmin(user)

    if (!canAccessStafArea) {
      return <Navigate to={homePathFor(user)} replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute