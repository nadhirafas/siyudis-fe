const API_URL = import.meta.env.VITE_API_URL
const MULTI_ROLE_ALLOWED = new Set(['super_admin', 'staf_akademik'])

export const DASHBOARD_BY_CATEGORY = {
  mahasiswa: '/dashboard',
  staf_akademik: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
  kaprodi: '/kaprodi/dashboard',
  manit: '/manit/dashboard',
  kadep: '/kadep/dashboard',
}

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

  window.location.href = data.url
}

// =========================================================
// USER & TOKEN SESSION
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

export function updateUser(updatedUserData) {
  const currentUser = getUser() || {}
  const newUser = { ...currentUser, ...updatedUserData }
  saveUser(newUser)
  return newUser
}

// =========================================================
// ROLE HELPERS (MULTI-ROLE: SUPER ADMIN + STAF AKADEMIK)
// =========================================================
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

// Mengambil semua role milik user (mendukung single role maupun array roles/role_names)
export function getUserRoles(user) {
  if (!user) return []
  const rawList = []

  if (Array.isArray(user.roles)) {
    rawList.push(...user.roles)
  } else if (user.roles && typeof user.roles === 'object') {
    rawList.push(user.roles)
  }

  if (Array.isArray(user.role_names)) {
    rawList.push(...user.role_names)
  }

  if (user.role) {
    rawList.push(user.role)
  }

  if (user.role_name) {
    rawList.push(user.role_name)
  }

  const categories = rawList
    .map((item) => {
      if (typeof item === 'string') return roleCategory(item)
      if (item && typeof item === 'object') {
        return roleCategory(item.name || item.nama || item.nama_role || item.slug || '')
      }
      return null
    })
    .filter(Boolean)

  const unique = [...new Set(categories)]

  // Pengaman: multi-role hanya diizinkan untuk kombinasi super_admin dan staf_akademik
  if (unique.length > 1 && unique.some((c) => !MULTI_ROLE_ALLOWED.has(c))) {
    return unique.slice(0, 1)
  }

  return unique
}

export function getRoleName(user) {
  if (!user) return ''
  const categories = getUserRoles(user)
  if (categories.length > 0) {
    if (categories.includes('super_admin')) return 'super_admin'
    return categories[0]
  }
  const r = user.role
  if (typeof r === 'string') return r
  return r?.name || r?.nama || r?.nama_role || user.role_name || ''
}

export function hasRole(user, targetCategory) {
  return getUserRoles(user).includes(targetCategory)
}

export function isSuperAdmin(user) {
  return hasRole(user, 'super_admin')
}

export function isStafAkademik(user) {
  return hasRole(user, 'staf_akademik') || hasRole(user, 'super_admin')
}

// Halaman awal setelah login, sesuai area kerja role
export function homePathFor(user) {
  const roles = getUserRoles(user)
  if (roles.includes('super_admin')) return DASHBOARD_BY_CATEGORY.super_admin
  if (roles.includes('staf_akademik')) return DASHBOARD_BY_CATEGORY.staf_akademik
  if (roles.length > 0 && DASHBOARD_BY_CATEGORY[roles[0]]) {
    return DASHBOARD_BY_CATEGORY[roles[0]]
  }
  return DASHBOARD_BY_CATEGORY[roleCategory(getRoleName(user))] || '/dashboard'
}

// =========================================================
// LOGOUT
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