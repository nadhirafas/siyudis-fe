import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  UserRound,
  FileText,
  Search,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  MinusCircle,
  Pencil,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RotateCcw,
  History,
  Inbox,
  RefreshCw,
  FileSearch,
  X,
  LogOut,
  ShieldCheck,
  BookOpen,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import { getUser, clearUser } from '../../services/auth'

/* =========================================================
   DATA PENGAJUAN
========================================================= */

const students = [
  {
    id: 1,
    nama: 'Nadila Aulia Rahma',
    nim: '22/501982/SV/21416',
    prodi: 'TRPL',
    predikat: 'Belum Ditentukan',
    status: 'SUBMITTED',
    tanggal: '12 Jun 2024',
    waktu: '08:30',
  },
  {
    id: 2,
    nama: 'Gilang Ramadhan Putra',
    nim: '22/502118/SV/21552',
    prodi: 'TRI',
    predikat: 'Belum Ditentukan',
    status: 'SUBMITTED',
    tanggal: '12 Jun 2024',
    waktu: '09:15',
  },
  {
    id: 3,
    nama: 'Maya Kinasih Wulandari',
    nim: '21/481726/SV/20318',
    prodi: 'TRE',
    predikat: 'Belum Ditentukan',
    status: 'SUBMITTED',
    tanggal: '12 Jun 2024',
    waktu: '10:04',
  },
  {
    id: 4,
    nama: 'Rizky Adi Nugroho',
    nim: '22/501644/SV/21287',
    prodi: 'TRPL',
    predikat: 'Belum Ditentukan',
    status: 'RESET TO AKADEMIK',
    tanggal: '12 Jun 2024',
    waktu: '10:33',
  },
  {
    id: 5,
    nama: 'Dimas Bagus Saputra',
    nim: '21/482090/SV/20490',
    prodi: 'TRIK',
    predikat: 'Belum Ditentukan',
    status: 'SUBMITTED',
    tanggal: '12 Jun 2024',
    waktu: '11:20',
  },
]

const historyStudents = [
  {
    id: 6,
    nama: 'Nadila Aulia Rahma',
    nim: '22/501982/SV/21416',
    prodi: 'TRPL',
    predikat: 'Cumlaude',
    status: 'TERVERIFIKASI',
    tanggal: '12 Jun 2024',
    waktu: '08:30',
  },
  {
    id: 7,
    nama: 'Gilang Ramadhan Putra',
    nim: '22/502118/SV/21552',
    prodi: 'TRI',
    predikat: 'Cumlaude',
    status: 'TERVERIFIKASI',
    tanggal: '12 Jun 2024',
    waktu: '09:15',
  },
  {
    id: 8,
    nama: 'Maya Kinasih Wulandari',
    nim: '21/481726/SV/20318',
    prodi: 'TRE',
    predikat: 'Tidak Cumlaude',
    status: 'TERVERIFIKASI',
    tanggal: '12 Jun 2024',
    waktu: '10:04',
  },
  {
    id: 9,
    nama: 'Rizky Adi Nugroho',
    nim: '22/501644/SV/21287',
    prodi: 'TRPL',
    predikat: 'Tidak Cumlaude',
    status: 'TERVERIFIKASI',
    tanggal: '12 Jun 2024',
    waktu: '10:33',
  },
  {
    id: 10,
    nama: 'Dimas Bagus Saputra',
    nim: '21/482090/SV/20490',
    prodi: 'TRIK',
    predikat: 'Cumlaude',
    status: 'TERVERIFIKASI',
    tanggal: '12 Jun 2024',
    waktu: '11:20',
  },
]

/* =========================================================
   DATA DETAIL MAHASISWA
========================================================= */

const studentDetails = {
  1: {
    nama: 'Nadila Aulia Rahma',
    nim: '22/501982/SV/21416',
    whatsapp: '+62 812 2784 6190',
    tempatTanggalLahir: 'Sleman, 14 Oktober 2002',
    dosen: 'Dr. Ir. Budi Santoso, M.T.',
    predikat: '',
    video: 'https://youtube.com/video-presentasi',
  },
  2: {
    nama: 'Gilang Ramadhan Putra',
    nim: '22/502118/SV/21552',
    whatsapp: '+62 812 2784 6191',
    tempatTanggalLahir: 'Sleman, 10 Mei 2002',
    dosen: 'Dr. Ir. Budi Santoso, M.T.',
    predikat: '',
    video: 'https://youtube.com/video-presentasi',
  },
  3: {
    nama: 'Maya Kinasih Wulandari',
    nim: '21/481726/SV/20318',
    whatsapp: '+62 812 2784 6192',
    tempatTanggalLahir: 'Yogyakarta, 22 Maret 2001',
    dosen: 'Dr. Siti Rahmawati, S.T., M.T.',
    predikat: '',
    video: 'https://youtube.com/video-presentasi',
  },
  4: {
    nama: 'Rizky Adi Nugroho',
    nim: '22/501644/SV/21287',
    whatsapp: '+62 812 2784 6193',
    tempatTanggalLahir: 'Bantul, 18 Juli 2002',
    dosen: 'Dr. Ahmad Fauzan, S.T., M.T.',
    predikat: '',
    video: 'https://youtube.com/video-presentasi',
  },
  5: {
    nama: 'Dimas Bagus Saputra',
    nim: '21/482090/SV/20490',
    whatsapp: '+62 812 2784 6194',
    tempatTanggalLahir: 'Sleman, 3 Februari 2001',
    dosen: 'Dr. Ir. Budi Santoso, M.T.',
    predikat: '',
    video: 'https://youtube.com/video-presentasi',
  },
}

/* =========================================================
   DOKUMEN
========================================================= */

const documents = [
  {
    no: '01',
    title: 'Form Pengajuan Yudisium',
    file: 'Form_Pengajuan_Yudisium_NAR.pdf',
    size: '340 KB',
    type: 'pdf',
  },
  {
    no: '02',
    title: 'Form Pembatalan Mata Kuliah Pilihan',
    file: 'Form_PembatalanMK.pdf',
    size: '215 KB',
    type: 'pdf',
  },
  {
    no: '03',
    title: 'Form Checklist Judul Proyek Akhir',
    file: 'Form_Checklist_JudulPA.pdf',
    size: '410 KB',
    type: 'pdf',
  },
  {
    no: '04',
    title: 'Pas Photo',
    file: 'Pasfoto_4×6_NAR.jpg',
    size: '1.2 MB',
    type: 'image',
  },
  {
    no: '05',
    title: 'Transkrip Nilai Sementara',
    file: 'Transkrip_Nilai_Sementara.pdf',
    size: '650 KB',
    type: 'pdf',
  },
  {
    no: '06',
    title:
      'Surat Tanda Terima Menyerahkan Skripsi dan Bebas Perpustakaan UGM',
    file: 'Bebas_PerpustakaanUGM.pdf',
    size: '480 KB',
    type: 'pdf',
  },
  {
    no: '07',
    title: 'Ijazah Terakhir',
    file: 'Ijazah.pdf',
    size: '890 KB',
    type: 'pdf',
  },
  {
    no: '08',
    title: 'Sertifikat PPSMB',
    file: 'Sertif_PPSMB.pdf',
    size: '890 KB',
    type: 'pdf',
  },
  {
    no: '09',
    title: 'Hasil Cek Plagiasi',
    file: 'Hasil_Turnitin.pdf',
    size: '1.1 MB',
    type: 'pdf',
  },
  {
    no: '10',
    title: 'Sertifikat Kemampuan Bahasa Inggris',
    file: 'Sertif_AcEPT.pdf',
    size: '530 KB',
    type: 'pdf',
  },
  {
    no: '11',
    title: 'Sertifikat Kompetensi',
    badge: 'Wajib TJI',
    badge2: 'Prodi Lain Opsional',
    file: 'Sertif_Kompetensi.pdf',
    size: '1.2 MB',
    type: 'pdf',
  },
  {
    no: '12',
    title: 'Lembar Halaman Pengesahan',
    file: 'Pengesahan_PA.pdf',
    size: '1.8 MB',
    type: 'pdf',
  },
  {
    no: '13',
    title: 'Unggah Draft Publikasi/Makalah',
    file: 'Draft_Publikasi.pdf',
    size: '2.4 MB',
    type: 'pdf',
  },
  {
    no: '14',
    title: 'Transkrip Nilai D3',
    badge: 'Khusus Mahasiswa Alih Program',
    unavailable: true,
  },
  {
    no: '15',
    title: 'Surat Bebas Lab',
    badge: 'Wajib TJI',
    file: 'Bebas_LAB.pdf',
    size: '310 KB',
    type: 'pdf',
  },
]

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  if (status === 'TERVERIFIKASI') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-3 py-1 text-[10px] font-bold text-[#047857]">
        <CheckCircle2 size={12} />
        TERVERIFIKASI
      </span>
    )
  }

  if (status === 'RESET TO AKADEMIK') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFB4A8] bg-[#FFF7F5] px-3 py-1 text-center text-[9px] font-bold leading-[12px] text-[#D9534F]">
        <RotateCcw size={12} />
        RESET TO
        <br />
        AKADEMIK
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D7DCE3] bg-white px-3 py-1 text-[10px] font-semibold text-[#4B5563]">
      <Clock3 size={12} />
      SUBMITTED
    </span>
  )
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  value,
  onChange,
  children,
  width = 'w-[145px]',
}) {
  return (
    <div className={`relative ${width}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[38px] w-full appearance-none rounded-xl border border-[#C9D5E3] bg-white px-3 pr-9 text-[11px] text-[#536174] outline-none focus:border-[#0A477F]"
      >
        {children}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
      />
    </div>
  )
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ history }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center">
      <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-[#EEF3FF]">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white shadow-sm">
          <FileSearch size={34} className="text-[#7A8089]" />
        </div>

        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FDBE35] text-[14px] font-bold text-[#111827]">
          !
        </div>
      </div>

      <h3 className="mt-5 text-[17px] font-bold text-[#172B4D]">
        {history
          ? 'Belum Ada Histori Verifikasi'
          : 'Belum Ada Pengajuan Yudisium'}
      </h3>

      <p className="mt-2 max-w-[540px] text-center text-[12px] leading-5 text-[#606B7A]">
        Belum ada berkas pengajuan yudisium mahasiswa yang masuk ataupun
        histori verifikasi pada periode ini.
      </p>

      <button
        type="button"
        className="mt-4 flex h-[34px] w-[245px] items-center justify-center gap-2 rounded-xl bg-[#DCE9FF] text-[11px] font-semibold text-[#172B4D]"
      >
        <RefreshCw size={13} />
        Muat Ulang Data
      </button>
    </div>
  )
}

/* =========================================================
   DETAIL FIELD
========================================================= */

function DetailField({
  label,
  value,
  edit,
  textarea = false,
  placeholder,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[8px] font-bold tracking-[0.04em] text-[#6C7E95]">
        {label}
      </label>

      {edit ? (
        textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[62px] w-full resize-none rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[9px] text-[#374151] outline-none focus:border-[#06447B]"
          />
        ) : (
          <input
            value={
              placeholder && value === placeholder
                ? ''
                : value
            }
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="h-[30px] w-full rounded-lg border border-[#D5DDE8] bg-white px-3 text-[9px] text-[#374151] outline-none focus:border-[#06447B]"
          />
        )
      ) : textarea ? (
        <div className="min-h-[62px] rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[9px] text-[#374151]">
          {value}
        </div>
      ) : (
        <div className="flex h-[30px] items-center rounded-lg border border-[#D5DDE8] bg-white px-3 text-[9px] text-[#374151]">
          {value}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   DOCUMENT BUTTON
========================================================= */

function DocumentButton({
  secondary,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-[8px] font-bold ${
        secondary
          ? 'border border-[#D0DBE8] bg-white text-[#536579]'
          : 'bg-[#063E73] text-white'
      }`}
    >
      <Eye size={11} />
      Lihat
    </button>
  )
}

/* =========================================================
   DOCUMENT CARD
========================================================= */

function DocumentCard({ document, edit }) {
  const handleView = () => {
    alert(`Melihat ${document.file}`)
  }

  const handleDownload = () => {
    alert(`Mengunduh ${document.file}`)
  }

  const handleChange = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      alert(`Berkas ${file.name} dipilih.`)
    }

    event.target.value = ''
  }

  if (document.unavailable) {
    return (
      <div className="flex min-h-[178px] flex-col rounded-lg border border-[#DCE3EF] bg-[#F0F3FC] p-3">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCE6FB] text-[9px] font-bold text-[#8A6B00]">
            {document.no}
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-bold leading-3 text-[#202936]">
              {document.title}
            </p>

            <span className="mt-1 inline-block rounded-full bg-[#F3E6AE] px-2 py-0.5 text-[7px] font-semibold text-[#8A6B00]">
              {document.badge}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-white px-2.5 py-2">
          <MinusCircle
            size={18}
            className="shrink-0 text-[#9AA8BD]"
          />

          <div>
            <p className="text-[8px] text-[#66738A]">
              Tidak Berlaku (Mahasiswa Jalur Reguler)
            </p>

            <p className="mt-0.5 text-[7px] text-[#9AA8BD]">
              Bukan Mahasiswa Alih Program
            </p>
          </div>
        </div>

        <div className="mt-2 flex gap-1.5">
          <DocumentButton
            secondary
            onClick={handleView}
          />

          <label className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#063E73] text-[8px] font-bold text-white">
            <Upload size={11} />
            Ganti Berkas

            <input
              type="file"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[178px] flex-col rounded-lg border border-[#DCE3EF] bg-[#F0F3FC] p-3">
      <div className="flex items-start gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCE6FB] text-[9px] font-bold text-[#8A6B00]">
          {document.no}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold leading-3 text-[#202936]">
            {document.title}
          </p>

          <div className="mt-1 flex flex-wrap gap-1">
            {document.badge && (
              <span className="rounded-full bg-[#F3E6AE] px-2 py-0.5 text-[7px] font-semibold text-[#8A6B00]">
                {document.badge}
              </span>
            )}

            {document.badge2 && (
              <span className="rounded-full bg-[#F3E6AE] px-2 py-0.5 text-[7px] font-semibold text-[#8A6B00]">
                {document.badge2}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#DCE3EF] bg-white px-2.5 py-2">
        <FileText
          size={15}
          className={
            document.type === 'image'
              ? 'text-[#4285F4]'
              : 'text-[#FF5555]'
          }
        />

        <div className="min-w-0">
          <p className="truncate text-[8px] font-bold text-[#4C5665]">
            {document.file}
          </p>

          <p className="mt-0.5 text-[7px] text-[#9AA4B2]">
            {document.size}
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-1.5 pt-3">
        {edit ? (
          <>
            <DocumentButton
              secondary
              onClick={handleView}
            />

            <label className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#063E73] text-[8px] font-bold text-white">
              <Upload size={11} />
              Ganti Berkas

              <input
                type="file"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#063E73] text-[8px] font-bold text-white"
            >
              <Download size={11} />
              Unduh
            </button>

            <DocumentButton
              secondary
              onClick={handleView}
            />
          </>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   POP-UP DETAIL / EDIT
========================================================= */

function DetailModal({
  student,
  mode,
  onClose,
  onEdit,
  onVerify,
  onSave,
}) {
  const isEdit = mode === 'edit'

  const baseStudent =
    studentDetails[student.id <= 5 ? student.id : student.id - 5] ||
    studentDetails[1]

  const [form, setForm] = useState({
    ...baseStudent,
    nama: student.nama,
    nim: student.nim,
    predikat:
      student.predikat === 'Belum Ditentukan'
        ? ''
        : student.predikat,
  })

  const handleBack = () => {
    if (isEdit) {
      onClose()
      return
    }

    onClose()
  }

  const handleSave = () => {
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#031A2B]/70 p-5">
      {/* POP-UP */}
      <div className="max-h-[94vh] w-full max-w-[1120px] overflow-y-auto rounded-2xl bg-[#F3F6FA] shadow-[0_4px_25px_rgba(0,0,0,0.28)]">
        {/* KONTEN DETAIL ASLI */}
        <div className="rounded-2xl bg-[#F4F7FB] p-5">
          {/* KEMBALI */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#D8DEE7] bg-white px-4 text-[10px] font-semibold text-[#536171] shadow-sm"
            >
              <ArrowLeft size={13} />
              Kembali
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8DEE7] bg-white text-[#536171] shadow-sm"
            >
              <X size={15} />
            </button>
          </div>

          {/* IDENTITAS */}
          <section className="mt-4 overflow-hidden rounded-xl border border-[#DDE4EF] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
            <div className="flex h-[48px] items-center gap-3 border-b border-[#DDE4EF] bg-[#EEF2FC] px-5">
              <UserRound
                size={20}
                strokeWidth={1.8}
                className="text-[#163B6C]"
              />

              <h3 className="text-[20px] font-bold text-[#173250]">
                Identitas Mahasiswa
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-4">
              <DetailField
                label="NAMA LENGKAP"
                value={form.nama}
                edit={isEdit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    nama: value,
                  })
                }
              />

              <DetailField
                label="NIM"
                value={form.nim}
                edit={isEdit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    nim: value,
                  })
                }
              />

              <DetailField
                label="NO. WA"
                value={form.whatsapp}
                edit={isEdit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    whatsapp: value,
                  })
                }
              />

              <DetailField
                label="TEMPAT/TANGGAL LAHIR"
                value={form.tempatTanggalLahir}
                edit={isEdit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    tempatTanggalLahir: value,
                  })
                }
              />

              <DetailField
                label="DOSEN PEMBIMBING"
                value={form.dosen}
                edit={isEdit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    dosen: value,
                  })
                }
              />

              <DetailField
                label="PREDIKAT KELULUSAN"
                value={
                  form.predikat ||
                  'Ketikkan Predikat Kelulusan...'
                }
                edit={isEdit}
                placeholder="Ketikkan Predikat Kelulusan..."
                onChange={(value) =>
                  setForm({
                    ...form,
                    predikat: value,
                  })
                }
              />

              <div className="col-span-2">
                <DetailField
                  label="TAUTAN (LINK) VIDEO PRESENTASI TUGAS AKHIR"
                  value={form.video}
                  edit={isEdit}
                  textarea
                  onChange={(value) =>
                    setForm({
                      ...form,
                      video: value,
                    })
                  }
                />
              </div>
            </div>
          </section>

          {/* DOKUMEN */}
          <section className="mt-4 overflow-hidden rounded-xl border border-[#DDE4EF] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
            <div className="flex h-[48px] items-center gap-3 border-b border-[#DDE4EF] bg-[#EEF2FC] px-5">
              <FileText
                size={20}
                strokeWidth={1.8}
                className="text-[#163B6C]"
              />

              <h3 className="text-[20px] font-bold text-[#173250]">
                Dokumen Persyaratan
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 p-5">
              {documents.map((document) => (
                <DocumentCard
                  key={document.no}
                  document={document}
                  edit={isEdit}
                />
              ))}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 border-t border-[#E1E6EF] px-5 py-4">
              {isEdit ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 items-center justify-center rounded-lg border border-[#06447B] bg-white px-5 text-[9px] font-bold text-[#06447B]"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#06447B] px-5 text-[9px] font-bold text-white"
                  >
                    <Download size={11} />
                    Simpan Perubahan
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#06447B] bg-white px-5 text-[9px] font-bold text-[#06447B]"
                  >
                    <Pencil size={11} />
                    Masuk ke Menu Edit
                  </button>

                  <button
                    type="button"
                    onClick={onVerify}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#06447B] px-5 text-[9px] font-bold text-white"
                  >
                    <CheckCircle2 size={12} />
                    Data Benar &amp; Verifikasi Yudisium
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */

function AdminPengajuanYudisium() {
  const navigate = useNavigate()

  const [user] = useState(() => getUser())
  const [profileOpen, setProfileOpen] = useState(false)

  const [activeTab, setActiveTab] = useState('active')
  const [search, setSearch] = useState('')
  const [prodi, setProdi] = useState('Semua Prodi')
  const [status, setStatus] = useState('Semua Status')
  const [date, setDate] = useState('Tanggal Pengajuan')

  const displayName = user?.nama || 'Aji Pangestu'

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalMode, setModalMode] = useState(null)

  const handleLogout = () => {
    clearUser()
    setProfileOpen(false)
    navigate('/')
  }

  const sourceData =
    activeTab === 'active'
      ? students
      : historyStudents

  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    return sourceData.filter((student) => {
      const matchSearch =
        student.nama.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword)

      const matchProdi =
        prodi === 'Semua Prodi' ||
        student.prodi === prodi

      const matchStatus =
        status === 'Semua Status' ||
        student.status === status

      const matchDate =
        date === 'Tanggal Pengajuan' ||
        student.tanggal === date

      return (
        matchSearch &&
        matchProdi &&
        matchStatus &&
        matchDate
      )
    })
  }, [sourceData, search, prodi, status, date])

  const resetFilter = () => {
    setSearch('')
    setProdi('Semua Prodi')
    setStatus('Semua Status')
    setDate('Tanggal Pengajuan')
  }

  const openView = (student) => {
    setSelectedStudent(student)
    setModalMode('view')
  }

  const openEdit = (student) => {
    setSelectedStudent(student)
    setModalMode('edit')
  }

  const closeModal = () => {
    setSelectedStudent(null)
    setModalMode(null)
  }

  const handleVerify = () => {
    alert('Data mahasiswa berhasil diverifikasi.')
    closeModal()
  }

  const handleSave = () => {
    alert('Perubahan pengajuan yudisium berhasil disimpan.')
    closeModal()
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      <Sidebar admin />

      <main className="ml-[295px] min-h-screen">
        {/* HEADER */}
        <header className="relative z-30 flex h-[78px] items-center justify-between border-b border-[#E4E9EF] bg-white px-8">
          <div>
            <h1 className="text-[25px] font-bold leading-tight text-[#111111]">
              Pengajuan Yudisium Staff Administrasi
            </h1>

            <p className="mt-1 text-[12px] text-[#687588]">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen((value) => !value)
              }
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-50"
            >
              <ProfileAvatar photo={user?.avatar} />

              <span className="max-w-[220px] truncate text-[14px] font-bold text-[#111111]">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className={`text-[#667085] transition-transform ${
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


        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1120px] px-7 py-8">
          {/* HERO */}
          <section className="rounded-2xl bg-white px-10 py-8 shadow-sm">
            <h2 className="text-[25px] font-bold text-[#111111]">
              Verifikasi Pengajuan Yudisium
            </h2>

            <p className="mt-2 text-[13px] text-[#606B7A]">
              Verifikasi identitas dan berkas mahasiswa yang mendaftar
              yudisium.
            </p>
          </section>

          {/* TABS */}
          <div className="mt-6 inline-flex rounded-xl bg-[#E1EBFB] p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('active')
                resetFilter()
              }}
              className={`flex h-[32px] items-center gap-2 rounded-lg px-3 text-[11px] font-semibold transition ${
                activeTab === 'active'
                  ? 'bg-white text-[#172B4D] shadow-sm'
                  : 'text-[#536174]'
              }`}
            >
              <Inbox size={14} />

              Antrean Pengajuan Aktif

              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  activeTab === 'active'
                    ? 'bg-[#EEF3FF] text-[#172B4D]'
                    : 'bg-transparent'
                }`}
              >
                {students.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('history')
                resetFilter()
              }}
              className={`flex h-[32px] items-center gap-2 rounded-lg px-3 text-[11px] font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-white text-[#172B4D] shadow-sm'
                  : 'text-[#536174]'
              }`}
            >
              <History size={14} />

              Histori Verifikasi

              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  activeTab === 'history'
                    ? 'bg-[#EEF3FF] text-[#172B4D]'
                    : 'bg-transparent'
                }`}
              >
                {historyStudents.length}
              </span>
            </button>
          </div>

          {/* TABLE CARD */}
          <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="px-10 pb-0 pt-8">
              <h3 className="text-[14px] font-bold text-[#111827]">
                {activeTab === 'active'
                  ? 'Antrean Pengajuan Aktif'
                  : 'Histori Verifikasi'}
              </h3>

              <p className="mt-2 text-[12px] text-[#667085]">
                {activeTab === 'active'
                  ? 'Pengajuan ditampilkan pada tampilan ini'
                  : 'Histori verifikasi ditampilkan pada halaman ini'}
              </p>

              {/* FILTER */}
              <div className="mt-4 flex items-center gap-2">
                <div className="relative w-[250px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8CA0B8]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari Nama / NIM..."
                    className="h-[38px] w-full rounded-xl border border-[#C9D5E3] bg-white pl-9 pr-3 text-[11px] text-[#374151] outline-none placeholder:text-[#9AAAC0] focus:border-[#0A477F]"
                  />
                </div>

                <FilterSelect
                  value={prodi}
                  onChange={setProdi}
                  width="w-[145px]"
                >
                  <option>Semua Prodi</option>
                  <option>TRPL</option>
                  <option>TRI</option>
                  <option>TRE</option>
                  <option>TRIK</option>
                </FilterSelect>

                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  width="w-[145px]"
                >
                  <option>Semua Status</option>
                  <option>SUBMITTED</option>
                  <option>RESET TO AKADEMIK</option>
                  <option>TERVERIFIKASI</option>
                </FilterSelect>

                <FilterSelect
                  value={date}
                  onChange={setDate}
                  width="w-[185px]"
                >
                  <option>Tanggal Pengajuan</option>
                  <option>12 Jun 2024</option>
                  <option>11 Jun 2024</option>
                  <option>10 Jun 2024</option>
                  <option>09 Jun 2024</option>
                </FilterSelect>
              </div>
            </div>

            {/* TABLE */}
            {filteredStudents.length === 0 ? (
              <EmptyState
                history={activeTab === 'history'}
              />
            ) : (
              <>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#E7EBF0]">
                        <th className="w-[65px] px-5 py-4 text-left text-[9px] font-bold uppercase text-[#657182]">
                          No
                        </th>

                        <th className="w-[230px] px-5 py-4 text-left text-[9px] font-bold uppercase text-[#657182]">
                          Mahasiswa
                        </th>

                        <th className="w-[150px] px-5 py-4 text-left text-[9px] font-bold uppercase text-[#657182]">
                          NIM
                        </th>

                        <th className="w-[90px] px-5 py-4 text-left text-[9px] font-bold uppercase text-[#657182]">
                          Prodi
                        </th>

                        <th className="w-[130px] px-5 py-4 text-left text-[9px] font-bold uppercase leading-3 text-[#657182]">
                          Predikat
                          <br />
                          Kelulusan
                        </th>

                        <th className="w-[150px] px-5 py-4 text-left text-[9px] font-bold uppercase text-[#657182]">
                          Status
                        </th>

                        <th className="w-[150px] px-5 py-4 text-left text-[9px] font-bold uppercase text-[#657182]">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map(
                        (student, index) => (
                          <tr
                            key={student.id}
                            className="border-b border-[#E7EBF0] last:border-b-0"
                          >
                            <td className="px-5 py-5 align-middle text-[11px] text-[#4B5563]">
                              {String(index + 1).padStart(
                                2,
                                '0',
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCE8FF] text-[11px] font-bold text-[#172B4D]">
                                  {student.nama
                                    .split(' ')
                                    .map(
                                      (word) =>
                                        word[0],
                                    )
                                    .slice(0, 2)
                                    .join('')}
                                </div>

                                <div>
                                  <p className="max-w-[120px] text-[14px] font-bold leading-[17px] text-[#172B4D]">
                                    {student.nama}
                                  </p>

                                  <p className="mt-1 text-[10px] leading-4 text-[#6B7280]">
                                    {student.status ===
                                    'RESET TO AKADEMIK'
                                      ? 'Dikembalikan:'
                                      : 'Diajukan:'}{' '}
                                    {student.tanggal},
                                    <br />
                                    {student.waktu}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-[11px] font-semibold text-[#172B4D]">
                              {student.nim}
                            </td>

                            <td className="px-5 py-5">
                              <span className="inline-flex rounded-lg bg-[#E1EBFB] px-3 py-1.5 text-[10px] font-bold text-[#172B4D]">
                                {student.prodi}
                              </span>
                            </td>

                            <td className="px-5 py-5 text-[11px] text-[#4B5563]">
                              {student.predikat ===
                              'Belum Ditentukan' ? (
                                <>
                                  Belum
                                  <br />
                                  Ditentukan
                                </>
                              ) : (
                                student.predikat
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge
                                status={student.status}
                              />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openView(student)
                                  }
                                  className="flex h-[28px] items-center gap-1.5 rounded-lg bg-[#063E73] px-3 text-[10px] font-semibold text-white transition hover:bg-[#052F58]"
                                >
                                  {student.status ===
                                  'TERVERIFIKASI' ? (
                                    <Eye size={13} />
                                  ) : (
                                    <FileSearch
                                      size={13}
                                    />
                                  )}

                                  {student.status ===
                                  'TERVERIFIKASI'
                                    ? 'Lihat'
                                    : 'Periksa'}
                                </button>

                                {/* EDIT JUGA ADA DI HISTORI */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit(student)
                                  }
                                  className="flex h-[28px] items-center gap-1.5 rounded-lg border border-[#063E73] bg-white px-3 text-[10px] font-semibold text-[#063E73] transition hover:bg-[#F4F8FC]"
                                >
                                  <Pencil size={12} />
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-between border-t border-[#E7EBF0] px-6 py-4">
                  <p className="text-[11px] text-[#5F6875]">
                    Menampilkan{' '}
                    {filteredStudents.length} pengajuan
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[#D8DFE8] bg-white text-[#657182]"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <button
                      type="button"
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[#AFC3DF] bg-[#F0F5FD] text-[11px] font-semibold text-[#172B4D]"
                    >
                      1
                    </button>

                    <button
                      type="button"
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[#D8DFE8] bg-white text-[#657182]"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          POP-UP
      ===================================================== */}

      {selectedStudent && modalMode && (
        <DetailModal
          student={selectedStudent}
          mode={modalMode}
          onClose={closeModal}
          onEdit={() => setModalMode('edit')}
          onVerify={handleVerify}
          onSave={handleSave}
        />
      )}
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


export default AdminPengajuanYudisium