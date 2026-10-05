import { useState } from 'react'
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
    description: 'Dokumen induk pendaftaran yudisium yang memuat profil mahasiswa, riwayat akademik, dan kelengkapan berkas persyaratan.',
  },
  {
    id: 2,
    title: 'Form Permohonan Pembatalan Mata Kuliah Pilihan',
    description: 'Digunakan bagi mahasiswa yang ingin menggugurkan mata kuliah pilihan yang telah diambil sebelumnya.',
  },
  {
    id: 3,
    // FIX: typo "From" -> "Form" di desain, kasih tau aku kalau ini sengaja.
    title: 'Form Checklist Judul Tugas Akhir',
    description: 'Verifikasi format penulisan judul Tugas Akhir bahasa Indonesia dan bahasa Inggris sebelum diajukan ke pembimbing.',
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

  return (
    <header className="fixed left-[272px] right-0 top-0 z-30 flex h-[88px] items-center justify-between border-b border-gray-100 bg-white px-8">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-gray-950">Panduan &amp; Dokumen</h1>
        <p className="mt-1 text-sm text-gray-500">Sistem Informasi Yudisium Terpadu DTEDI SV UGM</p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center gap-3 rounded-xl px-2 py-2"
        >
          {user?.photo ? (
            <img src={user.photo} alt="" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c7cbd1]">
              <UserRound size={27} strokeWidth={2} className="text-white" />
            </div>
          )}
          <p className="max-w-[260px] truncate text-[14px] font-bold text-gray-900">{displayName}</p>
          <ChevronDown size={18} className={`text-gray-500 transition ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[68px] w-[420px] overflow-hidden rounded-2xl border border-[#e0e5ed] bg-white shadow-xl">
            <div className="px-6 pt-6">
              <p className="border-b border-[#edf0f5] pb-5 text-sm font-semibold text-gray-500">{email}</p>
              <div className="flex flex-col items-center py-6">
                <div className="relative">
                  {user?.photo ? (
                    <img src={user.photo} alt="" className="h-24 w-24 rounded-full border-4 border-[#e8edf5] object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#e8edf5] bg-[#c7cbd1]">
                      <UserRound size={53} strokeWidth={2} className="text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-[#5dbb67]" />
                </div>
                <p className="mt-4 text-[18px] font-bold text-gray-900">{displayName}</p>
              </div>
            </div>

            <div className="mx-6 border-t border-[#edf0f5]" />

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false)
                navigate('/profile')
              }}
              className="flex w-full items-center gap-4 px-7 py-6 text-left hover:bg-gray-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#163b6c]">
                <UserRound size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold text-gray-900">Profil Saya</span>
                <span className="mt-1 block text-xs text-gray-500">Ubah nama dan foto profil</span>
              </span>
            </button>

            <div className="mx-6 border-t border-[#edf0f5]" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-4 px-7 py-6 text-left hover:bg-red-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fde8e7] text-[#d9362b]">
                <LogOut size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#d9362b]">Keluar / Logout</span>
                <span className="mt-1 block text-xs text-red-400">Akhiri sesi akun di perangkat ini</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// Toolbar viewer — belum fungsional (belum ada PDF asli buat di-zoom/print/fullscreen-in).
// Ini cuma nampilin gambar statis, jadi tombol-tombol ini masih dekorasi dulu.
function ViewerToolbar() {
  const btn =
    'flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1">
      <button type="button" disabled className={btn} title="Perkecil (belum tersedia)">
        <ZoomOut size={16} />
      </button>
      <span className="px-2 text-xs font-medium text-gray-500">100%</span>
      <button type="button" disabled className={btn} title="Perbesar (belum tersedia)">
        <ZoomIn size={16} />
      </button>
      <span className="mx-1 h-5 w-px bg-gray-200" />
      <button type="button" disabled className={btn} title="Cetak (belum tersedia)">
        <Printer size={16} />
      </button>
      <button type="button" disabled className={btn} title="Layar penuh (belum tersedia)">
        <Maximize size={16} />
      </button>
    </div>
  )
}

export default function PanduanDokumenPage() {
  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar />
      <Header />

      <main className="ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-7 py-8">
          <section className="rounded-2xl bg-white p-9 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-950">Panduan &amp; Dokumen</h2>
            <p className="mt-2 text-sm text-gray-500">
              Akses format dokumen yang dibutuhkan untuk pengajuan yudisium
            </p>
          </section>

          {/* Dokumen persyaratan — gambar utuh, bukan hasil slicing jadi teks. */}
          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#1f3d6d]" />
                <h3 className="font-semibold text-gray-900">Persyaratan Pengajuan Yudisium DTEDI</h3>
              </div>
              <ViewerToolbar />
            </div>

            <div className="bg-[#eef1f6] p-6">
              <img
                src={persyaratanImage}
                alt="Persyaratan Pengajuan Yudisium DTEDI"
                className="mx-auto max-w-[820px] w-full rounded-lg bg-white shadow-sm"
              />
            </div>
          </section>

          {/* Template Dokumen — tombol unduh sengaja dinonaktifkan dulu, belum ada file aslinya. */}
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Template Dokumen</h3>

            <div className="grid grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="flex flex-col rounded-xl border border-gray-200 bg-[#f7f8fc] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dce6fb] text-[#1f3d6d]">
                    <FileText size={18} />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-gray-900">{tpl.title}</h4>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">{tpl.description}</p>

                  <button
                    type="button"
                    disabled
                    title="Dokumen belum tersedia"
                    className="mt-4 flex h-9 items-center justify-center gap-2 self-start rounded-lg bg-gray-200 px-4 text-xs font-semibold text-gray-500 cursor-not-allowed"
                  >
                    <Download size={14} />
                    Unduh Dokumen
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}