import { useEffect, useState } from 'react'
import { getToken, getUser, saveUser } from '../services/auth'
import { getProfile } from '../services/mahasiswaApi'

// Data akun terbaru dari GET /api/me, digabung ke session (menggantikan fetch manual per halaman)
export default function useCurrentUser() {
  const [user, setUser] = useState(() => getUser())

  useEffect(() => {
    let cancelled = false
    if (!getToken()) return undefined

    getProfile()
      .then((raw) => {
        if (cancelled || !raw || typeof raw !== 'object') return
        const merged = { ...getUser(), ...raw }
        saveUser(merged)
        setUser(merged)
      })
      .catch(() => {
        // tetap pakai data session bila gagal
      })

    return () => {
      cancelled = true
    }
  }, [])

  return user
}
