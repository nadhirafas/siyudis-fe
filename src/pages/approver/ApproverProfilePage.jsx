import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  ShieldCheck,
  BookOpen,
  Menu,
  X,
  Upload,
  UserRound,
  LogOut,
  AlertTriangle,
  Save,
  Trash2,
  Lock,
  Mail,
  Camera,
  Contact2,
  Info
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

const SignatureStrokeIcon = ({ size = 22, color = '#9A6B29' }) => (
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

function Sidebar({ isOpen, onClose, user }) {
  const navigate = useNavigate()

  const getRolePrefix = () => {
    const roleStr = (user?.role || user?.name || '').toLowerCase()
    if (roleStr.includes('kadep') || roleStr.includes('departemen')) return 'kadep'
    if (roleStr.includes('manit')) return 'manit'
    return 'kaprodi'
  }

  const rolePrefix = getRolePrefix()

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
              navigate(`/${rolePrefix}/dashboard`)
            }}
            className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-white/10 px-4 text-left font-semibold text-white transition"
          >
            <Home size={20} strokeWidth={1.8} className="text-[#FACC15]" />
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

function Header({ onOpenSidebar, pageTitle, user }) {
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
          {user?.photo ? (
            <img src={user.photo} alt="" className="h-9 w-9 lg:h-10 lg:w-10 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 lg:h-10 lg:w-10 shrink-0">
              <DefaultAvatarCircle />
            </div>
          )}
          <span className="hidden sm:inline-block text-xs lg:text-[15px] font-bold text-gray-900 tracking-tight">
            {user?.name || 'Kaprodi TRPL'}
          </span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[58px] w-[300px] sm:w-[340px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-5">
            <div className="border-b border-gray-100 pb-3">
              <p className="text-xs font-semibold text-gray-500 text-left">{user.email}</p>
            </div>

            <div className="flex flex-col items-center py-4 border-b border-gray-100">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-[4px] border-[#e8edf5] bg-[#c7cbd1] flex items-center justify-center overflow-hidden shrink-0">
                  {user?.photo ? (
                    <img src={user.photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <DefaultAvatarCircle />
                  )}
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-[2px] border-white bg-[#5dbb67]" />
              </div>

              <p className="mt-3 text-base sm:text-lg font-bold text-gray-900 text-center tracking-tight">
                {user.name}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/approver/profile')
                }}
                className="flex w-full items-center gap-3.5 py-3 border-b border-gray-100 text-left hover:bg-gray-50/80 transition rounded-xl px-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#163b6c]">
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
                className="flex w-full items-center gap-3.5 py-3 border-b border-gray-100 text-left hover:bg-gray-50/80 transition rounded-xl px-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#9A6B29]">
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
                className="flex w-full items-center gap-3.5 py-3 text-left hover:bg-red-50/60 transition rounded-xl px-2 mt-1"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FDE8E7] text-[#D9362B]">
                  <LogOut size={18} />
                </span>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-[#D9362B]">Keluar / Logout</span>
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

export default function ApproverProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [user, setUserState] = useState(() => getUser() || {
    name: 'Kaprodi TRPL',
    email: 'trpl_kaprodi@mail.ugm.ac.id',
    role: 'kaprodi',
    photo: null
  })

  const [nameInput, setNameInput] = useState(user.name)
  const [photoPreview, setPhotoPreview] = useState(user.photo)
  const [tteFile, setTteFile] = useState(null)

  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const photoInputRef = useRef(null)
  const tteInputRef = useRef(null)

  const getHeaderTitle = () => {
    const roleStr = (user?.role || user?.name || '').toLowerCase()
    if (roleStr.includes('kadep') || roleStr.includes('departemen')) {
      return 'Profile Kepala Departemen'
    }
    if (roleStr.includes('manit')) {
      return 'Profile Manit'
    }
    return 'Profile Kepala Program Studi'
  }

  const headerTitle = getHeaderTitle()

  // Handler Upload Foto Profile (Hanya PNG/JPG/WebP, Maks 2.0 MB)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const fileName = file.name || ''
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp']

    if (!allowedExts.includes(fileExt) || !file.type.startsWith('image/')) {
      setErrorMessage({
        title: 'Unggah Gagal: Format File Tidak Didukung',
        desc: `File "${fileName}" berformat ${fileExt.toUpperCase() || 'DOKUMEN'}. Hanya file gambar berformat PNG, JPG, atau WebP yang diperbolehkan.`
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage({
        title: 'Unggah Gagal: Ukuran File Terlalu Besar',
        desc: `File "${fileName}" berukuran ${(file.size / (1024 * 1024)).toFixed(1)} MB, melebihi batas maksimal 2.0 MB. Kompres foto Anda terlebih dahulu.`
      })
      return
    }

    setErrorMessage(null)
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Handler Upload TTE (Hanya PNG/JPG, Tolak PDF/Word, Maks 5.0 MB)
  const handleTteUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const fileName = file.name || ''
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    const allowedExts = ['.png', '.jpg', '.jpeg']

    if (!allowedExts.includes(fileExt) || (!file.type.includes('png') && !file.type.includes('jpeg'))) {
      setErrorMessage({
        title: 'Unggah Gagal: Format File Tidak Didukung',
        desc: `File "${fileName}" berformat ${fileExt.toUpperCase() || 'DOKUMEN'}. Tanda Tangan Elektronik hanya menerima format gambar PNG atau JPG.`
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage({
        title: 'Unggah Gagal: Ukuran File Terlalu Besar',
        desc: `File "${fileName}" berukuran ${(file.size / (1024 * 1024)).toFixed(1)} MB, melebihi batas maksimal 5 MB. Kompres atau pindai ulang tanda tangan Anda dengan resolusi lebih rendah.`
      })
      return
    }

    setErrorMessage(null)
    setTteFile({
      name: fileName,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: '12 Nov 2026',
      url: URL.createObjectURL(file)
    })
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const updated = {
      ...user,
      name: nameInput,
      photo: photoPreview
    }
    localStorage.setItem('user', JSON.stringify(updated))
    setUserState(updated)
    setSuccessMessage('Perubahan profil berhasil disimpan!')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <input
        ref={tteInputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={handleTteUpload}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <Header onOpenSidebar={() => setSidebarOpen(true)} pageTitle={headerTitle} user={user} />

      <main className="ml-0 lg:ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-4 sm:px-7 py-6 sm:py-8 space-y-6">

          {/* BOX HEADER KELOLA PROFILE */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Kelola {headerTitle}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-normal">
              Perbarui data personal, foto profil, dan tanda tangan elektronik akun SIYUDIS Anda.
            </p>
          </div>

          {/* ALERT SUCCESS */}
          {successMessage && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-emerald-800 text-xs font-semibold shadow-2xs">
              <span>{successMessage}</span>
            </div>
          )}

          {/* CARD FOTO PROFILE */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF]">
                <UserRound size={22} className="text-[#142F57]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#142F57] leading-tight">Foto Profile</h3>
                <p className="mt-0.5 text-xs text-[#64748B] font-normal">Ditampilkan pada profile akun Anda.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
              <div className="relative shrink-0">
                <div className="h-28 w-28 rounded-[24px] border-2 border-[#DCE7F6] bg-white p-1.5 flex items-center justify-center shadow-2xs">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <DefaultAvatarCircle />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-[#142F57] text-white shadow-md hover:bg-[#0B1E38] transition"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#142F57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0B1E38] transition shadow-2xs"
                  >
                    <Upload size={16} /> Unggah Foto Baru
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FDE8E7] border border-[#F5B7B1] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#991B1B] hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} /> Hapus Foto
                  </button>
                </div>

                <div className="flex items-center gap-2.5 rounded-2xl bg-[#F0F4FA] p-3.5 text-xs">
                  <Info size={16} className="shrink-0 text-[#9A6B29]" />
                  <p className="text-slate-600 font-normal">
                    <span className="font-semibold text-gray-900">Ketentuan Foto Profile:</span>{' '}
                    <span className="font-semibold text-slate-500">Format file PNG, JPG, atau WebP dengan ukuran maksimal 2.0 MB.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CARD DATA AKUN */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF]">
                <Contact2 size={22} className="text-[#142F57]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#142F57] leading-tight">Data Akun</h3>
                <p className="mt-0.5 text-xs text-[#52647C] font-normal">Identitas dari pengguna akun.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-gray-900">Nama</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <UserRound size={18} />
                  </span>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs sm:text-sm font-normal text-gray-900 focus:border-[#142F57] focus:outline-none focus:ring-1 focus:ring-[#142F57]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900">
                    Email Institusi SSO UGM <Lock size={14} className="text-slate-400" />
                  </label>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">TERKUNCI</span>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-[#F0F4FA] py-3 pl-10 pr-4 text-xs sm:text-sm font-normal text-[#475569] cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-[#475569] font-normal">
                  Tersinkronisasi otomatis via Google Workspace UGM Mail.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(user.name)
                    setPhotoPreview(user.photo)
                  }}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#F0F4FA] px-6 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-slate-200 transition"
                >
                  <X size={16} /> Batal
                </button>

                <button
                  type="submit"
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#142F57] px-6 text-xs sm:text-sm font-semibold text-white hover:bg-[#0B1E38] transition shadow-2xs"
                >
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* CARD TANDA TANGAN ELEKTRONIK (TTE) */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs border border-slate-100 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB]">
                <SignatureStrokeIcon size={24} color="#9A6B29" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#142F57] leading-tight">Tanda Tangan Elektronik</h3>
                <p className="mt-0.5 text-xs text-[#52647C] font-normal">Digunakan untuk menyetujui Berita Acara Yudisium.</p>
              </div>
            </div>

            {!tteFile ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C2D7EF] bg-[#F4F8FF] p-8 text-center space-y-3">
                <button
                  type="button"
                  onClick={() => tteInputRef.current?.click()}
                  className="text-[#142F57] hover:scale-105 transition"
                >
                  <Upload size={32} />
                </button>
                <h4 className="text-sm font-bold text-gray-900">Belum Ada Tanda Tangan Diunggah</h4>
                <p className="max-w-md text-xs text-slate-500 font-normal leading-relaxed">
                  Anda perlu mengunggah tanda tangan sekali saja. Setelah itu, tanda tangan akan diterapkan otomatis setiap kali Anda menyetujui mahasiswa.
                </p>

                <button
                  type="button"
                  onClick={() => tteInputRef.current?.click()}
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#142F57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0B1E38] transition shadow-xs"
                >
                  Unggah Tanda Tangan
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-[#EFF7ED] border border-[#C8E6C9] p-4 sm:p-5 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 p-2 shadow-2xs">
                    <img src={tteFile.url} alt="E-sign" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" /> Tanda Tangan Aktif
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-gray-900">{tteFile.name}</h5>
                    <p className="text-[11px] text-slate-500">Diunggah {tteFile.date} · {tteFile.size}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => tteInputRef.current?.click()}
                    className="w-full sm:w-auto rounded-xl bg-white border border-slate-200 px-5 py-2 text-xs font-bold text-gray-800 hover:bg-slate-50 transition shadow-2xs"
                  >
                    Ganti Tanda Tangan
                  </button>

                  <button
                    type="button"
                    onClick={() => setTteFile(null)}
                    className="w-full sm:w-auto rounded-xl bg-[#FDE8E7] border border-[#F5B7B1] px-5 py-2 text-xs font-bold text-[#991B1B] hover:bg-red-100 transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}

            {/* CARD ALERT ERROR */}
            {errorMessage && (
              <div className="flex items-start gap-3.5 rounded-2xl bg-[#FDF2F2] border border-[#F5C6CB] p-4 shadow-2xs">
                <AlertTriangle size={18} strokeWidth={1.8} className="shrink-0 text-[#DC2626] mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#7A2619] leading-tight">{errorMessage.title}</h4>
                  <p className="text-xs text-[#8A4A40] leading-relaxed font-normal">
                    {errorMessage.desc}
                  </p>
                </div>
              </div>
            )}

            {/* CARD KETENTUAN TTE */}
            <div className="flex items-start gap-2.5 rounded-2xl bg-[#F0F4FA] border border-[#D0E2F7] p-4 text-xs">
              <Info size={16} className="shrink-0 text-[#142F57] mt-0.5" />
              <p className="text-slate-500 font-normal leading-relaxed">
                <span className="font-semibold text-slate-600">Ketentuan Tanda Tangan:</span> Format file PNG atau JPG dengan latar belakang transparan/putih, ukuran maksimal 5 MB. Gunakan hasil pindai yang jelas agar tampil rapi di Berita Acara.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}