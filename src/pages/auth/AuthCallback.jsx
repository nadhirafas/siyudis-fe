import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveUser } from '../../services/auth'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // =========================================================
        // 1. AMBIL TOKEN DARI URL
        // =========================================================
        const token = searchParams.get('token')

        console.log('TOKEN:', token)

        if (!token) {
          throw new Error('Token login tidak ditemukan')
        }

        // Simpan token
        sessionStorage.setItem('siyudis_token', token)

        // =========================================================
        // 2. AMBIL DATA USER DARI BACKEND
        // =========================================================
        const API_URL = import.meta.env.VITE_API_URL

        console.log('API URL:', API_URL)

        const response = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('STATUS:', response.status)

        const result = await response.json()

        console.log('RESULT:', result)

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

        console.log('USER:', user)

        if (!user) {
          throw new Error('Data pengguna tidak ditemukan')
        }

        // =========================================================
        // 4. SIMPAN USER
        // =========================================================
        saveUser(user)

        // =========================================================
        // 5. TENTUKAN ROLE
        // =========================================================
        const getRoleName = (userData) => {
          // Jika backend mengirim:
          // role: {
          //   name: "Staf Akademik"
          // }
          if (userData?.role?.name) {
            return userData.role.name
          }

          // Jika frontend mendapatkan role sebagai string
          if (typeof userData?.role === 'string') {
            return userData.role
          }

          // Fallback jika backend hanya mengirim role_id
          if (userData?.role_id) {
            return `role_id:${userData.role_id}`
          }

          return 'mahasiswa'
        }

        const rawRole = getRoleName(user)

        console.log('RAW ROLE:', rawRole)

        const role = rawRole
          .toLowerCase()
          .trim()

        console.log('NORMALIZED ROLE:', role)

        // =========================================================
        // 6. TENTUKAN DASHBOARD
        // =========================================================
        let dashboardPath = '/dashboard'

        // ---------------------------------------------------------
        // MAHASISWA
        // ---------------------------------------------------------
        if (role === 'mahasiswa') {
          dashboardPath = '/dashboard'
        }

        // ---------------------------------------------------------
        // STAF AKADEMIK
        // ---------------------------------------------------------
        else if (
          role === 'staf akademik' ||
          role === 'staff akademik' ||
          role === 'staf administrasi' ||
          role === 'staff administrasi' ||
          role === 'admin'
        ) {
          dashboardPath = '/admin/dashboard'
        }

        // ---------------------------------------------------------
        // SUPER ADMIN
        // Super Admin tetap masuk ke area admin/staf.
        // Bukan /super-admin/dashboard.
        // ---------------------------------------------------------
        else if (
          role === 'super admin' ||
          role === 'super_admin' ||
          role === 'superadmin'
        ) {
          dashboardPath = '/admin/dashboard'
        }

        // ---------------------------------------------------------
        // KAPRODI
        // ---------------------------------------------------------
        else if (
          role === 'kaprodi' ||
          role === 'kepala program studi' ||
          role === 'kepala_prodi'
        ) {
          dashboardPath = '/kepala-prodi/dashboard'
        }

        // ---------------------------------------------------------
        // MANIT
        // ---------------------------------------------------------
        else if (role === 'manit') {
          dashboardPath = '/management/dashboard'
        }

        // ---------------------------------------------------------
        // KADEP
        // ---------------------------------------------------------
        else if (
          role === 'kadep' ||
          role === 'kepala departemen' ||
          role === 'kepala_departemen'
        ) {
          dashboardPath = '/management/dashboard'
        }

        // ---------------------------------------------------------
        // FALLBACK
        // ---------------------------------------------------------
        else {
          console.warn(
            'Role tidak dikenali:',
            rawRole
          )

          dashboardPath = '/dashboard'
        }

        console.log(
          'REDIRECT DASHBOARD:',
          dashboardPath
        )

        // =========================================================
        // 7. REDIRECT
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
          err.message || 'Login gagal'
        )
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  // =============================================================
  // ERROR SCREEN
  // =============================================================
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7FB] px-5">
        <div className="w-full max-w-md rounded-2xl border border-[#E0E7EF] bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">

          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEECEC]">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M12 16H12.01"
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                d="M10.29 3.86L1.82 18C1.64 18.31 1.55 18.66 1.55 19C1.55 20.1 2.45 21 3.55 21H20.45C21.55 21 22.45 20.1 22.45 19C22.45 18.66 22.36 18.31 22.18 18L13.71 3.86C13.54 3.58 13.3 3.35 13.01 3.19C12.72 3.03 12.4 2.95 12 2.95C11.6 2.95 11.28 3.03 10.99 3.19C10.7 3.35 10.46 3.58 10.29 3.86Z"
                stroke="#DC2626"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mt-5 text-xl font-bold text-[#111827]">
            Login gagal
          </h1>

          {/* Error */}
          <p className="mt-2 text-sm leading-6 text-[#65758B]">
            {error}
          </p>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="mt-6 rounded-xl bg-[#07548C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#063E73]"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    )
  }

  // =============================================================
  // LOADING SCREEN
  // =============================================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F7FB] px-5">
      <div className="w-full max-w-sm rounded-2xl border border-[#E0E7EF] bg-white px-8 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">

        {/* Logo / Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0F8]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07548C]">
            <span className="text-lg font-bold text-white">
              S
            </span>
          </div>
        </div>

        {/* Loading */}
        <div className="mt-7 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D5E1EC] border-t-[#07548C]" />
        </div>

        {/* Text */}
        <h1 className="mt-5 text-base font-bold text-[#111827]">
          Menyiapkan akun Anda
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#65758B]">
          Sedang mengambil data pengguna dan
          menyiapkan dashboard.
        </p>

        {/* Small indicator */}
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