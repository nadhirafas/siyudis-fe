import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  LogOut,
  ChevronDown,
  Clock3,
  FilePlus2,
  Check,
  Award,
  Pencil,
  Eye,
  ClipboardList,
  Menu,
  X,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react'

import { logout } from '../../services/auth'
import { errorMessage } from '../../services/api'
import { getActiveForm, getMyPengajuan } from '../../services/mahasiswaApi'
import { findEventObject, normalizeMyPengajuan } from '../../services/mahasiswaStatus'
import useCurrentUser from '../../hooks/useCurrentUser'
import ugmLogo from '../../assets/ugm-logo.png'

// =============================================================
// DEFAULT STATUS
// =============================================================

const DEFAULT_STATUS = {
  registrationOpen: false,
  periode: null,
  tahap1: { status: 'not_started', submittedAt: null, completedAt: null },
  tahap2: { status: 'waiting', completedAt: null },
  tahap3: { status: 'waiting', draftBAAvailable: false, studentConfirmed: false, completedAt: null },
  tahap4: { status: 'waiting', completedAt: null },
  tahap5: { status: 'waiting', completedAt: null },
  tahap6: { status: 'waiting', completedAt: null },
  tahap7: { status: 'waiting', issuedAt: null },
}

// =============================================================
// MAPPING DATA REAL DARI BACKEND KE 7 TAHAP
// =============================================================

function mapBackendToStatus(activeEvent, submission) {
  // Pendaftaran dibuka bila periode aktif DAN hari ini berada di antara tgl_buka dan tgl_tutup
  const nowMs = Date.now()
  const inWindow =
    (!activeEvent?.tgl_buka || new Date(activeEvent.tgl_buka).getTime() <= nowMs) &&
    (!activeEvent?.tgl_tutup || new Date(activeEvent.tgl_tutup).getTime() >= nowMs)
  const isEventOpen = Boolean(
    activeEvent &&
      inWindow &&
      (activeEvent.is_active === undefined ||
        activeEvent.is_active === true ||
        activeEvent.is_active === 1 ||
        activeEvent.status === 'active' ||
        activeEvent.status === 'open')
  )

  const periode = activeEvent
    ? {
        id: activeEvent.id,
        nama: activeEvent.nama_event || activeEvent.nama || 'Periode Yudisium',
        tglMulai: activeEvent.tgl_buka || activeEvent.tgl_mulai || activeEvent.tanggal_mulai || null,
        tglSelesai: activeEvent.tgl_tutup || activeEvent.tgl_selesai || activeEvent.tanggal_selesai || null,
        tglYudisium: activeEvent.tgl_yudisium || activeEvent.tanggal_yudisium || null,
      }
    : null

  if (!submission) {
    return {
      ...DEFAULT_STATUS,
      registrationOpen: isEventOpen,
      periode,
    }
  }

  const st = String(submission.status || '').toLowerCase()
  const baStatus = String(
    submission.berita_acara?.status || submission.berita_acara_status || ''
  ).toLowerCase()

  const submittedAt = submission.submitted_at || submission.created_at || null
  const verifiedAt = submission.verified_at || null
  const confirmedAt = submission.student_confirmed_at || submission.confirmed_at || null
  const kaprodiAt = submission.kaprodi_approved_at || null
  const manitAt = submission.manit_signed_at || null
  const kadepAt = submission.kadep_signed_at || null
  const issuedAt = submission.berita_acara?.issued_at || kadepAt || null

  const t1Done = st !== '' && st !== 'draft' && st !== 'not_started'
  const t2Done = [
    'verified_akademik',
    'waiting_student_confirmation',
    'student_revision_requested',
    'confirmed_by_student',
    'final_checked_akademik',
    'submitted_to_kaprodi',
    'approved_kaprodi',
    'signed_manit',
    'signed_kadep',
    'completed',
  ].includes(st)

  const draftAvailable = [
    'waiting_student_confirmation',
    'student_revision_requested',
    'confirmed_by_student',
    'final_checked_akademik',
    'submitted_to_kaprodi',
    'approved_kaprodi',
    'signed_manit',
    'signed_kadep',
    'completed',
  ].includes(st)

  const studentConfirmed = [
    'confirmed_by_student',
    'final_checked_akademik',
    'submitted_to_kaprodi',
    'approved_kaprodi',
    'signed_manit',
    'signed_kadep',
    'completed',
  ].includes(st)

  const kaprodiDone =
    ['approved_kaprodi', 'signed_manit', 'signed_kadep', 'completed'].includes(st) ||
    ['approved_kaprodi', 'signed_manit', 'signed_kadep', 'published', 'completed'].includes(baStatus)

  const manitDone =
    ['signed_manit', 'signed_kadep', 'completed'].includes(st) ||
    ['signed_manit', 'signed_kadep', 'published', 'completed'].includes(baStatus)

  const kadepDone =
    ['signed_kadep', 'completed'].includes(st) ||
    ['signed_kadep', 'published', 'completed'].includes(baStatus)

  const finalDone = st === 'completed' || ['published', 'completed', 'signed_kadep'].includes(baStatus)

  return {
    registrationOpen: isEventOpen,
    periode,
    tahap1: {
      status: t1Done ? 'completed' : 'not_started',
      submittedAt,
      completedAt: submittedAt,
    },
    tahap2: {
      status: t2Done ? 'completed' : t1Done ? 'processing' : 'waiting',
      completedAt: verifiedAt,
    },
    tahap3: {
      status: studentConfirmed ? 'completed' : draftAvailable ? 'processing' : 'waiting',
      draftBAAvailable: draftAvailable,
      studentConfirmed,
      needsRevision: st === 'student_revision_requested',
      completedAt: confirmedAt,
    },
    tahap4: {
      status: kaprodiDone ? 'completed' : studentConfirmed ? 'processing' : 'waiting',
      completedAt: kaprodiAt,
    },
    tahap5: {
      status: manitDone ? 'completed' : kaprodiDone ? 'processing' : 'waiting',
      completedAt: manitAt,
    },
    tahap6: {
      status: kadepDone ? 'completed' : manitDone ? 'processing' : 'waiting',
      completedAt: kadepAt,
    },
    tahap7: {
      status: finalDone ? 'completed' : kadepDone ? 'processing' : 'waiting',
      issuedAt,
    },
  }
}

function getCurrentStep(status) {
  if (status.tahap1.status === 'not_started') return 0
  if (status.tahap1.status !== 'completed') return 1
  if (status.tahap2.status !== 'completed') return 2
  if (status.tahap3.status !== 'completed' && !status.tahap3.studentConfirmed) return 3
  if (status.tahap4.status !== 'completed') return 4
  if (status.tahap5.status !== 'completed') return 5
  if (status.tahap6.status !== 'completed') return 6
  return 7
}

// =============================================================
// MAIN COMPONENT
// =============================================================

function StudentDashboard() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [yudisiumStatus, setYudisiumStatus] = useState(DEFAULT_STATUS)

  // Periode aktif: GET /pengajuan/active-form (endpoint mahasiswa)
  // Pengajuan sendiri: GET /pengajuan/me (404 = belum pernah mengajukan)
  const fetchDashboardData = useCallback(
    () =>
      Promise.allSettled([getActiveForm(), getMyPengajuan()])
        .then(([formRes, pengajuanRes]) => {
          if (pengajuanRes.status === 'rejected') throw pengajuanRes.reason

          const activeEvent =
            formRes.status === 'fulfilled' && formRes.value ? findEventObject(formRes.value) : null
          const submission = normalizeMyPengajuan(pengajuanRes.value)?.raw ?? null

          const mapped = mapBackendToStatus(activeEvent, submission)
          setYudisiumStatus(mapped)
          sessionStorage.setItem('siyudis_yudisium_status', JSON.stringify(mapped))
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat status yudisium dari server')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    fetchDashboardData()

    window.addEventListener('siyudis-status-updated', fetchDashboardData)
    return () => {
      window.removeEventListener('siyudis-status-updated', fetchDashboardData)
    }
  }, [fetchDashboardData])

  const handleLogout = async () => {
    await logout()
    sessionStorage.removeItem('siyudis_yudisium_status')
    setProfileOpen(false)
    navigate('/')
  }

  const displayName = user?.nama || 'Mahasiswa'
  const currentStep = getCurrentStep(yudisiumStatus)
  const hasSubmitted = yudisiumStatus.tahap1.status !== 'not_started'
  const isRegistrationOpen = Boolean(yudisiumStatus.registrationOpen)
  const finalBAAvailable = yudisiumStatus.tahap7.status === 'completed'

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR RESPONSIVE */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[272px] bg-[#063E73] text-white transition-transform duration-300 lg:z-30 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <img src={ugmLogo} alt="Logo UGM" className="h-11 w-11 object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[16px] font-bold tracking-wide">SIYUDIS</h1>
                <p className="mt-0.5 truncate text-[9px] text-white/75">
                  Departemen Teknik Elektro dan Informatika
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 h-px bg-white/30" />
        </div>

        <nav className="mt-7 px-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/dashboard')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm"
          >
            <Home size={20} strokeWidth={2} className="text-[#FFD32A]" />
            <span className="text-sm font-semibold">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/pengajuan-yudisium')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <FileText size={20} strokeWidth={1.8} />
            <span className="text-sm">Pengajuan Yudisium</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/berita-acara')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <ShieldCheck size={20} strokeWidth={1.8} />
            <span className="text-sm">Berita Acara</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/panduan')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <BookOpen size={20} strokeWidth={1.8} />
            <span className="text-sm">Panduan &amp; Dokumen</span>
          </button>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="min-h-screen lg:ml-[272px]">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex h-[72px] sm:h-[78px] items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#063E73] transition hover:bg-slate-100 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-[18px] sm:text-[23px] lg:text-[25px] font-bold leading-tight text-[#111111]">
                Dashboard Mahasiswa
              </h2>
              <p className="hidden sm:block mt-0.5 text-[12px] text-[#687588]">
                Sistem Informasi Yudisium Terpadu DTEDI SV UGM
              </p>
            </div>
          </div>

          {/* PROFILE */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
            >
              <ProfileAvatar photo={user?.avatar} name={displayName} />

              <span className="hidden md:inline max-w-[230px] truncate text-[14px] font-bold text-[#111111]">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`hidden md:block transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="absolute right-0 top-[56px] sm:top-[64px] z-50 w-[290px] sm:w-[340px] overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
                {(user?.email || user?.email_ugm) && (
                  <div className="border-b border-[#EDF0F4] px-5 py-2.5 text-center">
                    <p className="truncate text-[11px] font-medium text-[#687588]">
                      {user?.email || user?.email_ugm}
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-center px-5 pt-5 pb-5">
                  <ProfileAvatar photo={user?.avatar} name={displayName} size="large" />
                  <p className="mt-4 max-w-[260px] sm:max-w-[290px] truncate text-center text-[17px] sm:text-[18px] font-extrabold text-[#111827]">
                    {displayName}
                  </p>
                </div>

                <div className="h-px bg-[#EDF0F4]" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/profile')
                  }}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F7F9FC]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF]">
                    <UserRound size={20} strokeWidth={1.8} className="text-[#06447B]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#172033]">Profil Saya</p>
                    <p className="mt-0.5 text-[11px] text-[#7A8493]">Ubah nama dan foto profil</p>
                  </div>
                </button>

                <div className="mx-5 h-px bg-[#EDF0F4]" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFE5E5]">
                    <LogOut size={20} strokeWidth={2} className="text-[#EF4444]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-red-500">Keluar / Logout</p>
                    <p className="mt-0.5 text-[11px] text-red-400">
                      Akhiri sesi akun di perangkat ini
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="px-4 sm:px-7 py-6 sm:py-7">
          {/* WELCOME BANNER */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#174A7C] to-[#3B6498] px-6 sm:px-10 py-6 sm:py-9 text-white shadow-sm">
            <div className="absolute -right-8 -top-14 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute -right-16 top-5 h-32 w-32 rounded-full bg-white/5" />

            <div className="relative z-10">
              <h1 className="text-[22px] sm:text-[28px] lg:text-[30px] font-bold leading-tight">
                Selamat Datang, {displayName}!
              </h1>
              <p className="mt-2 sm:mt-3 text-[13px] sm:text-[16px] text-white/95">
                Pusat kendali dan layanan terpadu pendaftaran yudisium Sarjana Terapan DTEDI SV UGM.
              </p>
            </div>
          </section>

          {loadError && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="mt-6 flex min-h-[220px] items-center justify-center gap-2 rounded-2xl bg-white text-[13px] text-[#687588] shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
              <Loader2 size={16} className="animate-spin" />
              Memuat informasi yudisium...
            </div>
          ) : (
            <>
              {/* PERIODE BANNER */}
              {!hasSubmitted && (
                <PeriodeStudentBanner
                  isOpen={isRegistrationOpen}
                  periode={yudisiumStatus.periode}
                  onAction={() => navigate('/pengajuan-yudisium')}
                />
              )}

              {/* BELUM MENGAJUKAN */}
              {!hasSubmitted && (
                <InitialDashboard isRegistrationOpen={isRegistrationOpen} navigate={navigate} />
              )}

              {/* SUDAH MENGAJUKAN */}
              {hasSubmitted && (
                <>
                  <ProgressTracker
                    status={yudisiumStatus}
                    currentStep={currentStep}
                    navigate={navigate}
                    finalBAAvailable={finalBAAvailable}
                  />

                  <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <StatusCard
                      title="STATUS PENGAJUAN"
                      icon={<Clock3 size={20} strokeWidth={1.7} />}
                      heading={getApplicationHeading(yudisiumStatus)}
                      badge={getApplicationBadge(yudisiumStatus)}
                      badgeType={getApplicationBadgeType(yudisiumStatus)}
                      description={
                        yudisiumStatus.tahap1.submittedAt
                          ? `Diajukan pada ${formatDate(yudisiumStatus.tahap1.submittedAt)} • ${
                              finalBAAvailable ? 'Yudisium Selesai' : 'Sedang Diproses'
                            }`
                          : 'Pengajuan sedang diproses'
                      }
                    />

                    <StatusCard
                      title="STATUS BERITA ACARA"
                      icon={<FileText size={20} strokeWidth={1.7} />}
                      heading={getBAHeading(yudisiumStatus)}
                      badge={getBABadge(yudisiumStatus)}
                      badgeType={getBABadgeType(yudisiumStatus)}
                      description={getBADescription(yudisiumStatus)}
                    />
                  </section>
                </>
              )}

              {/* QUICK ACCESS */}
              <QuickAccess
                navigate={navigate}
                status={yudisiumStatus}
                hasSubmitted={hasSubmitted}
                isRegistrationOpen={isRegistrationOpen}
                finalBAAvailable={finalBAAvailable}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function PeriodeStudentBanner({ isOpen, periode, onAction }) {
  return (
    <section className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3.5 shadow-[0_3px_10px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] sm:mt-0">
          <Clock3 size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-[12.5px] font-bold text-[#151C2D]">
            {isOpen
              ? `${periode?.nama || 'Periode Yudisium'} sedang dibuka`
              : 'Pendaftaran Yudisium Saat Ini Sedang Ditutup'}
          </p>
          <p className="mt-0.5 text-[11px] text-[#687588]">
            {isOpen
              ? `Pendaftaran dibuka ${formatDate(periode?.tglMulai)} – ${formatDate(
                  periode?.tglSelesai
                )}, 23.59 WIB${
                  periode?.tglYudisium
                    ? `. Yudisium dilaksanakan ${formatDate(periode.tglYudisium)}.`
                    : '.'
                }`
              : 'Belum ada periode pendaftaran yudisium yang dibuka oleh Bagian Akademik DTEDI SV UGM.'}
          </p>
        </div>
      </div>

      {isOpen ? (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#03447E] px-4 py-2 text-[11.5px] font-bold text-white transition hover:bg-[#063B69] sm:self-center"
        >
          Ajukan Sekarang <span>→</span>
        </button>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-[#DCE3EB] bg-[#F1F5F9] px-3.5 py-2 text-[11px] font-semibold text-[#7A8493] sm:self-center">
          Pendaftaran Ditutup
          <Lock size={12} />
        </span>
      )}
    </section>
  )
}

function InitialDashboard({ isRegistrationOpen, navigate }) {
  return (
    <>
      <section className="mt-5 rounded-2xl bg-white px-5 sm:px-7 py-9 sm:py-11 text-center shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
        <div className="relative mx-auto mb-5 flex h-[80px] w-[80px] sm:h-[88px] sm:w-[88px] items-center justify-center rounded-[20px] border-2 border-dashed border-[#A9D0FF] bg-[#F7FBFF]">
          <FilePlus2 size={38} strokeWidth={1.8} className="text-[#06447B]" />
          <span
            className={`absolute -right-1 -top-2 h-4 w-4 rounded-full ${
              isRegistrationOpen ? 'bg-[#F59E0B]' : 'bg-[#94A3B8]'
            }`}
          />
        </div>

        <h2 className="text-[20px] sm:text-[28px] font-bold text-[#151C2D]">
          {isRegistrationOpen
            ? 'Anda Belum Memulai Pengajuan Yudisium'
            : 'Pendaftaran Yudisium Ditutup'}
        </h2>

        <p className="mx-auto mt-2 max-w-[660px] text-[13px] sm:text-[15px] leading-6 text-[#5F6B7A]">
          {isRegistrationOpen
            ? 'Lengkapi dan ajukan berkas persyaratan kelulusan Anda untuk memulai proses verifikasi yudisium.'
            : 'Periode pendaftaran yudisium saat ini sedang ditutup. Silakan pantau pengumuman resmi dari Bagian Akademik DTEDI SV UGM untuk jadwal pembukaan berikutnya.'}
        </p>

        {isRegistrationOpen ? (
          <button
            type="button"
            onClick={() => navigate('/pengajuan-yudisium')}
            className="mt-6 inline-flex items-center gap-3 rounded-xl bg-[#03447E] px-7 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#063B69]"
          >
            Mulai Pengajuan <span className="text-lg">→</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#DCE3EB] bg-[#F1F5F9] px-6 py-3 text-[13px] font-bold text-[#94A3B8]"
          >
            Pendaftaran Ditutup
            <Lock size={14} />
          </button>
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StatusCard
          title="STATUS PENGAJUAN"
          icon={<Clock3 size={20} strokeWidth={1.7} />}
          heading="Belum Ada Pengajuan"
          badge={isRegistrationOpen ? 'Belum Dimulai' : 'Pendaftaran Ditutup'}
          badgeType="neutral"
          description={
            isRegistrationOpen
              ? 'Silakan ajukan pengajuan yudisium untuk memulai proses.'
              : 'Pendaftaran sedang ditutup.'
          }
        />

        <StatusCard
          title="STATUS BERITA ACARA"
          icon={<FileText size={20} strokeWidth={1.7} />}
          heading="Belum Tersedia"
          badge={isRegistrationOpen ? 'Menunggu Pengajuan' : 'Menunggu Pendaftaran Dibuka'}
          badgeType="neutral"
          description={
            isRegistrationOpen
              ? 'Draft akan muncul setelah pengajuan diajukan.'
              : 'Draft akan muncul setelah pendaftaran dibuka dan pengajuan diajukan.'
          }
        />
      </section>
    </>
  )
}

function ProgressTracker({ status, currentStep, navigate, finalBAAvailable }) {
  const steps = [
    { number: 1, title: 'Pengajuan Yudisium', description: 'Unggah berkas persyaratan', date: status.tahap1.completedAt || status.tahap1.submittedAt },
    { number: 2, title: 'Verifikasi Pengajuan Yudisium', description: 'Staf akademik memeriksa berkas', date: status.tahap2.completedAt },
    { number: 3, title: 'Verifikasi Draft Berita Acara', description: 'Anda memeriksa data draft BA', date: status.tahap3.completedAt },
    { number: 4, title: 'Validasi Kaprodi', description: 'Review & persetujuan', date: status.tahap4.completedAt },
    { number: 5, title: 'Pengesahan Manit', description: 'TTE Manit setelah Kaprodi', date: status.tahap5.completedAt },
    { number: 6, title: 'Pengesahan Kadep', description: 'TTE Kadep setelah Manit', date: status.tahap6.completedAt },
    { number: 7, title: 'Penerbitan Berita Acara Final', description: 'Berita Acara sah TTE siap unduh', date: status.tahap7.issuedAt },
  ]

  return (
    <section className="mt-6 rounded-2xl bg-white px-4 sm:px-7 py-6 sm:py-7 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
      <div className="flex items-center gap-3 border-b border-[#E7EBF0] pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C9E0FF] bg-[#F2F8FF]">
          <ClipboardList size={18} strokeWidth={1.8} className="text-[#06447B]" />
        </div>
        <div>
          <h2 className="text-[15px] sm:text-[16px] font-bold text-[#172033]">
            Pelacakan Progres Pengajuan Yudisium
          </h2>
          <p className="mt-0.5 text-[11px] text-[#7A8493]">
            Pantau perkembangan tahapan kelulusan dan pengesahan Berita Acara secara real-time
          </p>
        </div>
      </div>

      <div className="mt-7 overflow-x-auto pb-2">
        <div className="relative min-w-[680px] px-1">
          <div className="absolute left-[7%] right-[7%] top-[20px] h-[4px] rounded-full bg-[#E5E7EB]" />
          <div
            className="absolute left-[7%] top-[20px] h-[4px] rounded-full bg-[#06447B] transition-all duration-500"
            style={{ width: currentStep <= 1 ? '0%' : `${((currentStep - 1) / 6) * 86}%` }}
          />
          <div className="relative grid grid-cols-7">
            {steps.map((step) => {
              const completed = step.number < currentStep || (step.number === 7 && finalBAAvailable)
              const active = step.number === currentStep && !completed

              return (
                <div key={step.number} className="flex min-w-0 flex-col items-center text-center">
                  <div
                    className={`relative z-10 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${
                      step.number === 7 && finalBAAvailable
                        ? 'bg-[#FDBF32] text-[#765400] ring-4 ring-[#FEF3C7]'
                        : completed
                          ? 'bg-[#06447B] text-white'
                          : active
                            ? 'border-[3.5px] border-[#06447B] bg-white text-[#06447B] ring-4 ring-[#DCEBFA]'
                            : 'bg-[#E5E7EB] text-[#566273]'
                    }`}
                  >
                    {step.number === 7 && finalBAAvailable ? (
                      <span className="text-[18px]">★</span>
                    ) : completed ? (
                      <Check size={17} strokeWidth={2.4} />
                    ) : (
                      <span className="text-[14px] font-bold">{step.number}</span>
                    )}
                  </div>

                  <p className={`mt-3 min-h-[30px] w-full max-w-[115px] px-1 text-[10.5px] font-bold leading-[14px] ${completed || active ? 'text-[#0B3158]' : 'text-[#4F5C6D]'}`}>
                    {step.title}
                  </p>
                  <p className="mt-1 min-h-[26px] w-full max-w-[115px] px-1 text-[9.5px] leading-[13px] text-[#8B95A3]">
                    {step.description}
                  </p>
                  <StepStatus step={step} completed={completed} active={active} finalBAAvailable={finalBAAvailable} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ProgressDetail status={status} currentStep={currentStep} navigate={navigate} finalBAAvailable={finalBAAvailable} />
    </section>
  )
}

function StepStatus({ step, completed, active, finalBAAvailable }) {
  if (step.number === 7 && finalBAAvailable) {
    return (
      <div className="mt-1.5 text-center">
        <p className="text-[9.5px] font-semibold text-[#059669]">✓ Selesai</p>
        {step.date && <p className="text-[9px] text-[#059669]">{formatShortDate(step.date)}</p>}
      </div>
    )
  }
  if (completed) {
    return (
      <div className="mt-1.5 text-center">
        <p className="text-[9.5px] font-semibold text-[#059669]">✓ Selesai</p>
        {step.date && <p className="text-[9px] text-[#059669]">{formatShortDate(step.date)}</p>}
      </div>
    )
  }
  if (active) {
    return <span className="mt-1.5 rounded-full bg-[#FFF0C2] px-2.5 py-0.5 text-[9px] font-bold text-[#C46A00]">Proses Aktif</span>
  }
  return <p className="mt-1.5 text-[9.5px] text-[#A3ACB8]">Menunggu</p>
}

function ProgressDetail({ status, currentStep, navigate, finalBAAvailable }) {
  if (finalBAAvailable) {
    return (
      <div className="mt-7 space-y-4">
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#ECFBF4] px-5 py-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-xl bg-[#C9F7E1]">
              <Award size={22} strokeWidth={1.8} className="text-[#047857]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-[#073B2B]">
                Berita Acara Kelulusan Telah Terbit &amp; Sah
              </h3>
              <p className="mt-1 max-w-[650px] text-[12px] leading-[19px] text-[#28634F]">
                Dokumen resmi Berita Acara kelulusan Anda telah ditandatangani secara elektronik oleh pengurus pleno departemen dan siap diunduh untuk syarat wisuda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/berita-acara')}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#03447E] px-5 py-3 text-[12.5px] font-bold text-white transition hover:bg-[#063B69]"
          >
            Unduh Berita Acara Resmi <span className="text-[16px]">→</span>
          </button>
        </div>
        <HardcopyReminderBox />
      </div>
    )
  }

  if (currentStep === 1 || currentStep === 2) {
    return <ProgressInfo icon={<ShieldCheck size={19} className="text-[#FFD32A]" />} title="Verifikasi Berkas Sedang Berlangsung" description="Pengajuan telah diterima dan sedang diperiksa oleh staf akademik sebelum Draft Berita Acara diterbitkan." />
  }
  if (currentStep === 3) {
    if (status.tahap3.draftBAAvailable) {
      return (
        <div className="mt-7 flex flex-col justify-between gap-4 rounded-xl border border-[#BCD8FF] bg-[#F8FBFF] px-4 py-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#06447B]">
              <Pencil size={18} strokeWidth={2} className="text-[#FFD32A]" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-[#172033]">Draf Berita Acara Kelulusan Siap Dikonfirmasi Mahasiswa</h3>
              <p className="mt-1 max-w-[720px] text-[11px] leading-5 text-[#687588]">Staf akademik telah menginput data kelulusan. Periksa data dengan teliti sebelum memberikan konfirmasi.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/berita-acara')}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#03447E] px-5 py-3 text-[12px] font-bold text-white transition hover:bg-[#063B69]"
          >
            <Eye size={15} strokeWidth={2} /> Tinjau Draft BAK
          </button>
        </div>
      )
    }
    return <ProgressInfo icon={<Clock3 size={19} className="text-[#FFD32A]" />} title="Menunggu Penerbitan Draft Berita Acara" description="Verifikasi berkas selesai. Staf akademik sedang menyusun Draft Berita Acara untuk Anda tinjau." />
  }
  if (currentStep === 4) {
    return <ProgressInfo icon={<ShieldCheck size={19} className="text-[#FFD32A]" />} title="Validasi Kaprodi Sedang Berlangsung" description="Berita Acara telah dikonfirmasi dan sedang direview oleh Ketua Program Studi." />
  }
  if (currentStep === 5) {
    return <ProgressInfo icon={<ShieldCheck size={19} className="text-[#FFD32A]" />} title="Menunggu Pengesahan Manajer Akademik & Kemahasiswaan (Manit)" description="Validasi Kaprodi selesai. Berita Acara menunggu Tanda Tangan Elektronik dari Manit." />
  }
  if (currentStep === 6 || currentStep === 7) {
    return <ProgressInfo icon={<Award size={19} className="text-[#FFD32A]" />} title="Menunggu Pengesahan Ketua Departemen & Penerbitan Final" description="Berita Acara sedang dalam proses penandatanganan elektronik akhir oleh Ketua Departemen." />
  }
  return null
}

function HardcopyReminderBox() {
  const items = [
    { num: '01', title: 'Pasfoto 4×6 Latar Belakang Biru (1 Lembar)', desc: 'Kemeja putih dan jas/blazer hitam resmi (bukan jas almamater), latar belakang biru tua, cetak foto studio berkualitas tajam (bukan foto ponsel atau hasil scan).' },
    { num: '02', title: 'Sertifikat Kemampuan Bahasa Inggris', desc: 'Sertifikat asli atau legalisir. Wajib melampirkan sertifikat pendamping resmi apabila skor belum memenuhi batas standar minimal yudisium.' },
    { num: '03', title: 'Formulir Checklist Judul TA / Proyek Akhir', desc: 'Lembar cetak checklist judul TA/Proyek Akhir yang telah disetujui dan ditandatangani asli oleh Dosen Pembimbing TA.' },
    { num: '04', title: 'Lembar Pengesahan Asli TA / Proyek Akhir', desc: 'Lembar pengesahan asli (1 eksemplar) bertandatangan basah dan berstempel lengkap dari tim dosen penguji, dosen pembimbing, serta Ketua Departemen.' },
  ]

  return (
    <div className="rounded-xl border border-[#F6D47A] bg-[#FFFDF7] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]">
          <AlertCircle size={18} />
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-[#78350F]">Pengingat Pengumpulan Berkas Hardcopy</h4>
          <p className="mt-0.5 text-[11px] text-[#92400E]">Mahasiswa wajib menyerahkan 4 berkas fisik cetak secara langsung ke Bagian Akademik. Abaikan jika Anda sudah menyerahkan berkas.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.num} className="flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-white p-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#FEF3C7] text-[10px] font-bold text-[#B45309]">{item.num}</span>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-[#1E293B]">{item.title}</p>
              <p className="mt-1 text-[10.5px] leading-4 text-[#64748B]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressInfo({ icon, title, description }) {
  return (
    <div className="mt-7 rounded-xl border border-[#BCD8FF] bg-[#F8FBFF] px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#06447B]">{icon}</div>
        <div>
          <h3 className="text-[13px] font-bold text-[#172033]">{title}</h3>
          <p className="mt-1 max-w-[800px] text-[11px] leading-5 text-[#687588]">{description}</p>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ title, icon, heading, badge, badgeType = 'neutral', description }) {
  const badgeStyles = {
    success: { wrapper: 'bg-[#D1FAE5] text-[#047857]', dot: 'bg-[#059669]' },
    active: { wrapper: 'bg-[#FFF3C7] text-[#C46A00]', dot: 'bg-[#F59E0B]' },
    info: { wrapper: 'bg-[#E8F1FF] text-[#2457A6]', dot: 'bg-[#2563EB]' },
    neutral: { wrapper: 'bg-[#F1F5F9] text-[#5D6C7F]', dot: 'bg-[#9BAFC4]' },
    warning: { wrapper: 'bg-[#FFF4E5] text-[#C46A00]', dot: 'bg-[#F59E0B]' },
  }
  const style = badgeStyles[badgeType] || badgeStyles.neutral

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] sm:text-[12px] font-bold tracking-wide text-[#6B7585]">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E0E6EE] text-[#607086]">{icon}</div>
      </div>
      <h3 className="mt-4 text-[19px] sm:text-[21px] font-bold text-[#111827]">{heading}</h3>
      <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold ${style.wrapper}`}>
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        {badge}
      </div>
      <div className="my-3 h-px bg-[#E6EAF0]" />
      <p className="text-[12px] text-[#687588]">{description}</p>
    </div>
  )
}

function QuickAccess({ navigate, status, hasSubmitted, isRegistrationOpen, finalBAAvailable }) {
  const draftAvailable = status.tahap3.draftBAAvailable

  return (
    <section className="mt-7">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-2 rounded-full bg-[#03447E]" />
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111827]">Akses Cepat Layanan</h2>
        </div>
        <p className="hidden sm:block text-[11px] text-[#7A8493]">Pilih layanan utama untuk mengelola yudisium</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* 1. PENGAJUAN */}
        <div className="flex min-h-[250px] flex-col rounded-2xl bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FF]">
              <FileText size={22} strokeWidth={1.8} className="text-[#06447B]" />
            </div>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${hasSubmitted ? 'border-[#A9E7CF] bg-[#ECFBF4] text-[#047857]' : isRegistrationOpen ? 'border-[#A9D5FF] bg-[#F0F7FF] text-[#07518D]' : 'border-[#DCE3EB] bg-[#F1F5F9] text-[#7A8493]'}`}>
              {hasSubmitted ? 'Sudah Mengajukan' : isRegistrationOpen ? 'Formulir Terbuka' : 'Pendaftaran Ditutup'}
            </span>
          </div>
          <h3 className="mt-5 text-[18px] font-bold">Pengajuan Yudisium</h3>
          <p className="mt-3 text-[12px] leading-5 text-[#596679]">Lengkapi dan unggah berkas persyaratan kelulusan untuk memulai proses verifikasi.</p>
          {finalBAAvailable ? (
            <button type="button" disabled className="mt-auto flex w-full cursor-default items-center justify-center rounded-xl bg-[#ECFBF4] py-3 text-[13px] font-bold text-[#047857]">
              Berkas Disetujui &amp; Selesai
            </button>
          ) : !hasSubmitted && !isRegistrationOpen ? (
            <button type="button" disabled className="mt-auto flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#DCE3EB] bg-[#F1F5F9] py-3 text-[13px] font-bold text-[#94A3B8]">
              Pendaftaran Ditutup <Lock size={14} />
            </button>
          ) : (
            <button type="button" onClick={() => navigate('/pengajuan-yudisium')} className="mt-auto flex w-full items-center justify-center gap-3 rounded-xl bg-[#03447E] py-3 text-[13px] font-bold text-white transition hover:bg-[#063B69]">
              {hasSubmitted ? 'Lihat Pengajuan' : 'Mulai Pengajuan'} <span className="text-lg">→</span>
            </button>
          )}
        </div>

        {/* 2. BERITA ACARA */}
        <div className="flex min-h-[250px] flex-col rounded-2xl bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF8E7]">
              <ShieldCheck size={22} strokeWidth={1.8} className="text-[#E89B00]" />
            </div>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${finalBAAvailable ? 'border-[#A9E7CF] bg-[#ECFBF4] text-[#047857]' : draftAvailable ? 'border-[#A9D5FF] bg-[#F0F7FF] text-[#07518D]' : 'border-[#E9E0C4] bg-[#FFFDF5] text-[#758095]'}`}>
              {finalBAAvailable ? 'Dokumen Terbit' : draftAvailable ? 'Draft Siap Ditinjau' : 'Belum Ada Draft'}
            </span>
          </div>
          <h3 className="mt-5 text-[18px] font-bold">Berita Acara</h3>
          <p className="mt-3 text-[12px] leading-5 text-[#7A8493]">
            {finalBAAvailable ? 'Unduh Berita Acara kelulusan resmi ber-Tanda Tangan Elektronik.' : draftAvailable ? 'Draft Berita Acara Kelulusan telah diterbitkan dan siap diperiksa.' : 'Draft Berita Acara Kelulusan diterbitkan otomatis setelah verifikasi berkas disetujui staf akademik.'}
          </p>
          <button
            type="button"
            disabled={!draftAvailable && !finalBAAvailable}
            onClick={() => navigate('/berita-acara')}
            className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold ${draftAvailable || finalBAAvailable ? 'bg-[#03447E] text-white transition hover:bg-[#063B69]' : 'cursor-not-allowed border border-[#DCE3EB] bg-[#F0F4F8] text-[#9BAFC4]'}`}
          >
            {finalBAAvailable ? 'Unduh Berita Acara' : draftAvailable ? 'Periksa Draft Berita Acara' : 'Belum Tersedia'}
            {(draftAvailable || finalBAAvailable) && <span className="text-lg">→</span>}
          </button>
        </div>

        {/* 3. PANDUAN */}
        <div className="flex min-h-[250px] flex-col rounded-2xl bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FF]">
              <BookOpen size={22} strokeWidth={1.8} className="text-[#06447B]" />
            </div>
            <span className="rounded-full border border-[#E0E4EA] bg-[#F6F7F8] px-3 py-1 text-[10px] font-semibold text-[#596679]">Dokumen Resmi</span>
          </div>
          <h3 className="mt-5 text-[18px] font-bold">Panduan dan Dokumen</h3>
          <p className="mt-3 text-[12px] leading-5 text-[#596679]">Akses format dokumen yang dibutuhkan untuk pengajuan yudisium.</p>
          <button type="button" onClick={() => navigate('/panduan')} className="mt-auto flex w-full items-center justify-center gap-3 rounded-xl border border-[#DCE3EB] bg-white py-3 text-[13px] font-bold text-[#26354A] transition hover:bg-[#F7F9FC]">
            Lihat Panduan &amp; Template <span className="text-lg text-[#687588]">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function getApplicationHeading(status) {
  if (status.tahap1.status !== 'not_started') return 'Pengajuan Yudisium'
  return 'Pengajuan Sedang Diproses'
}

function getApplicationBadge(status) {
  if (status.tahap7.status === 'completed') return 'Selesai & Lulus Pleno'
  if (status.tahap6.status === 'completed') return 'Pengesahan Kadep Selesai'
  if (status.tahap5.status === 'completed') return 'Tahap 6: Pengesahan Kadep'
  if (status.tahap4.status === 'completed') return 'Tahap 5: Pengesahan Manit'
  if (status.tahap3.studentConfirmed) return 'Tahap 4: Validasi Kaprodi'
  if (status.tahap3.draftBAAvailable) return 'Tahap 3: Verifikasi Draft BA'
  return 'Tahap 2: Sedang Diverifikasi Staf'
}

function getApplicationBadgeType(status) {
  if (status.tahap7.status === 'completed') return 'success'
  if (status.tahap3.draftBAAvailable) return 'info'
  return 'active'
}

function getBAHeading(status) {
  if (status.tahap7.status === 'completed') return 'Berita Acara Telah Tersedia'
  if (status.tahap3.draftBAAvailable) return 'Draft Siap Ditinjau'
  return 'Draft Belum Tersedia'
}

function getBABadge(status) {
  if (status.tahap7.status === 'completed') return 'Siap Diunduh'
  if (status.tahap3.draftBAAvailable) return 'Perlu Review Mahasiswa'
  return 'Menunggu Verifikasi Berkas'
}

function getBABadgeType(status) {
  if (status.tahap7.status === 'completed') return 'success'
  if (status.tahap3.draftBAAvailable) return 'info'
  return 'neutral'
}

function getBADescription(status) {
  if (status.tahap7.status === 'completed') return 'Berita Acara sudah tersedia'
  if (status.tahap3.draftBAAvailable) return 'Draft Berita Acara telah diterbitkan dan menunggu konfirmasi Anda.'
  return 'Draft BA diterbitkan setelah verifikasi berkas disetujui'
}

function formatDate(date) {
  if (!date) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date))
  } catch {
    return date
  }
}

function formatShortDate(date) {
  if (!date) return ''
  try {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
  } catch {
    return date
  }
}

function ProfileAvatar({ photo, name = '', size = 'small' }) {
  const [imageError, setImageError] = useState(false)
  const showPhoto = photo && !imageError
  const sizeClass = size === 'large' ? 'h-[72px] w-[72px]' : 'h-[36px] w-[36px]'
  const initial = (name || 'M').trim().charAt(0).toUpperCase()

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-[#0E8388] text-white font-bold flex items-center justify-center`}>
      {showPhoto ? (
        <img src={photo} alt="Foto profil" className="h-full w-full object-cover" onError={() => setImageError(true)} />
      ) : (
        <span className={size === 'large' ? 'text-2xl' : 'text-sm'}>{initial}</span>
      )}
    </div>
  )
}

export default StudentDashboard