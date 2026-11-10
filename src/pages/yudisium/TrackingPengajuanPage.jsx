import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  LogOut,
  Check,
  AlertTriangle,
  Pencil,
  ArrowRight,
  Info,
  Star,
  Megaphone,
  PlayCircle,
  Award,
  ClipboardList,
  Menu,
  X,
  Image as ImageIcon,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'
import profilePhoto from '../../assets/pasfoto.png'

const uploadedDocuments = [
  { no: '01', title: 'Form Pengajuan Yudisium', fileName: 'Form_Pengajuan_Yudisium_Raihananta.pdf', size: '340 KB', date: '14 Nov 09:12', type: 'pdf' },
  { no: '02', title: 'Form Pembatalan Mata Kuliah Pilihan', fileName: 'Form_Pembatalan_MK_Pilihan.pdf', size: '215 KB', date: '14 Nov 09:15', type: 'pdf' },
  { no: '03', title: 'Form Checklist Judul Proyek Akhir', fileName: 'Checklist_Judul_TA_Signed.pdf', size: '410 KB', date: '14 Nov 09:18', type: 'pdf' },
  { no: '04', title: 'Pas Photo 4×6 Latar Biru', fileName: 'Pasfoto_4x6_Raihananta.png', size: '1.2 MB', date: '14 Nov 09:20', type: 'img' },
  { no: '05', title: 'Transkrip Nilai Sementara', fileName: 'Transkrip_Nilai_Sementara_Simaster.pdf', size: '650 KB', date: '14 Nov 09:22', type: 'pdf' },
  { no: '06', title: 'Surat Tanda Terima Menyerahkan Skripsi & Bebas Perpustakaan UGM', fileName: 'Bebas_Perpustakaan_UGM.pdf', size: '480 KB', date: '14 Nov 09:25', type: 'pdf' },
  { no: '07', title: 'Ijazah Terakhir', fileName: 'Ijazah_SMA_SMK_Legalisir.pdf', size: '890 KB', date: '14 Nov 09:28', type: 'pdf' },
  { no: '08', title: 'Sertifikat PPSMB', fileName: 'Sertifikat_PPSMB_Pionir.pdf', size: '720 KB', date: '14 Nov 09:30', type: 'pdf' },
  { no: '09', title: 'Hasil Cek Plagiasi Turnitin', fileName: 'Hasil_Cek_Plagiasi_Turnitin_14%.pdf', size: '1.1 MB', date: '14 Nov 09:33', type: 'pdf' },
  { no: '10', title: 'Sertifikat Kemampuan Bahasa Inggris', fileName: 'Sertifikat_AcEPT_UGM_Skor268.pdf', size: '530 KB', date: '14 Nov 09:35', type: 'pdf' },
  { no: '11', title: 'Sertifikat Kompetensi Bidang', fileName: 'Sertifikat_Kompetensi_BNSP_JuniorWebDev.pdf', size: '1.4 MB', date: '14 Nov 09:38', type: 'pdf' },
  { no: '12', title: 'Lembar Halaman Pengesahan', fileName: 'Lembar_Pengesahan_TA_Asli.pdf', size: '1.8 MB', date: '14 Nov 09:40', type: 'pdf' },
  { no: '13', title: 'Unggah Draft Publikasi/Makalah', fileName: 'Draft_Publikasi_Jurnal_Sinta2.pdf', size: '2.4 MB', date: '14 Nov 09:42', type: 'pdf' },
  { no: '14', title: 'Transkrip Nilai D3', fileName: 'Tidak Berlaku', size: '', date: 'Mahasiswa Jalur Reguler', type: 'disabled' },
  { no: '15', title: 'Surat Bebas Lab', fileName: 'Surat_Bebas_Lab_DTEDI.pdf', size: '310 KB', date: '14 Nov 09:45', type: 'pdf' },
]

const timelineStepsData = [
  { id: 1, title: 'Pengajuan Yudisium', desc: 'Unggah berkas persyaratan', date: '21 Okt 2026' },
  { id: 2, title: 'Verifikasi Pengajuan Yudisium', desc: 'Staf akademik memeriksa berkas', date: '23 Okt 2026' },
  { id: 3, title: 'Verifikasi Draft Berita Acara', desc: 'Anda memeriksa data draft BA', date: '25 Okt 2026' },
  { id: 4, title: 'Validasi Kaprodi', desc: 'Review & persetujuan', date: '26 Okt 2026' },
  { id: 5, title: 'Pengesahan Manit', desc: 'TTE Manit setelah Kaprodi', date: '27 Okt 2026' },
  { id: 6, title: 'Pengesahan Kadep', desc: 'TTE Kadep setelah Manit', date: '28 Okt 2026' },
  { id: 7, title: 'Penerbitan Berita Acara Final', desc: 'Berita Acara sah TTE siap unduh', date: '28 Okt 2026' },
]

const PdfIcon = () => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100">
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5V9H8c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V9H13c.83 0 1.5.67 1.5 1.5v3zm4-3.5h-3v1.5h2v1.5h-2V15h-1.5V9h4.5v1.5zM7 10.5h1v1H7v-1zm4.5 0h1v3h-1v-3z" />
    </svg>
  </span>
)

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
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm"
          >
            <FileText size={20} strokeWidth={2} className="text-[#FFD32A]" />
            <span className="text-sm font-semibold">Pengajuan Yudisium</span>
          </button>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/berita-acara') }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <ShieldCheck size={20} strokeWidth={1.8} />
            <span className="text-sm">Berita Acara</span>
          </button>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/panduan') }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <BookOpen size={20} strokeWidth={1.8} />
            <span className="text-sm">Panduan &amp; Dokumen</span>
          </button>
        </nav>
      </aside>
    </>
  )
}

function Header({ onToggleSidebar }) {
  const navigate = useNavigate()
  const [user] = useState(() => getUser() || { name: 'Raihananta Khoiril Anam Pitoyo', email: 'raihananta.k@mail.ugm.ac.id' })
  const [profileOpen, setProfileOpen] = useState(false)

  const displayName = user?.name || 'Raihananta Khoiril Anam Pitoyo'
  const email = user?.email || 'raihananta.k@mail.ugm.ac.id'

  const DefaultAvatarIcon = () => (
    <div className="relative h-full w-full rounded-full bg-[#c7cbd1] flex items-center justify-center overflow-hidden">
      <div className="absolute top-[22%] h-[36%] w-[36%] rounded-full bg-white" />
      <div className="absolute bottom-[-10%] h-[50%] w-[75%] rounded-full bg-white" />
    </div>
  )

  return (
    <header className="fixed left-0 lg:left-[272px] right-0 top-0 z-30 flex h-[76px] lg:h-[88px] items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-lg sm:text-2xl lg:text-[28px] font-bold leading-tight text-gray-950">Pengajuan Yudisium</h1>
          <p className="hidden sm:block mt-0.5 text-xs lg:text-sm text-gray-500">Sistem Informasi Yudisium Terpadu DTEDI SV UGM</p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center gap-2 rounded-full py-1 px-1.5 hover:bg-gray-50 transition"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
            <DefaultAvatarIcon />
          </div>
          <span className="hidden md:inline text-[15px] font-bold text-gray-900 tracking-tight">{displayName}</span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[52px] sm:top-[58px] w-[300px] sm:w-[380px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-5 sm:p-6">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-xs font-semibold text-gray-400 text-left">{email}</p>
            </div>
            <div className="flex flex-col items-center py-5">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] border-[#e8edf5] bg-[#c7cbd1] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <DefaultAvatarIcon />
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[2.5px] border-white bg-[#5dbb67]" />
              </div>
              <p className="mt-3 text-base sm:text-[18px] font-bold text-gray-900 text-center tracking-tight">{displayName}</p>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <button
                type="button"
                onClick={() => { setProfileOpen(false); navigate('/profile') }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#163b6c]">
                  <UserRound size={18} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-gray-900">Profil Saya</span>
                  <span className="text-xs text-gray-400">Ubah nama dan foto profil</span>
                </div>
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                type="button"
                onClick={() => { clearUser(); setProfileOpen(false); navigate('/') }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-red-50/60 transition"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fde8e7] text-[#d9362b]">
                  <LogOut size={18} />
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

export default function TrackingPengajuanPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // STATE TRACKING STATUS: 'normal' | 'revisi' | 'disetujui'
  const [status] = useState('revisi') 

  const currentActiveStep = status === 'disetujui' ? 7 : 2

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} />

      <main className="lg:ml-[272px] pt-[76px] lg:pt-[88px] pb-16">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
          
          {/* ========================================================= */}
          {/* 1. SECTION PELACAKAN PROGRES YUDISIUM                     */}
          {/* ========================================================= */}
          <section className="rounded-2xl bg-white p-5 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF3FC] border border-[#BBE0F5] text-[#142F57]">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pelacakan Progres Pengajuan Yudisium</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Pantau perkembangan tahapan kelulusan dan pengesahan Berita Acara secara real-time
                  </p>
                </div>
              </div>

              {/* BUTTON EDIT / PERBAIKAN PENGAJUAN */}
              {status === 'revisi' ? (
                <button
                  type="button"
                  onClick={() => navigate('/pengajuan-yudisium/edit')}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#C27803] bg-[#FFFDF5] px-5 py-2.5 text-sm font-semibold text-[#A05E03] shadow-2xs hover:bg-[#FDF3D6] transition w-full sm:w-auto"
                >
                  <Pencil size={16} className="text-[#A05E03]" />
                  <span>Perbaiki Pengajuan Yudisium</span>
                </button>
              ) : status !== 'disetujui' ? (
                <button
                  type="button"
                  onClick={() => navigate('/pengajuan-yudisium/edit')}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition w-full sm:w-auto"
                >
                  <Pencil size={16} className="text-slate-800" />
                  <span>Edit Pengajuan Yudisium</span>
                </button>
              ) : null}
            </div>

            {/* TIMELINE STEPS */}
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden lg:block mt-8 relative px-2">
              <div className="absolute top-[24px] left-[7%] right-[7%] h-[4px] z-0 flex">
                {timelineStepsData.slice(0, 6).map((step) => {
                  const isPassed = step.id < currentActiveStep || (status === 'disetujui' && step.id <= 7)
                  return (
                    <div
                      key={`line-desk-${step.id}`}
                      className={`flex-1 h-full transition-colors duration-300 ${
                        isPassed ? 'bg-[#1b345f]' : 'bg-slate-200'
                      }`}
                    />
                  )
                })}
              </div>

              <div className="grid grid-cols-7 gap-2 text-center relative z-10">
                {timelineStepsData.map((step) => {
                  const isCompleted = step.id < currentActiveStep || status === 'disetujui'
                  const isActive = step.id === currentActiveStep

                  return (
                    <div key={`desk-${step.id}`} className="flex flex-col items-center">
                      <div className="h-12 w-12 flex items-center justify-center shrink-0">
                        {step.id === 7 && status === 'disetujui' ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3CB67] shadow-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C4A11] text-[#F3CB67]">
                              <Star size={18} fill="currentColor" />
                            </div>
                          </div>
                        ) : isCompleted ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b345f] text-white shadow-xs">
                            <Check size={20} strokeWidth={2.5} />
                          </div>
                        ) : isActive && status === 'revisi' ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF3D6] p-1 shadow-xs">
                            <div className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#C27803] bg-[#FFFDF5]">
                              <AlertTriangle size={18} strokeWidth={2.2} className="text-[#A05E03]" />
                            </div>
                          </div>
                        ) : isActive ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0] p-1">
                            <div className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#1b345f] bg-white text-[#1b345f] text-sm font-bold">
                              {step.id}
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-sm font-bold">
                            {step.id}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 h-[40px] flex items-start justify-center">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight max-w-[115px]">{step.title}</h4>
                      </div>

                      <div className="mt-1 h-[32px] flex items-start justify-center">
                        <p className={`text-[11px] leading-tight max-w-[110px] ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.desc}
                        </p>
                      </div>

                      <div className="mt-2 h-[28px] flex items-center justify-center">
                        {isActive && status === 'revisi' ? (
                          <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">Perlu Revisi</span>
                        ) : isCompleted ? (
                          <span className="text-[11px] font-bold text-emerald-700">✓ Selesai</span>
                        ) : isActive ? (
                          <span className="rounded-md bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">Proses Aktif</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Menunggu</span>
                        )}
                      </div>

                      <div className="h-[20px] flex items-center justify-center">
                        {isCompleted && <span className="text-[10px] text-slate-700 font-medium">{step.date}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* --- MOBILE & TABLET VIEW VERTICAL STEPPER (< lg) --- */}
            <div className="block lg:hidden mt-6 space-y-4">
              {timelineStepsData.map((step, idx) => {
                const isCompleted = step.id < currentActiveStep || status === 'disetujui'
                const isActive = step.id === currentActiveStep
                const isPassed = step.id < currentActiveStep || (status === 'disetujui' && step.id <= 7)

                return (
                  <div key={`mob-${step.id}`} className="relative flex items-start gap-4">
                    {/* Vertical Connector Line */}
                    {idx !== timelineStepsData.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 bottom-[-16px] w-[3px] z-0 ${
                          isPassed ? 'bg-[#1b345f]' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div className="relative z-10 shrink-0">
                      {step.id === 7 && status === 'disetujui' ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3CB67]">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6C4A11] text-[#F3CB67]">
                            <Star size={14} fill="currentColor" />
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b345f] text-white">
                          <Check size={18} strokeWidth={2.5} />
                        </div>
                      ) : isActive && status === 'revisi' ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF3D6] p-0.5">
                          <div className="flex h-full w-full items-center justify-center rounded-full border-[2.5px] border-[#C27803] bg-[#FFFDF5]">
                            <AlertTriangle size={16} strokeWidth={2.2} className="text-[#A05E03]" />
                          </div>
                        </div>
                      ) : isActive ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2E8F0] p-0.5">
                          <div className="flex h-full w-full items-center justify-center rounded-full border-[2.5px] border-[#1b345f] bg-white text-[#1b345f] text-xs font-bold">
                            {step.id}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs font-bold">
                          {step.id}
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pt-0.5 pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                        <div>
                          {isActive && status === 'revisi' ? (
                            <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Perlu Revisi</span>
                          ) : isCompleted ? (
                            <span className="text-[11px] font-bold text-emerald-700">✓ Selesai</span>
                          ) : isActive ? (
                            <span className="rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold text-amber-800">Proses Aktif</span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Menunggu</span>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs mt-0.5 ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>{step.desc}</p>
                      {isCompleted && <p className="text-[10px] text-slate-500 font-medium mt-1">{step.date}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ALERT REVISI */}
            {status === 'revisi' && (
              <div className="mt-8 flex items-start gap-4 rounded-2xl border border-amber-200/80 bg-[#fffdf5] p-4 sm:p-5 shadow-2xs">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7c4d12] text-[#F59E0B]">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Pengajuan Yudisium Anda Dikembalikan oleh Staf Akademik
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Terdapat hal yang perlu diperbaiki pada pengajuan yudisium Anda:<br />
                    <span className="font-normal text-slate-700">(1) Pas Foto tidak terlihat jelas, dan (2) NIM tidak sesuai dengan SIMASTER</span>
                  </p>
                </div>
              </div>
            )}

            {/* ALERT DISETUJUI & PENGINGAT HARDCOPY */}
            {status === 'disetujui' && (
              <div className="mt-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#E6F8F0] p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C1F0DC] text-[#065F46]">
                      <Award size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Berita Acara Kelulusan Telah Terbit &amp; Sah
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#065F46]">
                        Dokumen resmi Berita Acara kelulusan Anda telah ditandatangani secara elektronik oleh pengurus pleno departemen dan siap diunduh untuk syarat wisuda.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/berita-acara')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1b345f] px-5 py-3 text-sm font-medium text-white shadow-md hover:bg-[#122443] transition shrink-0 w-full sm:w-auto"
                  >
                    <span>Unduh Berita Acara Resmi</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Box Pengingat Hardcopy */}
                <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-100 space-y-5">
                  <div className="flex items-center gap-3.5 pb-4 border-b border-blue-100">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]">
                      <Megaphone size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Pengingat Pengumpulan Berkas Hardcopy</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Mahasiswa wajib menyerahkan 4 berkas fisik cetak secara langsung ke Bagian Akademik. Abaikan jika Anda sudah menyerahkan berkas.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#F0F4FB] p-4 sm:p-5 border border-[#E5D7C5] flex items-start gap-4">
                      <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#E2EAF7] text-xs font-bold text-[#A3783E]">
                        01
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-[#142F57]">Pasfoto 4×6 Latar Belakang Biru (1 Lembar)</h5>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          Kemeja putih dan jas/blazer hitam resmi (bukan jas almamater), latar belakang biru tua, cetak foto studio berkualitas tajam (bukan foto ponsel atau hasil scan).
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F0F4FB] p-4 sm:p-5 border border-[#E5D7C5] flex items-start gap-4">
                      <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#E2EAF7] text-xs font-bold text-[#A3783E]">
                        02
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-[#142F57]">Sertifikat Kemampuan Bahasa Inggris</h5>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          Sertifikat asli atau legalisir. Wajib melampirkan sertifikat pendamping resmi apabila skor belum memenuhi batas standar minimal yudisium.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F0F4FB] p-4 sm:p-5 border border-[#E5D7C5] flex items-start gap-4">
                      <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#E2EAF7] text-xs font-bold text-[#A3783E]">
                        03
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-[#142F57]">Formulir Checklist Judul TA / Proyek Akhir</h5>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          Lembar cetak checklist judul TA/Proyek Akhir yang telah disetujui dan ditandatangani asli oleh Dosen Pembimbing TA.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F0F4FB] p-4 sm:p-5 border border-[#E5D7C5] flex items-start gap-4">
                      <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#E2EAF7] text-xs font-bold text-[#A3783E]">
                        04
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-[#142F57]">Lembar Pengesahan Asli TA / Proyek Akhir</h5>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          Lembar pengesahan asli (1 eksemplar) bertandatangan basah dan berstempel lengkap dari tim dosen penguji, dosen pembimbing, serta Ketua Departemen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* 2. SECTION IDENTITAS DIRI                                  */}
          {/* ========================================================= */}
          <section className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-[#F4F7FC] px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100">
              <h3 className="text-lg sm:text-xl font-bold text-[#142F57]">Identitas Diri</h3>
            </div>

            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                <img
                  src={profilePhoto}
                  alt="Pasfoto Raihananta"
                  className="h-[180px] w-[140px] rounded-2xl object-cover shadow-xs shrink-0 border border-slate-100 mx-auto md:mx-0"
                />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full pt-1">
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">NAMA LENGKAP</p>
                    <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">Raihananta Khoiril Anam Pitoyo</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">NOMOR INDUK MAHASISWA (NIM)</p>
                    <p className="mt-1 text-base sm:text-lg font-bold text-[#1b345f]">24/542538/SV/25053</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">PROGRAM STUDI</p>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">Sarjana Terapan Teknologi Rekayasa Perangkat Lunak</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-slate-100">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">DOSEN PEMBIMBING PROYEK AKHIR</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">Dr. Ir. Budi Santoso, M.T.</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-slate-100">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">NOMOR WHATSAPP AKTIF MAHASISWA</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">+62 81234567890</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-slate-100">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TAUTAN (LINK) VIDEO PRESENTASI TUGAS AKHIR</p>
                    <a
                      href="https://youtube.com/video-presentasi"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#C8392B] hover:underline"
                    >
                      <PlayCircle size={16} className="text-[#C8392B] shrink-0" />
                      <span className="truncate">youtube.com/video-presentasi</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. SECTION DOKUMEN PERSYARATAN TERUNGGAH                   */}
          {/* ========================================================= */}
          <section className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-[#F4F7FC] px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100">
              <h3 className="text-lg sm:text-xl font-bold text-[#142F57]">Dokumen Persyaratan</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase bg-[#F8FAFC]">
                    <th className="py-4 px-6 sm:px-8 w-16">NO</th>
                    <th className="py-4 px-4 sm:px-6">DOKUMEN STATUTER</th>
                    <th className="py-4 px-6 sm:px-8">BERKAS / TAUTAN TERUNGGAH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {uploadedDocuments.map((doc) => (
                    <tr key={doc.no} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 sm:px-8 font-bold text-slate-400">{doc.no}</td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 max-w-[320px]">
                        {doc.title}
                        {doc.type === 'disabled' && (
                          <span className="block text-xs font-normal text-slate-400 italic mt-0.5">
                            Khusus mahasiswa alih jalur / lanjutan (Tidak berlaku untuk reguler)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 sm:px-8">
                        {doc.type === 'disabled' ? (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Info size={16} />
                            <div>
                              <p className="text-xs font-bold text-slate-500">Tidak Berlaku</p>
                              <p className="text-[11px] text-slate-400">{doc.date}</p>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={`https://siyudis.dtedi.ugm.ac.id/files/${doc.fileName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-3 hover:underline"
                          >
                            {doc.type === 'img' ? (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                <ImageIcon size={18} />
                              </span>
                            ) : (
                              <PdfIcon />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#1b345f] group-hover:text-blue-900 truncate max-w-[220px] sm:max-w-none">
                                {doc.fileName}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {doc.size} • {doc.date}
                              </p>
                            </div>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}