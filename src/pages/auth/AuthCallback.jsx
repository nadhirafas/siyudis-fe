import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveUser, roleCategory, DASHBOARD_BY_CATEGORY } from '../../services/auth'

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

        console.log('RAW ROLE:', rawRole)

        const role = rawRole
          .toLowerCase()
          .trim()

        console.log('NORMALIZED ROLE:', role)

        // =========================================================
        // 6. TENTUKAN DASHBOARD
        // =========================================================
        const category = roleCategory(rawRole)
        let dashboardPath = DASHBOARD_BY_CATEGORY[category] || '/dashboard'

        if (!category) {
          console.warn('Role tidak dikenali:', rawRole)
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
  // ERROR SCREEN (TAMPILAN AKSES DITOLAK YANG RAPI)
  // =============================================================
  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F7FB] flex flex-col justify-between font-sans">
        <main className="flex-1 flex items-center justify-center px-5">
          <div className="w-full max-w-[550px] rounded-2xl border border-[#E0E7EF] bg-white p-10 shadow-[0_18px_40px_rgba(7,84,140,0.12)]">
            
            {/* Header Card & Badge */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[25px] leading-8 font-bold tracking-[-0.5px] text-[#111827]">
                Masuk ke SIYUDIS
              </h2>
              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FDECEC] px-3 py-1 text-[11px] font-bold text-[#C53030]">
                <span className="text-[10px]">●</span>
                Akses Ditolak
              </span>
            </div>

            <p className="mt-2 text-[13px] leading-6 text-[#65758B]">
              Satu pintu akses untuk seluruh civitas akademika DTEDI Sekolah Vokasi UGM.
            </p>

            {/* Error Box */}
            <div className="mt-5 rounded-xl border border-[#F5C6C6] bg-[#FFF5F5] px-5 py-4.5">
              <div className="flex gap-4">
                <div className="pt-0.5 shrink-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#DC2626] text-[11px] font-bold text-[#DC2626]">
                    !
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#5F1111]">
                    Autentikasi Gagal / Akses Ditolak
                  </p>

                  <p className="mt-3 text-[12px] leading-6 text-[#B42318]">
                    {error}
                  </p>

                  <div className="my-3 h-px bg-[#F5C6C6]" />

                  <p className="text-[11px] text-[#B42318]">
                    Ketentuan domain akun SIYUDIS:
                  </p>

                  <p className="mt-1 text-[12px] leading-5 font-semibold text-[#6B1111]">
                    Menggunakan akun Google dengan domain @ugm.ac.id / @mail.ugm.ac.id
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Coba Lagi */}
            <button
              type="button"
              onClick={() => navigate('/LoginPage', { replace: true })}
              className="w-full mt-6 h-14 rounded-xl border border-[#D9E2EC] bg-white flex items-center justify-center gap-2 text-[15px] font-semibold text-[#26354A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition duration-200 hover:bg-[#FAFCFE] hover:border-[#C8D5E2]"
            >
              <span>Coba Masuk dengan Akun UGM Lain</span>
            </button>
          </div>
        </main>
      </div>
    )
  }

  // =============================================================
  // LOADING SCREEN
  // =============================================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F7FB] px-5">
      <div className="w-full max-w-sm rounded-2xl border border-[#E0E7EF] bg-white px-8 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
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