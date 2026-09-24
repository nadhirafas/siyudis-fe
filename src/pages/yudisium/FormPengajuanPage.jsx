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
  PenTool,
  Info,
  AlertTriangle,
  Ban,
  Send,
  CheckCircle2,
  MinusCircle,
  CalendarDays,
  Award,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

// Mengubah URL polos di dalam teks deskripsi jadi link yang beneran bisa diklik,
// buka di tab baru. Catatan: frasa "Lihat panduan" di deskripsi dokumen #10 gak
// punya URL eksplisit di datanya, jadi tetap teks biasa (gak bisa di-link-kan
// tanpa alamat tujuannya) — kasih tau aku kalau ada link resminya, nanti aku pasang.
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

// accept disamakan persis dengan label "type" yang ditampilkan ke user.
// badge 'Wajib TRI' sekarang gak lagi bikin dokumen wajib diupload sebelum submit
// (lihat requiredDocuments di komponen utama) — sesuai permintaan terbaru.
const documents = [
  { id: 1, title: 'Form Pengajuan Yudisium', description: 'Unduh dan lengkapi template form pengajuan yudisium resmi DTEDI yang telah ditandatangani.', accept: '.pdf', type: 'PDF' },
  { id: 2, title: 'Form Pembatalan Mata Kuliah Pilihan', description: 'Unduh dan lengkapi template form pembatalan mata kuliah pilihan yang telah ditandatangani mahasiswa dan ketua program studi.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 3, title: 'Form Checklist Judul Proyek Akhir', description: 'Kesesuaian tata bahasa judul Proyek Akhir (ID & EN) tervalidasi pembimbing.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 4, title: 'Pas Photo', description: 'Pas Photo 4×6 latar biru (1 lembar). Ketentuan:\nKemeja putih, blazer/jas hitam (bukan almamater).\nBackground BIRU tua.\nTidak memakai kacamata hitam.\nFoto asli, tajam, tidak kabur (bukan hasil scan/repro).', accept: '.jpg,.jpeg,.png', type: 'JPG/PNG' },
  { id: 5, title: 'Transkrip Nilai Sementara', description: 'Transkrip nilai diambil dari SIMASTER, dan wajib mengisi form http://ugm.id/ProyekAkhirDTEDI sebagai syarat pemrosesan/terbitnya nilai PA, dan apabila terdapat nilai kosong/T, laporkan kepada Bagian Akademik.', accept: '.pdf', type: 'PDF' },
  { id: 6, title: 'Surat Tanda Terima Menyerahkan Skripsi dan Bebas Perpustakaan UGM.', description: 'Melakukan unggah Proyek Akhir secara mandiri di https://simaster.ugm.ac.id, dengan panduan tersedia di https://lib.ugm.ac.id/panduan-unggah-mandiri.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 7, title: 'Ijazah Terakhir', description: 'Pindaian ijazah terakhir, bukan sertifikat hasil ujian.', accept: '.pdf,.png', type: 'PDF/PNG' },
  // ⚠️ Screenshot referensimu beda-beda soal batas ukuran (5MB vs 10MB untuk dokumen ini).
  // Dipakai 5MB dulu — pastikan lagi ke PM/desainer mana yang benar.
  { id: 8, title: 'Sertifikat PPSMB', description: 'Pindaian sertifikat Pelatihan Pembelajar Sukses bagi Mahasiswa Baru.', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 9, title: 'Hasil Cek Plagiasi', description: 'Hasil cek plagiasi harus memenuhi:\nPersentase kemiripan maksimal 25%.\nDitandatangani dosen pembimbing tugas akhir (DPTA).', accept: '.pdf,.png', type: 'PDF/PNG' },
  { id: 10, title: 'Sertifikat Kemampuan Bahasa Inggris', description: 'Skor minimal: TEVoCS≥60 / AcEPT≥209 / IELTS≥4.5 / TOEIC≥495 / TOEFL IBT≥52 / TOEFL ITP≥453. Belum memenuhi? Lihat panduan. Lolos PKM: TEVoCS berapa pun berlaku. Substitusi lain: Pengurus/Panitia/Juara Lomba (maks 5; Nasional=1, Universitas=2, SV=3, Departemen=5).', accept: '.pdf,.png', type: 'PDF/PNG' },
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

// Dropdown profil dikembalikan (sesuai screenshot), spacing dilebarkan biar gak "mepet".
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
        <h1 className="text-[28px] font-bold leading-tight text-gray-950">Pengajuan Yudisium</h1>
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
          <ChevronDown
            size={18}
            className={`text-gray-500 transition ${profileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[68px] w-[420px] overflow-hidden rounded-2xl border border-[#e0e5ed] bg-white shadow-xl">
            <div className="px-6 pt-6">
              <p className="border-b border-[#edf0f5] pb-5 text-sm font-semibold text-gray-500">
                {email}
              </p>

              <div className="flex flex-col items-center py-6">
                <div className="relative">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      className="h-24 w-24 rounded-full border-4 border-[#e8edf5] object-cover"
                    />
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
          {linkifyText(document.description)}
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
        {linkifyText(document.description)}
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
              className={`flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white text-xs font-semibold ${
                error ? 'border-red-400 text-red-500' : 'border-[#d7dce6] text-gray-700'
              }`}
            >
              <FileUp size={15} className="shrink-0" />
              Pilih Berkas {document.type}
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

// Select dengan chevron custom (bukan panah bawaan browser) + padding kanan
// secukupnya biar gak "mepet" sama teks/chevronnya.
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
                  icon: <BookOpen size={18} />,
                  title: 'Persyaratan & Dokumen',
                  text: 'Persyaratan lengkap serta berkas template resmi dapat diakses dan diunduh melalui menu Panduan & Dokumen.',
                  link: true,
                },
                {
                  icon: <CalendarDays size={18} />,
                  title: 'Sidang Pleno Yudisium',
                  text: 'Penetapan kelulusan dilaksanakan melalui Rapat Pengurus Departemen sesuai jadwal kalender akademik DTEDI.',
                },
                {
                  icon: <Award size={18} />,
                  title: 'Penerbitan Berita Acara',
                  text: 'Dokumen Berita Acara resmi bertanda tangan elektronik dapat diunduh pada menu Berita Acara setelah seluruh verifikasi tuntas disahkan.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-[#f0f3fc] p-4">
                  <div className="flex items-center gap-2 text-[#1f3d6d]">
                    {item.icon}
                    <h4 className="font-bold">{item.title}</h4>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
                  {item.link && (
                    <button type="button" className="mt-2 text-xs font-bold text-[#172f55]">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2ca] text-[#8a6b00]">
                <PenTool size={20} />
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
            className={`mt-6 flex items-center justify-between rounded-xl border bg-white px-7 py-5 ${
              footerState === 'error' ? 'border-red-200' : 'border-gray-200'
            }`}
          >
            <div className="flex max-w-[620px] items-start gap-3">
              {footerState === 'error' ? (
                <AlertTriangle size={19} className="mt-1 shrink-0 text-red-500" />
              ) : (
                <Info size={19} className="mt-1 shrink-0 text-[#8a6b00]" />
              )}
              <p className={`text-sm ${footerState === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
                {footerState === 'error'
                  ? 'Lengkapi semua field dan dokumen yang ditandai merah sebelum mengirimkan permohonan yudisium.'
                  : 'Pastikan Anda telah memeriksa kesesuaian berkas sebelum mengirimkan permohonan yudisium.'}
              </p>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                setSubmitAttempted(true)
                if (canSubmit) {
                  alert('Pengajuan yudisium siap dikirim.')
                }
              }}
              className={`flex h-12 min-w-[260px] items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold ${
                canSubmit
                  ? 'bg-[#142f57] text-white hover:bg-[#102647]'
                  : 'cursor-not-allowed bg-[#d6dce7] text-[#8b96a8]'
              }`}
            >
              Ajukan Berkas Yudisium
              {footerState === 'error' ? <Ban size={17} /> : <Send size={17} />}
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}