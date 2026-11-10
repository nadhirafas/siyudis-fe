import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Menu,
  X,
  SendHorizontal,
  Printer,
  Download,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Mail,
  Info,
  Calendar,
  LayoutDashboard,
  Check,
  Award,
  PenTool,
  Hourglass,
  ClipboardList,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'
import draftBaPdf from '../../assets/berita-acara-trpl.pdf'

// ============================================================================
// KOMPONEN SIDEBAR
// ============================================================================
function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
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
            className="absolute -right-12 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition lg:hidden shadow-lg border border-white/20"
            aria-label="Tutup Menu"
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
            onClick={() => { onClose(); navigate('/dashboard') }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <Home size={20} strokeWidth={2} />
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/pengajuan-yudisium') }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <FileText size={20} strokeWidth={2} />
            <span className="text-sm">Pengajuan Yudisium</span>
          </button>

          <button
            type="button"
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm text-white"
          >
            <ShieldCheck size={20} strokeWidth={2} className="text-[#FFD32A]" />
            <span className="text-sm font-semibold">Berita Acara</span>
          </button>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/panduan') }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <BookOpen size={18} strokeWidth={1.8} />
            <span className="text-sm">Panduan &amp; Dokumen</span>
          </button>
        </nav>
      </aside>
    </>
  )
}

// ============================================================================
// KOMPONEN HEADER
// ============================================================================
function Header({ onOpenSidebar }) {
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
          aria-label="Buka Menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold leading-tight text-gray-950">Berita Acara</h1>
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
            {displayName}
          </span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[58px] w-[300px] sm:w-[380px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-5 sm:p-6">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-xs font-semibold text-gray-400 text-left">{email}</p>
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
                {displayName}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#163b6c]">
                  <UserRound size={18} />
                </span>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-gray-900">Profil Saya</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Ubah nama dan foto profil</span>
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

// ============================================================================
// KOMPONEN PELACAKAN PROGRES
// ============================================================================
function ProgressTracker({ activeStep = 4 }) {
  const steps = [
    { title: 'Pengajuan Yudisium', desc: 'Unggah berkas persyaratan', status: 'Selesai', date: '21 Okt 2026' },
    { title: 'Verifikasi Pengajuan Yudisium', desc: 'Staf akademik memeriksa berkas', status: 'Selesai', date: '22 Okt 2026' },
    { title: 'Verifikasi Draft Berita Acara', desc: 'Anda memeriksa data draft BA', status: 'Selesai', date: '22 Okt 2026' },
    { title: 'Validasi Kaprodi', desc: 'Review & persetujuan', status: 'Proses Aktif', date: null },
    { title: 'Pengesahan Manit', desc: 'TTE Manit setelah Kaprodi', status: 'Menunggu', date: null },
    { title: 'Pengesahan Kadep', desc: 'TTE Kadep setelah Manit', status: 'Menunggu', date: null },
    { title: 'Penerbitan Berita Acara Final', desc: 'Berita Acara sah TTE siap unduh', status: 'Menunggu', date: null },
  ]

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#173b6d]">
          <ClipboardList size={22} />
        </div>
        <div>
          <h3 className="font-bold text-gray-950 text-base sm:text-lg">Pelacakan Progres Pengajuan Yudisium</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Pantau perkembangan tahapan kelulusan dan pengesahan Berita Acara secara real-time
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[840px] relative px-6">
          
          {/* GARIS PENGHUBUNG BASE */}
          <div className="absolute top-[20px] left-[7.14%] right-[7.14%] h-[4px] bg-slate-200 -z-0" />
          
          {/* GARIS AKTIF */}
          <div
            className="absolute top-[20px] left-[7.14%] h-[4px] bg-[#173b6d] transition-all duration-500 -z-0"
            style={{ width: `${((activeStep - 1) / 6) * 85.72}%` }}
          />

          <div className="grid grid-cols-7 gap-2 relative z-10 text-center">
            {steps.map((step, idx) => {
              const stepNum = idx + 1
              const isCompleted = stepNum < activeStep
              const isActive = stepNum === activeStep

              return (
                <div key={stepNum} className="flex flex-col items-center">
                  {/* BULATAN STEP */}
                  {isCompleted ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173b6d] text-white shadow-xs">
                      <Check size={18} strokeWidth={2.8} />
                    </div>
                  ) : isActive ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#173b6d] bg-white text-[#173b6d] font-bold text-base shadow-md ring-4 ring-[#d8e4f5]">
                      {stepNum}
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9ecef] text-slate-500 font-semibold text-sm">
                      {stepNum}
                    </div>
                  )}

                  {/* JUDUL STEP */}
                  <div className="mt-3.5 h-9 flex items-start justify-center">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug px-1">
                      {step.title}
                    </h4>
                  </div>

                  {/* DESKRIPSI TEKS */}
                  <div className="mt-1 h-9 flex items-start justify-center">
                    <p className="text-[11px] text-slate-500 leading-tight px-1">
                      {step.desc}
                    </p>
                  </div>

                  {/* BADGE STATUS */}
                  <div className="mt-2.5 h-6 flex items-center justify-center">
                    {isActive && (
                      <span className="rounded-full bg-[#fef08a]/70 px-3.5 py-0.5 text-[11px] font-bold text-[#78350f] border-0">
                        Proses Aktif
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check size={13} strokeWidth={2.8} /> Selesai
                      </span>
                    )}

                    {!isCompleted && !isActive && (
                      <span className="text-[11px] text-slate-400 font-normal">Menunggu</span>
                    )}
                  </div>

                  {/* TIMESTAMP TANGGAL */}
                  <div className="mt-1 h-4 flex items-center justify-center">
                    {isCompleted && step.date ? (
                      <p className="text-[11px] font-medium text-slate-900">{step.date}</p>
                    ) : (
                      <span className="text-[11px] text-transparent">-</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

// ============================================================================
// KOMPONEN PRATINJAU DOKUMEN BA (MENAMPILKAN FILE PDF & KETERANGAN NOMOR DOKUMEN)
// ============================================================================
function DocumentViewer({ title = 'Pratinjau Dokumen Berita Acara Rapat Yudisium' }) {
  const [zoom, setZoom] = useState(100)
  const docContainerRef = useRef(null)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 70))

  const handlePrintDoc = () => {
    const printWindow = window.open(draftBaPdf, '_blank')
    if (printWindow) {
      printWindow.focus()
    }
  }

  const handleFullscreenDoc = () => {
    if (!docContainerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      docContainerRef.current.requestFullscreen()
    }
  }

  return (
    <div
      ref={docContainerRef}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-white px-5 py-3 gap-2">
        <div className="flex items-center gap-2 text-[#172f55] font-bold text-sm">
          <FileText size={19} className="text-[#172f55]" />
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-100 rounded transition text-slate-600"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="font-medium px-1 text-slate-800">{zoom}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-100 rounded transition text-slate-600"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <button
            type="button"
            onClick={handlePrintDoc}
            className="p-1 hover:bg-slate-100 rounded transition text-slate-600"
            title="Cetak Dokumen Ini"
          >
            <Printer size={15} />
          </button>
          <button
            type="button"
            onClick={handleFullscreenDoc}
            className="p-1 hover:bg-slate-100 rounded transition text-slate-600"
            title="Layar Penuh Dokumen"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* RENDER DOKUMEN PDF BERITA ACARA */}
      <div className="p-4 sm:p-6 bg-slate-100 flex justify-center overflow-x-auto min-h-[560px]">
        <div
          className="bg-white shadow-md rounded-lg max-w-[850px] w-full h-[650px] border border-slate-200 overflow-hidden transition-all duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <iframe
            src={`${draftBaPdf}#toolbar=0&navpanes=0`}
            title="Pratinjau Berita Acara Yudisium DTEDI"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* FOOTER DOKUMEN (TANPA KETERANGAN HALAMAN 1 DARI 1) */}
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-emerald-600 shrink-0" />
          <span>Format Dokumen Resmi Rapat Yudisium DTEDI SV UGM • Sesuai Standar Akademik Keputusan Departemen</span>
        </div>
        <p>Nomor Dokumen: 142/UN1/SV.3/DTEDI/BAK/2026</p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function BeritaAcaraPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // State tampilan ('1' | '2' | '3' | '4A' | '4B' | '5')
  const [viewState, setViewState] = useState('2')

  const [revisionNote, setRevisionNote] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [submitErr, setSubmitErr] = useState('')

  const handleSendRevision = (e) => {
    e.preventDefault()
    if (!revisionNote.trim()) {
      setSubmitErr('Catatan rincian kesalahan data wajib diisi.')
      return
    }
    if (!agreeTerms) {
      setSubmitErr('Centang pernyataan keabsahan data terlebih dahulu.')
      return
    }
    setSubmitErr('')
    setViewState('4B')
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onOpenSidebar={() => setSidebarOpen(true)} />

      <main className="ml-0 lg:ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-4 sm:px-7 py-6 sm:py-8 space-y-6">

          {/* ============================================================================ */}
          {/* TAMPILAN 1: DRAFT BELUM TERSEDIA                                             */}
          {/* ============================================================================ */}
          {viewState === '1' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-950">Berita Acara</h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  Pusat peninjauan draft, konfirmasi data kelulusan, dan pengunduhan dokumen resmi Berita Acara
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
                <div className="relative mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-[#eef4ff] text-[#1e3a8a]">
                  <FileSpreadsheet size={36} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#855b14] border-2 border-white" />
                  <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600">
                    <Hourglass size={14} />
                  </div>
                </div>

                <div className="max-w-xl mx-auto space-y-1.5">
                  <h3 className="text-xl font-bold text-gray-950">Draft Berita Acara Belum Tersedia</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Dokumen Berita Acara saat ini belum dapat ditampilkan. Hal ini umumnya terjadi karena berkas pendaftaran yudisium Anda belum diserahkan atau masih dalam antrean validasi transkrip oleh Bagian Akademik DTEDI SV UGM.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto pt-2 text-left">
                  <div className="rounded-2xl bg-[#edf4ff] border border-[#c0d8fd] p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-slate-800 shadow-2xs border border-slate-100">
                          <span className="h-2 w-2 rounded-full bg-[#855b14]" />
                          <span>Skenario 1</span>
                        </div>
                        <FileText size={19} className="text-slate-400" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900">Belum Mengajukan Yudisium</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Draft Berita Acara hanya dapat digenerate setelah Anda mengunggah dokumen dan identitas diri Anda dalam pengajuan yudisium.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/pengajuan-yudisium')}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#142f57] py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#0f2444] transition shadow-xs"
                    >
                      <span>Menuju Form Pengajuan</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-[#edf4ff] border border-[#c0d8fd] p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-slate-800 shadow-2xs border border-slate-100">
                          <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                          <span>Skenario 2</span>
                        </div>
                        <ShieldCheck size={19} className="text-slate-400" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900">Sedang Verifikasi Berkas</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Jika Anda telah mengajukan berkas, petugas akademik sedang melakukan rekonsiliasi data SKS kumulatif dan predikat kelulusan ke dalam draf resmi.
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white p-3 text-xs sm:text-sm text-slate-700 shadow-2xs border border-slate-100">
                      <Info size={16} className="text-amber-500 shrink-0" />
                      <span>Estimasi audit: 1–3 hari kerja</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAMPILAN 2: REVIEW DRAFT MAHASISWA                                           */}
          {/* ============================================================================ */}
          {viewState === '2' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-[#cce1f8] bg-[#ebf3fc] p-5 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eab308] text-[#713f12]">
                  <PenTool size={20} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-950">
                    Periksa Ketelitian Data Draft Berita Acara Kelulusan
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-900 leading-relaxed">
                    Staf Administrasi Akademik DTEDI telah selesai menyusun draft Berita Acara Kelulusan kolektif mahasiswa. Silakan periksa dengan teliti seluruh rincian biodata, ejaan nama lengkap, NIK, NIM, judul Proyek Akhir / Tugas Akhir, IPK, perolehan nilai, dan kelayakan berkas. Ketelitian data ini mutlak diperlukan sebelum dokumen diteruskan ke Ketua Program Studi (Kaprodi).
                  </p>
                </div>
              </div>

              <DocumentViewer />

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#142f57]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-base">Pernyataan Persetujuan Isi Berita Acara Kelulusan</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Data di atas merupakan rekapitulasi draft Berita Acara Kelulusan dari Staf Administrasi Akademik DTEDI SV UGM. Dengan menekan tombol Data Benar &amp; Konfirmasi, Anda menyatakan bahwa data pribadi, nilai akademik, judul tugas akhir, dan syarat kelulusan Anda pada baris yang disorot telah sesuai dan siap diajukan ke Kaprodi untuk pengesahan yudisium resmi.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewState('3')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-red-700 bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-50 transition"
                  >
                    <AlertCircle size={17} className="text-red-700 shrink-0" />
                    <span>Data Salah / Catatan Revisi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState('4A')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#142f57] px-7 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#0f2444] transition shadow-xs"
                  >
                    <CheckCircle2 size={17} />
                    <span>Data Benar &amp; Konfirmasi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAMPILAN 3: FORM REVISI TERBUKA                                              */}
          {/* ============================================================================ */}
          {viewState === '3' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-[#cce1f8] bg-[#ebf3fc] p-5 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eab308] text-[#713f12]">
                  <PenTool size={20} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-950">
                    Periksa Ketelitian Data Draft Berita Acara Kelulusan
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-900 leading-relaxed">
                    Staf Administrasi Akademik DTEDI telah selesai menyusun draft Berita Acara Kelulusan kolektif mahasiswa. Silakan periksa dengan teliti seluruh rincian biodata, ejaan nama lengkap, NIK, NIM, judul Proyek Akhir / Tugas Akhir, IPK, perolehan nilai, dan kelayakan berkas. Ketelitian data ini mutlak diperlukan sebelum dokumen diteruskan ke Ketua Program Studi (Kaprodi).
                  </p>
                </div>
              </div>

              <DocumentViewer />

              <form onSubmit={handleSendRevision} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#ebf3fc] border-b border-[#cce1f8] p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-950">
                    Formulir Catatan Kesalahan Data &amp; Pengajuan Revisi
                  </h3>
                  <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mt-0.5">
                    Sanggahan Ketidaksesuaian Draft Berita Acara
                  </p>
                </div>

                <div className="p-5 sm:p-7 space-y-5">
                  <div className="space-y-3">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Rincian Kesalahan Data &amp; Catatan Revisi Mahasiswa <span className="text-red-600">*</span>
                    </label>

                    <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-[#eff6ff] p-4 text-xs text-slate-800">
                      <Info size={17} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Tuliskan secara lengkap dan jelas bagian data mana yang keliru pada draft Berita Acara (misalnya: data diri, ejaan nama, nilai SKS/IPK, skor bahasa inggris, judul tugas akhir Bahasa Indonesia/Inggris, gelar pembimbing, dll.) beserta rincian pembetulan yang benar.
                      </p>
                    </div>

                    <textarea
                      rows={5}
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      placeholder={`Contoh format catatan:\n1. Terjemahan Judul Tugas Akhir Bahasa Inggris: Pada draft tertulis 'Evaduation', yang benar adalah 'Graduation'.\n2. Penulisan Gelar Pembimbing: Mohon dilengkapi menjadi 'Dr. Ir. Wahyono, M.Kom.'.`}
                      className="w-full rounded-xl border border-slate-300 p-4 text-xs sm:text-sm outline-none focus:border-[#142f57] transition leading-relaxed"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 bg-[#f0f4fd] p-4">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-md accent-[#142f57] shrink-0"
                    />
                    <span className="text-xs text-slate-900 leading-relaxed">
                      Saya menyatakan dengan sesungguhnya bahwa catatan revisi data Berita Acara ini telah sesuai dengan dokumen statuter resmi yang diajukan dan dapat dipertanggungjawabkan keabsahannya kepada Departemen Teknik Elektro dan Informatika SV UGM.
                    </span>
                  </label>

                  {submitErr && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                      <AlertCircle size={14} /> {submitErr}
                    </p>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-red-700 px-7 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-red-800 transition shadow-xs"
                    >
                      <SendHorizontal size={17} />
                      <span>Kirim Catatan Revisi ke Staf Akademik</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAMPILAN 4A: KONFIRMASI BENAR                                                */}
          {/* ============================================================================ */}
          {viewState === '4A' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-500/80 border-l-[6px] border-l-emerald-600 bg-white p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex gap-4 items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Data Draft Berita Acara Telah Dikonfirmasi Benar</h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-900 leading-relaxed max-w-2xl">
                      Terima kasih atas konfirmasi Anda. Data kelulusan Anda telah tervalidasi dan dinyatakan akurat oleh mahasiswa bersangkutan melalui otentikasi resmi SSO UGM. Data kini terkunci dan diteruskan ke Ketua Program Studi untuk proses pengesahan Berita Acara.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-900">
                      <Calendar size={15} className="text-emerald-600 shrink-0" />
                      <span>16 Oktober 2026, 14:32:08 WIB</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#142f57] px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#0f2444] transition shadow-xs my-auto"
                >
                  <LayoutDashboard size={16} />
                  <span>Kembali ke Dashboard</span>
                </button>
              </div>

              <ProgressTracker activeStep={4} />
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAMPILAN 4B: REVISI TERKIRIM                                                 */}
          {/* ============================================================================ */}
          {viewState === '4B' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-amber-50/80 p-6 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex gap-4 items-start w-full">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-[#78350f]">
                    <Mail size={22} />
                  </div>
                  <div className="w-full min-w-0">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-bold text-slate-900 uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#855b14]" />
                      <span>MENUNGGU TINJAUAN STAF AKADEMIK</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[#142f57]">Catatan Revisi Draft Berita Acara Berhasil Dikirim</h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed w-full">
                      Laporan perbaikan data kelulusan Anda telah berhasil diteruskan ke antrean meja Verifikator Staf Akademik DTEDI SV UGM. Staf akademik akan memeriksa sanggahan Anda dan memperbarui draf Berita Acara sebelum diajukan ke Ketua Program Studi.
                    </p>
                  </div>
                </div>
              </div>

              <ProgressTracker activeStep={3} />
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAMPILAN 5: BERITA ACARA TERBIT & SAH                                        */}
          {/* ============================================================================ */}
          {viewState === '5' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#142f57] p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">Berita Acara Kelulusan Telah Terbit &amp; Sah</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                    Seluruh tahapan verifikasi data, validasi Ketua Program Studi, dan pengesahan rapat pleno Departemen Teknik Elektro dan Informatika telah selesai.
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-xs flex flex-col gap-2.5">
                  <a
                    href={draftBaPdf}
                    download="Berita_Acara_Yudisium_TRPL.pdf"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#FFD32A] px-5 py-2.5 text-xs font-bold text-[#8a6b00] hover:bg-amber-300 transition shadow-xs"
                  >
                    <Download size={16} className="text-[#8a6b00]" />
                    <span>Unduh Berita Acara (PDF)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const printWin = window.open(draftBaPdf, '_blank')
                      if (printWin) printWin.focus()
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/30 transition border border-white/20"
                  >
                    <Printer size={16} />
                    <span>Cetak Dokumen Resmi</span>
                  </button>
                </div>
              </div>

              <DocumentViewer title="Dokumen Resmi Berita Acara Rapat Yudisium" />
            </div>
          )}

        </div>
      </main>
    </div>
  )
}