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
  localStorage.setItem('siyudis_user', JSON.stringify(user))
}

export function getUser() {
  const user = localStorage.getItem('siyudis_user')

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
  localStorage.removeItem('siyudis_user')
}