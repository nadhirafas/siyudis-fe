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
  RotateCw,
  FileText,
  FileCheck2,
  Download,
  CornerUpLeft,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight,
  History,
  Inbox,
  Send
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'
import beritaAcaraPdf from '../../assets/berita-acara-trpl.pdf'

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
              navigate('/kaprodi/dashboard')
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
            Berita Acara Kepala Program Studi
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

const INITIAL_STUDENTS = [
  {
    initials: 'NA',
    name: 'Nadila Aulia Rahma',
    nim: '22/505388/SV/21878',
    predikat: 'Cumlaude'
  },
  {
    initials: 'GR',
    name: 'Gilang Ramadhan Putra',
    nim: '22/505700/SV/22013',
    predikat: 'Cumlaude'
  },
  {
    initials: 'RA',
    name: 'Rizky Adi Nugroho',
    nim: '22/505810/SV/22028',
    predikat: 'Tidak Cumlaude'
  },
  {
    initials: 'DB',
    name: 'Dimas Bagus Saputra',
    nim: '22/506015/SV/22054',
    predikat: 'Tidak Cumlaude'
  }
]

const INITIAL_DRAFT = {
  id: 1,
  periode: 'Periode Oktober 2026',
  docNumber: '104/UN1/SV.DTEDI/BA-YUD/VI/2024',
  pdfFile: beritaAcaraPdf,
  students: INITIAL_STUDENTS
}

const INITIAL_HISTORY = [
  {
    id: 101,
    periode: 'Periode Oktober 2026',
    approvedDate: '3 November 2026',
    docNumber: '104/UN1/SV.DTEDI/BA-YUD/VI/2024',
    pdfFile: beritaAcaraPdf,
    students: INITIAL_STUDENTS
  }
]

export default function KaprodiBeritaAcaraPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [storedUser] = useState(() => getUser())

  // Deteksi Prodi Dinamis
  const prodiCode = (storedUser?.prodi || 'TRPL').toUpperCase()
  const userDisplayName = storedUser?.name || `Kaprodi ${prodiCode}`
  const userEmail = storedUser?.email || `${prodiCode.toLowerCase()}_kaprodi@mail.ugm.ac.id`

  // Tab & Search States
  const [activeTab, setActiveTab] = useState('aktif') // 'aktif' | 'histori'
  const [searchActive, setSearchActive] = useState('')
  const [searchHistory, setSearchHistory] = useState('')

  const [activeDraft, setActiveDraft] = useState(INITIAL_DRAFT)
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY)

  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returnNote, setReturnNote] = useState('')
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [previewHistoryDoc, setPreviewHistoryDoc] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
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
    setReturnModalOpen(false)
    setReturnNote('')
    setActiveDraft(null)
    triggerToast('Draft Berita Acara berhasil dikembalikan ke Staf Administrasi beserta catatan revisi.')
  }

  const handleConfirmApprove = () => {
    if (!activeDraft) return
    const newlyApproved = {
      ...activeDraft,
      id: Date.now(),
      approvedDate: '16 November 2026'
    }
    setHistoryList((prev) => [newlyApproved, ...prev])
    setActiveDraft(null)
    setApproveModalOpen(false)
    setActiveTab('histori')
    triggerToast('Berita Acara Yudisium berhasil disetujui dan ditandatangani secara elektronik!')
  }

  const handleDownloadAssetPdf = (pdfUrl, filename) => {
    const link = document.createElement('a')
    link.href = pdfUrl || beritaAcaraPdf
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
          {toastMessage && (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-300 px-5 py-3.5 text-xs sm:text-sm font-semibold text-emerald-900 shadow-xs">
              <span>{toastMessage}</span>
              <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Persetujuan Berita Acara Yudisium
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-normal">
              Periksa kebenaran informasi dokumen dan daftar seluruh mahasiswa yudisium Program Studi {prodiCode} sebelum memberikan tanda tangan persetujuan.
            </p>
          </div>

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
                <Inbox size={16} strokeWidth={2.2} className={activeTab === 'aktif' ? 'text-[#111827]' : 'text-[#475569]'} />
                <span>Berita Acara Aktif</span>
                <span
                  className={`ml-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    activeTab === 'aktif'
                      ? 'bg-[#E6EEF9] text-[#334155]'
                      : 'bg-[#CBD8EC] text-[#334155]'
                  }`}
                >
                  {activeDraft ? 1 : 0}
                </span>
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
                <History size={16} strokeWidth={2.2} className={activeTab === 'histori' ? 'text-[#111827]' : 'text-[#475569]'} />
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
              {!activeDraft ? (
                <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-2xs border border-slate-100 space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Persetujuan Berita Acara Aktif
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 font-normal">
                      Mahasiswa pada daftar ini menunggu keputusan Anda.
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

                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <EmptyStateDoubleLayerIcon />

                    <h4 className="mt-5 text-base sm:text-lg font-bold text-gray-900">
                      Belum Ada Berita Acara yang Perlu Disetujui
                    </h4>
                    <p className="mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed font-normal">
                      Belum ada draf Berita Acara prodi Anda yang diajukan oleh Staf Administrasi pada periode ini. Dokumen kolektif akan tampil di sini begitu siap untuk Anda tinjau.
                    </p>

                    <button
                      type="button"
                      onClick={() => triggerToast('Data Berita Acara berhasil dimuat ulang.')}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#EEF4FF] px-5 py-2 text-xs font-bold text-[#142F57] hover:bg-[#DCE7F6] transition"
                    >
                      <RotateCw size={14} /> Muat Ulang Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-5">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        Daftar Mahasiswa Yudisium {prodiCode} &bull; {activeDraft.periode}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 font-normal">
                        Mahasiswa pada daftar ini menunggu keputusan Anda.
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

                  <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#142F57]">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            Dokumen Draft Berita Acara Yudisium &bull; Prodi {prodiCode}
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
                            `Draft_Berita_Acara_${prodiCode}_Oktober_2026.pdf`
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
                          title={`Pratinjau ${activeDraft.periode}`}
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
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Histori Berita Acara Yudisium
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-normal">
                  Arsip dokumen Berita Acara Yudisium per periode yang telah selesai Anda setujui dan tanda tangani.
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

              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <EmptyStateDoubleLayerIcon />

                  <h4 className="mt-5 text-base sm:text-lg font-bold text-gray-900">
                    Belum Ada Histori Berita Acara
                  </h4>
                  <p className="mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed font-normal">
                    Belum ada dokumen Berita Acara Yudisium yang telah disahkan pada periode sebelumnya.
                  </p>
                </div>
              ) : (
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
                  placeholder="Tuliskan bagian kesalahan pada draf Berita Acara (misalnya: kesalahan nomor surat, typo gelar/nama mahasiswa, atau data mahasiswa tertentu)..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-gray-900 focus:border-[#142F57] focus:outline-none focus:ring-1 focus:ring-[#142F57]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="rounded-xl bg-[#F1F5F9] px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-200 transition"
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
                Apakah Anda yakin seluruh data pada draf Berita Acara Prodi {prodiCode} telah sesuai?{' '}
                <span className="font-bold text-slate-600">Tanda Tangan Elektronik</span> Anda akan dibubuhkan dan dokumen akan diteruskan kepada{' '}
                <span className="font-bold text-slate-600">Ketua Departemen (Kadep)</span>.
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
                  Dokumen Berita Acara Yudisium &bull; {previewHistoryDoc.periode}
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
                      `Berita_Acara_${prodiCode}_${previewHistoryDoc.periode.replace(/\s+/g, '_')}.pdf`
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
                  title={`Pratinjau ${previewHistoryDoc.periode}`}
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