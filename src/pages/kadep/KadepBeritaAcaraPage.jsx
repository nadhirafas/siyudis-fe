import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  ShieldCheck,
  BookOpen,
  Menu,
  X,
  UserRound,
  LogOut,
  Search,
  FileText,
  FileCheck2,
  Download,
  CornerUpLeft,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  History,
  Inbox,
  Send
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'
import beritaAcaraTrplPdf from '../../assets/berita-acara-trpl.pdf'
import beritaAcaraTriPdf from '../../assets/berita-acara-tri.pdf'
import beritaAcaraTrePdf from '../../assets/berita-acara-tre.pdf'

const SignatureStrokeIcon = ({ size = 20, color = '#9A6B29' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 16c2-4 4-8 6-4s-1 6 2 6 5-5 7-1" />
  </svg>
)

const DefaultAvatarCircle = () => (
  <div className="relative h-full w-full rounded-full bg-[#c7cbd1] flex items-center justify-center overflow-hidden">
    <div className="absolute top-[22%] h-[36%] w-[36%] rounded-full bg-white" />
    <div className="absolute bottom-[-10%] h-[50%] w-[75%] rounded-full bg-white" />
  </div>
)

const EmptyStateDoubleLayerIcon = () => (
  <div className="relative flex h-24 w-24 items-center justify-center rounded-[26px] bg-[#EEF3FA]">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-2xs">
      <FileText size={26} strokeWidth={2} className="text-[#64748B]" />
    </div>
    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EBC644] text-xs font-black text-gray-900 shadow-2xs">
      !
    </span>
  </div>
)

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
              navigate('/approver/dashboard')
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            type="button"
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm text-white font-semibold"
          >
            <ShieldCheck size={20} strokeWidth={2} className="text-[#FFD32A]" />
            <span className="text-sm">Berita Acara</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/approver/panduan')
            }}
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

function Header({ onOpenSidebar, userDisplayName, userEmail, userPhoto }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

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
          <h1 className="text-xl lg:text-[28px] font-bold leading-tight text-gray-950">
            Berita Acara Kepala Departemen
          </h1>
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
          {userPhoto ? (
            <img src={userPhoto} alt="" className="h-9 w-9 lg:h-10 lg:w-10 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 lg:h-10 lg:w-10 shrink-0">
              <DefaultAvatarCircle />
            </div>
          )}
          <span className="hidden sm:inline-block text-xs lg:text-[15px] font-bold text-gray-900 tracking-tight">
            {userDisplayName}
          </span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[58px] w-[300px] sm:w-[380px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-5 sm:p-6">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-xs font-semibold text-gray-400 text-left">{userEmail}</p>
            </div>

            <div className="flex flex-col items-center py-5">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] border-[#e8edf5] bg-[#c7cbd1] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {userPhoto ? (
                    <img src={userPhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <DefaultAvatarCircle />
                  )}
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[2.5px] border-white bg-[#5dbb67]" />
              </div>

              <p className="mt-4 text-base sm:text-[18px] font-bold text-gray-900 text-center tracking-tight">
                {userDisplayName}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/approver/profile')
                }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition border-b border-gray-100"
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
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition border-b border-gray-100"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#9A6B29]">
                  <SignatureStrokeIcon size={20} color="#9A6B29" />
                </span>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-gray-900">Tanda Tangan</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Kelola e-sign Anda</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-red-50/60 transition pt-3"
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

const INITIAL_PRODI_DATA = {
  TRPL: {
    code: 'TRPL',
    fullName: 'Teknologi Rekayasa Perangkat Lunak',
    status: 'pending', // 'pending' | 'approved' | 'unsubmitted'
    kaprodiApprovedDate: '3 November 2026',
    activeDraft: {
      id: 1,
      periode: 'Periode Oktober 2026',
      docNumber: '104/UN1/SV.DTEDI/BA-YUD/VI/2024',
      pdfFile: beritaAcaraTrplPdf,
      students: [
        { initials: 'NA', name: 'Nadila Aulia Rahma', nim: '22/505388/SV/21878', predikat: 'Cumlaude' },
        { initials: 'GR', name: 'Gilang Ramadhan Putra', nim: '22/505700/SV/22013', predikat: 'Cumlaude' },
        { initials: 'RA', name: 'Rizky Adi Nugroho', nim: '22/505810/SV/22028', predikat: 'Tidak Cumlaude' },
        { initials: 'DB', name: 'Dimas Bagus Saputra', nim: '22/506015/SV/22054', predikat: 'Tidak Cumlaude' }
      ]
    },
    history: [
      {
        id: 101,
        periode: 'Periode September 2026',
        approvedDate: '5 Oktober 2026',
        docNumber: '098/UN1/SV.DTEDI/BA-YUD/V/2024',
        pdfFile: beritaAcaraTrplPdf,
        students: [
          { initials: 'AF', name: 'Anisa Fitriani', nim: '22/501120/SV/21410', predikat: 'Cumlaude' },
          { initials: 'BP', name: 'Bagas Pratama', nim: '22/501245/SV/21455', predikat: 'Tidak Cumlaude' }
        ]
      }
    ]
  },
  TRI: {
    code: 'TRI',
    fullName: 'Teknologi Rekayasa Internet',
    status: 'pending',
    kaprodiApprovedDate: '4 November 2026',
    activeDraft: {
      id: 2,
      periode: 'Periode Oktober 2026',
      docNumber: '105/UN1/SV.DTEDI/BA-YUD/VI/2024',
      pdfFile: beritaAcaraTriPdf,
      students: [
        { initials: 'FA', name: 'Farhan Alamsyah', nim: '22/504112/SV/21610', predikat: 'Cumlaude' },
        { initials: 'SN', name: 'Salsabila Nurul Izzah', nim: '22/504390/SV/21688', predikat: 'Cumlaude' },
        { initials: 'MR', name: 'Muhammad Reza Pahlevi', nim: '22/504621/SV/21740', predikat: 'Tidak Cumlaude' }
      ]
    },
    history: [
      {
        id: 201,
        periode: 'Periode September 2026',
        approvedDate: '5 Oktober 2026',
        docNumber: '099/UN1/SV.DTEDI/BA-YUD/V/2024',
        pdfFile: beritaAcaraTriPdf,
        students: [
          { initials: 'DA', name: 'Daffa Ardiansyah', nim: '22/501990/SV/21501', predikat: 'Cumlaude' }
        ]
      }
    ]
  },
  TRE: {
    code: 'TRE',
    fullName: 'Teknologi Rekayasa Elektro',
    status: 'approved',
    kaprodiApprovedDate: '2 November 2026',
    activeDraft: null,
    history: [
      {
        id: 301,
        periode: 'Periode Oktober 2026',
        approvedDate: '6 November 2026',
        docNumber: '103/UN1/SV.DTEDI/BA-YUD/VI/2024',
        pdfFile: beritaAcaraTrePdf,
        students: [
          { initials: 'AW', name: 'Aditya Wijaya Kusuma', nim: '22/503110/SV/21512', predikat: 'Cumlaude' },
          { initials: 'KP', name: 'Kartika Putri Dewi', nim: '22/503425/SV/21590', predikat: 'Cumlaude' },
          { initials: 'HS', name: 'Hendra Setiawan', nim: '22/503780/SV/21644', predikat: 'Tidak Cumlaude' }
        ]
      }
    ]
  },
  TRIK: {
    code: 'TRIK',
    fullName: 'Teknologi Rekayasa Instrumentasi & Kontrol',
    status: 'unsubmitted',
    kaprodiApprovedDate: null,
    activeDraft: null,
    history: []
  }
}

const PRODI_ORDER = ['TRPL', 'TRI', 'TRE', 'TRIK']

export default function KadepBeritaAcaraPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [storedUser] = useState(() => getUser())

  const userDisplayName = storedUser?.name || 'Kadep TEDI'
  const userEmail = storedUser?.email || 'kadep_tedi@mail.ugm.ac.id'

  // State Prodi Terpilih & Data Seluruh Prodi
  const [selectedProdiCode, setSelectedProdiCode] = useState('TRPL')
  const [prodiMap, setProdiMap] = useState(INITIAL_PRODI_DATA)

  // Tab & Search States
  const [activeTab, setActiveTab] = useState('aktif') // 'aktif' | 'histori'
  const [searchActive, setSearchActive] = useState('')
  const [searchHistory, setSearchHistory] = useState('')

  // Modal States
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returnNote, setReturnNote] = useState('')
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [previewHistoryDoc, setPreviewHistoryDoc] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const currentProdi = prodiMap[selectedProdiCode]
  const activeDraft = currentProdi.activeDraft
  const historyList = currentProdi.history

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handler Pilih Kartu Prodi
  const handleSelectProdi = (code) => {
    setSelectedProdiCode(code)
    setSearchActive('')
    setSearchHistory('')
    setActiveTab('aktif')
  }

  const filteredStudents = activeDraft
    ? activeDraft.students.filter(
        (mhs) =>
          mhs.name.toLowerCase().includes(searchActive.toLowerCase()) ||
          mhs.nim.toLowerCase().includes(searchActive.toLowerCase())
      )
    : []

  const filteredHistory = historyList.filter(
    (item) =>
      item.periode.toLowerCase().includes(searchHistory.toLowerCase()) ||
      item.docNumber.toLowerCase().includes(searchHistory.toLowerCase()) ||
      item.students.some(
        (s) =>
          s.name.toLowerCase().includes(searchHistory.toLowerCase()) ||
          s.nim.toLowerCase().includes(searchHistory.toLowerCase())
      )
  )

  const handleConfirmReturn = (e) => {
    e.preventDefault()
    if (!returnNote.trim()) return

    setProdiMap((prev) => ({
      ...prev,
      [selectedProdiCode]: {
        ...prev[selectedProdiCode],
        status: 'unsubmitted',
        activeDraft: null
      }
    }))

    setReturnModalOpen(false)
    setReturnNote('')
    triggerToast(
      `Draft Berita Acara Prodi ${selectedProdiCode} dikembalikan ke Staf Administrasi beserta catatan revisi.`
    )
  }

  const handleConfirmApprove = () => {
    if (!activeDraft) return

    const newlyApproved = {
      ...activeDraft,
      id: Date.now(),
      approvedDate: '18 November 2026'
    }

    setProdiMap((prev) => ({
      ...prev,
      [selectedProdiCode]: {
        ...prev[selectedProdiCode],
        status: 'approved',
        activeDraft: null,
        history: [newlyApproved, ...prev[selectedProdiCode].history]
      }
    }))

    setApproveModalOpen(false)
    triggerToast(
      `Berita Acara Prodi ${selectedProdiCode} berhasil ditandatangani dan diteruskan kepada Manit!`
    )
  }

  const handleDownloadAssetPdf = (pdfUrl, filename) => {
    const link = document.createElement('a')
    link.href = pdfUrl || beritaAcaraTrplPdf
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast(`Mengunduh ${filename}`)
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header
        onOpenSidebar={() => setSidebarOpen(true)}
        userDisplayName={userDisplayName}
        userEmail={userEmail}
        userPhoto={storedUser?.photo || null}
      />

      <main className="ml-0 lg:ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-4 sm:px-7 py-6 sm:py-8 space-y-6">

          {/* TOAST NOTIFIKASI */}
          {toastMessage && (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-300 px-5 py-3.5 text-xs sm:text-sm font-semibold text-emerald-900 shadow-xs">
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-emerald-700 hover:text-emerald-950"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* HEADER CARD PERSETUJUAN BERITA ACARA */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Persetujuan Berita Acara Yudisium
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-normal">
              Pilih program studi untuk memeriksa daftar mahasiswa lulusan dan dokumen Berita Acara yang telah disetujui Kaprodi sebelum diteruskan ke Manit.
            </p>
          </div>

          {/* STATUS BERITA ACARA PROGRAM STUDI (4 KARTU PRODI) */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Status Berita Acara Program Studi
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 font-normal">
                Indikator warna pada kartu menunjukkan program studi mana yang sedang menunggu persetujuan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {PRODI_ORDER.map((code) => {
                const item = prodiMap[code]
                const isSelected = selectedProdiCode === code

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectProdi(code)}
                    className={`flex flex-col justify-between rounded-2xl p-4 text-left transition bg-white ${
                      isSelected
                        ? 'border-[2px] border-[#142F57] shadow-xs'
                        : 'border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Prodi Pill + Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-[#142F57] px-3 py-1 text-[11px] font-bold text-white tracking-wide">
                          {item.code}
                        </span>

                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF6DE] border border-[#EBD48B] px-2.5 py-0.5 text-[10px] font-bold text-[#7C3F19]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#B45E26]" />
                            Perlu Persetujuan
                          </span>
                        )}

                        {item.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-0.5 text-[10px] font-bold text-[#166534]">
                            <Check size={11} strokeWidth={2.8} />
                            Disetujui
                          </span>
                        )}

                        {item.status === 'unsubmitted' && (
                          <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                            0 Mahasiswa
                          </span>
                        )}
                      </div>

                      {/* Prodi Name */}
                      <p className="mt-3.5 text-xs sm:text-[13px] font-bold text-gray-900 leading-snug min-h-[38px]">
                        {item.fullName} ({item.code})
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      {item.status === 'pending' && (
                        <div className="flex items-center justify-between text-xs font-bold text-[#8E491E]">
                          <span>Menunggu Persetujuan Anda</span>
                          <ArrowRight size={14} className="shrink-0" />
                        </div>
                      )}

                      {item.status === 'approved' && (
                        <div className="flex items-center justify-between text-xs font-bold text-[#166534]">
                          <span>Selesai &bull; Masuk di Histori</span>
                          <CheckCircle2 size={15} className="shrink-0" />
                        </div>
                      )}

                      {item.status === 'unsubmitted' && (
                        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                          <span>Belum Diajukan Kaprodi</span>
                          <Clock size={14} className="shrink-0" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {currentProdi.status === 'pending' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#EED88E] bg-[#FDF8E8] px-5 py-4 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7E8B4] text-[#4A2C0A]">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#4A2C0A]">
                    Menunggu Persetujuan Anda &bull; Program Studi {currentProdi.code}
                  </h4>
                  <p className="mt-0.5 text-xs text-[#944E23] leading-relaxed">
                    Dokumen ini telah disetujui oleh Kaprodi {currentProdi.code} pada {currentProdi.kaprodiApprovedDate}. Setelah Anda setujui, dokumen ini akan langsung berpindah ke{' '}
                    <span className="font-bold text-[#7C3F19]">Histori Berita Acara.</span>
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1.5 self-start sm:self-center rounded-full border border-[#E6CA73] bg-white px-3.5 py-1 text-[11px] font-bold text-[#7C3F19]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B45E26]" />
                Perlu Tindakan
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-2xl bg-[#DCE6F5] p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('aktif')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'aktif'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-[#334155] hover:text-gray-950'
                }`}
              >
                <Inbox
                  size={16}
                  strokeWidth={2.2}
                  className={activeTab === 'aktif' ? 'text-[#111827]' : 'text-[#475569]'}
                />
                <span>Berita Acara Aktif</span>
                {currentProdi.status === 'pending' ? (
                  <span className="ml-0.5 rounded-full bg-[#FDF6DE] border border-[#EBD48B] px-2.5 py-0.5 text-[10px] font-bold text-[#7C3F19]">
                    Menunggu
                  </span>
                ) : (
                  <span
                    className={`ml-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      activeTab === 'aktif'
                        ? 'bg-[#E6EEF9] text-[#334155]'
                        : 'bg-[#CBD8EC] text-[#334155]'
                    }`}
                  >
                    0
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('histori')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'histori'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-[#334155] hover:text-gray-950'
                }`}
              >
                <History
                  size={16}
                  strokeWidth={2.2}
                  className={activeTab === 'histori' ? 'text-[#111827]' : 'text-[#475569]'}
                />
                <span>Histori Berita Acara</span>
                <span
                  className={`ml-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    activeTab === 'histori'
                      ? 'bg-[#E6EEF9] text-[#334155]'
                      : 'bg-[#CBD8EC] text-[#334155]'
                  }`}
                >
                  {historyList.length}
                </span>
              </button>
            </div>
          </div>


          {activeTab === 'aktif' && (
            <>
              {/* KONDISI A: BERITA ACARA PRODI SUDAH DISAHKAN KADEP */}
              {currentProdi.status === 'approved' && (
                <div className="rounded-2xl bg-white p-10 sm:p-14 shadow-2xs border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#ECFDF5] border-[1.5px] border-[#A7F3D0] text-[#15803D]">
                    <CheckCircle2 size={32} strokeWidth={2.2} />
                  </div>

                  <h3 className="mt-6 text-lg sm:text-xl font-bold text-gray-900">
                    Berita Acara Prodi {currentProdi.code} Periode Ini Telah Anda Sahkan
                  </h3>
                  <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    Dokumen Berita Acara beserta data kelulusan mahasiswa pada program studi ini telah selesai Anda tanda tangani dan kini tersimpan di dalam Histori Berita Acara.
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveTab('histori')}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#142F57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0B1E38] transition shadow-xs"
                  >
                    Lihat Histori Berita Acara <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* KONDISI B: BELUM DIAJUKAN KAPRODI */}
              {currentProdi.status === 'unsubmitted' && (
                <div className="rounded-2xl bg-white p-10 sm:p-14 shadow-2xs border border-slate-100 flex flex-col items-center justify-center text-center">
                  <EmptyStateDoubleLayerIcon />

                  <h4 className="mt-5 text-base sm:text-lg font-bold text-gray-900">
                    Belum Ada Berita Acara dari Prodi {currentProdi.code}
                  </h4>
                  <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    Kaprodi {currentProdi.code} belum meneruskan draf Berita Acara Yudisium pada periode ini. Dokumen akan tampil di sini setelah disetujui oleh Kaprodi terkait.
                  </p>
                </div>
              )}

              {/* KONDISI C: MENUNGGU PERSETUJUAN KADEP (FILLED STATE) */}
              {currentProdi.status === 'pending' && activeDraft && (
                <div className="space-y-6">
                  {/* 1. CARD DAFTAR MAHASISWA YUDISIUM */}
                  <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-5">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        Daftar Mahasiswa Yudisium {currentProdi.code} &bull; {activeDraft.periode}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 font-normal">
                        Mahasiswa pada daftar ini telah diverifikasi oleh Kaprodi {currentProdi.code} dan menunggu pengesahan Anda.
                      </p>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchActive}
                        onChange={(e) => setSearchActive(e.target.value)}
                        placeholder="Cari Nama / NIM..."
                        className="w-full rounded-xl border border-slate-200/70 bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 placeholder:text-slate-400 focus:border-[#142F57] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#142F57] transition"
                      />
                    </div>

                    {/* Tabel Mahasiswa */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            <th className="py-3 px-3 w-14">NO</th>
                            <th className="py-3 px-3">MAHASISWA</th>
                            <th className="py-3 px-3">NIM</th>
                            <th className="py-3 px-3">PREDIKAT KELULUSAN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          {filteredStudents.map((mhs, idx) => (
                            <tr key={mhs.nim} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-3 font-semibold text-slate-500">
                                {String(idx + 1).padStart(2, '0')}
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FA] border border-slate-200 text-xs font-bold text-[#142F57]">
                                    {mhs.initials}
                                  </span>
                                  <span className="font-bold text-gray-900">{mhs.name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-slate-700 font-normal">{mhs.nim}</td>
                              <td className="py-3.5 px-3 text-gray-900 font-normal">{mhs.predikat}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Tabel & Paginasi */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span>Menampilkan {filteredStudents.length} mahasiswa</span>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-[#EEF3FA] font-bold text-gray-900">
                          1
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CARD PRATINJAU DOKUMEN BERITA ACARA */}
                  <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#142F57]">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            Dokumen Draft Berita Acara Yudisium &bull; Prodi {currentProdi.code}
                          </h3>
                          <p className="text-xs text-slate-500 font-normal">
                            Pratinjau penuh surat Berita Acara beserta lampiran daftar kelulusan mahasiswa
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadAssetPdf(
                            activeDraft.pdfFile,
                            `Draft_Berita_Acara_${currentProdi.code}_Oktober_2026.pdf`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-slate-50 transition shadow-2xs"
                      >
                        <Download size={15} /> Unduh Draft Berita Acara (PDF)
                      </button>
                    </div>

                    <div className="rounded-2xl bg-[#F4F7FB] p-3 sm:p-4 border border-slate-200/70">
                      <div className="h-[680px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                        <iframe
                          src={`${activeDraft.pdfFile}#toolbar=0&navpanes=0&scrollbar=1`}
                          title={`Pratinjau ${activeDraft.periode} ${currentProdi.code}`}
                          className="h-full w-full border-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-white p-5 sm:p-6 shadow-2xs border border-slate-100 gap-4">
                    <div className="flex items-start gap-3 max-w-md">
                      <ShieldCheck size={20} strokeWidth={2.2} className="shrink-0 text-[#142F57] mt-0.5" />
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">
                        Pastikan isi surat draf Berita Acara di atas telah sesuai sebelum memberikan tanda tangan persetujuan atau mengembalikan ke Staf Administrasi.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setReturnModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDE8E7] border border-[#F5B7B1] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#991B1B] hover:bg-red-100 transition"
                      >
                        Kembalikan ke Staf Administrasi <CornerUpLeft size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setApproveModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#142F57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0B1E38] transition shadow-xs"
                      >
                        Setujui &amp; Tanda Tangani <Check size={16} strokeWidth={2.6} className="text-[#FFD32A]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'histori' && (
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-2xs border border-slate-100 space-y-6">
              {historyList.length > 0 && (
                <>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Histori Berita Acara Yudisium
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 font-normal">
                      Arsip dokumen Berita Acara Yudisium per periode yang telah selesai Anda sahkan dan tanda tangani.
                    </p>
                  </div>

                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchHistory}
                      onChange={(e) => setSearchHistory(e.target.value)}
                      placeholder="Cari Nama Periode, Nama Mahasiswa, / NIM..."
                      className="w-full rounded-xl border border-slate-200/70 bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 placeholder:text-slate-400 focus:border-[#142F57] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#142F57] transition"
                    />
                  </div>
                </>
              )}

              {filteredHistory.length === 0 ? (
                /* EMPTY STATE HISTORI BERITA ACARA */
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <EmptyStateDoubleLayerIcon />

                  <h4 className="mt-5 text-base sm:text-lg font-bold text-gray-900">
                    {historyList.length === 0
                      ? 'Belum Ada Histori Berita Acara'
                      : 'Data Histori Tidak Ditemukan'}
                  </h4>
                  <p className="mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed font-normal">
                    {historyList.length === 0
                      ? 'Belum ada dokumen Berita Acara Yudisium yang telah disahkan pada periode sebelumnya.'
                      : 'Tidak ada arsip Berita Acara yang cocok dengan kata kunci pencarian Anda.'}
                  </p>
                </div>
              ) : (
                /* TABEL HISTORI BERITA ACARA */
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          <th className="py-3 px-3 w-14">NO</th>
                          <th className="py-3 px-3">NAMA PERIODE</th>
                          <th className="py-3 px-3">NOMOR DOKUMEN</th>
                          <th className="py-3 px-3">JUMLAH LULUSAN</th>
                          <th className="py-3 px-3 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {filteredHistory.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-4 px-3 font-semibold text-slate-500">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-4 px-3">
                              <p className="font-bold text-gray-900">{item.periode}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Disetujui: {item.approvedDate}
                              </p>
                            </td>
                            <td className="py-4 px-3 text-slate-700 font-normal">{item.docNumber}</td>
                            <td className="py-4 px-3 font-medium text-gray-800">
                              {item.students.length} Mahasiswa
                            </td>
                            <td className="py-4 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setPreviewHistoryDoc(item)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#142F57] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B1E38] transition shadow-2xs"
                              >
                                <Eye size={14} /> Lihat
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span>Menampilkan {filteredHistory.length} periode</span>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-[#EEF3FA] font-bold text-gray-900">
                        1
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </main>

      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDF5F5] border border-[#F5C2BE] text-[#C0392B]">
                  <CornerUpLeft size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Kembalikan ke Staf Administrasi
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Berikan catatan bagian mana yang perlu diperbaiki pada draf Berita Acara ini.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="text-slate-400 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-900">
                  Catatan Revisi / Alasan Pengembalian <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Tuliskan letak kesalahan pada draf Berita Acara (misalnya kesalahan nomor surat, tanggal dokumen, atau data atribut mahasiswa tertentu)..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-gray-900 placeholder:text-slate-400 focus:border-[#142F57] focus:outline-none focus:ring-1 focus:ring-[#142F57]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C0392B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-800 transition shadow-xs"
                >
                  <Send size={14} /> Kirim Catatan Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[500px] rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] border-[1.5px] border-[#A7F3D0] text-[#15803D]">
                <FileCheck2 size={22} />
              </div>

              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="text-slate-400 hover:text-gray-700 transition p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Setujui &amp; Tanda Tangani Berita Acara?
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Apakah Anda yakin seluruh data pada draf Berita Acara Prodi {currentProdi.code} telah sesuai?{' '}
                <span className="font-bold text-slate-600">Tanda Tangan Elektronik</span> Anda akan dibubuhkan dan dokumen akan diteruskan kepada{' '}
                <span className="font-bold text-slate-600">Manit</span>.
              </p>
            </div>

            {/* Summary Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-4 space-y-3 text-xs sm:text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Periode Yudisium</span>
                <span className="font-bold text-gray-900">{activeDraft?.periode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nomor Dokumen</span>
                <span className="font-semibold text-gray-800">{activeDraft?.docNumber}</span>
              </div>
              <div className="h-px bg-slate-200/80" />
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Mahasiswa Lulusan</span>
                <span className="inline-block rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-0.5 text-xs font-bold text-[#15803D]">
                  {activeDraft?.students.length || 0} Mahasiswa
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3D8B5E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#32754E] transition shadow-xs"
              >
                Ya, Setujui &amp; Tanda Tangani <Check size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      )}

      {previewHistoryDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4">
          <div className="flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Dokumen Berita Acara Yudisium &bull; Prodi {currentProdi.code} ({previewHistoryDoc.periode})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pratinjau penuh surat Berita Acara yang telah disahkan
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadAssetPdf(
                      previewHistoryDoc.pdfFile,
                      `Berita_Acara_${currentProdi.code}_${previewHistoryDoc.periode.replace(/\s+/g, '_')}.pdf`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#142F57] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B1E38] transition shadow-2xs"
                >
                  <Download size={14} /> Unduh Berita Acara (PDF)
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewHistoryDoc(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-gray-700 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-y-auto bg-[#F4F7FB] p-4 sm:p-6">
              <div className="h-[68vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                <iframe
                  src={`${previewHistoryDoc.pdfFile}#toolbar=0&navpanes=0&scrollbar=1`}
                  title={`Pratinjau ${previewHistoryDoc.periode} ${currentProdi.code}`}
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}