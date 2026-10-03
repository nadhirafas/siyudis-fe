import { useRef, useState } from 'react'
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
  Download,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'
import persyaratanImage from '../../assets/persyaratan-yudisium.png'

const templates = [
  {
    id: 1,
    title: 'Form Pengajuan Yudisium',
    description: 'Dokumen induk pendaftaran yudisium yang memuat profil mahasiswa, riwayat...',
  },
  {
    id: 2,
    title: 'Form Permohonan Pembatalan Mata Kuliah Pilihan',
    description: 'Digunakan bagi mahasiswa yang ingin menggugurkan mata kuliah pilihan...',
  },
  {
    id: 3,
    // FIX: typo "From" -> "Form" di desain, kasih tau aku kalau ini sengaja.
    title: 'Form Checklist Judul Tugas Akhir',
    description: 'Verifikasi format penulisan judul Tugas Akhir bahasa Indonesia dan bahasa...',
  },
]

function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[272px] bg-[#063E73] text-white">
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
          onClick={() => navigate('/dashboard')}
          className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <Home size={20} strokeWidth={2} />
          <span className="text-sm">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/pengajuan-yudisium')}
          className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <FileText size={20} strokeWidth={1.8} />
          <span className="text-sm">Pengajuan Yudisium</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/berita-acara')}
          className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <ShieldCheck size={20} strokeWidth={1.8} />
          <span className="text-sm">Berita Acara</span>
        </button>

        <button
          type="button"
          className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm"
        >
          <BookOpen size={20} strokeWidth={2} className="text-[#FFD32A]" />
          <span className="text-sm font-semibold">Panduan &amp; Dokumen</span>
        </button>
      </nav>
    </aside>
  )
}

function Header() {
  const navigate = useNavigate()

  const [user] = useState(
    () => getUser() || { name: 'Raihananta Khoiril Anam Pitoyo', email: 'raihananta.k@mail.ugm.ac.id', photo: null },
  )
  const [profileOpen, setProfileOpen] = useState(false)

  const displayName = user?.name || 'Raihananta Khoiril Anam Pitoyo'
  const email = user?.email || 'raihananta.k@mail.ugm.ac.id'

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

  // Avatar Default dengan Siluet Putih di Dalam Lingkaran Abu-abu
  const DefaultAvatarIcon = () => (
    <div className="relative h-full w-full rounded-full bg-[#c7cbd1] flex items-center justify-center overflow-hidden">
      <div className="absolute top-[22%] h-[36%] w-[36%] rounded-full bg-white" />
      <div className="absolute bottom-[-10%] h-[50%] w-[75%] rounded-full bg-white" />
    </div>
  )

  return (
    <header className="fixed left-[272px] right-0 top-0 z-30 flex h-[88px] items-center justify-between border-b border-gray-100 bg-white px-8">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-gray-950">Panduan &amp; Dokumen</h1>
        <p className="mt-1 text-sm text-gray-500">Sistem Informasi Yudisium Terpadu DTEDI SV UGM</p>
      </div>

      <div className="relative">
        {/* TOMBOL HEADER PROFIL (GAP DIREPATKAN KE GAP-2/2.5) */}
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-full py-1 px-1.5 hover:bg-gray-50 transition"
        >
          {user?.photo ? (
            <img src={user.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 shrink-0">
              <DefaultAvatarIcon />
            </div>
          )}

          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            {displayName}
          </span>
        </button>

        {/* CARD POPOUT DETAIL PROFIL */}
        {profileOpen && (
          <div className="absolute right-0 top-[58px] w-[380px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-6">
            
            {/* Email + Garis Bawah */}
            <div className="border-b border-gray-100 pb-4">
              <p className="text-xs font-semibold text-gray-400 text-left">
                {email}
              </p>
            </div>

            {/* Avatar Besar + Ring Biru Muda Halus + Siluet Putih + Status Hijau */}
            <div className="flex flex-col items-center py-6">
              <div className="relative flex items-center justify-center">
                
                {/* Ring Bingkai Luar (#e8edf5) + Container Avatar Besar */}
                <div className="h-24 w-24 rounded-full border-[5px] border-[#e8edf5] bg-[#c7cbd1] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {user?.photo ? (
                    <img src={user.photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <DefaultAvatarIcon />
                  )}
                </div>

                {/* Titik Status Hijau */}
                <span className="absolute bottom-0.5 right-0.5 h-5 w-5 rounded-full border-[2.5px] border-white bg-[#5dbb67]" />
              </div>

              <p className="mt-4 text-[18px] font-bold text-gray-900 text-center tracking-tight">
                {displayName}
              </p>
            </div>

            {/* List Menu Pilihan */}
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              
              {/* Menu Profil Saya */}
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#163b6c]">
                  <UserRound size={20} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-gray-900">Profil Saya</span>
                  <span className="text-xs text-gray-400">Ubah nama dan foto profil</span>
                </div>
              </button>

              {/* Garis Pemisah Antar Menu */}
              <div className="border-t border-gray-100 my-1" />

              {/* Menu Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-red-50/60 transition"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fde8e7] text-[#d9362b]">
                  <LogOut size={20} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-[#d9362b]">Keluar / Logout</span>
                  <span className="text-xs text-red-400">Akhiri sesi akun di perangkat ini</span>
                </div>
              </button>

            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default function PanduanDokumenPage() {
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
        <head><title>Cetak - Persyaratan Pengajuan Yudisium DTEDI</title></head>
        <body style="margin:0">
          <img src="${persyaratanImage}" style="width:100%" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar />
      <Header />

      <main className="ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-7 py-8">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#1f3d6d]" />
                <h3 className="font-semibold text-gray-900">Persyaratan Pengajuan Yudisium DTEDI</h3>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                  title="Perkecil"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-12 text-center text-xs font-medium text-gray-600">{zoom}%</span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                  title="Perbesar"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                  title="Cetak"
                >
                  <Printer size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                  title="Layar penuh"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>

            <div ref={viewerRef} className="overflow-auto bg-[#eef1f6] p-6">
              <img
                src={persyaratanImage}
                alt="Persyaratan Pengajuan Yudisium DTEDI"
                style={{ width: `${zoom}%` }}
                className="mx-auto max-w-none rounded-lg bg-white shadow-sm transition-[width]"
              />
            </div>
          </section>

          {/* SECTION TEMPLATE DOKUMEN DENGAN PENYESUAIAN DESAIN */}
          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="bg-[#f2f5fb] px-8 py-5 border-b border-[#e2e8f0]">
              <h3 className="text-xl font-bold text-[#142642]">
                Template Dokumen
              </h3>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-5">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="flex flex-col justify-between rounded-2xl bg-[#eef3fb] p-6">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dbe1ec] text-[#142642]">
                        <FileText size={22} />
                      </div>

                      <h4 className="mt-4 text-base font-bold leading-snug text-gray-900">{tpl.title}</h4>
                      <p className="mt-3 text-sm leading-6 text-gray-500">{tpl.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('Dokumen belum tersedia.')}
                      className="mt-6 flex h-11 items-center gap-2 self-end rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                    >
                      <Download size={16} />
                      Unduh Dokumen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}