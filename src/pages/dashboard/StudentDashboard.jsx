import { useEffect, useState } from 'react'

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
  Circle,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'


// =============================================================
// DEFAULT STATUS
// =============================================================

const DEFAULT_STATUS = {
  tahap1: {
    status: 'not_started',
    submittedAt: null,
  },

  tahap2: {
    status: 'waiting',
    draftBAAvailable: false,
    studentConfirmed: false,
    completedAt: null,
  },

  tahap3: {
    status: 'waiting',
    validatedAt: null,
  },

  tahap4: {
    status: 'waiting',
    approvedAt: null,
  },

  tahap5: {
    status: 'waiting',
    issuedAt: null,
  },
}


// =============================================================
// GET STATUS DARI SESSION STORAGE
// =============================================================

function getStoredStatus() {
  try {
    const stored = sessionStorage.getItem(
      'siyudis_yudisium_status'
    )

    if (!stored) {
      return DEFAULT_STATUS
    }

    const parsed = JSON.parse(stored)

    return {
      ...DEFAULT_STATUS,
      ...parsed,
      tahap1: {
        ...DEFAULT_STATUS.tahap1,
        ...parsed.tahap1,
      },
      tahap2: {
        ...DEFAULT_STATUS.tahap2,
        ...parsed.tahap2,
      },
      tahap3: {
        ...DEFAULT_STATUS.tahap3,
        ...parsed.tahap3,
      },
      tahap4: {
        ...DEFAULT_STATUS.tahap4,
        ...parsed.tahap4,
      },
      tahap5: {
        ...DEFAULT_STATUS.tahap5,
        ...parsed.tahap5,
      },
    }
  } catch {
    return DEFAULT_STATUS
  }
}


// =============================================================
// TENTUKAN TAHAP AKTIF
// =============================================================

function getCurrentStep(status) {
  if (status.tahap1.status === 'not_started') {
    return 0
  }

  if (status.tahap1.status !== 'completed') {
    return 1
  }

  if (
    status.tahap2.status !== 'completed' &&
    !status.tahap2.studentConfirmed
  ) {
    return 2
  }

  if (status.tahap3.status !== 'completed') {
    return 3
  }

  if (status.tahap4.status !== 'completed') {
    return 4
  }

  if (status.tahap5.status !== 'completed') {
    return 5
  }

  return 5
}


// =============================================================
// MAIN COMPONENT
// =============================================================

function StudentDashboard() {
  const navigate = useNavigate()

  // =========================================================
  // USER
  // =========================================================
  
  const [user] = useState(() => getUser())

  const [profileOpen, setProfileOpen] = useState(false)

  // =========================================================
  // YUDISIUM STATUS
  // =========================================================

  const [yudisiumStatus, setYudisiumStatus] = useState(
    getStoredStatus
  )

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  useEffect(() => {
    const refreshStatus = () => {
      setYudisiumStatus(getStoredStatus())
    }

    window.addEventListener(
      'siyudis-status-updated',
      refreshStatus
    )

    window.addEventListener(
      'storage',
      refreshStatus
    )

    return () => {
      window.removeEventListener(
        'siyudis-status-updated',
        refreshStatus
      )

      window.removeEventListener(
        'storage',
        refreshStatus
      )
    }
  }, [])

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

  // =========================================================
  // DISPLAY NAME
  // =========================================================

  const displayName = user?.nama || 'Mahasiswa'

  if (!user) {
    return null
  }

  const currentStep = getCurrentStep(yudisiumStatus)

  const hasSubmitted =
    yudisiumStatus.tahap1.status !== 'not_started'

  const finalBAAvailable =
    yudisiumStatus.tahap5.status === 'completed'


  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-30 h-screen w-[272px] bg-[#063E73] text-white">

        {/* LOGO */}

        <div className="px-5 pt-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <img
                src={ugmLogo}
                alt="Logo UGM"
                className="h-12 w-12 object-contain"
              />
            </div>

            <div className="min-w-0">

              <h1 className="text-[16px] font-bold tracking-wide">
                SIYUDIS
              </h1>

              <p className="mt-0.5 whitespace-nowrap text-[9px] text-white/75">
                Departemen Teknik Elektro dan Informatika
              </p>

            </div>

          </div>

          <div className="mt-7 h-px bg-white/30" />

        </div>


        {/* NAVIGATION */}

        <nav className="mt-8 px-4">

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="
              flex
              h-[43px]
              w-full
              items-center
              gap-4
              rounded-xl
              bg-[#2D628F]
              px-4
              text-left
              shadow-sm
            "
          >
            <Home
              size={20}
              strokeWidth={2}
              className="text-[#FFD32A]"
            />

            <span className="text-sm font-semibold">
              Dashboard
            </span>

          </button>


          {/* PENGAJUAN */}

          <button
            type="button"
            onClick={() => navigate('/pengajuan-yudisium')}
            className="
              mt-2
              flex
              h-[43px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-left
              text-white/65
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <FileText
              size={20}
              strokeWidth={1.8}
            />

            <span className="text-sm">
              Pengajuan Yudisium
            </span>

          </button>


          {/* BERITA ACARA */}

          <button
            type="button"
            onClick={() => navigate('/berita-acara')}
            className="
              mt-2
              flex
              h-[43px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-left
              text-white/65
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <ShieldCheck
              size={20}
              strokeWidth={1.8}
            />

            <span className="text-sm">
              Berita Acara
            </span>

          </button>


          {/* PANDUAN */}

          <button
            type="button"
            onClick={() => navigate('/panduan')}
            className="
              mt-2
              flex
              h-[43px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-left
              text-white/65
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <BookOpen
              size={20}
              strokeWidth={1.8}
            />

            <span className="text-sm">
              Panduan &amp; Dokumen
            </span>

          </button>

        </nav>

      </aside>


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="ml-[272px] min-h-screen">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            relative
            z-20
            flex
            h-[78px]
            items-center
            justify-between
            bg-white
            px-8
          "
        >

          <div>

            <h2 className="text-[25px] font-bold leading-tight text-[#111111]">
              Dashboard Mahasiswa
            </h2>

            <p className="mt-1 text-[12px] text-[#687588]">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>

          </div>


          {/* PROFILE */}
          <button
            type="button"
            onClick={() =>
              setProfileOpen((current) => !current)
            }
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-2
              transition
              hover:bg-gray-50
            "
          >
            <ProfileAvatar photo={user?.avatar} />

            <span className="max-w-[250px] truncate text-[14px] font-bold text-[#111111]">
              {displayName}
            </span>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`
                transition-transform
                ${profileOpen ? 'rotate-180' : ''}
              `}
            />
          </button>


          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div
              className="
                absolute
                right-7
                top-[70px]
                z-50
                w-[340px]
                overflow-hidden
                rounded-2xl
                border
                border-[#E1E7EF]
                bg-white
                shadow-[0_18px_45px_rgba(0,0,0,0.15)]
              "
            >

              {/* PROFILE HEADER */}
              <div
                className="
                  flex
                  flex-col
                  items-center
                  px-5
                  pt-6
                  pb-5
                "
              >
                {/* FOTO PROFIL */}
              <ProfileAvatar
                photo={user?.avatar}
                size="large"
              />

                {/* NAMA LENGKAP */}
                <p
                  className="
                    mt-4
                    max-w-[290px]
                    truncate
                    text-center
                    text-[18px]
                    font-extrabold
                    text-[#111827]
                  "
                >
                  {displayName}
                </p>
              </div>

              {/* PEMBATAS */}
              <div className="h-px bg-[#EDF0F4]" />

              {/* PROFIL SAYA */}
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/profile')
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-4
                  px-5
                  py-4
                  text-left
                  transition
                  hover:bg-[#F7F9FC]
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EEF5FF]
                  "
                >
                  <UserRound
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#06447B]"
                  />
                </div>

                <div>
                  <p className="text-[13px] font-bold text-[#172033]">
                    Profil Saya
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#7A8493]">
                    Ubah nama dan foto profil
                  </p>
                </div>
              </button>

              {/* PEMBATAS */}
              <div className="mx-5 h-px bg-[#EDF0F4]" />

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-4
                  px-5
                  py-4
                  text-left
                  transition
                  hover:bg-red-50
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#FFE5E5]
                  "
                >
                  <LogOut
                    size={20}
                    strokeWidth={2}
                    className="text-[#EF4444]"
                  />
                </div>

                <div>
                  <p className="text-[13px] font-bold text-red-500">
                    Keluar / Logout
                  </p>

                  <p className="mt-0.5 text-[11px] text-red-400">
                    Akhiri sesi akun di perangkat ini
                  </p>
                </div>
              </button>

            </div>
          )}
        </header>


        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="px-7 py-7">

          {/* =================================================
              WELCOME
          ================================================= */}

          <section
            className="
              relative
              overflow-hidden
              rounded-2xl
              bg-gradient-to-r
              from-[#174A7C]
              to-[#3B6498]
              px-10
              py-9
              text-white
              shadow-sm
            "
          >

            <div
              className="
                absolute
                -right-8
                -top-14
                h-32
                w-32
                rounded-full
                bg-white/5
              "
            />

            <div
              className="
                absolute
                -right-16
                top-5
                h-32
                w-32
                rounded-full
                bg-white/5
              "
            />

            <div className="relative z-10">

              <h1 className="text-[28px] font-bold leading-tight md:text-[30px]">
                Selamat Datang, {user?.nama || 'Mahasiswa'}
              </h1>

              <p className="mt-3 text-[16px] text-white/95">
                Pusat kendali dan layanan terpadu pendaftaran
                yudisium Sarjana Terapan DTEDI SV UGM.
              </p>

            </div>

          </section>


          {/* =================================================
              BELUM MENGAJUKAN
          ================================================= */}

          {!hasSubmitted && (

            <InitialDashboard
              navigate={navigate}
            />

          )}


          {/* =================================================
              SUDAH MENGAJUKAN
          ================================================= */}

          {hasSubmitted && (

            <>

              <ProgressTracker
                status={yudisiumStatus}
                currentStep={currentStep}
                navigate={navigate}
                finalBAAvailable={finalBAAvailable}
              />


              <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                <StatusCard
                  title="STATUS PENGAJUAN"
                  icon={
                    <Clock3
                      size={20}
                      strokeWidth={1.7}
                    />
                  }
                  heading={getApplicationHeading(yudisiumStatus)}
                  badge={getApplicationBadge(yudisiumStatus)}
                  badgeType={getApplicationBadgeType(yudisiumStatus)}
                  description={
                    yudisiumStatus.tahap1.submittedAt
                      ? `Diajukan pada ${formatDate(
                          yudisiumStatus.tahap1.submittedAt
                        )}`
                      : 'Pengajuan sedang diproses'
                  }
                />


                <StatusCard
                  title="STATUS BERITA ACARA"
                  icon={
                    <FileText
                      size={20}
                      strokeWidth={1.7}
                    />
                  }
                  heading={getBAHeading(yudisiumStatus)}
                  badge={getBABadge(yudisiumStatus)}
                  badgeType={getBABadgeType(yudisiumStatus)}
                  description={getBADescription(yudisiumStatus)}
                />

              </section>

            </>

          )}


          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <QuickAccess
            navigate={navigate}
            status={yudisiumStatus}
            hasSubmitted={hasSubmitted}
          />

        </main>

      </div>

    </div>
  )
}


// =============================================================
// INITIAL DASHBOARD
// =============================================================

function InitialDashboard({ navigate }) {

  return (
    <>

      <section
        className="
          mt-6
          rounded-2xl
          bg-white
          px-7
          py-11
          text-center
          shadow-[0_5px_15px_rgba(0,0,0,0.07)]
        "
      >

        <div
          className="
            relative
            mx-auto
            mb-6
            flex
            h-[88px]
            w-[88px]
            items-center
            justify-center
            rounded-[20px]
            border-2
            border-dashed
            border-[#A9D0FF]
            bg-[#F7FBFF]
          "
        >

          <FilePlus2
            size={40}
            strokeWidth={1.8}
            className="text-[#06447B]"
          />

          <span
            className="
              absolute
              -right-1
              -top-2
              h-4
              w-4
              rounded-full
              bg-[#F59E0B]
            "
          />

        </div>


        <h2 className="text-[28px] font-bold text-[#151C2D]">
          Anda Belum Memulai Pengajuan Yudisium
        </h2>

        <p className="mt-2 text-[15px] text-[#5F6B7A]">
          Lengkapi dan ajukan berkas persyaratan kelulusan
          Anda untuk memulai proses verifikasi.
        </p>


        <button
          type="button"
          onClick={() => navigate('/pengajuan-yudisium')}
          className="
            mt-6
            inline-flex
            items-center
            gap-3
            rounded-xl
            bg-[#03447E]
            px-7
            py-3
            text-[14px]
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-[#063B69]
          "
        >

          Mulai Pengajuan

          <span className="text-lg">
            →
          </span>

        </button>

      </section>


      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <StatusCard
          title="STATUS PENGAJUAN"
          icon={
            <Clock3
              size={20}
              strokeWidth={1.7}
            />
          }
          heading="Belum Ada Pengajuan"
          badge="Belum Dimulai"
          badgeType="neutral"
          description="Silakan ajukan pengajuan yudisium untuk memulai proses."
        />

        <StatusCard
          title="STATUS BERITA ACARA"
          icon={
            <FileText
              size={20}
              strokeWidth={1.7}
            />
          }
          heading="Belum Tersedia"
          badge="Menunggu Pengajuan"
          badgeType="neutral"
          description="Draft akan muncul setelah pengajuan diajukan."
        />

      </section>

    </>
  )
}


// =============================================================
// PROGRESS TRACKER
// =============================================================

function ProgressTracker({
  status,
  currentStep,
  navigate,
  finalBAAvailable,
}) {

  const steps = [
    {
      number: 1,
      title: 'Pengajuan Yudisium',
      description: 'Pengajuan Yudisium',
      data: status.tahap1,
    },

    {
      number: 2,
      title: 'Verifikasi dan Berita Acara',
      description: 'Cek Draft BA Kelulusan',
      data: status.tahap2,
    },

    {
      number: 3,
      title: 'Validasi Kaprodi',
      description: 'Review & Persetujuan',
      data: status.tahap3,
    },

    {
      number: 4,
      title: 'Pengesahan Pleno',
      description: 'TTE Paralel Manit & Kadep',
      data: status.tahap4,
    },

    {
      number: 5,
      title: 'Penerbitan Berita Acara Final',
      description: 'Berita Acara Sah TTE Siap Unduh',
      data: status.tahap5,
    },
  ]


  return (
    <section
      className="
        mt-6
        rounded-2xl
        bg-white
        px-7
        py-7
        shadow-[0_5px_15px_rgba(0,0,0,0.07)]
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center gap-3 border-b border-[#E7EBF0] pb-4">

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-[#C9E0FF]
            bg-[#F2F8FF]
          "
        >
          <ClipboardList
            size={18}
            strokeWidth={1.8}
            className="text-[#06447B]"
          />
        </div>

        <div>

          <h2 className="text-[16px] font-bold text-[#172033]">
            Pelacakan Progres Pengajuan Yudisium
          </h2>

          <p className="mt-0.5 text-[11px] text-[#7A8493]">
            Pantau perkembangan tahapan kelulusan dan pengesahan Berita Acara secara real-time
          </p>

        </div>

      </div>


      {/* =====================================================
          TRACKER
      ===================================================== */}

      <div className="mt-8 px-1">

        <div className="relative">

          {/* BASE LINE */}

          <div
            className="
              absolute
              left-[8%]
              right-[8%]
              top-[22px]
              h-[5px]
              rounded-full
              bg-[#E5E7EB]
            "
          />


          {/* ACTIVE LINE */}

          <div
            className="
              absolute
              left-[8%]
              top-[22px]
              h-[5px]
              rounded-full
              bg-[#06447B]
              transition-all
              duration-500
            "
            style={{
              width:
                currentStep <= 1
                  ? '0%'
                  : `${((currentStep - 1) / 4) * 84}%`,
            }}
          />


          <div className="relative grid grid-cols-5">

            {steps.map((step) => {

              const completed =
                step.number < currentStep ||
                (
                  step.number === 5 &&
                  finalBAAvailable
                )

              const active =
                step.number === currentStep &&
                !completed


              return (
                <div
                  key={step.number}
                  className="
                    flex
                    min-w-0
                    flex-col
                    items-center
                    text-center
                  "
                >

                  {/* CIRCLE */}

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-[44px]
                      w-[44px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full

                      ${
                        step.number === 5 && finalBAAvailable
                          ? 'bg-[#FDBF32] text-[#765400]'
                          : completed
                            ? 'bg-[#06447B] text-white'
                            : active
                              ? 'border-[4px] border-[#06447B] bg-white text-[#06447B] ring-4 ring-[#DCEBFA]'
                              : 'bg-[#E5E7EB] text-[#566273]'
                      }
                    `}
                  >

                    {step.number === 5 && finalBAAvailable ? (

                      <span className="text-[20px]">
                        ★
                      </span>

                    ) : completed ? (

                      <Check
                        size={18}
                        strokeWidth={2.3}
                      />

                    ) : (

                      <span className="text-[16px] font-bold">
                        {step.number}
                      </span>

                    )}

                  </div>


                  {/* TITLE */}

                  <p
                    className={`
                      mt-3
                      min-h-[32px]
                      w-full
                      max-w-[155px]
                      px-1
                      text-[11px]
                      font-bold
                      leading-[15px]

                      ${
                        completed || active
                          ? 'text-[#0B3158]'
                          : 'text-[#4F5C6D]'
                      }
                    `}
                  >
                    {step.title}
                  </p>


                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-1
                      min-h-[15px]
                      w-full
                      max-w-[155px]
                      px-1
                      text-[10px]
                      leading-[14px]
                      text-[#8B95A3]
                    "
                  >
                    {step.description}
                  </p>


                  {/* STATUS */}

                  <StepStatus
                    step={step}
                    completed={completed}
                    active={active}
                    finalBAAvailable={finalBAAvailable}
                  />

                </div>
              )
            })}

          </div>

        </div>

      </div>


      {/* =====================================================
          DETAIL TAHAP AKTIF
      ===================================================== */}

      <ProgressDetail
        status={status}
        currentStep={currentStep}
        navigate={navigate}
        finalBAAvailable={finalBAAvailable}
      />

    </section>
  )
}


// =============================================================
// STEP STATUS
// =============================================================

function StepStatus({
  step,
  completed,
  active,
  finalBAAvailable,
}) {

  if (
    step.number === 5 &&
    finalBAAvailable
  ) {
    return (
      <span
        className="
          mt-1
          whitespace-nowrap
          rounded-full
          bg-[#FFE4A3]
          px-2.5
          py-1
          text-[9px]
          font-bold
          text-[#765400]
        "
      >
        ✓ Terbit &amp; Sah • 4 April 2026
      </span>
    )
  }


  if (completed) {

    const dates = {
      1: '18 Maret 2026',
      2: '22 Maret 2026',
      3: '27 Maret 2026',
      4: '1 April 2026',
    }

    return (
      <p className="mt-1 text-[10px] font-semibold text-[#059669]">
        ✓ Selesai • {dates[step.number]}
      </p>
    )
  }


  if (active) {

    return (
      <span
        className="
          mt-1
          rounded-full
          bg-[#FFF0C2]
          px-2.5
          py-1
          text-[9px]
          font-bold
          text-[#C46A00]
        "
      >
        Proses Aktif
      </span>
    )
  }


  return (
    <p className="mt-1 text-[10px] text-[#A3ACB8]">
      Menunggu
    </p>
  )
}


// =============================================================
// DETAIL PROGRESS
// =============================================================

function ProgressDetail({
  status,
  currentStep,
  navigate,
  finalBAAvailable,
}) {

  // ===========================================================
  // FINAL
  // ===========================================================

  if (finalBAAvailable) {

    return (
      <div
        className="
          mt-8
          flex
          items-center
          justify-between
          gap-6
          rounded-xl
          bg-[#ECFBF4]
          px-5
          py-5
        "
      >

        <div className="flex min-w-0 items-start gap-4">

          <div
            className="
              flex
              h-[43px]
              w-[43px]
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#C9F7E1]
            "
          >
            <Award
              size={22}
              strokeWidth={1.8}
              className="text-[#047857]"
            />
          </div>


          <div className="min-w-0">

            <h3 className="text-[15px] font-bold text-[#073B2B]">
              Berita Acara Kelulusan Telah Terbit &amp; Sah
            </h3>

            <p className="mt-1 max-w-[650px] text-[12px] leading-[19px] text-[#28634F]">
              Dokumen resmi Berita Acara Kelulusan telah
              ditandatangani secara elektronik dan siap
              diunduh untuk syarat wisuda.
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={() => navigate('/berita-acara')}
          className="
            flex
            shrink-0
            items-center
            gap-3
            rounded-xl
            bg-[#03447E]
            px-5
            py-3
            text-[13px]
            font-bold
            text-white
            transition
            hover:bg-[#063B69]
          "
        >

          Unduh Berita Acara Resmi

          <span className="text-[18px]">
            →
          </span>

        </button>

      </div>
    )
  }


  // ===========================================================
  // TAHAP 1
  // ===========================================================

  if (currentStep === 1) {

    return (
      <ProgressInfo
        icon={
          <FileText
            size={19}
            className="text-[#FFD32A]"
          />
        }
        title="Pengajuan Yudisium Sedang Diproses"
        description="Pengajuan telah dikirim. Berkas sedang menunggu proses verifikasi oleh staf akademik."
      />
    )
  }


  // ===========================================================
  // TAHAP 2
  // ===========================================================

  if (currentStep === 2) {

    if (status.tahap2.draftBAAvailable) {

      return (
        <div
          className="
            mt-8
            rounded-xl
            border
            border-[#BCD8FF]
            bg-[#F8FBFF]
            px-4
            py-4
          "
        >

          <div className="flex items-start gap-4">

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#06447B]
              "
            >
              <Pencil
                size={18}
                strokeWidth={2}
                className="text-[#FFD32A]"
              />
            </div>


            <div className="flex-1">

              <h3 className="text-[13px] font-bold text-[#172033]">
                Draf Berita Acara Kelulusan Siap Dikonfirmasi Mahasiswa
              </h3>

              <p className="mt-1 max-w-[720px] text-[11px] leading-5 text-[#687588]">
                Staf akademik telah menginput data kelulusan.
                Periksa data dengan teliti sebelum memberikan
                konfirmasi.
              </p>

            </div>


            <button
              type="button"
              onClick={() => navigate('/berita-acara')}
              className="
                mt-1
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-[#03447E]
                px-5
                py-3
                text-[12px]
                font-bold
                text-white
                transition
                hover:bg-[#063B69]
              "
            >

              <Eye
                size={15}
                strokeWidth={2}
              />

              Tinjau Draft BAK

            </button>

          </div>

        </div>
      )
    }


    return (
      <ProgressInfo
        icon={
          <ShieldCheck
            size={19}
            className="text-[#FFD32A]"
          />
        }
        title="Verifikasi Berkas Sedang Berlangsung"
        description="Pengajuan telah diterima dan sedang diperiksa oleh staf akademik sebelum Draft Berita Acara diterbitkan."
      />
    )
  }


  // ===========================================================
  // TAHAP 3
  // ===========================================================

  if (currentStep === 3) {

    if (status.tahap3.status === 'review') {

      return (
        <ProgressInfo
          icon={
            <ShieldCheck
              size={19}
              className="text-[#FFD32A]"
            />
          }
          title="Validasi Kaprodi Sedang Berlangsung"
          description="Berita Acara sedang direview dan menunggu persetujuan Kaprodi."
        />
      )
    }


    if (status.tahap3.status === 'revision') {

      return (
        <ProgressInfo
          icon={
            <Pencil
              size={19}
              className="text-[#FFD32A]"
            />
          }
          title="Berita Acara Memerlukan Revisi"
          description="Terdapat catatan dari Kaprodi yang perlu diperbaiki sebelum proses validasi dapat dilanjutkan."
        />
      )
    }


    return (
      <ProgressInfo
        icon={
          <Clock3
            size={19}
            className="text-[#FFD32A]"
          />
        }
        title="Menunggu Validasi Kaprodi"
        description="Berita Acara telah dikonfirmasi dan menunggu proses review serta persetujuan Kaprodi."
      />
    )
  }


  // ===========================================================
  // TAHAP 4
  // ===========================================================

  if (currentStep === 4) {

    if (status.tahap4.status === 'processing') {

      return (
        <ProgressInfo
          icon={
            <ShieldCheck
              size={19}
              className="text-[#FFD32A]"
            />
          }
          title="Pengesahan Pleno Sedang Berlangsung"
          description="Berita Acara sedang dalam proses pengesahan pleno."
        />
      )
    }


    return (
      <ProgressInfo
        icon={
          <Clock3
            size={19}
            className="text-[#FFD32A]"
          />
        }
        title="Menunggu Pengesahan Pleno"
        description="Validasi Kaprodi telah selesai. Berita Acara selanjutnya menunggu proses pengesahan pleno."
      />
    )
  }


  // ===========================================================
  // TAHAP 5
  // ===========================================================

  if (currentStep === 5) {

    if (status.tahap5.status === 'processing') {

      return (
        <ProgressInfo
          icon={
            <Award
              size={19}
              className="text-[#FFD32A]"
            />
          }
          title="Berita Acara Final Sedang Diproses"
          description="Berita Acara sedang diproses untuk penandatanganan elektronik dan penerbitan dokumen final."
        />
      )
    }


    return (
      <ProgressInfo
        icon={
          <Clock3
            size={19}
            className="text-[#FFD32A]"
          />
        }
        title="Menunggu Penerbitan Berita Acara Final"
        description="Pengesahan pleno telah selesai. Berita Acara Final menunggu proses penerbitan."
      />
    )
  }


  return null
}


// =============================================================
// PROGRESS INFO
// =============================================================

function ProgressInfo({
  icon,
  title,
  description,
}) {

  return (
    <div
      className="
        mt-8
        rounded-xl
        border
        border-[#BCD8FF]
        bg-[#F8FBFF]
        px-5
        py-4
      "
    >

      <div className="flex items-start gap-4">

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#06447B]
          "
        >
          {icon}
        </div>


        <div>

          <h3 className="text-[13px] font-bold text-[#172033]">
            {title}
          </h3>

          <p className="mt-1 max-w-[800px] text-[11px] leading-5 text-[#687588]">
            {description}
          </p>

        </div>

      </div>

    </div>
  )
}


// =============================================================
// STATUS CARD
// =============================================================

function StatusCard({
  title,
  icon,
  heading,
  badge,
  badgeType = 'neutral',
  description,
}) {

  const badgeStyles = {
    success: {
      wrapper: 'bg-[#D1FAE5] text-[#047857]',
      dot: 'bg-[#059669]',
    },

    active: {
      wrapper: 'bg-[#FFF3C7] text-[#C46A00]',
      dot: 'bg-[#F59E0B]',
    },

    info: {
      wrapper: 'bg-[#E8F1FF] text-[#2457A6]',
      dot: 'bg-[#2563EB]',
    },

    neutral: {
      wrapper: 'bg-[#F1F5F9] text-[#5D6C7F]',
      dot: 'bg-[#9BAFC4]',
    },

    warning: {
      wrapper: 'bg-[#FFF4E5] text-[#C46A00]',
      dot: 'bg-[#F59E0B]',
    },
  }


  const style =
    badgeStyles[badgeType] ||
    badgeStyles.neutral


  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-6
        shadow-[0_5px_15px_rgba(0,0,0,0.07)]
      "
    >

      <div className="flex items-start justify-between">

        <p className="text-[12px] font-bold tracking-wide text-[#6B7585]">
          {title}
        </p>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-[#E0E6EE]
            text-[#607086]
          "
        >
          {icon}
        </div>

      </div>


      <h3 className="mt-4 text-[21px] font-bold text-[#111827]">
        {heading}
      </h3>


      <div
        className={`
          mt-3
          inline-flex
          items-center
          gap-2
          rounded-full
          px-4
          py-1.5
          text-[11px]
          font-semibold
          ${style.wrapper}
        `}
      >

        <span
          className={`
            h-2
            w-2
            rounded-full
            ${style.dot}
          `}
        />

        {badge}

      </div>


      <div className="my-3 h-px bg-[#E6EAF0]" />


      <p className="text-[12px] text-[#687588]">
        {description}
      </p>

    </div>
  )
}


// =============================================================
// QUICK ACCESS
// =============================================================

function QuickAccess({
  navigate,
  status,
  hasSubmitted,
}) {

  const draftAvailable =
    status.tahap2.draftBAAvailable


  return (
    <section className="mt-7">

      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="h-7 w-2 rounded-full bg-[#03447E]" />

          <h2 className="text-[20px] font-bold text-[#111827]">
            Akses Cepat Layanan
          </h2>

        </div>

        <p className="text-[11px] text-[#7A8493]">
          Pilih layanan utama untuk mengelola yudisium
        </p>

      </div>


      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* =================================================
            PENGAJUAN
        ================================================= */}

        <div
          className="
            flex
            min-h-[255px]
            flex-col
            rounded-2xl
            bg-white
            p-6
            shadow-[0_5px_15px_rgba(0,0,0,0.07)]
          "
        >

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#EEF5FF]
              "
            >
              <FileText
                size={22}
                strokeWidth={1.8}
                className="text-[#06447B]"
              />
            </div>


            <span
              className={`
                rounded-full
                border
                px-3
                py-1
                text-[10px]
                font-semibold

                ${
                  hasSubmitted
                    ? 'border-[#A9E7CF] bg-[#ECFBF4] text-[#047857]'
                    : 'border-[#A9D5FF] bg-[#F0F7FF] text-[#07518D]'
                }
              `}
            >
              {hasSubmitted
                ? 'Sudah Mengajukan'
                : 'Formulir Terbuka'}
            </span>

          </div>


          <h3 className="mt-5 text-[18px] font-bold">
            Pengajuan Yudisium
          </h3>


          <p className="mt-3 text-[12px] leading-5 text-[#596679]">
            Lengkapi dan unggah berkas persyaratan kelulusan
            untuk memulai proses verifikasi.
          </p>


          <button
            type="button"
            onClick={() =>
              navigate('/pengajuan-yudisium')
            }
            className="
              mt-auto
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-[#03447E]
              py-3
              text-[13px]
              font-bold
              text-white
              transition
              hover:bg-[#063B69]
            "
          >

            {hasSubmitted
              ? 'Lihat Pengajuan'
              : 'Mulai Pengajuan'}

            <span className="text-lg">
              →
            </span>

          </button>

        </div>


        {/* =================================================
            BERITA ACARA
        ================================================= */}

        <div
          className="
            flex
            min-h-[255px]
            flex-col
            rounded-2xl
            bg-white
            p-6
            shadow-[0_5px_15px_rgba(0,0,0,0.07)]
          "
        >

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#FFF8E7]
              "
            >
              <ShieldCheck
                size={22}
                strokeWidth={1.8}
                className="text-[#E89B00]"
              />
            </div>


            <span
              className="
                rounded-full
                border
                border-[#E9E0C4]
                bg-[#FFFDF5]
                px-3
                py-1
                text-[10px]
                font-semibold
                text-[#758095]
              "
            >
              {draftAvailable
                ? 'Draft Siap Ditinjau'
                : 'Belum Ada Draft'}
            </span>

          </div>


          <h3 className="mt-5 text-[18px] font-bold">
            Berita Acara
          </h3>


          <p className="mt-3 text-[12px] leading-5 text-[#7A8493]">
            {draftAvailable
              ? 'Draft Berita Acara Kelulusan telah diterbitkan dan siap diperiksa.'
              : 'Draft Berita Acara Kelulusan diterbitkan setelah proses verifikasi berkas.'}
          </p>


          <button
            type="button"
            disabled={!draftAvailable}
            onClick={() => navigate('/berita-acara')}
            className={`
              mt-auto
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              py-3
              text-[13px]
              font-bold

              ${
                draftAvailable
                  ? 'bg-[#03447E] text-white hover:bg-[#063B69]'
                  : 'border border-[#DCE3EB] bg-[#F0F4F8] text-[#9BAFC4]'
              }
            `}
          >

            {draftAvailable
              ? 'Periksa Draft Berita Acara'
              : 'Belum Tersedia'}

            {draftAvailable && (
              <span className="text-lg">
                →
              </span>
            )}

          </button>

        </div>


        {/* =================================================
            PANDUAN
        ================================================= */}

        <div
          className="
            flex
            min-h-[255px]
            flex-col
            rounded-2xl
            bg-white
            p-6
            shadow-[0_5px_15px_rgba(0,0,0,0.07)]
          "
        >

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#EEF5FF]
              "
            >
              <BookOpen
                size={22}
                strokeWidth={1.8}
                className="text-[#06447B]"
              />
            </div>


            <span
              className="
                rounded-full
                border
                border-[#E0E4EA]
                bg-[#F6F7F8]
                px-3
                py-1
                text-[10px]
                font-semibold
                text-[#596679]
              "
            >
              Dokumen Resmi
            </span>

          </div>


          <h3 className="mt-5 text-[18px] font-bold">
            Panduan dan Dokumen
          </h3>


          <p className="mt-3 text-[12px] leading-5 text-[#596679]">
            Akses format dokumen yang dibutuhkan untuk
            pengajuan yudisium.
          </p>


          <button
            type="button"
            onClick={() => navigate('/panduan')}
            className="
              mt-auto
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-[#DCE3EB]
              bg-white
              py-3
              text-[13px]
              font-bold
              text-[#26354A]
              transition
              hover:bg-[#F7F9FC]
            "
          >

            Lihat Panduan &amp; Template

            <span className="text-lg text-[#687588]">
              →
            </span>

          </button>

        </div>

      </div>

    </section>
  )
}


// =============================================================
// APPLICATION STATUS
// =============================================================

function getApplicationHeading(status) {

  if (status.tahap1.status === 'completed') {
    if (status.tahap5.status === 'completed') {
      return 'Verifikasi Akademik dan Berita Acara'
    }

    return 'Verifikasi Akademik dan Berita Acara'
  }

  return 'Pengajuan Sedang Diproses'
}


function getApplicationBadge(status) {

  if (status.tahap5.status === 'completed') {
    return 'Selesai & Lulus Pleno'
  }

  if (status.tahap4.status === 'completed') {
    return 'Pengesahan Pleno Selesai'
  }

  if (status.tahap3.status === 'completed') {
    return 'Validasi Kaprodi Selesai'
  }

  if (status.tahap2.studentConfirmed) {
    return 'Tahap 3 Sedang Berjalan'
  }

  if (status.tahap2.draftBAAvailable) {
    return 'Perlu Konfirmasi Mahasiswa'
  }

  return 'Tahap 2 Sedang Berjalan'
}


function getApplicationBadgeType(status) {

  if (status.tahap5.status === 'completed') {
    return 'success'
  }

  if (status.tahap3.status === 'completed') {
    return 'success'
  }

  if (status.tahap2.draftBAAvailable) {
    return 'info'
  }

  return 'active'
}


// =============================================================
// BA STATUS
// =============================================================

function getBAHeading(status) {

  if (status.tahap5.status === 'completed') {
    return 'Berita Acara Telah Tersedia'
  }

  if (status.tahap2.draftBAAvailable) {
    return 'Draft Siap Ditinjau'
  }

  return 'Berita Acara Belum Tersedia'
}


function getBABadge(status) {

  if (status.tahap5.status === 'completed') {
    return 'Siap Diunduh'
  }

  if (status.tahap2.draftBAAvailable) {
    return 'Perlu Review Mahasiswa'
  }

  return 'Menunggu Verifikasi'
}


function getBABadgeType(status) {

  if (status.tahap5.status === 'completed') {
    return 'success'
  }

  if (status.tahap2.draftBAAvailable) {
    return 'info'
  }

  return 'neutral'
}


function getBADescription(status) {

  if (status.tahap5.status === 'completed') {
    return 'Berita Acara resmi sudah tersedia dan dapat diunduh.'
  }

  if (status.tahap2.draftBAAvailable) {
    return 'Draft akan muncul setelah pengajuan diverifikasi.'
  }

  return 'Draft akan muncul setelah proses verifikasi berkas.'
}


// =============================================================
// DATE FORMAT
// =============================================================

function formatDate(date) {

  if (!date) {
    return '-'
  }

  try {

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ).format(new Date(date))

  } catch {

    return date

  }
}


// =============================================================
// PROFILE AVATAR
// =============================================================

function ProfileAvatar({ photo, size = 'small' }) {
  const [imageError, setImageError] = useState(false)

  const showPhoto = photo && !imageError

  const sizeClass =
    size === 'large'
      ? 'h-[72px] w-[72px]'
      : 'h-[36px] w-[36px]'

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full
        overflow-hidden
        bg-[#C4C8CE]
        flex
        items-center
        justify-center
      `}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt="Foto profil"
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="relative h-full w-full">
          {/* HEAD */}
          <div
            className="
              absolute
              left-1/2
              top-[22%]
              -translate-x-1/2
              h-[32%]
              w-[32%]
              rounded-full
              bg-white
            "
          />

          {/* BODY */}
          <div
            className="
              absolute
              left-1/2
              bottom-[14%]
              -translate-x-1/2
              h-[36%]
              w-[62%]
              rounded-t-full
              bg-white
            "
          />
        </div>
      )}
    </div>
  )
}

export default StudentDashboard