import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  LogOut,
  ChevronDown,
  CalendarDays,
  Eye,
  FileUp,
  Gavel,
  Info,
  AlertTriangle,
  Ban,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MinusCircle,
  Award,
} from 'lucide-react'

import { getUser, clearUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

const documents = [
  { id: 1, title: 'Form Pengajuan Yudisium', description: 'Unduh dan lengkapi template form pengajuan yudisium resmi DTEDI yang telah ditandatangani.', accept: '.pdf', type: 'PDF' },
  { id: 2, title: 'Form Pembatalan Mata Kuliah Pilihan', description: 'Unduh dan lengkapi template form pembatalan mata kuliah pilihan yang telah ditandatangani mahasiswa dan ketua program studi.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 3, title: 'Form Checklist Judul Proyek Akhir', description: 'Kesesuaian tata bahasa judul Proyek Akhir (ID & EN) tervalidasi pembimbing.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 4, title: 'Pas Photo', description: 'Pas Photo 4×6 latar biru (1 lembar). Ketentuan:\nKemeja putih, blazer/jas hitam (bukan almamater).\nBackground BIRU tua.\nTidak memakai kacamata hitam.\nFoto asli, tajam, tidak kabur (bukan hasil scan/repro).', accept: '.jpg,.jpeg,.png', type: 'JPG/PNG' },
  { id: 5, title: 'Transkrip Nilai Sementara', description: 'Transkrip nilai diambil dari SIMASTER, dan wajib mengisi form http://ugm.id/ProyekAkhirDTEDI sebagai syarat pemrosesan/terbitnya nilai PA, dan apabila terdapat nilai kosong/T, laporkan kepada Bagian Akademik.', accept: '.pdf', type: 'PDF' },
  { id: 6, title: 'Surat Tanda Terima Menyerahkan Skripsi dan Bebas Perpustakaan UGM.', description: 'Melakukan unggah Proyek Akhir secara mandiri di https://simaster.ugm.ac.id, dengan panduan tersedia di https://lib.ugm.ac.id/panduan-unggah-mandiri.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 7, title: 'Ijazah Terakhir', description: 'Pindaian ijazah terakhir, bukan sertifikat hasil ujian.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 8, title: 'Sertifikat PPSMB', description: 'Pindaian sertifikat Pelatihan Pembelajar Sukses bagi Mahasiswa Baru.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 9, title: 'Hasil Cek Plagiasi', description: 'Hasil cek plagiasi harus memenuhi:\nPersentase kemiripan maksimal 25%.\nDitandatangani dosen pembimbing tugas akhir (DPTA).', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 10, title: 'Sertifikat Kemampuan Bahasa Inggris', description: 'Skor minimal: TEVoCS≥60 / AcEPT≥209 / IELTS≥4.5 / TOEIC≥495 / TOEFL IBT≥52 / TOEFL ITP≥453. Belum memenuhi? Lihat panduan. Lolos PKM: TEVoCS berapa pun berlaku. Substitusi lain: Pengurus/Panitia/Juara Lomba (maks 5; Nasional=1, Universitas=2, SV=3, Departemen=5).', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 11, title: 'Sertifikat Kompetensi', description: 'Wajib untuk prodi TRI, opsional untuk prodi lain. Minimal level associate, dengan skor hasil dan tanggal berlaku yang ditunjukkan, serta dicantumkan dalam Berita Acara Yudisium (maksimal 5 sertifikat).', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG', badge: 'Wajib TRI', optionalBadge: 'Prodi Lain Opsional' },
  { id: 12, title: 'Lembar Halaman Pengesahan', description: 'Pindaian lembar pengesahan bertandatangan lengkap penguji, pembimbing, dan Kepala Departemen DTEDI.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 13, title: 'Unggah Draft Publikasi/Makalah', description: 'Angkatan 2021 & sebelumnya: Prosiding konferensi, HAKI, atau jurnal.\nAngkatan 2022 & seterusnya: Draft publikasi yang disetujui dosen pembimbing.\nTRI, TRIK & TRPL: draft jurnal acc pembimbing.\nTRE: wajib submit jurnal.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG' },
  { id: 14, title: 'Transkrip Nilai D3', description: 'Transkrip nilai D3 untuk mahasiswa jalur alih program.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG', notApplicable: true },
  { id: 15, title: 'Surat Bebas Lab', description: 'Keterangan pengembalian alat & kebersihan laboratorium.', accept: '.pdf,.png,.jpg,.jpeg', type: 'PDF/PNG', badge: 'Wajib TRI' },
]

function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[272px] bg-[#063E73] text-white">
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
          className="flex h-[43px] w-full items-center gap-4 rounded-xl px-4 text-left text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <Home size={20} strokeWidth={2} />
          <span className="text-sm">Dashboard</span>
        </button>

        <button
          type="button"
          className="mt-2 flex h-[43px] w-full items-center gap-4 rounded-xl bg-[#2D628F] px-4 text-left shadow-sm"
        >
          <FileText
            size={20}
            strokeWidth={2}
            className="text-[#FFD32A]"
          />
          <span className="text-sm font-semibold">Pengajuan Yudisium</span>
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

function Header() {
  const navigate = useNavigate()

  const [user] = useState(() => {
    const currentUser = getUser()

    return (
      currentUser || {
        name: 'Raihananta Khoiril Anam Pitoyo',
        email: 'raihananta.k@mail.ugm.ac.id',
        photo: null,
      }
    )
  })

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
        <h1 className="text-[28px] font-bold leading-tight text-gray-950">
          Pengajuan Yudisium
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Sistem Informasi Yudisium Terpadu DTEDI SV UGM
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center gap-3 rounded-xl px-2 py-2"
        >
          {user?.photo ? (
            <img
              src={user.photo}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c7cbd1]">
              <UserRound size={27} strokeWidth={2} className="text-white" />
            </div>
          )}

          <p className="max-w-[260px] truncate text-[14px] font-bold text-gray-900">
            {displayName}
          </p>

          <ChevronDown
            size={18}
            className={`text-gray-500 transition ${
              profileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[65px] w-[410px] overflow-hidden rounded-2xl border border-[#e0e5ed] bg-white shadow-xl">
            <div className="px-5 pt-5">
              <p className="border-b border-[#edf0f5] pb-4 text-sm font-semibold text-gray-500">
                {email}
              </p>

              <div className="flex flex-col items-center py-5">
                <div className="relative">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      className="h-24 w-24 rounded-full border-4 border-[#e8edf5] object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#e8edf5] bg-[#c7cbd1]">
                      <UserRound
                        size={53}
                        strokeWidth={2}
                        className="text-white"
                      />
                    </div>
                  )}

                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-[#5dbb67]" />
                </div>

                <p className="mt-3 text-[18px] font-bold text-gray-900">
                  {displayName}
                </p>
              </div>
            </div>

            <div className="mx-5 border-t border-[#edf0f5]" />

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false)
                navigate('/profile')
              }}
              className="flex w-full items-center gap-4 px-7 py-5 text-left hover:bg-gray-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#163b6c]">
                <UserRound size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold text-gray-900">
                  Profil Saya
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Ubah nama dan foto profil
                </span>
              </span>
            </button>

            <div className="mx-5 border-t border-[#edf0f5]" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-4 px-7 py-5 text-left hover:bg-red-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fde8e7] text-[#d9362b]">
                <LogOut size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#d9362b]">
                  Keluar / Logout
                </span>
                <span className="mt-0.5 block text-xs text-red-400">
                  Akhiri sesi akun di perangkat ini
                </span>
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function DocumentCard({
  document,
  file,
  error,
  disabled,
  onFileChange,
  onErrorChange,
}) {
  const navigate = useNavigate()

  const validateFile = (selectedFile) => {
    if (!selectedFile) return

    const extension = `.${selectedFile.name.split('.').pop().toLowerCase()}`
    const acceptedExtensions = document.accept
      .split(',')
      .map((item) => item.trim())

    if (!acceptedExtensions.includes(extension)) {
      onErrorChange(
        document.id,
        `Format berkas tidak sesuai. Berkas harus berupa ${document.type}.`,
      )
      onFileChange(document.id, null)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      onErrorChange(
        document.id,
        'Ukuran berkas terlalu besar. Maksimal ukuran berkas adalah 5 MB.',
      )
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
            <h3 className="font-semibold leading-5 text-gray-900">
              {document.title}
            </h3>

            <span className="mt-1 inline-block rounded-full bg-[#f3e6ae] px-2 py-0.5 text-[10px] font-semibold text-[#8a6b00]">
              Khusus mahasiswa Alih Program
            </span>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
          {document.description}
        </p>

        <div className="mt-auto flex items-center gap-2 rounded-lg border border-dashed border-[#cfd7e6] bg-white/50 px-3 py-2.5 text-xs text-[#66738a]">
          <MinusCircle size={19} className="text-[#9aa8bd]" />
          <div>
            <p>Tidak Berlaku (Mahasiswa Jalur Reguler)</p>
            <p className="mt-0.5 text-[10px] text-[#9aa8bd]">
              Bukan Mahasiswa Alih Program
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-[322px] flex-col rounded-xl border p-4 ${
        error
          ? 'border-red-300 bg-[#fffafa]'
          : 'border-[#dbe1ef] bg-[#f0f3fc]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
            error
              ? 'bg-red-50 text-red-500'
              : 'bg-[#dce6fb] text-[#8a6b00]'
          }`}
        >
          {String(document.id).padStart(2, '0')}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold leading-5 text-gray-900">
            {document.title}
          </h3>

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
        {document.description}
      </p>

      <div className="mt-auto">
        {file ? (
          <>
            <div className="mb-2 rounded-lg border border-[#cfd7e6] bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={19}
                  className="shrink-0 text-[#38a169]"
                />

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>

            {/* Setelah file masuk: TEPAT 2 tombol */}
            <div className="flex gap-2">
              <label className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#b52f26] text-xs font-semibold text-white hover:bg-[#9f2921]">
                <FileUp size={14} />
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

              <button
                type="button"
                onClick={() =>
                  navigate(`/dokumen/${document.id}`, {
                    state: {
                      fileName: file.name,
                      fileUrl: URL.createObjectURL(file),
                      title: document.title,
                    },
                  })
                }
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#cfd7e6] bg-white text-xs font-semibold text-[#173b6d] hover:bg-gray-50"
              >
                <Eye size={14} />
                Lihat
              </button>
            </div>
          </>
        ) : (
          <>
            {error && (
              <p className="mb-2 flex items-start gap-1 text-xs font-medium leading-4 text-red-500">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            {/* Sebelum file masuk: HANYA 1 tombol */}
            <label
              className={`flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white text-xs font-semibold ${
                error
                  ? 'border-red-400 text-red-500'
                  : 'border-[#d7dce6] text-gray-700'
              }`}
            >
              <FileUp size={15} />
              Pilih Berkas {document.type}
              <span className="ml-auto pr-3 font-normal text-gray-400">
                Maks 5MB
              </span>
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

function FormPengajuanPage() {
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

  const handleFileChange = (id, file) => {
    setFiles((previous) => ({ ...previous, [id]: file }))
  }

  const handleErrorChange = (id, message) => {
    setErrors((previous) => ({ ...previous, [id]: message }))
  }

  /*
   * Sebelum NIM diisi, dokumen D3 masih berupa dokumen biasa.
   * Setelah NIM diisi, mahasiswa dianggap sudah teridentifikasi
   * sebagai jalur reguler untuk state UI ini, sehingga D3 dinonaktifkan.
   */
  const isNimFilled = form.nim.trim().length > 0

  const requiredDocuments = documents.filter(
    (document) => !document.notApplicable || !isNimFilled,
  )

  const uploadedCount = requiredDocuments.filter(
    (document) => files[document.id],
  ).length

  const allDocumentsUploaded =
    uploadedCount === requiredDocuments.length

  const hasDocumentError = Object.values(errors).some(Boolean)
  const isWhatsappValid = /^8\d{8,12}$/.test(form.whatsapp)

  const allFieldsFilled = Boolean(
    form.name.trim() &&
      form.nim.trim() &&
      form.prodi &&
      form.dosen &&
      isWhatsappValid &&
      form.video.trim(),
  )

  const canSubmit =
    allFieldsFilled &&
    allDocumentsUploaded &&
    !hasDocumentError &&
    integrityChecked

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar />
      <Header />

      <main className="ml-[272px] pt-[88px]">
        <div className="mx-auto max-w-[1090px] px-7 py-8">
          <section className="rounded-2xl bg-white p-9 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-950">
              Formulir Pengajuan Yudisium
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Lengkapi identitas diri, data akademik, dan dokumen-dokumen yang
              dibutuhkan untuk melakukan pengajuan yudisium
            </p>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex gap-4 border-b border-[#dce3ee] pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff2ca] text-[#8a6b00]">
                <Gavel size={22} />
              </div>

              <div>
                <h3 className="font-bold text-[#172f55]">
                  Ketentuan Pengajuan &amp; Penyerahan Berkas Yudisium
                </h3>
                <p className="text-sm text-gray-500">
                  Perhatikan alur pelaksanaan yudisium serta kewajiban
                  penyerahan berkas cetak (hardcopy) ke Bagian Akademik
                </p>
              </div>
            </div>

            <h3 className="mt-6 text-lg font-bold text-gray-900">
              Alur &amp; Prosedur Yudisium
            </h3>

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
                <div
                  key={item.title}
                  className="rounded-xl bg-[#f0f3fc] p-4"
                >
                  <div className="flex items-center gap-2 text-[#1f3d6d]">
                    {item.icon}
                    <h4 className="font-bold">{item.title}</h4>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {item.text}
                  </p>

                  {item.link && (
                    <button
                      type="button"
                      onClick={() => {}}
                      className="mt-2 text-xs font-bold text-[#172f55]"
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
              Selain mengunggah berkas digital pada sistem, mahasiswa wajib
              menyerahkan 4 berkas fisik cetak secara langsung ke Bagian
              Akademik
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
                <div
                  key={title}
                  className="rounded-xl border border-gray-200 bg-[#f0f3fc] p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dce6fb] text-sm font-semibold text-[#8a6b00]">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#1f3d6d]">
                        {title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#f7f8fc] px-8 py-6">
              <h2 className="text-2xl font-bold text-[#172f55]">
                Identitas Diri
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-5 p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  1. Nama Lengkap (Sesuai KTP/Ijazah/Akta)
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap sesuai KTP/Ijazah/Akta"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#1f3d6d]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  2. Nomor Induk Mahasiswa (NIM)
                </label>
                <input
                  value={form.nim}
                  onChange={(e) =>
                    setForm({ ...form, nim: e.target.value })
                  }
                  placeholder="Contoh: 21/478812/SV/18301"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#1f3d6d]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  3. Program Studi
                </label>
                <div className="relative">
                  <select
                    value={form.prodi}
                    onChange={(e) =>
                      setForm({ ...form, prodi: e.target.value })
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#1f3d6d]"
                  >
                    <option value="">Pilih Program Studi</option>
                    <option>
                      Teknologi Rekayasa Perangkat Lunak
                    </option>
                    <option>Teknologi Rekayasa Elektro</option>
                    <option>
                      Teknologi Rekayasa Instrumentasi dan Kontrol
                    </option>
                    <option>Teknologi Rekayasa Internet</option>
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  4. Dosen Pembimbing Proyek Akhir
                </label>

                <div className="relative">
                  <select
                    value={form.dosen}
                    onChange={(e) =>
                      setForm({ ...form, dosen: e.target.value })
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#1f3d6d]"
                  >
                    <option value="">
                      Pilih Dosen Pembimbing Proyek Akhir
                    </option>
                    <option>Dr. Ir. Budi Santoso, M.T.</option>
                    <option>
                      Dr. Siti Rahmawati, S.T., M.T.
                    </option>
                    <option>
                      Dr. Ahmad Fauzan, S.T., M.T.
                    </option>
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  5. Nomor WhatsApp Aktif
                </label>

                <div className="flex overflow-hidden rounded-xl border border-gray-300">
                  <span className="flex items-center bg-[#dce6fb] px-4 text-sm text-[#1f3d6d]">
                    +62
                  </span>

                  <input
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        whatsapp: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    placeholder="Contoh: 81234567890"
                    className="h-12 flex-1 px-4 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  6. Tautan (Link) Video Presentasi Tugas Akhir
                </label>

                <input
                  value={form.video}
                  onChange={(e) =>
                    setForm({ ...form, video: e.target.value })
                  }
                  placeholder="Tautan video diseminasi tugas akhir, minimal 3 menit"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#1f3d6d]"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#f7f8fc] px-8 py-6">
              <h2 className="text-2xl font-bold text-[#172f55]">
                Dokumen Persyaratan
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4 p-6">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  file={files[document.id]}
                  error={errors[document.id]}
                  disabled={document.notApplicable && isNimFilled}
                  onFileChange={handleFileChange}
                  onErrorChange={handleErrorChange}
                />
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2ca] text-[#8a6b00]">
                <Gavel size={20} />
              </div>

              <h2 className="font-bold text-[#172f55]">
                Pakta Integritas Mahasiswa Yudisium DTEDI
              </h2>
            </div>

            <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-[#dbe1ef] bg-[#f0f3fc] p-4">
              <input
                type="checkbox"
                checked={integrityChecked}
                onChange={(e) => setIntegrityChecked(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#1f3d6d]"
              />

              <span className="text-sm leading-6 text-gray-700">
                Saya menyatakan dengan sadar bahwa seluruh berkas dan data
                akademik yang diunggah adalah{' '}
                <strong>
                  benar, absah, dan sesuai dengan ketentuan DTEDI SV UGM.
                </strong>{' '}
                Saya memahami bahwa setelah diajukan, berkas akan langsung
                masuk ke tahap Verifikasi Akademik DTEDI dan{' '}
                <span className="font-semibold text-red-500">
                  tidak dapat diubah atau ditarik kembali secara sepihak
                </span>{' '}
                tanpa persetujuan Akademik.
              </span>
            </label>
          </section>

          <section
            className={`mt-6 flex items-center justify-between rounded-xl border bg-white px-7 py-5 ${
              canSubmit ? 'border-gray-200' : 'border-red-200'
            }`}
          >
            <div className="flex max-w-[620px] items-start gap-3">
              {canSubmit ? (
                <Info
                  size={19}
                  className="mt-1 shrink-0 text-[#8a6b00]"
                />
              ) : (
                <AlertTriangle
                  size={19}
                  className="mt-1 shrink-0 text-red-500"
                />
              )}

              <p
                className={`text-sm ${
                  canSubmit ? 'text-gray-600' : 'text-red-500'
                }`}
              >
                {canSubmit
                  ? 'Pastikan Anda telah memeriksa kesesuaian berkas sebelum mengirimkan permohonan yudisium.'
                  : 'Lengkapi semua field dan dokumen yang ditandai merah sebelum mengirimkan permohonan yudisium.'}
              </p>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => alert('Pengajuan yudisium siap dikirim.')}
              className={`flex h-12 min-w-[260px] items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold ${
                canSubmit
                  ? 'bg-[#142f57] text-white hover:bg-[#102647]'
                  : 'cursor-not-allowed bg-[#d6dce7] text-[#8b96a8]'
              }`}
            >
              Ajukan Berkas Yudisium
              {canSubmit ? (
                <ArrowRight size={17} />
              ) : (
                <Ban size={17} />
              )}
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}

function DocumentPreviewPage() {
  const navigate = useNavigate()

  const [documentData] = useState(
    () =>
      window.history.state?.usr || {
        fileName: 'Dokumen',
        fileUrl: '',
        title: 'Dokumen Yudisium',
      },
  )

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <Sidebar />

      <main className="ml-[272px] min-h-screen pt-[110px]">
        <div className="mx-auto max-w-[1090px] px-7">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#1f3d6d]"
          >
            <ArrowLeft size={18} />
            Kembali ke Pengajuan Yudisium
          </button>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-200 px-7 py-5">
              <h1 className="text-xl font-bold text-[#172f55]">
                {documentData.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {documentData.fileName}
              </p>
            </div>

            <div className="flex min-h-[700px] items-center justify-center bg-gray-100 p-6">
              {documentData.fileUrl ? (
                <iframe
                  src={documentData.fileUrl}
                  title={documentData.fileName}
                  className="h-[700px] w-full rounded-lg border border-gray-300 bg-white"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <FileText
                    size={50}
                    className="mx-auto mb-3 text-gray-400"
                  />
                  <p>Dokumen belum tersedia untuk ditampilkan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default FormPengajuanPage
export { DocumentPreviewPage }
