import { useState } from 'react'
import { useNavigate } from 'react-router'

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
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

function StudentDashboard() {
  const navigate = useNavigate()

  // =========================================================
  // USER DATA
  // =========================================================

  const [user] = useState(() => {
    const currentUser = getUser()

    return (
      currentUser || {
        name: 'Nadhira',
        email: 'nadhirafarraaisyasui@mail.ugm.ac.id',
        photo: null,
      }
    )
  })

  const [profileOpen, setProfileOpen] = useState(false)

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

  const displayName = user?.name || 'Mahasiswa'

  if (!user) {
    return null
  }

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

          {/* PENGAJUAN YUDISIUM */}
          <button
            type="button"
            onClick={() => navigate('/pengajuan')}
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
          {/* TITLE */}
          <div>
            <h2 className="text-[25px] font-bold leading-tight text-[#111111]">
              Dashboard Mahasiswa
            </h2>

            <p className="mt-1 text-[12px] text-[#687588]">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>
          </div>

          {/* USER PROFILE */}
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
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
            {/* AVATAR */}
            <ProfileAvatar photo={user.photo} />

            {/* NAME */}
            <span className="max-w-[250px] truncate text-[14px] font-bold text-[#111111]">
              {displayName}
            </span>

            {/* CHEVRON */}
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`
                transition-transform
                ${profileOpen ? 'rotate-180' : ''}
              `}
            />
          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

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
              {/* EMAIL */}
              <div className="px-5 py-4">
                <p className="text-[12px] font-semibold text-[#718096]">
                  {user.email}
                </p>
              </div>

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
            {/* DECORATIVE CIRCLES */}
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

            {/* CONTENT */}
            <div className="relative z-10">
              <h1 className="text-[28px] font-bold leading-tight md:text-[30px]">
                Selamat Datang, {displayName}!
              </h1>

              <p className="mt-3 text-[16px] text-white/95">
                Pusat kendali dan layanan terpadu pendaftaran
                yudisium Sarjana Terapan DTEDI SV UGM.
              </p>
            </div>
          </section>

          {/* =================================================
              BELUM MEMULAI
          ================================================= */}

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
            {/* ICON */}
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
              onClick={() => navigate('/pengajuan')}
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

          {/* =================================================
              STATUS
          ================================================= */}

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* STATUS PENGAJUAN */}
            <StatusCard
              title="STATUS PENGAJUAN"
              icon={<Clock3 size={20} strokeWidth={1.7} />}
              heading="Belum Ada Pengajuan"
              badge="Belum Dimulai"
              description="Silakan untuk mengajukan pengajuan yudisium"
            />

            {/* STATUS BERITA ACARA */}
            <StatusCard
              title="STATUS BERITA ACARA"
              icon={<FileText size={20} strokeWidth={1.7} />}
              heading="Belum Tersedia"
              badge="Menunggu Pengajuan"
              description="Draft akan muncul setelah pengajuan diajukan"
            />
          </section>

          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <section className="mt-7">
            {/* SECTION TITLE */}
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

            {/* CARDS */}
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
                    className="
                      rounded-full
                      border
                      border-[#A9D5FF]
                      bg-[#F0F7FF]
                      px-3
                      py-1
                      text-[10px]
                      font-semibold
                      text-[#07518D]
                    "
                  >
                    Formulir Terbuka
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
                  onClick={() => navigate('/pengajuan')}
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
                  Mulai Pengajuan

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
                    Belum Ada Draft
                  </span>
                </div>

                <h3 className="mt-5 text-[18px] font-bold">
                  Berita Acara
                </h3>

                <p className="mt-3 text-[12px] leading-5 text-[#7A8493]">
                  Draft Berita Acara Kelulusan diterbitkan otomatis
                  setelah verifikasi berkas disetujui staf akademik.
                </p>

                <button
                  type="button"
                  disabled
                  className="
                    mt-auto
                    w-full
                    rounded-xl
                    border
                    border-[#DCE3EB]
                    bg-[#F0F4F8]
                    py-3
                    text-[13px]
                    font-bold
                    text-[#9BAFC4]
                  "
                >
                  Belum Tersedia
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
        </main>
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
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-6
        shadow-[0_5px_15px_rgba(0,0,0,0.07)]
      "
    >
      {/* HEADER */}
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

      {/* HEADING */}
      <h3 className="mt-4 text-[21px] font-bold text-[#111827]">
        {heading}
      </h3>

      {/* BADGE */}
      <div
        className="
          mt-3
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-[#F1F5F9]
          px-4
          py-1.5
          text-[11px]
          font-semibold
          text-[#5D6C7F]
        "
      >
        <span className="h-2 w-2 rounded-full bg-[#9BAFC4]" />

        {badge}
      </div>

      {/* DIVIDER */}
      <div className="my-3 h-px bg-[#E6EAF0]" />

      {/* DESCRIPTION */}
      <p className="text-[12px] text-[#687588]">
        {description}
      </p>
    </div>
  )
}

// =============================================================
// PROFILE AVATAR
// =============================================================

function ProfileAvatar({ photo }) {
  return (
    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-full
        bg-[#C8CDD3]
      "
    >
      {photo ? (
        <img
          src={photo}
          alt="Foto profil"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="relative h-full w-full">
          {/* HEAD */}
          <div
            className="
              absolute
              left-1/2
              top-[8px]
              h-[12px]
              w-[12px]
              -translate-x-1/2
              rounded-full
              bg-white
            "
          />

          {/* BODY */}
          <div
            className="
              absolute
              bottom-[4px]
              left-1/2
              h-[13px]
              w-[23px]
              -translate-x-1/2
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