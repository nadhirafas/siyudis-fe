import { useState, Fragment } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  ChevronDown,
  LogOut,
  Eye,
  FileUp,
  Megaphone,
  Feather,
  Info,
  AlertTriangle,
  Ban,
  Send,
  CheckCircle2,
  MinusCircle,
  CalendarClock,
  BadgeCheck,
  Gavel
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

function renderDescription(description) {
  if (typeof description !== 'string') return description
  return linkifyText(description)
}

function linkifyText(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, i) => {
    if (!urlRegex.test(part)) return part
    const trailingMatch = part.match(/[),.]+$/)
    const trailing = trailingMatch ? trailingMatch[0] : ''
    const cleanUrl = trailing ? part.slice(0, -trailing.length) : part
    return (
      <Fragment key={i}>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1f3d6d] underline hover:text-[#0f2038]"
        >
          {cleanUrl}
        </a>
        {trailing}
      </Fragment>
    )
  })
}

const documents = [
  { id: 1, title: 'Form Pengajuan Yudisium', description: 'Unduh dan lengkapi template form pengajuan yudisium resmi DTEDI yang telah ditandatangani.', accept: '.pdf', type: 'PDF' },
  { id: 2, title: 'Form Pembatalan Mata Kuliah Pilihan', description: 'Unduh dan lengkapi template form pembatalan mata kuliah pilihan yang telah ditandatangani mahasiswa dan ketua program studi.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 3, title: 'Form Checklist Judul Proyek Akhir', description: 'Kesesuaian tata bahasa judul Proyek Akhir (ID & EN) tervalidasi pembimbing.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 4, title: 'Pas Photo', description: 'Pas Photo 4×6 latar biru (1 lembar). Ketentuan:\nKemeja putih, blazer/jas hitam (bukan almamater).\nBackground BIRU tua.\nTidak memakai kacamata hitam.\nFoto asli, tajam, tidak kabur (bukan hasil scan/repro).', accept: '.jpg,.jpeg,.png', type: 'JPG/PNG' },
  { id: 5, title: 'Transkrip Nilai Sementara', description: 'Transkrip nilai diambil dari SIMASTER, dan wajib mengisi form http://ugm.id/ProyekAkhirDTEDI sebagai syarat pemrosesan/terbitnya nilai PA, dan apabila terdapat nilai kosong/T, laporkan kepada Bagian Akademik.', accept: '.pdf', type: 'PDF' },
  { id: 6, title: 'Surat Tanda Terima Menyerahkan Skripsi dan Bebas Perpustakaan UGM.', description: 'Melakukan unggah Proyek Akhir secara mandiri di https://simaster.ugm.ac.id, dengan panduan tersedia di https://lib.ugm.ac.id/panduan-unggah-mandiri.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 7, title: 'Ijazah Terakhir', description: 'Pindaian ijazah terakhir, bukan sertifikat hasil ujian.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 8, title: 'Sertifikat PPSMB', description: 'Pindaian sertifikat Pelatihan Pembelajar Sukses bagi Mahasiswa Baru.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 9, title: 'Hasil Cek Plagiasi', description: 'Hasil cek plagiasi harus memenuhi:\nPersentase kemiripan maksimal 25%.\nDitandatangani dosen pembimbing tugas akhir (DPTA).', accept: '.pdf,.png', type: 'PDF/PNG' },
  {
    id: 10,
    title: 'Sertifikat Kemampuan Bahasa Inggris',

    description: (
      <>
        Skor minimal: TEVoCS≥60 / AcEPT≥209 / IELTS≥4.5 / TOEIC≥495 / TOEFL IBT≥52 / TOEFL
        ITP≥453. Belum memenuhi?{' '}
        <a
          href="https://tedi.sv.ugm.ac.id/id/2026/08/07/panduan-syarat-bahasa-inggris-untuk-yudisium-bagi-angkatan-2020-2023/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1f3d6d] underline hover:text-[#0f2038]"
        >
          Lihat panduan
        </a>
        . Lolos PKM: TEVoCS berapa pun berlaku. Substitusi lain: Pengurus/Panitia/Juara Lomba
        (maks 5; Nasional=1, Universitas=2, SV=3, Departemen=5).
      </>
    ),
    accept: '.pdf,.png',
    type: 'PDF/PNG',
  },
  { id: 11, title: 'Sertifikat Kompetensi', description: 'Wajib untuk prodi TRI, opsional untuk prodi lain. Minimal level associate, dengan skor hasil dan tanggal berlaku yang ditunjukkan, serta dicantumkan dalam Berita Acara Yudisium (maksimal 5 sertifikat).', accept: '.pdf,.png', type: 'PDF/PNG', badge: 'Wajib TRI', optionalBadge: 'Prodi Lain Opsional' },
  { id: 12, title: 'Lembar Halaman Pengesahan', description: 'Pindaian lembar pengesahan bertandatangan lengkap penguji, pembimbing, dan Kepala Departemen DTEDI.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 13, title: 'Unggah Draft Publikasi/Makalah', description: 'Angkatan 2021 & sebelumnya: Prosiding konferensi, HAKI, atau jurnal.\nAngkatan 2022 & seterusnya: Draft publikasi yang disetujui dosen pembimbing.\nTRI, TRIK & TRPL: draft jurnal acc pembimbing.\nTRE: wajib submit jurnal.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 14, title: 'Transkrip Nilai D3', description: 'Transkrip nilai D3 untuk mahasiswa jalur alih program.', accept: '.pdf,.png', type: 'PDF/PNG', notApplicable: true },
  { id: 15, title: 'Surat Bebas Lab', description: 'Keterangan pengembalian alat & kebersihan laboratorium.', accept: '.pdf,.png', type: 'PDF/PNG', badge: 'Wajib TRI' },
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
          className="flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm"
        >
          <FileText size={20} strokeWidth={2} className="text-[#FFD32A]" />
          <span className="text-sm font-semibold">Pengajuan Yudisium</span>
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
          onClick={() => navigate('/panduan')}
          className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <BookOpen size={20} strokeWidth={1.8} />
          <span className="text-sm">Panduan &amp; Dokumen</span>
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

function DocumentCard({ document, file, error, disabled, onFileChange, onErrorChange }) {
  const validateFile = (selectedFile) => {
    if (!selectedFile) return

    const extension = `.${selectedFile.name.split('.').pop().toLowerCase()}`
    const acceptedExtensions = document.accept.split(',').map((item) => item.trim())

    if (!acceptedExtensions.includes(extension)) {
      onErrorChange(document.id, `Format berkas tidak sesuai. Berkas harus berupa ${document.type}.`)
      onFileChange(document.id, null)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      onErrorChange(document.id, 'Ukuran berkas terlalu besar. Maksimal ukuran berkas adalah 5 MB.')
      onFileChange(document.id, null)
      return
    }

    onErrorChange(document.id, '')
    onFileChange(document.id, selectedFile)
  }

  if (disabled) {
    return (
      <div className="flex min-h-[322px] flex-col rounded-xl border border-[#dbe1ef] bg-[#f0f3fc] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dce6fb] text-sm font-semibold text-[#8a6b00]">
            {String(document.id).padStart(2, '0')}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold leading-5 text-gray-900">{document.title}</h3>
            <span className="mt-1 inline-block rounded-full bg-[#f3e6ae] px-2 py-0.5 text-[10px] font-semibold text-[#8a6b00]">
              Khusus mahasiswa Alih Program
            </span>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
          {renderDescription(document.description)}
        </p>

        <div className="mt-auto flex items-center gap-2 rounded-lg border border-dashed border-[#cfd7e6] bg-white/50 px-3 py-2.5 text-xs text-[#66738a]">
          <MinusCircle size={19} className="shrink-0 text-[#9aa8bd]" />
          <div>
            <p>Tidak Berlaku (Mahasiswa Jalur Reguler)</p>
            <p className="mt-0.5 text-[10px] text-[#9aa8bd]">Bukan Mahasiswa Alih Program</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-[322px] flex-col rounded-xl border p-4 ${
        error ? 'border-red-300 bg-[#fffafa]' : 'border-[#dbe1ef] bg-[#f0f3fc]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
            error ? 'bg-red-50 text-red-500' : 'bg-[#dce6fb] text-[#8a6b00]'
          }`}
        >
          {String(document.id).padStart(2, '0')}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold leading-5 text-gray-900">{document.title}</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {document.badge && (
              <span className="rounded-full bg-[#f3e6ae] px-2 py-0.5 text-[10px] font-semibold text-[#8a6b00]">
                {document.badge}
              </span>
            )}
            {document.optionalBadge && (
              <span className="rounded-full bg-[#f3e6ae] px-2 py-0.5 text-[10px] font-semibold text-[#8a6b00]">
                {document.optionalBadge}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
        {renderDescription(document.description)}
      </p>

      <div className="mt-auto">
        {file ? (
          <>
            <div className="mb-2 rounded-lg border border-[#cfd7e6] bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={19} className="shrink-0 text-[#38a169]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-800">{file.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <label className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#b52f26] text-xs font-semibold text-white hover:bg-[#9f2921]">
                <FileUp size={14} className="shrink-0" />
                Ganti
                <input
                  type="file"
                  className="hidden"
                  accept={document.accept}
                  onChange={(event) => {
                    validateFile(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
              </label>

              {/* "Lihat" buka file di tab baru, di luar aplikasi ini. */}
              <button
                type="button"
                onClick={() => window.open(URL.createObjectURL(file), '_blank', 'noopener,noreferrer')}
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#cfd7e6] bg-white text-xs font-semibold text-[#173b6d] hover:bg-gray-50"
              >
                <Eye size={14} className="shrink-0" />
                Lihat
              </button>
            </div>
          </>
        ) : (
          <>
            {error && (
              <p className="mb-2 flex items-start gap-1.5 text-xs font-medium leading-4 text-red-500">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <label
              className={`flex h-9 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border bg-white pl-4 text-xs font-semibold ${
                error ? 'border-red-400 text-red-500' : 'border-[#d7dce6] text-gray-700'
              }`}
            >
              <FileUp size={15} className="shrink-0" />
              <span>Pilih Berkas {document.type}</span>
              <span className="ml-auto pr-3 font-normal text-gray-400">Maks 5MB</span>
              <input
                type="file"
                className="hidden"
                accept={document.accept}
                onChange={(event) => {
                  validateFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </label>
          </>
        )}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, error, onBlur }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`h-12 w-full rounded-xl border px-4 text-sm outline-none ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#1f3d6d]'
        }`}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertTriangle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}


function SelectField({ label, value, onChange, onBlur, error, placeholder, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-11 text-sm text-gray-700 outline-none ${
            error ? 'border-red-400' : 'border-gray-300 focus:border-[#1f3d6d]'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertTriangle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default function FormPengajuanPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState({})
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    nim: '',
    prodi: '',
    dosen: '',
    whatsapp: '',
    video: '',
  })
  const [integrityChecked, setIntegrityChecked] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const [isAlihProgram] = useState(false) // TODO: ganti dengan data asli dari profil mahasiswa

  const handleFileChange = (id, file) => setFiles((prev) => ({ ...prev, [id]: file }))
  const handleErrorChange = (id, message) => setErrors((prev) => ({ ...prev, [id]: message }))
  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  // FIX: dokumen dengan badge 'Wajib TRI' sekarang gak lagi memblokir submit —
  // tetap boleh diunggah dan tetap tampil badge peringatannya, tapi gak wajib.
  const requiredDocuments = documents.filter((document) => {
    if (document.notApplicable && !isAlihProgram) return false
    if (document.badge === 'Wajib TRI') return false
    return true
  })

  const uploadedCount = requiredDocuments.filter((document) => files[document.id]).length
  const allDocumentsUploaded = uploadedCount === requiredDocuments.length

  const hasDocumentError = Object.values(errors).some(Boolean)
  const isWhatsappValid = /^8\d{8,12}$/.test(form.whatsapp)

  const allFieldsFilled = Boolean(
    form.name.trim() && form.nim.trim() && form.prodi && form.dosen && isWhatsappValid && form.video.trim(),
  )

  const canSubmit = allFieldsFilled && allDocumentsUploaded && !hasDocumentError && integrityChecked

  const showErr = (field) => touched[field] || submitAttempted
  const fieldError = {
    name: showErr('name') && !form.name.trim() ? 'Kolom ini wajib diisi.' : null,
    nim: showErr('nim') && !form.nim.trim() ? 'Kolom ini wajib diisi.' : null,
    prodi: showErr('prodi') && !form.prodi ? 'Pilih salah satu program studi.' : null,
    dosen: showErr('dosen') && !form.dosen ? 'Pilih dosen pembimbing.' : null,
    whatsapp:
      showErr('whatsapp') && !isWhatsappValid
        ? 'Kolom ini wajib diisi dengan nomor WhatsApp aktif yang valid.'
        : null,
    video: showErr('video') && !form.video.trim() ? 'Kolom ini wajib diisi.' : null,
  }

  const anyFieldError = Object.values(fieldError).some(Boolean)
  const hasError = hasDocumentError || anyFieldError
  const footerState = canSubmit ? 'valid' : hasError ? 'error' : 'empty'

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar />
      <Header />

      <main className="ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-7 py-8">
          <section className="rounded-2xl bg-white p-9 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-950">Formulir Pengajuan Yudisium</h2>
            <p className="mt-2 text-sm text-gray-500">
              Lengkapi identitas diri, data akademik, dan dokumen-dokumen yang dibutuhkan untuk
              melakukan pengajuan yudisium
            </p>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex gap-4 border-b border-[#dce3ee] pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff2ca] text-[#8a6b00]">
                <Megaphone size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#172f55]">
                  Ketentuan Pengajuan &amp; Penyerahan Berkas Yudisium
                </h3>
                <p className="text-sm text-gray-500">
                  Perhatikan alur pelaksanaan yudisium serta kewajiban penyerahan berkas cetak
                  (hardcopy) ke Bagian Akademik
                </p>
              </div>
            </div>

            <h3 className="mt-6 text-lg font-bold text-gray-900">Alur &amp; Prosedur Yudisium</h3>

            <div className="mt-5 grid grid-cols-3 gap-4">
              {[
                {
                  icon: <BookOpen size={18} className="text-[#855b14]" />,
                  title: 'Persyaratan & Dokumen',
                  text: 'Persyaratan lengkap serta berkas template resmi dapat diakses dan diunduh melalui menu Panduan & Dokumen.',
                  link: true,
                },
                {
                  icon: <CalendarClock size={18} className="text-[#855b14]" />,
                  title: 'Sidang Pleno Yudisium',
                  text: 'Penetapan kelulusan dilaksanakan melalui Rapat Pengurus Departemen sesuai jadwal kalender akademik DTEDI.',
                },
                {
                  icon: <BadgeCheck size={18} className="text-[#855b14]" />,
                  title: 'Penerbitan Berita Acara',
                  text: 'Dokumen Berita Acara resmi bertanda tangan elektronik dapat diunduh pada menu Berita Acara setelah seluruh verifikasi tuntas disahkan.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-[#f0f3fc] p-4">
                  <div className="flex items-center gap-2">
                    {/* Ikon memakai warna cokelat dari properti className masing-masing */}
                    {item.icon}
                    {/* Warna biru tua khusus dipasang di teks judul saja */}
                    <h4 className="font-bold text-[#1f3d6d]">{item.title}</h4>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
                  {item.link && (
                    <button
                      type="button"
                      onClick={() => navigate('/panduan')}
                      className="mt-2 text-xs font-bold text-[#172f55] hover:underline"
                    >
                      Lihat Panduan &amp; Dokumen →
                    </button>
                  )}
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-lg font-bold text-gray-900">
              Kewajiban Penyerahan Berkas Fisik (Hardcopy)
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Selain mengunggah berkas digital pada sistem, mahasiswa wajib menyerahkan 4 berkas
              fisik cetak secara langsung ke Bagian Akademik
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                [
                  'Pasfoto 4×6 Latar Belakang Biru (1 Lembar)',
                  'Kemeja putih dan jas/blazer hitam resmi (bukan jas almamater), latar belakang biru tua, cetak foto studio berkualitas tajam (bukan foto ponsel atau hasil scan).',
                ],
                [
                  'Sertifikat Kemampuan Bahasa Inggris',
                  'Sertifikat asli atau legalisir. Wajib melampirkan sertifikat pendamping resmi apabila skor belum memenuhi batas standar minimal yudisium.',
                ],
                [
                  'Formulir Checklist Judul TA / Proyek Akhir',
                  'Lembar cetak checklist judul TA/Proyek Akhir yang telah disetujui dan ditandatangani asli oleh Dosen Pembimbing TA.',
                ],
                [
                  'Lembar Pengesahan Asli TA / Proyek Akhir',
                  'Lembar pengesahan asli (1 eksemplar) bertandatangan basah dan berstempel lengkap dari tim dosen penguji, dosen pembimbing, serta Ketua Departemen.',
                ],
              ].map(([title, text], index) => (
                <div key={title} className="rounded-xl border border-gray-200 bg-[#f0f3fc] p-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dce6fb] text-sm font-semibold text-[#8a6b00]">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1f3d6d]">{title}</h4>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#f7f8fc] px-8 py-6">
              <h2 className="text-2xl font-bold text-[#172f55]">Identitas Diri</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-5 p-8">
              <TextField
                label="1. Nama Lengkap (Sesuai KTP/Ijazah/Akta)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => markTouched('name')}
                placeholder="Masukkan nama lengkap sesuai KTP/Ijazah/Akta"
                error={fieldError.name}
              />

              <TextField
                label="2. Nomor Induk Mahasiswa (NIM)"
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
                onBlur={() => markTouched('nim')}
                placeholder="Contoh: 21/478812/SV/18301"
                error={fieldError.nim}
              />

              <SelectField
                label="3. Program Studi"
                value={form.prodi}
                onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                onBlur={() => markTouched('prodi')}
                error={fieldError.prodi}
                placeholder="Pilih Program Studi"
                options={[
                  'Teknologi Rekayasa Perangkat Lunak',
                  'Teknologi Rekayasa Elektro',
                  'Teknologi Rekayasa Instrumentasi dan Kontrol',
                  'Teknologi Rekayasa Internet',
                ]}
              />

              <SelectField
                label="4. Dosen Pembimbing Proyek Akhir"
                value={form.dosen}
                onChange={(e) => setForm({ ...form, dosen: e.target.value })}
                onBlur={() => markTouched('dosen')}
                error={fieldError.dosen}
                placeholder="Pilih Dosen Pembimbing Proyek Akhir"
                options={['Dr. Ir. Budi Santoso, M.T.', 'Dr. Siti Rahmawati, S.T., M.T.', 'Dr. Ahmad Fauzan, S.T., M.T.']}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  5. Nomor WhatsApp Aktif Mahasiswa
                </label>
                <div
                  className={`flex overflow-hidden rounded-xl border ${
                    fieldError.whatsapp ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <span className="flex items-center bg-[#dce6fb] px-4 text-sm text-[#1f3d6d]">+62</span>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                    onBlur={() => markTouched('whatsapp')}
                    placeholder="Contoh: 81234567890"
                    className="h-12 flex-1 px-4 text-sm outline-none"
                  />
                </div>
                {fieldError.whatsapp && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <AlertTriangle size={12} className="shrink-0" /> {fieldError.whatsapp}
                  </p>
                )}
              </div>

              <TextField
                label="6. Tautan (Link) Video Presentasi Tugas Akhir"
                value={form.video}
                onChange={(e) => setForm({ ...form, video: e.target.value })}
                onBlur={() => markTouched('video')}
                placeholder="Tautan video diseminasi tugas akhir, minimal 3 menit"
                error={fieldError.video}
              />
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#f7f8fc] px-8 py-6">
              <h2 className="text-2xl font-bold text-[#172f55]">Dokumen Persyaratan</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 p-6">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  file={files[document.id]}
                  error={errors[document.id]}
                  disabled={document.notApplicable && !isAlihProgram}
                  onFileChange={handleFileChange}
                  onErrorChange={handleErrorChange}
                />
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Box Icon Palu Sidang (Gavel) Latar Kuning/Krim Halus */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2ca] text-[#8a6b00]">
                <Gavel size={20} />
              </div>
              <h2 className="font-bold text-[#172f55]">Pakta Integritas Mahasiswa Yudisium DTEDI</h2>
            </div>

            <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-[#dbe1ef] bg-[#f0f3fc] p-4">
              <input
                type="checkbox"
                checked={integrityChecked}
                onChange={(e) => setIntegrityChecked(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#1f3d6d]"
              />
              <span className="text-sm leading-6 text-gray-700">
                Saya menyatakan dengan sadar bahwa seluruh berkas dan data akademik yang diunggah
                adalah{' '}
                <strong>benar, absah, dan sesuai dengan ketentuan DTEDI SV UGM.</strong> Saya
                memahami bahwa setelah diajukan, berkas akan langsung masuk ke tahap Verifikasi
                Akademik DTEDI dan{' '}
                <span className="font-semibold text-red-500">
                  tidak dapat diubah atau ditarik kembali secara sepihak
                </span>{' '}
                tanpa persetujuan Akademik.
              </span>
            </label>
          </section>

          <section
          className={`mt-6 flex items-center justify-between rounded-2xl border bg-white px-7 py-5 transition ${
            footerState === 'error' ? 'border-[#f2d4ce]' : 'border-gray-200'
          }`}
        >
          {/* AREA TEKS PERINGATAN / INFO */}
          <div className="flex max-w-[620px] items-center gap-3.5">
            {footerState === 'error' ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7ece9] text-[#a04638]">
                <AlertTriangle size={18} strokeWidth={2.2} />
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff2ca] text-[#8a6b00]">
                <Info size={18} strokeWidth={2.2} />
              </div>
            )}

            <p
              className={`text-sm leading-relaxed ${
                footerState === 'error'
                  ? 'font-semibold text-[#9e3a2b]'
                  : 'font text-gray-600'
              }`}
            >
              {footerState === 'error'
                ? 'Lengkapi semua field dan dokumen yang ditandai merah sebelum mengirimkan permohonan yudisium.'
                : 'Pastikan Anda telah memeriksa kesesuaian berkas sebelum mengirimkan permohonan yudisium.'}
            </p>
          </div>

          {/* TOMBOL SUBMIT */}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              setSubmitAttempted(true)
              if (canSubmit) {
                alert('Pengajuan yudisium siap dikirim.')
              }
            }}
            className={`flex h-12 min-w-[260px] items-center justify-center gap-2.5 rounded-xl px-7 text-sm font-semibold transition ${
              canSubmit
                ? 'bg-[#142f57] text-white hover:bg-[#102647]'
                : footerState === 'error'
                ? 'cursor-not-allowed bg-[#d0d7e2] text-[#7a8699]' 
                : 'cursor-not-allowed bg-[#a0a8b5] text-white' 
            }`}
          >
            <span>Ajukan Berkas Yudisium</span>

            {footerState === 'error' ? (
              <Ban size={17} className="shrink-0" />
            ) : (
              <Send size={17} className="rotate-45 shrink-0" />
            )}
          </button>
        </section>
        </div>
      </main>
    </div>
  )
}