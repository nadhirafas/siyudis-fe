import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveUser, roleCategory, DASHBOARD_BY_CATEGORY } from '../../services/auth'
import LoginPage from './LoginPage'

// Kode OAuth Google hanya berlaku sekali. React StrictMode (dev) menjalankan effect dua kali,
// jadi kode yang sudah diproses dicatat di luar komponen agar tidak ditukar ulang.
const handledCodes = new Set()

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Cek apakah ada parameter error yang dikirim dari backend (misal: salah domain email)
        const errorParam = searchParams.get('error')
        if (errorParam) {
          throw new Error(errorParam)
        }

        // =========================================================
        // 1. AMBIL TOKEN DARI URL
        // =========================================================
        let token = searchParams.get('token')
        const code = searchParams.get('code')

        // Alur utama: Google mengarahkan ke halaman ini dengan ?code=...,
        // lalu FE menukarnya ke GET /api/auth/google/callback (balasan: data.token).
        if (!token && code) {
          if (handledCodes.has(code)) return
          handledCodes.add(code)

          const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
          const exchange = await fetch(
            `${apiBase}/auth/google/callback?code=${encodeURIComponent(code)}`,
            { method: 'GET', headers: { Accept: 'application/json' } }
          )
          const exchanged = await exchange.json().catch(() => ({}))

          if (!exchange.ok) {
            throw new Error(exchanged.message || 'Login Google gagal diproses')
          }
          token = exchanged?.data?.token
        }

        if (!token) {
          throw new Error('Token login tidak ditemukan')
        }

        // Simpan token
        sessionStorage.setItem('siyudis_token', token)

        // =========================================================
        // 2. AMBIL DATA USER DARI BACKEND
        // =========================================================
        const API_URL = import.meta.env.VITE_API_URL

        const response = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || 'Gagal mengambil data pengguna'
          )
        }

        if (result.status !== 'success') {
          throw new Error('Data pengguna tidak valid')
        }

        // =========================================================
        // 3. DATA USER
        // =========================================================
        const user = result.data

        if (!user) {
          throw new Error('Data pengguna tidak ditemukan')
        }

        // =========================================================
        // 4. SIMPAN USER
        // =========================================================
        saveUser(user)

        // =========================================================
        // 5. TENTUKAN ROLE & DASHBOARD
        // =========================================================
        const getRoleName = (userData) => {
          if (userData?.role?.name) {
            return userData.role.name
          }

          if (typeof userData?.role === 'string') {
            return userData.role
          }

          if (userData?.role_id) {
            return `role_id:${userData.role_id}`
          }

          return 'mahasiswa'
        }

        const rawRole = getRoleName(user)
        const category = roleCategory(rawRole)
        const dashboardPath = DASHBOARD_BY_CATEGORY[category] || '/dashboard'

        if (!category) {
          console.warn('Role tidak dikenali:', rawRole)
        }

        // =========================================================
        // 6. REDIRECT
        // =========================================================
        navigate(dashboardPath, {
          replace: true,
        })
      } catch (err) {
        console.error(
          'AUTH CALLBACK ERROR:',
          err
        )

        setError(
          err.message ||
            'Akun Google yang Anda pilih bukan merupakan akun resmi Google Workspace UGM.'
        )
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  // =============================================================
  // ERROR SCREEN -> TAMPILKAN LOGIN PAGE DENGAN STATE DENIED
  // =============================================================
  if (error) {
    return <LoginPage initialError={error} />
  }

  // =============================================================
  // LOADING SCREEN
  // =============================================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F7FB] px-4 sm:px-5">
      <div className="w-full max-w-sm rounded-2xl border border-[#E0E7EF] bg-white px-6 sm:px-8 py-8 sm:py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0F8]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07548C]">
            <span className="text-lg font-bold text-white">S</span>
          </div>
        </div>

        <div className="mt-7 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D5E1EC] border-t-[#07548C]" />
        </div>

        <h1 className="mt-5 text-base font-bold text-[#111827]">
          Menyiapkan akun Anda
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#65758B]">
          Sedang mengambil data pengguna dan menyiapkan dashboard.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#07548C]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#07548C] [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#07548C] [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export default AuthCallback