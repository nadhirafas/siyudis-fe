import { useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  ChevronDown,
  LogOut,
  ZoomIn,
  ZoomOut,
  Printer,
  Maximize,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'

import ugmLogo from '../../assets/ugm-logo.png'
import persyaratanImage from '../../assets/persyaratan-yudisium.png'

const SIDEBAR_WIDTH = 295

// =========================================================
// SIDEBAR
// =========================================================

function AdminSidebar() {
  const navigate = useNavigate()
  const location = window.location.pathname

  const menus = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
    },
    {
      label: 'Pengajuan Yudisium',
      icon: FileText,
      path: '/admin/pengajuan-yudisium',
    },
    {
      label: 'Berita Acara',
      icon: ShieldCheck,
      path: '/admin/berita-acara',
    },
    {
      label: 'Panduan & Dokumen',
      icon: BookOpen,
      path: '/admin/panduan',
    },
  ]

  return (
    <aside
      className="fixed left-0 top-0 z-50 h-screen bg-[#063E73] text-white"
      style={{ width: `${SIDEBAR_WIDTH}px` }}
    >
      <div className="px-5 pt-5">
        {/* Logo + nama SIYUDIS */}
        <div className="flex h-[52px] items-center gap-3">
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

        {/* Garis */}
        <div className="mt-7 h-px bg-white/30" />
      </div>

      {/* Menu */}
      <nav className="mt-8 space-y-2 px-4">
        {menus.map((menu) => {
          const Icon = menu.icon

          const active =
            location === menu.path ||
            location.startsWith(`${menu.path}/`)

          return (
            <button
              key={menu.path}
              type="button"
              onClick={() => navigate(menu.path)}
              className={`flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left transition ${
                active
                  ? 'bg-[#2D628F] text-white shadow-sm'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.8}
                className={active ? 'text-[#FFD32A]' : ''}
              />

              <span
                className={`text-sm ${
                  active ? 'font-semibold' : ''
                }`}
              >
                {menu.label}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

// =========================================================
// PROFILE AVATAR
// =========================================================

function ProfileAvatar({ photo, size = 'normal' }) {
  const large = size === 'large'

  return photo ? (
    <img
      src={photo}
      alt="Foto profil"
      className={`rounded-full border-4 border-[#EEF2F6] object-cover ${
        large ? 'h-20 w-20' : 'h-9 w-9'
      }`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full bg-[#C7CBD1] text-white ${
        large ? 'h-20 w-20' : 'h-9 w-9'
      }`}
    >
      <UserRound size={large ? 40 : 20} />
    </div>
  )
}

// =========================================================
// PROFILE DROPDOWN
// =========================================================

function ProfileDropdown({
  user,
  displayName,
  navigate,
  handleLogout,
  setProfileOpen,
}) {
  return (
    <div
      className="
        absolute
        right-0
        top-[65px]
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
      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

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

      {/* =====================================================
          PROFIL SAYA
      ===================================================== */}

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

      {/* =====================================================
          LOGOUT
      ===================================================== */}

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
  )
}

// =========================================================
// ADMIN HEADER
// =========================================================

function AdminHeader() {
  const navigate = useNavigate()

  const [user, setUser] = useState(
    () =>
      getUser() || {
        nama: 'Aji Pangestu',
        email: 'aji.pangestu@mail.ugm.ac.id',
        avatar: null,
      },
  )

  const [profileOpen, setProfileOpen] = useState(false)

  const displayName =
    user?.nama ||
    user?.name ||
    'Aji Pangestu'

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header
      className="
        fixed
        top-0
        right-0
        z-40
        flex
        h-[88px]
        items-center
        justify-between
        border-b
        border-gray-100
        bg-white
        px-8
      "
      style={{ left: `${SIDEBAR_WIDTH}px` }}
    >
      {/* =====================================================
          JUDUL
      ===================================================== */}

      <div>
        <h1 className="text-[28px] font-bold leading-tight text-gray-950">
          Panduan & Dokumen
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Sistem Informasi Yudisium Terpadu DTEDI SV UGM
        </p>
      </div>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setProfileOpen((open) => !open)
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
          <ProfileAvatar
            photo={user?.avatar}
            size="normal"
          />

          <p className="max-w-[260px] truncate text-[14px] font-bold text-gray-900">
            {displayName}
          </p>

          <ChevronDown
            size={18}
            className={`text-gray-500 transition ${
              profileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {profileOpen && (
          <ProfileDropdown
            user={user}
            displayName={displayName}
            navigate={navigate}
            handleLogout={handleLogout}
            setProfileOpen={setProfileOpen}
          />
        )}
      </div>
    </header>
  )
}

// =========================================================
// VIEWER TOOLBAR
// =========================================================

function ViewerToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onPrint,
  onFullscreen,
}) {
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800'

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1">
      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= 50}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
        title="Perkecil"
      >
        <ZoomOut size={16} />
      </button>

      {/* Persentase */}
      <button
        type="button"
        onClick={onReset}
        className="min-w-[58px] px-2 text-xs font-medium text-gray-600 hover:text-gray-900"
        title="Kembalikan ke 100%"
      >
        {zoom}%
      </button>

      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= 200}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
        title="Perbesar"
      >
        <ZoomIn size={16} />
      </button>

      <span className="mx-1 h-5 w-px bg-gray-200" />

      {/* Print */}
      <button
        type="button"
        onClick={onPrint}
        className={buttonClass}
        title="Cetak dokumen"
      >
        <Printer size={16} />
      </button>

      {/* Fullscreen */}
      <button
        type="button"
        onClick={onFullscreen}
        className={buttonClass}
        title="Layar penuh"
      >
        <Maximize size={16} />
      </button>
    </div>
  )
}

// =========================================================
// DOCUMENT VIEWER
// =========================================================

function DocumentViewer() {
  const viewerRef = useRef(null)

  const [zoom, setZoom] = useState(100)

  const zoomIn = () => {
    setZoom((current) =>
      Math.min(current + 10, 200),
    )
  }

  const zoomOut = () => {
    setZoom((current) =>
      Math.max(current - 10, 50),
    )
  }

  const resetZoom = () => {
    setZoom(100)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')

    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Persyaratan Pengajuan Yudisium DTEDI</title>

          <style>
            @page {
              margin: 10mm;
            }

            body {
              margin: 0;
              padding: 0;
              background: white;
              text-align: center;
            }

            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>

        <body>
          <img
            src="${persyaratanImage}"
            alt="Persyaratan Pengajuan Yudisium DTEDI"
          />
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleFullscreen = async () => {
    if (!viewerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error(
        'Gagal membuka fullscreen:',
        error,
      )
    }
  }

  return (
    <section
      ref={viewerRef}
      className="
        flex
        min-h-0
        flex-1
        flex-col
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-sm
      "
    >
      {/* =====================================================
          VIEWER HEADER
      ===================================================== */}

      <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-gray-200 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC]">
            <FileText
              size={19}
              className="text-[#063E73]"
            />
          </div>

          <h2 className="text-[18px] font-semibold text-[#111827]">
            Petunjuk Penggunaan SIYUDIS
          </h2>
        </div>

        <ViewerToolbar
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          onPrint={handlePrint}
          onFullscreen={handleFullscreen}
        />
      </div>

      {/* =====================================================
          DOCUMENT
      ===================================================== */}

      <div className="min-h-0 flex-1 overflow-auto bg-[#EEF2F7] p-8">
        <div className="flex min-w-max justify-center">
          <div
            className="shrink-0 overflow-hidden bg-white shadow-sm"
            style={{
              width: `${zoom}%`,
              minWidth:
                zoom < 100 ? `${zoom}%` : '100%',
            }}
          >
            <img
              src={persyaratanImage}
              alt="Persyaratan Pengajuan Yudisium DTEDI"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// =========================================================
// ADMIN PANDUAN
// =========================================================

export default function AdminPanduan() {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow =
        previousOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F3F6FA] text-[#111827]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* HEADER */}
      <AdminHeader />

      {/* MAIN AREA */}
      <main
        className="absolute bottom-0 right-0 top-[88px] overflow-hidden"
        style={{ left: `${SIDEBAR_WIDTH}px` }}
      >
        <div className="flex h-full min-h-0 flex-col p-8">
          <DocumentViewer />
        </div>
      </main>
    </div>
  )
}