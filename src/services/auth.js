const API_URL = import.meta.env.VITE_API_URL

// =========================================================
// GOOGLE LOGIN
// =========================================================
export async function loginWithGoogle() {
  const response = await fetch(`${API_URL}/auth/google/redirect`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Gagal menghubungkan ke Google')
  }

  const data = await response.json()

  if (!data.url) {
    throw new Error('URL Google tidak ditemukan')
  }

  // Arahkan user ke halaman login Google
  window.location.href = data.url
}

// =========================================================
// USER
// =========================================================
export function saveUser(user) {
  sessionStorage.setItem('siyudis_user', JSON.stringify(user))
}

export function getUser() {
  const user = sessionStorage.getItem('siyudis_user')

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

export function clearUser() {
  sessionStorage.removeItem('siyudis_user')
}

export function saveToken(token) {
  sessionStorage.setItem('siyudis_token', token)
}

export function getToken() {
  return sessionStorage.getItem('siyudis_token')
}

export function clearToken() {
  sessionStorage.removeItem('siyudis_token')
}

// =========================================================
// ROLE HELPERS
// =========================================================
export function getRoleName(user) {
  if (!user) return ''
  const r = user.role
  if (typeof r === 'string') return r
  return r?.name || r?.nama || r?.nama_role || user.role_name || ''
}

function normalizeRole(user) {
  return getRoleName(user).toLowerCase().replace(/[_-]/g, ' ').trim()
}

export function isSuperAdmin(user) {
  return normalizeRole(user).includes('super')
}

export function isStafAkademik(user) {
  const r = normalizeRole(user)
  return r.includes('staf') || r.includes('staff') || r === 'admin' || r.includes('super')
}

// =========================================================
// LOGOUT (revoke token di backend, lalu bersihkan session)
// =========================================================
export async function logout() {
  const token = getToken()
  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
    }
  } catch {
    // tetap lanjut bersihkan session lokal
  } finally {
    clearToken()
    clearUser()
  }
}


// Halaman awal setelah login, sesuai area kerja role
export function homePathFor(user) {
  if (isSuperAdmin(user)) return '/super-admin/dashboard'
  if (isStafAkademik(user)) return '/admin/dashboard'
  return '/dashboard'
}


// Kategori role dari nama role di database. Toleran terhadap variasi penulisan:
// "staf_akademik", "Staf Akademik", "staff-akademik", "super_admin", dst.
export function roleCategory(name = '') {
  const r = String(name).toLowerCase().replace(/[_-]+/g, ' ').trim()
  if (!r) return null
  if (r.includes('super')) return 'super_admin'
  if (r.includes('staf') || r.includes('staff') || r === 'admin') return 'staf_akademik'
  if (r.includes('kaprodi') || r.includes('kepala program studi') || r.includes('kepala prodi')) return 'kaprodi'
  if (r.includes('manit')) return 'manit'
  if (r.includes('kadep') || r.includes('kepala departemen')) return 'kadep'
  if (r.includes('mahasiswa')) return 'mahasiswa'
  return null
}

export const DASHBOARD_BY_CATEGORY = {
  mahasiswa: '/dashboard',
  staf_akademik: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
  kaprodi: '/kepala-prodi/dashboard',
  manit: '/management/dashboard',
  kadep: '/management/dashboard',
}
