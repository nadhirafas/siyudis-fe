import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  ShieldCheck,
  BookOpen,
  UserRound,
  LogOut,
  ZoomIn,
  ZoomOut,
  Printer,
  Maximize,
  Menu,
  X,
  PenTool,
  FileText
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'
import persyaratanImage from '../../assets/persyaratan-yudisium.png'

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[272px] bg-[#063E73] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {isOpen && (
          <button
            type="button"
            onClick={onClose}
            className="absolute -right-12 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 lg:hidden shadow-lg border border-white/20"
          >
            <X size={20} />
          </button>
        )}

        <div className="px-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <img src={ugmLogo} alt="Logo UGM" className="h-12 w-12 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[16px] font-bold tracking-wide">SIYUDIS</h1>
              <p className="mt-0.5 whitespace-nowrap text-[9px] text-white/75">
                Departemen Teknik Elektro dan Informatika
              </p>
            </div>
          </div>
          <div className="mt-7 h-px bg-white/30" />
        </div>

        <nav className="mt-8 space-y-2 px-4">
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/kaprodi/dashboard')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/kaprodi/berita-acara')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <ShieldCheck size={20} strokeWidth={1.8} />
            <span className="text-sm">Berita Acara</span>
          </button>

          <button
            type="button"
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm text-white font-semibold"
          >
            <BookOpen size={20} strokeWidth={2} className="text-[#FFD32A]" />
            <span className="text-sm">Panduan &amp; Dokumen</span>
          </button>
        </nav>
      </aside>
    </>
  )
}

function Header({ onOpenSidebar }) {
  const navigate = useNavigate()
  const [user] = useState(() => getUser() || { name: 'Kaprodi TRPL', email: 'trpl_kaprodi@mail.ugm.ac.id', photo: null })
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

  const DefaultAvatarIcon = () => (
    <div className="relative h-full w-full rounded-full bg-[#c7cbd1] flex items-center justify-center overflow-hidden">
      <div className="absolute top-[22%] h-[36%] w-[36%] rounded-full bg-white" />
      <div className="absolute bottom-[-10%] h-[50%] w-[75%] rounded-full bg-white" />
    </div>
  )

  return (
    <header className="fixed left-0 lg:left-[272px] right-0 top-0 z-30 flex h-[88px] items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-[#172f55] hover:bg-gray-100 transition lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold leading-tight text-gray-950">Panduan &amp; Dokumen</h1>
          <p className="hidden sm:block mt-0.5 text-xs lg:text-sm text-gray-500">
            Sistem Informasi Yudisium Terpadu DTEDI SV UGM
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-full py-1 px-1.5 hover:bg-gray-50 transition"
        >
          {user?.photo ? (
            <img src={user.photo} alt="" className="h-9 w-9 lg:h-10 lg:w-10 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 lg:h-10 lg:w-10 shrink-0">
              <DefaultAvatarIcon />
            </div>
          )}
          <span className="hidden sm:inline-block text-xs lg:text-[15px] font-bold text-gray-900 tracking-tight">
            {user?.name || 'Kaprodi TRPL'}
          </span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[58px] w-[300px] sm:w-[380px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-5 sm:p-6">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-xs font-semibold text-gray-400 text-left">{user.email}</p>
            </div>

            <div className="flex flex-col items-center py-5">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] border-[#e8edf5] bg-[#c7cbd1] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {user?.photo ? (
                    <img src={user.photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <DefaultAvatarIcon />
                  )}
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[2.5px] border-white bg-[#5dbb67]" />
              </div>

              <p className="mt-4 text-base sm:text-[18px] font-bold text-gray-900 text-center tracking-tight">
                {user.name}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/approver/profile')
                }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#163b6c]">
                  <UserRound size={18} />
                </span>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-gray-900">Profil Saya</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Ubah nama dan foto profil</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/approver/profile')
                }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D97706]">
                  <PenTool size={18} />
                </span>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-gray-900">Tanda Tangan</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Kelola e-sign Anda</span>
                </div>
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-red-50/60 transition"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fde8e7] text-[#d9362b]">
                  <LogOut size={18} />
                </span>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-[#d9362b]">Keluar / Logout</span>
                  <span className="text-[10px] sm:text-xs text-red-400">Akhiri sesi akun di perangkat ini</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default function ApproverPanduanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const viewerRef = useRef(null)

  const zoomOut = () => setZoom((z) => Math.max(50, z - 10))
  const zoomIn = () => setZoom((z) => Math.min(200, z + 10))

  const handleFullscreen = () => {
    if (viewerRef.current?.requestFullscreen) {
      viewerRef.current.requestFullscreen()
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Cetak - Petunjuk Penggunaan SIYUDIS</title></head>
        <body style="margin:0">
          <img src="${persyaratanImage}" style="width:100%" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onOpenSidebar={() => setSidebarOpen(true)} />

      <main className="ml-0 lg:ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-4 sm:px-7 py-6 sm:py-8">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4 gap-2">
              <div className="flex items-center gap-2">
                <FileText size={22} className="text-[#063E73] shrink-0" />
                <h3 className="font-semibold text-gray-900 text-xs sm:text-base">
                    Petunjuk Penggunaan SIYUDIS
                </h3>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1 shadow-2xs">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition"
                  title="Perkecil"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-10 sm:w-12 text-center text-xs font-medium text-gray-600">{zoom}%</span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition"
                  title="Perbesar"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition"
                  title="Cetak"
                >
                  <Printer size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition"
                  title="Layar penuh"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>

            <div ref={viewerRef} className="overflow-auto bg-[#eef1f6] p-4 sm:p-6 min-h-[600px]">
              <img
                src={persyaratanImage}
                alt="Petunjuk Penggunaan SIYUDIS DTEDI"
                style={{ width: `${zoom}%` }}
                className="mx-auto max-w-none rounded-lg bg-white shadow-sm transition-[width]"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}