import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loginWithGoogle } from '../../services/auth'

export default function LoginPage({ initialError = '' }) {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('default')
  const [error, setError] = useState('')

  // Menangkap pesan error dari URL atau prop (misal: redirect /?error=... atau dari AuthCallback)
  useEffect(() => {
    const errorParam = searchParams.get('error') || initialError
    if (errorParam) {
      setError(errorParam)
      setStatus('denied')
    }
  }, [searchParams, initialError])

  const handleGoogleLogin = async () => {
    try {
      setStatus('loading')
      setError('')

      await loginWithGoogle()
    } catch (err) {
      console.error('Google login error:', err)
      setStatus('denied')
      setError(err?.message || '')
    }
  }

  const handleTryAgain = () => {
    setStatus('default')
    setError('')
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F7FB] flex flex-col">
      {/* ================= MAIN ================= */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* ================= LEFT ================= */}
            <section className="min-w-0">
              {/* SIYUDIS BRAND */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-5 sm:mb-7">
                <span className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.8px] text-[#07548C]">
                  SIYUDIS
                </span>

                <div className="h-5 sm:h-6 w-px bg-[#C8D3DF]" />

                <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#DCE8F3] text-[10px] sm:text-[11px] font-bold tracking-wide text-[#07548C] max-w-full break-words">
                  SISTEM INFORMASI YUDISIUM TERPADU
                </span>
              </div>

              {/* TITLE */}
              <h1 className="max-w-[570px] text-[26px] sm:text-[34px] lg:text-[38px] leading-[1.15] lg:leading-[1.08] font-extrabold tracking-[-0.8px] lg:tracking-[-1px] text-[#101B30] break-words">
                Departemen Teknik Elektro &amp; Informatika
              </h1>

              {/* SUBTITLE */}
              <p className="mt-3 sm:mt-4 text-[15px] sm:text-[18px] lg:text-[19px] leading-6 sm:leading-7 text-[#526780]">
                Sekolah Vokasi • Universitas Gadjah Mada
              </p>

              {/* DESCRIPTION */}
              <p className="mt-4 sm:mt-6 max-w-[580px] text-[13px] sm:text-[14px] leading-6 text-[#657B95]">
                Layanan administrasi dan verifikasi kelulusan terintegrasi
                untuk mahasiswa sarjana terapan DTEDI SV UGM.
              </p>
            </section>

            {/* ================= RIGHT ================= */}
            <section className="min-w-0">
              <div className="w-full max-w-[550px] mx-auto lg:ml-auto lg:mr-0 rounded-2xl border border-[#E0E7EF] bg-white p-5 sm:p-8 lg:p-10 shadow-[0_18px_40px_rgba(7,84,140,0.12)]">
                {/* ================= CARD HEADER ================= */}
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <h2 className="text-[20px] sm:text-[25px] leading-7 sm:leading-8 font-bold tracking-[-0.4px] text-[#111827]">
                    Masuk ke SIYUDIS
                  </h2>

                  {/* BADGE DENIED */}
                  {status === 'denied' && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FDECEC] px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-[11px] font-bold text-[#C53030]">
                      <span className="text-[9px]">●</span>
                      Akses Ditolak
                    </span>
                  )}
                </div>

                {/* CARD DESCRIPTION */}
                <p className="mt-2 max-w-[500px] text-[12.5px] sm:text-[13px] leading-5 sm:leading-6 text-[#65758B]">
                  Satu pintu akses untuk seluruh civitas akademika DTEDI
                  Sekolah Vokasi UGM.
                </p>

                {/* ================= DEFAULT ================= */}
                {status === 'default' && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="
                        w-full
                        mt-6 sm:mt-8
                        min-h-12 sm:h-14
                        px-4
                        rounded-xl
                        border
                        border-[#D9E2EC]
                        bg-white
                        flex
                        items-center
                        justify-center
                        gap-3 sm:gap-4
                        text-[14px] sm:text-[16px]
                        font-semibold
                        text-[#1F2937]
                        shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                        transition
                        duration-200
                        hover:bg-[#FAFCFE]
                        hover:border-[#C8D5E2]
                        hover:shadow-[0_3px_8px_rgba(0,0,0,0.08)]
                        active:scale-[0.99]
                      "
                    >
                      <GoogleIcon />

                      <span className="text-center leading-snug">
                        Masuk dengan Akun Google UGM
                      </span>
                    </button>

                    <p className="mt-3 px-1 sm:px-4 text-center text-[11.5px] sm:text-[12px] leading-5 text-[#91A4BB]">
                      Gunakan akun Google Workspace UGM{' '}
                      <span className="text-[#65758B]">
                        (@mail.ugm.ac.id)
                      </span>
                      . Peran akun akan dikenali secara otomatis oleh sistem.
                    </p>
                  </>
                )}

                {/* ================= LOADING ================= */}
                {status === 'loading' && (
                  <>
                    {/* PROGRESS BAR */}
                    <div className="mt-6 sm:mt-8 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF3F8]">
                      <div className="h-full w-3/5 rounded-full bg-[#07548C] animate-pulse" />
                    </div>

                    {/* LOADING BOX */}
                    <div className="mt-4 sm:mt-5 flex min-h-12 sm:h-14 px-4 items-center justify-center gap-3 sm:gap-4 rounded-xl border border-[#D9E2EC] bg-white text-[13.5px] sm:text-[15px] font-semibold text-[#1D4F7D] shadow-sm">
                      <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-4 border-[#D5E1EC] border-t-[#07548C]" />

                      <span className="text-center leading-snug">
                        Menghubungkan ke Akun Google UGM...
                      </span>
                    </div>

                    {/* INFORMATION BOX */}
                    <div className="mt-4 sm:mt-5 rounded-xl border border-[#D5E6F7] bg-[#EFF6FD] p-3.5 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#07548C]" />

                        <div className="min-w-0">
                          <p className="text-[13px] sm:text-[14px] font-semibold text-[#26354A]">
                            Memverifikasi identitas civitas akademika DTEDI SV UGM...
                          </p>

                          <p className="mt-1 text-[11.5px] sm:text-[12px] leading-5 text-[#65758B]">
                            Sistem SSO sedang memeriksa hak akses dan role
                            akun Anda. Anda akan dialihkan secara otomatis
                            setelah autentikasi berhasil.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* WARNING */}
                    <p className="mt-5 sm:mt-6 text-[11.5px] sm:text-[12px] text-[#65758B]">
                      ⚠ Jangan menutup jendela peramban saat proses
                      otentikasi berlangsung.
                    </p>
                  </>
                )}

                {/* ================= DENIED ================= */}
                {status === 'denied' && (
                  <>
                    {/* ERROR BOX */}
                    <div className="mt-5 rounded-xl border border-[#F5C6C6] bg-[#FFF5F5] px-4 sm:px-5 py-4">
                      <div className="flex gap-3 sm:gap-4">
                        {/* INFO ICON */}
                        <div className="pt-0.5 shrink-0">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#DC2626] text-[11px] font-bold text-[#DC2626]">
                            !
                          </div>
                        </div>

                        {/* ERROR CONTENT */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] sm:text-[14px] font-bold text-[#5F1111]">
                            Autentikasi Gagal / Akses Ditolak
                          </p>

                          <p className="mt-2 text-[12px] leading-5 sm:leading-6 text-[#B42318] break-words">
                            {error ||
                              'Akun Google yang Anda pilih bukan merupakan akun resmi Google Workspace UGM.'}
                          </p>

                          {/* DIVIDER */}
                          <div className="my-3 h-px bg-[#F5C6C6]" />

                          <p className="text-[11px] text-[#B42318]">
                            Ketentuan domain akun SIYUDIS:
                          </p>

                          <p className="mt-1 text-[12px] leading-5 font-semibold text-[#6B1111] break-words">
                            Menggunakan akun Google dengan domain{' '}
                            @ugm.ac.id / @mail.ugm.ac.id
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* TRY AGAIN BUTTON */}
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="
                        w-full
                        mt-5 sm:mt-6
                        min-h-12 sm:h-14
                        px-4
                        rounded-xl
                        border
                        border-[#D9E2EC]
                        bg-white
                        flex
                        items-center
                        justify-center
                        gap-3 sm:gap-4
                        text-[13.5px] sm:text-[15px]
                        font-semibold
                        text-[#26354A]
                        shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                        transition
                        duration-200
                        hover:bg-[#FAFCFE]
                        hover:border-[#C8D5E2]
                      "
                    >
                      <GoogleIcon />

                      <span className="text-center leading-snug">
                        Coba Masuk dengan Akun UGM Lain
                      </span>
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="min-h-12 py-3 shrink-0 border-t border-[#DCE3EA] bg-white">
        <div className="flex h-full w-full max-w-[1200px] mx-auto items-center px-4 sm:px-6 lg:px-8">
          <p className="text-[11.5px] sm:text-[12px] leading-5 text-[#65758B]">
            © 2026 Departemen Teknik Elektro dan Informatika,
            Sekolah Vokasi UGM
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ================= GOOGLE ICON ================= */
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.21z"
      />

      <path
        fill="#34A853"
        d="M12 21.83c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.83z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.92A5.86 5.86 0 0 1 6.23 12c0-.67.12-1.32.31-1.92V7.55H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.45l3.24-2.53z"
      />

      <path
        fill="#EA4335"
        d="M12 6.05c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.15 14.63 2.17 12 2.17a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.77 9.46 6.05 12 6.05z"
      />
    </svg>
  )
}