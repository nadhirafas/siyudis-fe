import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  UserRound,
  LogOut,
  Search,
  Send,
  Mail,
  MoreHorizontal,
  FileText,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Pencil,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileSearchIcon
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import { getUser, clearUser } from '../../services/auth'

/* =========================================================
   DATA PROGRAM STUDI
========================================================= */

const PROGRAM_STUDI = [
  {
    kode: 'TRPL',
    nama: 'Teknologi Rekayasa Perangkat Lunak (TRPL)',
  },
  {
    kode: 'TRI',
    nama: 'Teknologi Rekayasa Internet (TRI)',
  },
  {
    kode: 'TRE',
    nama: 'Teknologi Rekayasa Elektro (TRE)',
  },
  {
    kode: 'TRIK',
    nama: 'Teknologi Rekayasa Instrumen & Kontrol (TRIK)',
  },
]

/* =========================================================
   DATA MAHASISWA
========================================================= */

const INITIAL_STUDENTS = [
  {
    id: 1,
    nama: 'Nadila Azka Rakhma',
    nim: '22/505286/SV/21978',
    prodi: 'TRPL',
    predikat: 'Cumlaude',
    emailStatus: 'TERKIRIM',
    confirmationStatus: 'SUDAH BENAR',
    baStatus: 'confirmed',
    selected: true,

    dataBA: {
      ipk: '3,70',
      nilaiD: '10',
      sks: '144',
      similarity: '14',
      english: 'TEVocS: 70',
      judulPA: 'Disetujui',
      sertifikatKegiatan: 'Kepanitiaan Universitas PORSENIGAMA 2023',
      sertifikatKompetensi: 'BNSP Associate Data Scientist 2025',
      statusPemeriksaan: '-',
    },
  },

  {
    id: 2,
    nama: 'Gilang Ramadhan Putra',
    nim: '22/505700/SV/22013',
    prodi: 'TRPL',
    predikat: 'Cumlaude',
    emailStatus: 'TERKIRIM',
    confirmationStatus: 'PERLU REVISI',
    baStatus: 'revision',
    selected: true,

    dataBA: {
      ipk: '3,70',
      nilaiD: '10',
      sks: '144',
      similarity: '14',
      english: 'TEVocS: 70',
      judulPA: 'Disetujui',
      sertifikatKegiatan: 'Kepanitiaan Universitas PORSENIGAMA 2023',
      sertifikatKompetensi: 'BNSP Associate Data Scientist 2025',
      statusPemeriksaan: '-',
    },

    catatanRevisi: [
      'IPK seharusnya 3,82',
      'Sertifikat Kegiatan seharusnya Kegiatan Fakultas PERMADANI 2023',
    ],
  },

  {
    id: 3,
    nama: 'Rizky Adi Nugroho',
    nim: '22/505810/SV/22028',
    prodi: 'TRPL',
    predikat: 'Tidak Cumlaude',
    emailStatus: 'GAGAL',
    confirmationStatus: 'PERLU REVISI',
    baStatus: 'revision',
    selected: false,

    dataBA: {
      ipk: '3,70',
      nilaiD: '10',
      sks: '144',
      similarity: '14',
      english: 'TEVocS: 70',
      judulPA: 'Disetujui',
      sertifikatKegiatan: 'Kepanitiaan Universitas PORSENIGAMA 2023',
      sertifikatKompetensi: 'BNSP Associate Data Scientist 2025',
      statusPemeriksaan: '-',
    },

    catatanRevisi: [
      'IPK seharusnya 3,82',
      'Sertifikat Kegiatan perlu diperiksa kembali',
    ],
  },

  {
    id: 4,
    nama: 'Dimas Bagus Saputra',
    nim: '22/506018/SV/22054',
    prodi: 'TRPL',
    predikat: 'Tidak Cumlaude',
    emailStatus: '-',
    confirmationStatus: '-',
    baStatus: 'empty',
    selected: false,

    dataBA: {
      ipk: '',
      nilaiD: '',
      sks: '',
      similarity: '',
      english: '',
      judulPA: '',
      sertifikatKegiatan: '',
      sertifikatKompetensi: '',
      statusPemeriksaan: '',
    },
  },
]

/* =========================================================
   MAIN PAGE
========================================================= */

function BeritaAcara() {
  const navigate = useNavigate()

  const [user] = useState(() => getUser())
  const [profileOpen, setProfileOpen] = useState(false)

  const [nomorDokumen, setNomorDokumen] = useState(
    '104/UN1/SV/DTEDI/BA-YUD/VI/2024'
  )

  const [tanggalDokumen, setTanggalDokumen] = useState('28 Jun 2024')

  const [periodeYudisium, setPeriodeYudisium] = useState(
    'Periode Juni 2024 (Genap 2023/2024)'
  )

  const [isSaved, setIsSaved] = useState(true)

  const [selectedProdi, setSelectedProdi] = useState('TRPL')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [emailFilter, setEmailFilter] = useState('Semua Status')

  const [students, setStudents] = useState(INITIAL_STUDENTS)

  const [selectedStudent, setSelectedStudent] = useState(null)

  const [modalMode, setModalMode] = useState(null)

  const [actionMenuId, setActionMenuId] = useState(null)

  const displayName = user?.nama || 'Aji Pangestu'

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

  /* =======================================================
     SAVE CONFIGURATION
  ======================================================= */

  const handleSaveConfiguration = () => {
    setIsSaved(true)
  }

  /* =======================================================
     PROGRAM STUDI
  ======================================================= */

  const handleSelectProdi = (kode) => {
    setSelectedProdi(kode)
    setSearch('')
    setStatusFilter('Semua Status')
    setEmailFilter('Semua Status')
    setActionMenuId(null)
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (student.prodi !== selectedProdi) {
        return false
      }

      const keyword = search.toLowerCase().trim()

      const searchMatch =
        !keyword ||
        student.nama.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword)

      const statusMatch =
        statusFilter === 'Semua Status' ||
        student.confirmationStatus === statusFilter

      const emailMatch =
        emailFilter === 'Semua Status' ||
        student.emailStatus === emailFilter

      return searchMatch && statusMatch && emailMatch
    })
  }, [
    students,
    selectedProdi,
    search,
    statusFilter,
    emailFilter,
  ])

  /* =======================================================
     SELECT STUDENT
  ======================================================= */

  const handleToggleStudent = (id) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? {
              ...student,
              selected: !student.selected,
            }
          : student
      )
    )
  }

  const handleToggleAll = () => {
    const visibleIds = filteredStudents.map((student) => student.id)

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        students.find((student) => student.id === id)?.selected
      )

    setStudents((current) =>
      current.map((student) =>
        visibleIds.includes(student.id)
          ? {
              ...student,
              selected: !allSelected,
            }
          : student
      )
    )
  }

  /* =======================================================
     MODAL
  ======================================================= */

  const openModal = (student, mode) => {
    setSelectedStudent(student)
    setModalMode(mode)
    setActionMenuId(null)
  }

  const closeModal = () => {
    setSelectedStudent(null)
    setModalMode(null)
  }

  /* =======================================================
     EDIT DATA BERITA ACARA
  ======================================================= */

  const handleChangeBA = (field, value) => {
    if (!selectedStudent) return

    setSelectedStudent((current) => ({
      ...current,
      dataBA: {
        ...current.dataBA,
        [field]: value,
      },
    }))
  }

  const handleSaveBA = () => {
    if (!selectedStudent) return

    setStudents((current) =>
      current.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              dataBA: selectedStudent.dataBA,
              baStatus:
                student.baStatus === 'empty'
                  ? 'filled'
                  : student.baStatus,
              emailStatus:
                student.emailStatus === '-'
                  ? 'TERKIRIM'
                  : student.emailStatus,
            }
          : student
      )
    )

    closeModal()
  }

  /* =======================================================
     VERIFIKASI / SERAHKAN KE KAPRODI
  ======================================================= */

  const handleSubmitToKaprodi = () => {
    const selectedIds = students
      .filter(
        (student) =>
          student.selected &&
          student.confirmationStatus === 'SUDAH BENAR'
      )
      .map((student) => student.id)

    if (selectedIds.length === 0) return

    setStudents((current) =>
      current.map((student) =>
        selectedIds.includes(student.id)
          ? {
              ...student,
              confirmationStatus: 'SUDAH BENAR',
              baStatus: 'submitted',
            }
          : student
      )
    )

    setActionMenuId(null)
  }

  /* =======================================================
     SEND EMAIL
  ======================================================= */

  const handleSendEmail = () => {
    const selectedIds = students
      .filter(
        (student) =>
          student.selected &&
          student.emailStatus !== 'TERKIRIM'
      )
      .map((student) => student.id)

    if (selectedIds.length === 0) return

    setStudents((current) =>
      current.map((student) =>
        selectedIds.includes(student.id)
          ? {
              ...student,
              emailStatus: 'TERKIRIM',
            }
          : student
      )
    )

    setActionMenuId(null)
  }

  /* =======================================================
     ACTION MENU
  ======================================================= */

  const handleFixData = (student) => {
    openModal(student, 'edit')
  }

  const handleResendEmail = (student) => {
    setStudents((current) =>
      current.map((item) =>
        item.id === student.id
          ? {
              ...item,
              emailStatus: 'TERKIRIM',
            }
          : item
      )
    )

    setActionMenuId(null)
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  const selectedForKaprodi = students.filter(
    (student) =>
      student.prodi === selectedProdi &&
      student.selected &&
      student.confirmationStatus === 'SUDAH BENAR'
  ).length

  const selectedForEmail = students.filter(
    (student) =>
      student.prodi === selectedProdi &&
      student.selected &&
      student.emailStatus !== 'TERKIRIM'
  ).length

  const selectedVisibleIds = filteredStudents.map(
    (student) => student.id
  )

  const allVisibleSelected =
    selectedVisibleIds.length > 0 &&
    selectedVisibleIds.every(
      (id) =>
        students.find((student) => student.id === id)?.selected
    )

  return (
    <div
      className="min-h-screen bg-[#EEF3F8] text-[#111827]"
      onClick={() => {
        if (actionMenuId !== null) {
          setActionMenuId(null)
        }
      }}
    >
      <Sidebar admin />

      <div className="ml-[295px] min-h-screen">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="relative z-20 flex h-[78px] items-center justify-between bg-white px-8">
          <div>
            <h1 className="text-[25px] font-bold leading-tight text-[#111111]">
              Berita Acara Staff Administrasi
            </h1>

            <p className="mt-1 text-[12px] text-[#687588]">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setProfileOpen((value) => !value)
              }}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-50"
            >
              <ProfileAvatar photo={user?.avatar} />

              <span className="max-w-[250px] truncate text-[14px] font-bold text-[#111111]">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileOpen && (
              <ProfileDropdown
                user={user}
                displayName={displayName}
                navigate={navigate}
                handleLogout={handleLogout}
                setProfileOpen={setProfileOpen}
              />
            )}
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="px-7 py-7">
          {/* =================================================
              INTRO
          ================================================= */}

          <section className="rounded-2xl bg-white px-9 py-7 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
            <h2 className="text-[23px] font-bold text-[#111111]">
              Pengelolaan Berita Acara Yudisium
            </h2>

            <p className="mt-2 text-[14px] text-[#687588]">
              Penyusunan dan validasi data kelulusan mahasiswa
              terverifikasi per program studi untuk penyusunan
              dokumen Berita Acara.
            </p>
          </section>

          {/* =================================================
              KONFIGURASI
          ================================================= */}

          <section className="mt-6 rounded-2xl bg-white px-8 py-6 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
            <h3 className="text-[16px] font-bold text-[#111111]">
              Konfigurasi Dokumen Berita Acara
            </h3>

            <div className="mt-6 grid grid-cols-[1.15fr_0.75fr_1.15fr] gap-3">
              <FormField
                label="Nomor Dokumen Berita Acara"
                required
                value={nomorDokumen}
                onChange={(value) => {
                  setNomorDokumen(value)
                  setIsSaved(false)
                }}
                placeholder="Contoh: 104/UN1/SV/DTEDI/BA-YUD/VI/2024"
              />

              <FormField
                label="Tanggal Dokumen"
                required
                value={tanggalDokumen}
                onChange={(value) => {
                  setTanggalDokumen(value)
                  setIsSaved(false)
                }}
                placeholder="Contoh: 28 Juni 2024"
              />

              <FormField
                label="Periode Yudisium"
                required
                value={periodeYudisium}
                onChange={(value) => {
                  setPeriodeYudisium(value)
                  setIsSaved(false)
                }}
                placeholder="Contoh: Periode Juni 2024 (Genap 2023/2024)"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfiguration}
                disabled={isSaved}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition ${
                  isSaved
                    ? 'bg-[#22912C]'
                    : 'bg-[#8998AA] hover:bg-[#748598]'
                }`}
              >
                {isSaved ? (
                  <>
                    Data Tersimpan
                    <span className="text-base">✓</span>
                  </>
                ) : (
                  <>
                    Simpan Perubahan
                    <Save size={15} />
                  </>
                )}
              </button>
            </div>
          </section>

          {/* =================================================
              PROGRAM STUDI
          ================================================= */}

          <section className="mt-6 rounded-2xl bg-white px-3 py-6 shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
            <div className="px-5">
              <h3 className="text-[16px] font-bold text-[#111111]">
                Pilih Program Studi Berita Acara
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {PROGRAM_STUDI.map((prodi) => {
                const count = students.filter(
                  (student) => student.prodi === prodi.kode
                ).length

                const readyCount = students.filter(
                  (student) =>
                    student.prodi === prodi.kode &&
                    student.confirmationStatus === 'SUDAH BENAR'
                ).length

                const active =
                  selectedProdi === prodi.kode

                return (
                  <ProgramCard
                    key={prodi.kode}
                    kode={prodi.kode}
                    nama={prodi.nama}
                    count={count}
                    readyCount={readyCount}
                    active={active}
                    onClick={() =>
                      handleSelectProdi(prodi.kode)
                    }
                  />
                )
              })}
            </div>
          </section>

          {/* =================================================
              DAFTAR MAHASISWA
          ================================================= */}

          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.07)]">
            <div className="px-9 py-7">
              <h3 className="text-[16px] font-bold text-[#111111]">
                Daftar Mahasiswa {selectedProdi}
              </h3>

              <div className="mt-5 grid grid-cols-[1fr_0.72fr_0.72fr] gap-2">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Cari Nama / NIM..."
                    className="h-11 w-full rounded-xl border border-[#D5DFEA] bg-white pl-10 pr-4 text-sm text-[#526780] outline-none focus:border-[#4B7CA7]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-[#D5DFEA] bg-white px-4 text-sm text-[#526780] outline-none"
                >
                  <option>Semua Status</option>
                  <option>SUDAH BENAR</option>
                  <option>PERLU REVISI</option>
                </select>

                <select
                  value={emailFilter}
                  onChange={(event) =>
                    setEmailFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-[#D5DFEA] bg-white px-4 text-sm text-[#526780] outline-none"
                >
                  <option>Semua Status</option>
                  <option>TERKIRIM</option>
                  <option>GAGAL</option>
                  <option>-</option>
                </select>
              </div>
            </div>

            {filteredStudents.length > 0 ? (
              <StudentTable
                students={filteredStudents}
                allVisibleSelected={allVisibleSelected}
                onToggleAll={handleToggleAll}
                onToggleStudent={handleToggleStudent}
                onOpenModal={openModal}
                actionMenuId={actionMenuId}
                setActionMenuId={setActionMenuId}
                onFixData={handleFixData}
                onResendEmail={handleResendEmail}
              />
            ) : (
              <EmptyState
                selectedProdi={selectedProdi}
                navigate={navigate}
              />
            )}

            {/* =================================================
                FOOTER TABLE
            ================================================= */}

            {filteredStudents.length > 0 && (
              <TableFooter
                count={filteredStudents.length}
                selectedForKaprodi={selectedForKaprodi}
                selectedForEmail={selectedForEmail}
                onSubmitToKaprodi={handleSubmitToKaprodi}
                onSendEmail={handleSendEmail}
              />
            )}
          </section>
        </main>
      </div>

      {/* =====================================================
          MODAL BERITA ACARA
      ===================================================== */}

      {selectedStudent && modalMode && (
        <BeritaAcaraModal
          student={selectedStudent}
          mode={modalMode}
          onClose={closeModal}
          onChange={handleChangeBA}
          onSave={handleSaveBA}
          onSubmitToKaprodi={() => {
            setStudents((current) =>
              current.map((student) =>
                student.id === selectedStudent.id
                  ? {
                      ...student,
                      confirmationStatus: 'SUDAH BENAR',
                      baStatus: 'submitted',
                    }
                  : student
              )
            )

            closeModal()
          }}
        />
      )}
    </div>
  )
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-[#3F4855]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#D5DFEA] bg-white px-3 text-[12px] text-[#526780] outline-none focus:border-[#4B7CA7]"
      />
    </div>
  )
}

/* =========================================================
   PROGRAM CARD
========================================================= */

function ProgramCard({
  kode,
  nama,
  count,
  readyCount,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[160px] rounded-xl px-3 py-3 text-left transition ${
        active
          ? 'border border-[#06447B] bg-[#F0F4FF]'
          : 'border border-transparent bg-[#F0F4FF] hover:border-[#B8CAE0]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-[#073E72] px-2 py-1 text-[10px] font-bold text-white">
          {kode}
        </span>

        <span className="text-[11px] font-medium text-[#073E72]">
          {count} Mahasiswa
        </span>
      </div>

      {active && (
        <span className="mt-2 inline-flex rounded-md bg-[#D9E9FF] px-2 py-1 text-[9px] font-bold text-[#174A7C]">
          PRODI AKTIF
        </span>
      )}

      <h4 className="mt-2 text-[13px] font-bold leading-5 text-[#073E72]">
        {nama}
      </h4>

      <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-[#073E72]">
        <span>
          {readyCount} Siap Diteruskan ke Kaprodi
        </span>

        <ArrowRight size={15} />
      </div>
    </button>
  )
}

/* =========================================================
   STUDENT TABLE
========================================================= */

function StudentTable({
  students,
  allVisibleSelected,
  onToggleAll,
  onToggleStudent,
  onOpenModal,
  actionMenuId,
  setActionMenuId,
  onFixData,
  onResendEmail,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        {/* HEADER */}
        <thead>
          <tr className="border-y border-[#DDE5ED] bg-[#F1F5F9] text-left text-[9px] font-bold uppercase tracking-wide text-[#667386]">
            <th className="w-[40 px] px-3 py-4">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleAll}
                className="h-4 w-4 accent-[#06447B]"
              />
            </th>

            <th className="px-3 py-4">
              Mahasiswa
            </th>

            <th className="px-3 py-4">
              Predikat Kelulusan
            </th>

            <th className="px-3 py-4">
              Status Email
            </th>

            <th className="px-3 py-4">
              Status Konfirmasi
            </th>

            <th className="px-3 py-4 text-center">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              onToggleStudent={onToggleStudent}
              onOpenModal={onOpenModal}
              actionMenuId={actionMenuId}
              setActionMenuId={setActionMenuId}
              onFixData={onFixData}
              onResendEmail={onResendEmail}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* =========================================================
   STUDENT ROW
========================================================= */

function StudentRow({
  student,
  onToggleStudent,
  onOpenModal,
  actionMenuId,
  setActionMenuId,
  onFixData,
  onResendEmail,
}) {
  const showActionMenu =
    actionMenuId === student.id

  const canUseMore = student.emailStatus === 'GAGAL'
  const getMainAction = () => {
    if (student.baStatus === 'empty') {
      return {
        label: 'Isi Berita Acara',
        mode: 'empty',
      }
    }

    if (student.confirmationStatus === 'PERLU REVISI') {
      return {
        label: 'Koreksi Berita Acara',
        mode: 'edit',
      }
    }

    return {
      label: 'Lihat Berita Acara',
      mode: 'view',
    }
  }

  const mainAction = getMainAction()

  return (
    <tr
      className={`border-b border-[#EDF1F5] last:border-b-0 ${
        student.confirmationStatus === 'PERLU REVISI'
          ? 'border-l-2 border-l-[#E53958]'
          : ''
      }`}
    >
      {/* CHECKBOX */}

      <td className="px-3 py-4">
        <input
          type="checkbox"
          checked={student.selected}
          onChange={() => onToggleStudent(student.id)}
          className="h-4 w-4 accent-[#06447B]"
        />
      </td>

      {/* MAHASISWA */}

      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DDEAFF] text-[10px] font-bold text-[#28588C]">
            {getInitials(student.nama)}
          </div>

          <div>
            <p className="text-[11px] font-bold leading-4 text-[#172033]">
              {student.nama}
            </p>

            <p className="mt-0.5 text-[9px] text-[#7B8797]">
              {student.nim}
            </p>
          </div>
        </div>
      </td>

      {/* PREDIKAT */}

      <td className="px-3 py-4 text-[10px] text-[#596577]">
        {student.predikat}
      </td>

      {/* EMAIL */}

      <td className="px-3 py-4">
        <EmailStatus status={student.emailStatus} />
      </td>

      {/* KONFIRMASI */}

      <td className="px-3 py-4">
        <ConfirmationStatus
          status={student.confirmationStatus}
        />
      </td>

      {/* AKSI */}

      <td className="px-3 py-4">
        <div className="relative flex items-center justify-start gap-2">
          <button
            type="button"
            onClick={() =>
              onOpenModal(student, mainAction.mode)
            }
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold transition ${
              mainAction.mode === 'view'
                ? 'border-[#C8D5E3] bg-white text-[#26384D] hover:bg-[#F7F9FC]'
                : 'border-[#C8D5E3] bg-white text-[#26384D] hover:bg-[#F7F9FC]'
            }`}
          >
            <FileText size={13} />
            {mainAction.label}
          </button>

          {student.baStatus === 'confirmed' && (
            <button
              type="button"
              onClick={() =>
                onOpenModal(student, 'view')
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C8D5E3] bg-white text-[#244D7A] hover:bg-[#F5F8FC]"
              title="Serahkan kepada Kaprodi"
            >
              <Send size={15} />
            </button>
          )}

          {student.emailStatus === 'TERKIRIM' &&
            student.confirmationStatus === 'PERLU REVISI' && (
              <button
                type="button"
                onClick={() => {
                  onOpenModal(student, 'edit')
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C8D5E3] bg-white text-[#244D7A]"
                title="Kirim email"
              >
                <Mail size={15} />
              </button>
            )}

          {canUseMore && (
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()

                  setActionMenuId((current) =>
                    current === student.id
                      ? null
                      : student.id
                  )
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  showActionMenu
                    ? 'border-[#E54A62] bg-[#FFF5F6] text-[#D72F4B]'
                    : 'border-[#F1B5BF] bg-[#FFF7F8] text-[#D72F4B]'
                }`}
                title="Tindakan lainnya"
              >
                <MoreHorizontal size={17} />
              </button>

              {showActionMenu && (
                <ActionMenu
                  student={student}
                  onFixData={onFixData}
                  onResendEmail={onResendEmail}
                />
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

/* =========================================================
   EMAIL STATUS
========================================================= */

function EmailStatus({ status }) {
  if (status === 'TERKIRIM') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#7DE2B5] bg-[#E8FFF3] px-2 py-1 text-[8px] font-bold text-[#16845A]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#21A66F]" />
        TERKIRIM
      </span>
    )
  }

  if (status === 'GAGAL') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#FFB8C3] bg-[#FFF0F2] px-2 py-1 text-[8px] font-bold text-[#D72F4B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E53D58]" />
        GAGAL
      </span>
    )
  }

  return (
    <span className="text-[10px] text-[#8A98AA]">
      -
    </span>
  )
}

/* =========================================================
   CONFIRMATION STATUS
========================================================= */

function ConfirmationStatus({ status }) {
  if (status === 'SUDAH BENAR') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#7DE2B5] bg-[#E8FFF3] px-2 py-1 text-[8px] font-bold text-[#16845A]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#21A66F]" />
        SUDAH BENAR
      </span>
    )
  }

  if (status === 'PERLU REVISI') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#FFB8C3] bg-[#FFF0F2] px-2 py-1 text-[8px] font-bold text-[#D72F4B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E53D58]" />
        PERLU REVISI
      </span>
    )
  }

  return (
    <span className="text-[10px] text-[#8A98AA]">
      -
    </span>
  )
}

/* =========================================================
   ACTION MENU
========================================================= */

function ActionMenu({
  student,
  onFixData,
  onResendEmail,
}) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="absolute right-0 top-[43px] z-50 w-[205px] overflow-hidden rounded-xl border border-[#DCE3EB] bg-white shadow-[0_12px_30px_rgba(20,43,70,0.15)]"
    >
      <div className="px-4 pb-2 pt-4">
        <p className="text-[8px] font-bold uppercase tracking-[0.8px] text-[#71809A]">
          Tindakan diperlukan
        </p>
      </div>

      <button
        type="button"
        onClick={() => onFixData(student)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#FFF7F8]"
      >
        <Pencil
          size={16}
          className="mt-0.5 shrink-0 text-[#D72F4B]"
        />

        <div>
          <p className="text-[10px] font-bold text-[#B91C3B]">
            Perbaiki data
          </p>

          <p className="mt-0.5 text-[8px] text-[#8A98AA]">
            Tinjau catatan mahasiswa
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onResendEmail(student)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#FFF7F8]"
      >
        <RotateCcw
          size={16}
          className="mt-0.5 shrink-0 text-[#D72F4B]"
        />

        <div>
          <p className="text-[10px] font-bold text-[#B91C3B]">
            Resend email
          </p>

          <p className="mt-0.5 text-[8px] text-[#8A98AA]">
            Kirim ulang email yang gagal
          </p>
        </div>
      </button>
    </div>
  )
}

/* =========================================================
   TABLE FOOTER
========================================================= */

function TableFooter({
  count,
  selectedForKaprodi,
  selectedForEmail,
  onSubmitToKaprodi,
  onSendEmail,
}) {
  return (
    <div className="flex items-center justify-between border-t border-[#E7ECF2] px-7 py-4">
      <span className="text-[12px] text-[#596577]">
        Menampilkan {count} pengajuan
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSubmitToKaprodi}
          disabled={selectedForKaprodi === 0}
          className={`flex h-9 items-center gap-2 rounded-lg border px-4 text-[10px] font-bold transition ${
            selectedForKaprodi > 0
              ? 'border-[#C8D5E3] bg-white text-[#26384D] hover:bg-[#F7F9FC]'
              : 'border-[#D8E0E8] bg-white text-[#9AA6B4]'
          }`}
        >
          <Send size={14} />
          Serahkan kepada Kaprodi ({selectedForKaprodi})
        </button>

        <button
          type="button"
          onClick={onSendEmail}
          disabled={selectedForEmail === 0}
          className={`flex h-9 items-center gap-2 rounded-lg border px-4 text-[10px] font-bold transition ${
            selectedForEmail > 0
              ? 'border-[#C8D5E3] bg-white text-[#26384D] hover:bg-[#F7F9FC]'
              : 'border-[#D8E0E8] bg-white text-[#9AA6B4]'
          }`}
        >
          <Mail size={14} />
          Kirim via Email ({selectedForEmail})
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8E0E8] bg-white text-[#536275]"
        >
          <ChevronLeft size={15} />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C6D2E0] bg-[#EFF4FB] text-[10px] font-bold text-[#173D67]"
        >
          1
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8E0E8] bg-white text-[#536275]"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  selectedProdi,
  navigate,
}) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
    <div className="relative mx-auto h-[128px] w-[128px] rounded-[28px] bg-[#EEF3FF]">
      <div className="absolute inset-[20px] flex items-center justify-center rounded-[22px] bg-white">
        <FileSearchIcon
          size={50}
          strokeWidth={3}
          className="text-[#85888D]"
        />
      </div>

      <div className="absolute -right-[5px] -top-[5px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#FFBE3B]">
        <span className="text-[16px] font-black leading-none text-[#071A2D]">
          !
        </span>
      </div>
    </div>

      <h3 className="mt-7 text-[17px] font-bold text-[#14243A]">
        Belum Ada Mahasiswa Siap Diproses
      </h3>

      <p className="mt-4 max-w-[520px] text-[12px] leading-6 text-[#687588]">
        Belum ada mahasiswa dari program studi {selectedProdi}{' '}
        yang siap diproses. Data akan muncul otomatis setelah Staf Akademik 
        menyelesaikan pemeriksaan.
      </p>

      <button
        type="button"
        onClick={() =>
          navigate('/admin/pengajuan-yudisium')
        }
        className="mt-7 rounded-xl bg-[#0B2038] px-7 py-3 text-[11px] font-bold text-white transition hover:bg-[#173653]"
      >
        Ke Halaman Pengajuan Yudisium
      </button>
    </div>
  )
}

/* =========================================================
   BERITA ACARA MODAL
========================================================= */

function BeritaAcaraModal({
  student,
  mode,
  onClose,
  onChange,
  onSave,
  onSubmitToKaprodi,
}) {
  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const isEmpty = mode === 'empty'

  const isRevision =
    student.confirmationStatus === 'PERLU REVISI'

  const isConfirmed =
    student.confirmationStatus === 'SUDAH BENAR'

  const title =
    isView && isConfirmed
      ? 'Isi Berita Acara'
      : 'Isi Berita Acara'

  const getValue = (field) => {
    return student.dataBA?.[field] || ''
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#031A2B]/60 px-6 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl bg-[#F4F7FB] shadow-[0_25px_70px_rgba(0,0,0,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            MODAL HEADER
        ================================================= */}

        <div className="flex items-start justify-between border-b border-[#DDE4EC] bg-white px-7 py-5">
          <div>
            <h2 className="text-[17px] font-bold text-[#111827]">
              {title}
            </h2>

            <p className="mt-1 text-[11px] text-[#71809A]">
              Pengisian Draft Berita Acara
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-[#172033] transition hover:text-[#D72F4B]"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            MODAL CONTENT
        ================================================= */}

        <div className="overflow-y-auto px-7 py-7">
          {/* =================================================
              REVISION ALERT
          ================================================= */}

          {isRevision && (
            <div className="mb-6 rounded-xl border border-[#F3D77B] bg-[#FFF9E8] px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0C5]">
                  <AlertCircle
                    size={19}
                    className="text-[#D58B00]"
                  />
                </div>

                <div>
                  <h3 className="text-[13px] font-bold text-[#8C421B]">
                    Mahasiswa Meminta Perbaikan Data
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-[#7C6940]">
                    Mahasiswa menemukan data yang tidak sesuai
                    pada draft Berita Acara. Periksa catatan di
                    bawah, lalu perbarui data melalui tombol Isi
                    Berita Acara.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#F3D77B] bg-white px-4 py-3">
                <ol className="space-y-1 text-[11px] text-[#273348]">
                  {(student.catatanRevisi || []).map(
                    (catatan, index) => (
                      <li key={index}>
                        {index + 1}. {catatan}
                      </li>
                    )
                  )}
                </ol>
              </div>
            </div>
          )}

          {/* =================================================
              CONFIRMED ALERT
          ================================================= */}

          {isConfirmed && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-[#ECFBF4] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D1F6E3]">
                  <CheckCircle2
                    size={20}
                    className="text-[#178A5D]"
                  />
                </div>

                <div>
                  <h3 className="text-[13px] font-bold text-[#104C3A]">
                    Data Telah Dikonfirmasi Mahasiswa
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-[#467567]">
                    Mahasiswa telah memastikan seluruh data pada
                    draft Berita Acara ini benar. Draft siap
                    diserahkan kepada Kaprodi untuk diproses lebih
                    lanjut.
                  </p>
                </div>
              </div>

              {isView && (
                <button
                  type="button"
                  onClick={onSubmitToKaprodi}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[#06447B] px-5 py-3 text-[11px] font-bold text-white"
                >
                  Serahkan Kepada Kaprodi
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}

          {/* =================================================
              STUDENT CARD
          ================================================= */}

          <section className="rounded-xl border border-[#E0E6ED] bg-white px-8 py-7 shadow-[0_4px_12px_rgba(20,43,70,0.06)]">
            {/* STUDENT HEADER */}

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DDEAFF] text-[13px] font-bold text-[#28588C]">
                {getInitials(student.nama)}
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#111827]">
                  {student.nama}
                </h3>

                <p className="mt-0.5 text-[11px] text-[#70809A]">
                  {student.nim}
                </p>
              </div>
            </div>

            {/* EMPTY INFORMATION */}

            {isEmpty && (
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#A8DFFF] bg-[#F0FAFF] px-3 py-2.5 text-[10px] text-[#2373A8]">
                <FileText size={14} />

                <span>
                  Lengkapi sembilan data sesuai kolom dokumen
                  Berita Acara Yudisium resmi.
                </span>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <div className="mt-7 grid grid-cols-4 gap-x-3 gap-y-5">
              <BAField
                label="IPK"
                value={getValue('ipk')}
                placeholder="Contoh: 3,70"
                disabled={isView}
                onChange={(value) =>
                  onChange('ipk', value)
                }
              />

              <BAField
                label="Nilai D"
                value={getValue('nilaiD')}
                placeholder="Contoh: 10"
                suffix="%"
                disabled={isView}
                onChange={(value) =>
                  onChange('nilaiD', value)
                }
              />

              <BAField
                label="SKS yang Ditempuh"
                value={getValue('sks')}
                placeholder="Contoh: 144"
                disabled={isView}
                onChange={(value) =>
                  onChange('sks', value)
                }
              />

              <BAField
                label="Jumlah Similarity Index"
                value={getValue('similarity')}
                placeholder="Contoh: 14"
                suffix="%"
                disabled={isView}
                onChange={(value) =>
                  onChange('similarity', value)
                }
              />

              <BAField
                label="Skor Kemampuan Bahasa Inggris"
                value={getValue('english')}
                placeholder="Contoh: TEVocS: 70"
                disabled={isView}
                onChange={(value) =>
                  onChange('english', value)
                }
              />

              <BAField
                label="Judul PA Disetujui/Tidak"
                value={getValue('judulPA')}
                placeholder="Contoh: Disetujui"
                disabled={isView}
                onChange={(value) =>
                  onChange('judulPA', value)
                }
              />

              <div className="col-span-4">
                <BAField
                  label="Sertifikat Kegiatan/Kepanitiaan/Kompetisi Level (Internasional/Nasional/Regional/Lokal)"
                  value={getValue(
                    'sertifikatKegiatan'
                  )}
                  placeholder="Contoh: Kepanitiaan Universitas PORSENIGAMA 2023"
                  disabled={isView}
                  onChange={(value) =>
                    onChange(
                      'sertifikatKegiatan',
                      value
                    )
                  }
                />
              </div>

              <div className="col-span-4">
                <BAField
                  label="Sertifikat Kompetensi"
                  value={getValue(
                    'sertifikatKompetensi'
                  )}
                  placeholder="Contoh: BNSP Associate Data Scientist 2025"
                  disabled={isView}
                  onChange={(value) =>
                    onChange(
                      'sertifikatKompetensi',
                      value
                    )
                  }
                />
              </div>

              <div className="col-span-4">
                <BAField
                  label="Status Pemeriksaan/Hukuman/Pelanggaran Etik"
                  value={getValue(
                    'statusPemeriksaan'
                  )}
                  placeholder="Contoh: -"
                  disabled={isView}
                  onChange={(value) =>
                    onChange(
                      'statusPemeriksaan',
                      value
                    )
                  }
                />
              </div>
            </div>

            {/* =================================================
                FOOTER MODAL
            ================================================= */}

            {!isView && (
              <div className="mt-7 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-xl border border-[#CBD7E4] bg-white px-5 text-[11px] font-bold text-[#174A7C]"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={onSave}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#06447B] px-5 text-[11px] font-bold text-white shadow-sm"
                >
                  <CheckCircle2 size={15} />
                  Simpan Data
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   BERITA ACARA FIELD
========================================================= */

function BAField({
  label,
  value,
  placeholder,
  suffix,
  disabled,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold text-[#3F4B5C]">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-10 w-full rounded-xl border border-[#CBD8E5] px-3 text-[11px] text-[#273348] outline-none ${
            disabled
              ? 'bg-white'
              : 'bg-white focus:border-[#4B7CA7]'
          } ${suffix ? 'pr-10' : ''}`}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#738196]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// =========================================================
// PROFILE
// =========================================================

function ProfileAvatar({ photo, size = 'normal' }) {
  const large = size === 'large'

  return photo ? (
    <img
      src={photo}
      alt="Foto profil"
      className={`rounded-full border-4 border-[#EEF2F6] object-cover ${
        large ? 'h-20 w-20' : 'h-9 w-9'
      }`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full bg-[#C7CBD1] text-white ${
        large ? 'h-20 w-20' : 'h-9 w-9'
      }`}
    >
      <UserRound size={large ? 40 : 20} />
    </div>
  )
}

function ProfileDropdown({
  user,
  displayName,
  navigate,
  handleLogout,
  setProfileOpen,
}) {
  return (
    <div
      className="
        absolute
        right-0
        top-[65px]
        z-50
        w-[340px]
        overflow-hidden
        rounded-2xl
        border
        border-[#E1E7EF]
        bg-white
        shadow-[0_18px_45px_rgba(0,0,0,0.15)]
      "
    >
      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          items-center
          px-5
          pt-6
          pb-5
        "
      >
        {/* FOTO PROFIL */}

        <ProfileAvatar
          photo={user?.avatar}
          size="large"
        />

        {/* NAMA LENGKAP */}

        <p
          className="
            mt-4
            max-w-[290px]
            truncate
            text-center
            text-[18px]
            font-extrabold
            text-[#111827]
          "
        >
          {displayName}
        </p>
      </div>

      {/* PEMBATAS */}

      <div className="h-px bg-[#EDF0F4]" />

      {/* =====================================================
          PROFIL SAYA
      ===================================================== */}

      <button
        type="button"
        onClick={() => {
          setProfileOpen(false)
          navigate('/profile')
        }}
        className="
          flex
          w-full
          items-center
          gap-4
          px-5
          py-4
          text-left
          transition
          hover:bg-[#F7F9FC]
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#EEF5FF]
          "
        >
          <UserRound
            size={20}
            strokeWidth={1.8}
            className="text-[#06447B]"
          />
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#172033]">
            Profil Saya
          </p>

          <p className="mt-0.5 text-[11px] text-[#7A8493]">
            Ubah nama dan foto profil
          </p>
        </div>
      </button>

      {/* PEMBATAS */}

      <div className="mx-5 h-px bg-[#EDF0F4]" />

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <button
        type="button"
        onClick={handleLogout}
        className="
          flex
          w-full
          items-center
          gap-4
          px-5
          py-4
          text-left
          transition
          hover:bg-red-50
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#FFE5E5]
          "
        >
          <LogOut
            size={20}
            strokeWidth={2}
            className="text-[#EF4444]"
          />
        </div>

        <div>
          <p className="text-[13px] font-bold text-red-500">
            Keluar / Logout
          </p>

          <p className="mt-0.5 text-[11px] text-red-400">
            Akhiri sesi akun di perangkat ini
          </p>
        </div>
      </button>
    </div>
  )
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export default BeritaAcara