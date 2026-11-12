import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  ArrowRight,
  Upload,
  Home,
  ShieldCheck,
  BookOpen,
  UserRound,
  LogOut,
  Menu,
  X,
  FilePlus,
  BookMarked
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

function Sidebar({ isOpen, onClose, rolePrefix }) {
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
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm text-white font-semibold"
          >
            <Home size={20} strokeWidth={2} className="text-[#FFD32A]" />
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              navigate(`/${rolePrefix}/berita-acara`)
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <ShieldCheck size={20} strokeWidth={1.8} />
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

function Header({ onOpenSidebar, pageTitle, userDisplayName, userEmail, userPhoto }) {
  const navigate = useNavigate()
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
          <h1 className="text-xl lg:text-[28px] font-bold leading-tight text-gray-950">{pageTitle}</h1>
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
              <DefaultAvatarIcon />
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
                    <DefaultAvatarIcon />
                  )}
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[2.5px] border-white bg-[#5dbb67]" />
              </div>

              <p className="mt-4 text-base sm:text-[18px] font-bold text-gray-900 text-center tracking-tight">
                {userDisplayName}
              </p>
            </div>

            {/* LIST MENU PROFIL DENGAN GARIS PEMISAH BORDER-B */}
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A6B29" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 16c2-4 4-8 6-4s-1 6 2 6 5-5 7-1" />
                  </svg>
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

export default function ApproverDashboardPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [storedUser] = useState(() => getUser())
  const [hasUploadedTTE] = useState(false)

  // Deteksi role & prodi dari sesi user
  const rawRole = (storedUser?.role || storedUser?.name || 'kaprodi').toLowerCase()
  const currentRole = rawRole.includes('kadep')
    ? 'kadep'
    : rawRole.includes('manit')
    ? 'manit'
    : 'kaprodi'
  const currentProdi = (storedUser?.prodi || 'TRPL').toUpperCase()

  const activeSubmissions = [
    {
      id: 1,
      prodi: 'TRPL',
      docNumber: '104/UN1/SV.DTEDI/BA-YUD/VI/2024',
      date: '3 November 2026',
    },
    {
      id: 2,
      prodi: 'TRI',
      docNumber: '105/UN1/SV.DTEDI/BA-YUD/TRI/X/2026',
      date: '3 November 2026',
    },
  ]

  const getRoleHeader = () => {
    if (currentRole === 'kadep') {
      return {
        rolePrefix: 'kadep',
        title: 'Dashboard Kepala Departemen',
        welcome: 'Selamat Datang, Kadep TEDI!',
        displayName: storedUser?.name || 'Kadep TEDI',
        email: storedUser?.email || 'kadep_tedi@mail.ugm.ac.id',
        sub: 'Pusat persetujuan yudisium mahasiswa DTEDI SV UGM.',
        emptyMsg: 'Belum ada draf Berita Acara Yudisium prodi Anda yang disetujui oleh Kaprodi pada periode ini. Dokumen kolektif akan tampil di sini begitu siap untuk Anda tinjau.',
      }
    }
    if (currentRole === 'manit') {
      return {
        rolePrefix: 'manit',
        title: 'Dashboard Manit',
        welcome: 'Selamat Datang, Manit TEDI!',
        displayName: storedUser?.name || 'Manit TEDI',
        email: storedUser?.email || 'manit_tedi@mail.ugm.ac.id',
        sub: 'Pusat persetujuan yudisium mahasiswa DTEDI SV UGM.',
        emptyMsg: 'Belum ada draf Berita Acara Yudisium prodi Anda yang disetujui oleh Kadep pada periode ini. Dokumen kolektif akan tampil di sini begitu siap untuk Anda tinjau.',
      }
    }
    return {
      rolePrefix: 'kaprodi',
      title: 'Dashboard Kepala Program Studi',
      welcome: `Selamat Datang, Kaprodi ${currentProdi}!`,
      displayName: storedUser?.name || `Kaprodi ${currentProdi}`,
      email: storedUser?.email || `${currentProdi.toLowerCase()}_kaprodi@mail.ugm.ac.id`,
      sub: `Pusat persetujuan yudisium mahasiswa Program Studi ${currentProdi} DTEDI SV UGM.`,
      emptyMsg: 'Belum ada draf Berita Acara Yudisium prodi Anda yang diajukan oleh Staf Administrasi pada periode ini. Dokumen kolektif akan tampil di sini begitu siap untuk Anda tinjau.',
    }
  }

  const roleInfo = getRoleHeader()

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} rolePrefix={roleInfo.rolePrefix} />
      <Header
        onOpenSidebar={() => setSidebarOpen(true)}
        pageTitle={roleInfo.title}
        userDisplayName={roleInfo.displayName}
        userEmail={roleInfo.email}
        userPhoto={storedUser?.photo || null}
      />

      <main className="ml-0 lg:ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-4 sm:px-7 py-6 sm:py-8 space-y-6">

          {/* BANNER WARNING TTE */}
          {!hasUploadedTTE && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-[#FFF9E4] border border-[#FDE68A] p-4 sm:p-5 gap-5 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDEEBA]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9A6B29" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 16c2-4 4-8 6-4s-1 6 2 6 5-5 7-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-[17px] font-bold text-[#5C2B0B] leading-tight">
                    Tanda Tangan Elektronik Belum Diunggah
                  </h3>
                  <p className="mt-1 text-xs sm:text-[13px] text-[#5C4528] leading-relaxed max-w-2xl font-normal">
                    Anda belum bisa menyetujui mahasiswa sebelum mengunggah tanda tangan. Cukup sekali, tanda tangan akan diterapkan otomatis setiap kali Anda menyetujui.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/approver/profile')}
                className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#142F57] px-6 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#0B1E38] shadow-xs"
              >
                Unggah Tanda Tangan <Upload size={16} />
              </button>
            </div>
          )}

          {/* BANNER WELCOME */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2B4B7C] via-[#2B4B7C] to-[#3B5F95] p-6 sm:p-8 text-white shadow-sm">
            <div className="pointer-events-none absolute right-16 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -right-4 -bottom-10 h-36 w-36 rounded-full bg-white/10" />

            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{roleInfo.welcome}</h1>
              <p className="mt-2 text-xs sm:text-sm text-white/90 font-normal">{roleInfo.sub}</p>
            </div>
          </div>

          {/* SECTION BERITA ACARA */}
          {activeSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 sm:p-12 text-center shadow-2xs border border-slate-100">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-[#BBE0FF] bg-[#F4F8FF]">
                <FilePlus size={32} className="text-[#142F57]" />
                <span className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 h-4 w-4 rounded-full bg-[#EAB308]" />
              </div>

              <h3 className="mt-6 text-lg sm:text-xl font-bold text-gray-900">
                Belum Ada Berita Acara yang Perlu Disahkan
              </h3>
              <p className="mt-2 max-w-lg text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {roleInfo.emptyMsg}
              </p>

              <button
                type="button"
                onClick={() => navigate(`/${roleInfo.rolePrefix}/berita-acara`)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#142F57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#0B1E38] shadow-xs"
              >
                Lihat Halaman Berita Acara <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-2xs border border-slate-100 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Draft Berita Acara Menunggu Pengesahan Anda
              </h3>

              <div className="space-y-3">
                {activeSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-[#F4F8FF] p-4 border border-[#DBE5F5] gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F2C75B] shadow-2xs">
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                          <path
                            d="M6 7.5C6 5.567 7.567 4 9.5 4H24.5C26.433 4 28 5.567 28 7.5V20.5C28 22.433 26.433 24 24.5 24H11.5L6 29.5V7.5Z"
                            fill="#543E15"
                          />
                          <path
                            d="M13.5 17.5L20.5 10.5C21.1627 9.83726 22.2373 9.83726 22.9 10.5C23.5627 11.1627 23.5627 12.2373 22.9 12.9L15.9 19.9H13.5V17.5Z"
                            fill="#F2C75B"
                          />
                          <rect x="13" y="20.5" width="11" height="2.2" rx="1" fill="#F2C75B" />
                        </svg>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          {(currentRole === 'kadep' || currentRole === 'manit') && (
                            <span className="inline-block shrink-0 rounded-full bg-[#1B365D] px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                              {item.prodi}
                            </span>
                          )}

                          <h4 className="text-sm sm:text-[15px] font-bold text-[#1F2937] flex items-center gap-1.5">
                            <span>
                              {currentRole === 'kaprodi'
                                ? 'Berita Acara Yudisium'
                                : `Berita Acara Yudisium ${item.prodi}`}
                            </span>
                            <span className="text-[15px] font-black text-[#273240] px-0.5">•</span>
                            <span>Periode Oktober 2026</span>
                          </h4>
                        </div>

                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#64748B] font-normal">
                          <span>Nomor Dokumen: <span className="font-bold text-[#374151]">{item.docNumber}</span></span>
                          <span className="text-[15px] font-black text-[#273240] px-0.5">•</span>
                          <span>Tanggal Dokumen: <span className="font-bold text-[#374151]">{item.date}</span></span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/${roleInfo.rolePrefix}/berita-acara`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#142F57] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0B1E38] self-end sm:self-auto"
                    >
                      Tinjau <ArrowRight size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AKSES CEPAT LAYANAN */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <span className="h-6 w-2.5 rounded-full bg-[#142F57]" /> Akses Cepat Layanan
              </h3>
              <span className="text-xs text-slate-500 font-normal">Pilih layanan utama untuk mengelola yudisium</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card Pengesahan */}
              <div className="flex flex-col justify-between rounded-2xl bg-white p-6 border border-slate-100 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F8FF] text-[#142F57]">
                      <FileText size={22} />
                    </div>

                    <span className="rounded-full bg-[#F4F8FF] border border-[#C2D7EF] px-5 py-1 text-xs font-bold text-[#173153]">
                      {activeSubmissions.length} Antrean Approval
                    </span>
                  </div>
                  <h4 className="mt-5 text-base font-bold text-gray-900">Pengesahan Berita Acara</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal">
                    Tinjau draf Berita Acara Yudisium mahasiswa prodi Anda secara kolektif per periode, lalu sahkan atau kembalikan ke Staf Administrasi jika terdapat kesalahan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/${roleInfo.rolePrefix}/berita-acara`)}
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#142F57] text-xs sm:text-sm font-semibold text-white transition hover:bg-[#0B1E38]"
                >
                  Tinjau Berita Acara <ArrowRight size={16} />
                </button>
              </div>

              {/* Card Panduan */}
              <div className="flex flex-col justify-between rounded-2xl bg-white p-6 border border-slate-100 shadow-2xs">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F8FF] text-[#142F57]">
                    <BookMarked size={22} />
                  </div>
                  <h4 className="mt-5 text-base font-bold text-gray-900">Panduan dan Dokumen</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal">
                    Baca User Manual dan dokumen pendukung untuk membantu proses persetujuan yudisium mahasiswa prodi Anda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/approver/panduan')}
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#142F57] text-xs sm:text-sm font-semibold text-white transition hover:bg-[#0B1E38]"
                >
                  Buka Panduan <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}