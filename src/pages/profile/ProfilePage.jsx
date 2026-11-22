import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserRound,
  Mail,
  Lock,
  Upload,
  Trash2,
  Camera,
  IdCard,
  Info,
  X,
  Save,
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import ProfileMenu from '../../components/ProfileMenu'
import { getRoleName, getUser, saveUser } from '../../services/auth'
import { errorMessage } from '../../services/api'
import { getProfile, updateProfile } from '../../services/mahasiswaApi'
import { roleKey } from '../../services/normalize'
import ugmLogo from '../../assets/ugm-logo.png'

export default function ProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [user, setUser] = useState(() => getUser())
  const key = roleKey(getRoleName(user) || 'mahasiswa')
  const isAdminArea =
    key === 'staf_akademik' ||
    key === 'super_admin' ||
    key === 'kaprodi' ||
    key === 'manit' ||
    key === 'kadep'

  const [nama, setNama] = useState(user?.nama || '')
  const [email, setEmail] = useState(user?.email || '')
  const [photo, setPhoto] = useState(
    () => localStorage.getItem(`profile_photo_${user?.email || 'me'}`) || user?.avatar || ''
  )
  const [initialState, setInitialState] = useState({
    nama: user?.nama || '',
    photo: localStorage.getItem(`profile_photo_${user?.email || 'me'}`) || user?.avatar || '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }

  const flash = (type, text) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 5000)
  }

  // =========================================================
  // AMBIL DATA AKUN DARI GET /api/me
  // =========================================================
  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((json) => {
        if (cancelled) return
        const raw = json || {}
        const fetchedNama = raw.nama || raw.name || user?.nama || ''
        const fetchedEmail = raw.email || user?.email || ''
        const savedPhoto =
          localStorage.getItem(`profile_photo_${fetchedEmail || 'me'}`) ||
          raw.avatar ||
          raw.foto ||
          user?.avatar ||
          ''

        setNama(fetchedNama)
        setEmail(fetchedEmail)
        setPhoto(savedPhoto)
        setInitialState({ nama: fetchedNama, photo: savedPhoto })

        const merged = {
          ...user,
          ...raw,
          nama: fetchedNama,
          email: fetchedEmail,
          avatar: savedPhoto,
        }
        setUser(merged)
        saveUser(merged)
      })
      .catch(() => {
        // Tetap gunakan data user dari localStorage jika offline/gagal fetch
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // =========================================================
  // HANDLER UPLOAD & HAPUS FOTO (MAKS 2.0 MB)
  // =========================================================
  // TODO: endpoint belum ada — upload foto profil belum tersedia di API (avatar berasal dari Google).
  // Foto hanya disimpan lokal di browser per akun.
  const handleSelectPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowed.includes(file.type)) {
      flash('error', 'Format file harus PNG, JPG, atau WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      flash('error', 'Ukuran foto maksimal 2.0 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    setPhoto('')
  }

  const handleCancel = () => {
    setNama(initialState.nama)
    setPhoto(initialState.photo)
    setNotice(null)

    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(isAdminArea ? '/admin' : '/dashboard', { replace: true })
    }
  }

  // =========================================================
  // SIMPAN PERUBAHAN KE PATCH /api/me
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) {
      flash('error', 'Nama wajib diisi.')
      return
    }

    setSaving(true)
    setNotice(null)

    try {
      // PATCH /api/me — error validasi 422 dirangkum otomatis oleh errorMessage()
      const raw = (await updateProfile({ nama: nama.trim() })) || {}
      const updatedNama = raw.nama || nama.trim()

      // Simpan foto profil lokal per email akun
      const storageKey = `profile_photo_${email || 'me'}`
      if (photo) {
        localStorage.setItem(storageKey, photo)
      } else {
        localStorage.removeItem(storageKey)
      }

      const nextUser = {
        ...user,
        ...raw,
        nama: updatedNama,
        email,
        avatar: photo,
      }

      setUser(nextUser)
      saveUser(nextUser)
      setInitialState({ nama: updatedNama, photo })
      flash('success', 'Perubahan profil berhasil disimpan.')
    } catch (err) {
      flash('error', errorMessage(err, 'Gagal menyimpan perubahan profil'))
    } finally {
      setSaving(false)
    }
  }

  const displayName = nama || user?.nama || 'Mahasiswa'

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#111827]">
      {/* SIDEBAR */}
      {isAdminArea ? (
        <Sidebar admin />
      ) : (
        <StudentSidebar navigate={navigate} />
      )}

      {/* MAIN CONTENT */}
      <div className={`${isAdminArea ? 'lg:pl-[295px]' : 'ml-[272px]'} min-h-screen`}>
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
          <div>
            <h1 className="text-[22px] font-bold leading-tight text-[#111111]">
              {isAdminArea ? 'Profile Pengguna' : 'Profile Mahasiswa'}
            </h1>
            <p className="mt-0.5 text-[12px] text-[#687588]">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>
          </div>

          <ProfileMenu fallbackName={displayName} />
        </header>

        {/* BODY */}
        <main className="space-y-6 px-8 py-7">
          {/* CARD 1: HEADER BANNER */}
          <section className="rounded-2xl border border-[#E6ECF2] bg-white px-8 py-7 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <h2 className="text-[22px] font-bold text-[#111827]">
              {isAdminArea ? 'Kelola Profile Akun' : 'Kelola Profile Mahasiswa'}
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Perbarui data personal dan foto profil akun SIYUDIS Anda.
            </p>
          </section>

          {/* NOTIFIKASI */}
          {notice && (
            <div
              className={`flex items-center gap-2.5 rounded-xl border px-5 py-3.5 text-xs font-medium ${
                notice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {notice.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : (
                <AlertCircle size={16} className="shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {/* CARD 2: FOTO PROFILE */}
          <section className="rounded-2xl border border-[#E6ECF2] bg-white p-7 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FA] text-[#0B3A68]">
                <UserRound size={19} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Foto Profile
                </h3>
                <p className="mt-0.5 text-[12px] text-[#64748B]">
                  Ditampilkan pada profile akun Anda.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* AVATAR BOX + TOMBOL KAMERA */}
              <div className="relative h-[126px] w-[126px] shrink-0">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white p-2 shadow-2xs">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Foto Profile"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#C7CBD1] text-white">
                      <UserRound size={58} />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti foto profile"
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#042F5B] text-white shadow-md transition hover:bg-[#073E73]"
                >
                  <Camera size={15} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSelectPhoto}
                  className="hidden"
                />
              </div>

              {/* TOMBOL UNGGAH, HAPUS & KETENTUAN */}
              <div className="flex-1 space-y-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#042F5B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#073E73]"
                  >
                    <Upload size={14} />
                    Unggah Foto Baru
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={!photo}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-2.5 text-xs font-bold text-[#DC2626] transition hover:bg-[#FECACA]/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Hapus Foto
                  </button>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-4 py-3 text-[12px] text-[#334155]">
                  <Info size={16} className="shrink-0 text-[#042F5B]" />
                  <span>
                    <strong className="font-bold text-[#0F172A]">
                      Ketentuan Foto Profile:
                    </strong>{' '}
                    Format file PNG, JPG, atau WebP dengan ukuran maksimal 2.0 MB.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 3: DATA AKUN */}
          <section className="rounded-2xl border border-[#E6ECF2] bg-white p-7 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FA] text-[#0B3A68]">
                <IdCard size={19} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Data Akun
                </h3>
                <p className="mt-0.5 text-[12px] text-[#64748B]">
                  Identitas dari pengguna akun.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Memuat data akun...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* INPUT NAMA */}
                <div>
                  <label className="block text-xs font-bold text-[#111827]">
                    Nama
                  </label>
                  <div className="relative mt-2">
                    <UserRound
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                    />
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white py-3 pl-10 pr-4 text-[13px] font-medium text-[#111827] outline-none transition focus:border-[#042F5B] focus:ring-2 focus:ring-[#042F5B]/15"
                    />
                  </div>
                </div>

                {/* INPUT EMAIL TERKUNCI */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                      <span>Email Institusi SSO UGM</span>
                      <Lock size={13} className="text-[#64748B]" />
                    </label>
                    <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                      TERKUNCI
                    </span>
                  </div>

                  <div className="relative mt-2">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                    />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-[#EEF2F7] py-3 pl-10 pr-4 text-[13px] font-medium text-[#334155]"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-[#64748B]">
                    Tersinkronisasi otomatis via Google Workspace UGM Mail.
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-xs font-bold text-[#111827] transition hover:bg-[#EEF2F6] disabled:opacity-50"
                  >
                    <X size={14} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#042F5B] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#073E73] disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

/* =========================================================
   SIDEBAR KHUSUS MAHASISWA
========================================================= */
function StudentSidebar({ navigate }) {
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-[272px] bg-[#063E73] text-white">
      <div className="px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            <img
              src={ugmLogo}
              alt="Logo UGM"
              className="h-12 w-12 object-contain"
            />
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

      <nav className="mt-8 px-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-white/15 px-4 text-left font-medium text-white transition hover:bg-white/20"
        >
          <Home size={20} strokeWidth={1.8} />
          <span className="text-sm">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/pengajuan-yudisium')}
          className="mt-2 flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <FileText size={20} strokeWidth={1.8} />
          <span className="text-sm">Pengajuan Yudisium</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/berita-acara')}
          className="mt-2 flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <ShieldCheck size={20} strokeWidth={1.8} />
          <span className="text-sm">Berita Acara</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/panduan')}
          className="mt-2 flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <BookOpen size={20} strokeWidth={1.8} />
          <span className="text-sm">Panduan &amp; Dokumen</span>
        </button>
      </nav>
    </aside>
  )
}