import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  UserRound,
  LogOut,
  Search,
  Send,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  History,
  Inbox,
  AlertTriangle,
  Loader2,
  Download,
  ListChecks,
  FileText,
  ExternalLink,
  Pencil,
  MailCheck,
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { getUser, logout } from '../../services/auth'
import { errorMessage } from '../../services/api'
import {
  listPengajuanStaf,
  listProgramStudi,
  listEvents,
  savePenilaian,
  kirimKonfirmasi,
  checklistAkhir,
  ajukanBeritaAcara,
  updateBeritaAcaraMeta,
  previewBeritaAcara,
  exportBeritaAcara,
} from '../../services/adminApi'
import { normalizePengajuan, normalizeProdi, formatDate } from '../../services/normalize'

const PAGE_SIZE = 10

/* =========================================================
   HELPER STATUS & ATRIBUT MAHASISWA
========================================================= */
const ATRIBUT_LENGKAP_STATUSES = [
  'waiting_student_confirmation',
  'confirmed_by_student',
  'final_checked_akademik',
]

// Ambil nilai pertama yang terisi
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '') ?? ''

// Nama field mengikuti API (PUT /staf-akademik/pengajuan/{id}/penilaian):
// ipk, persen_nilai_d, sks_ditempuh, similarity_index, skor_bahasa_inggris,
// sertifikat_level, status_judul_pa, sertifikat_kompetensi, status_bebas_pelanggaran (boolean)
function extractStudentDraft(p) {
  const raw = p?.raw || p || {}
  const penilaian =
    raw.penilaian || raw.data_penilaian || raw.penilaian_yudisium || raw.berita_acara_detail || raw.detail || {}
  const bebas = pick(penilaian.status_bebas_pelanggaran, raw.status_bebas_pelanggaran)
  return {
    ipk: pick(p?.ipk, penilaian.ipk, raw.ipk),
    jumlahNilaiD: pick(p?.jumlahNilaiD, penilaian.persen_nilai_d, penilaian.jumlah_nilai_d, raw.persen_nilai_d),
    sksDitempuh: pick(p?.sksDitempuh, penilaian.sks_ditempuh, raw.sks_ditempuh, raw.total_sks),
    skorBahasaInggris: pick(p?.skorBahasaInggris, penilaian.skor_bahasa_inggris, raw.skor_bahasa_inggris),
    judulPaStatus: pick(p?.judulPaStatus, penilaian.status_judul_pa, penilaian.judul_pa_status, penilaian.status_pa),
    judulPa: pick(p?.judulPa, penilaian.judul_pa, raw.judul_pa, raw.judul_ta),
    similarityIndex: pick(p?.similarityIndex, penilaian.similarity_index, raw.similarity_index),
    sertifikatKegiatan: pick(
      p?.sertifikatKegiatan,
      penilaian.sertifikat_level,
      penilaian.sertifikat_kegiatan,
      raw.sertifikat_kegiatan
    ),
    sertifikatKompetensi: pick(p?.sertifikatKompetensi, penilaian.sertifikat_kompetensi, raw.sertifikat_kompetensi),
    // API menyimpan boolean; UI memakai teks bebas
    statusEtik:
      typeof bebas === 'boolean'
        ? bebas
          ? 'Bebas pelanggaran'
          : 'Ada pelanggaran'
        : pick(p?.statusEtik, penilaian.status_etik, penilaian.pelanggaran_etik, raw.status_etik),
  }
}

const toNumberOrNull = (v) => {
  const t = String(v ?? '').trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isNaN(n) ? t : n
}

// Teks kosong / "-" / "bebas..." = tidak ada pelanggaran
const isBebasPelanggaran = (text) => /^(|-|bebas.*|tidak ada.*|nihil|tidak|aman|none)$/i.test(String(text ?? '').trim())

// Bentuk form -> body PUT penilaian (nama field persis seperti di Postman)
function toPenilaianPayload(f) {
  return {
    ipk: toNumberOrNull(f.ipk),
    persen_nilai_d: toNumberOrNull(f.jumlahNilaiD),
    sks_ditempuh: toNumberOrNull(f.sksDitempuh),
    similarity_index: toNumberOrNull(f.similarityIndex),
    skor_bahasa_inggris: toNumberOrNull(f.skorBahasaInggris),
    sertifikat_level: String(f.sertifikatKegiatan ?? '').trim() || null,
    status_judul_pa: String(f.judulPaStatus ?? '').trim() || null,
    sertifikat_kompetensi: String(f.sertifikatKompetensi ?? '').trim() || null,
    status_bebas_pelanggaran: isBebasPelanggaran(f.statusEtik),
  }
}

function isDraftComplete(draft) {
  return (
    String(draft.ipk ?? '').trim() !== '' &&
    String(draft.jumlahNilaiD ?? '').trim() !== '' &&
    String(draft.sksDitempuh ?? '').trim() !== '' &&
    String(draft.skorBahasaInggris ?? '').trim() !== '' &&
    String(draft.judulPaStatus ?? '').trim() !== '' &&
    String(draft.similarityIndex ?? '').trim() !== ''
  )
}

function getPredikatKelulusan(p, localDrafts) {
  const raw = p?.raw || p || {}
  if (p?.predikatKelulusan || raw.predikat_kelulusan || raw.predikat) {
    return p?.predikatKelulusan || raw.predikat_kelulusan || raw.predikat
  }
  const d = localDrafts?.[p.id] || extractStudentDraft(p)
  const ipkNum = parseFloat(String(d.ipk).replace(',', '.'))
  const nilaiDNum = parseFloat(String(d.jumlahNilaiD).replace(',', '.'))
  if (!Number.isNaN(ipkNum)) {
    if (ipkNum >= 3.51 && (Number.isNaN(nilaiDNum) || nilaiDNum === 0)) return 'Cumlaude'
    return 'Tidak Cumlaude'
  }
  return '-'
}

const statusAtribut = (p, localDrafts) => {
  if (
    ATRIBUT_LENGKAP_STATUSES.includes(p.status) ||
    p.beritaAcaraId ||
    isDraftComplete(localDrafts?.[p.id] || extractStudentDraft(p))
  ) {
    return 'LENGKAP'
  }
  return 'BELUM LENGKAP'
}

function statusKonfirmasi(p) {
  if (p.beritaAcaraId || ['confirmed_by_student', 'final_checked_akademik'].includes(p.status)) {
    return 'TERKONFIRMASI'
  }
  if (p.status === 'waiting_student_confirmation') return 'MENUNGGU KONFIRMASI'
  if (p.status === 'student_revision_requested') return 'PERLU REVISI'
  return '-'
}

function getRevisionNotes(p) {
  const raw = p?.raw || p || {}
  const notes =
    p?.catatanKoreksi ||
    p?.catatanInternal ||
    raw.catatan_koreksi_mahasiswa ||
    raw.catatan_revisi_internal ||
    p?.catatanRevisi ||
    raw.catatan_revisi_mahasiswa ||
    raw.revision_notes ||
    raw.catatan_mahasiswa ||
    raw.catatan
  if (Array.isArray(notes)) return notes
  if (typeof notes === 'string' && notes.trim()) {
    return notes
      .split('\n')
      .map((s) => s.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
  }
  return []
}

function getDocumentUrls(p) {
  const raw = p?.raw || p || {}
  const docs = raw.dokumen || raw.documents || raw.berkas || {}
  return {
    bahasaInggris:
      docs.sertifikat_bahasa_inggris ||
      docs.bahasa_inggris ||
      raw.file_bahasa_inggris ||
      raw.url_bahasa_inggris ||
      null,
    pa: docs.persetujuan_pa || docs.judul_pa || raw.file_pa || raw.url_pa || null,
    similarity:
      docs.turnitin || docs.similarity || raw.file_similarity || raw.url_similarity || null,
    kegiatan:
      docs.sertifikat_kegiatan || docs.kegiatan || raw.file_kegiatan || raw.url_kegiatan || null,
    kompetensi:
      docs.sertifikat_kompetensi ||
      docs.kompetensi ||
      raw.file_kompetensi ||
      raw.url_kompetensi ||
      null,
    etik: docs.bebas_etik || docs.etik || raw.file_etik || raw.url_etik || null,
    fallback: raw.folder_berkas_url || raw.berkas_url || null,
  }
}

/* =========================================================
   AVATAR PROFIL & DROPDOWN
========================================================= */
function ProfileAvatar({ photo, size = 'normal' }) {
  const large = size === 'large'
  return photo ? (
    <img
      src={photo}
      alt="Foto profil"
      className={`rounded-full border-2 border-[#EEF2F6] object-cover ${
        large ? 'h-16 w-16' : 'h-8 w-8'
      }`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full bg-[#CBD5E1] text-[#475569] ${
        large ? 'h-16 w-16' : 'h-8 w-8'
      }`}
    >
      <UserRound size={large ? 32 : 18} />
    </div>
  )
}

function ProfileDropdown({ user, displayName, navigate, handleLogout, setProfileOpen }) {
  return (
    <div className="absolute right-0 top-[52px] z-50 w-[260px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
      <div className="flex flex-col items-center px-5 pb-4 pt-5">
        <ProfileAvatar photo={user?.avatar} size="large" />
        <p className="mt-3 max-w-[220px] truncate text-center text-[14px] font-bold text-[#0F172A]">
          {displayName}
        </p>
      </div>
      <div className="h-px bg-[#F1F5F9]" />
      <button
        type="button"
        onClick={() => {
          setProfileOpen(false)
          navigate('/profile')
        }}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-[#F8FAFC]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FF]">
          <UserRound size={16} className="text-[#0A477F]" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#1E293B]">Profil Saya</p>
          <p className="text-[10px] text-[#64748B]">Ubah nama dan foto profil</p>
        </div>
      </button>
      <div className="mx-5 h-px bg-[#F1F5F9]" />
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-red-50"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFE5E5]">
          <LogOut size={16} className="text-[#DC2626]" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-red-600">Keluar / Logout</p>
          <p className="text-[10px] text-red-400">Akhiri sesi akun di perangkat ini</p>
        </div>
      </button>
    </div>
  )
}

/* =========================================================
   BADGE STATUS
========================================================= */
function StatusBadgeAtribut({ status }) {
  if (status === 'LENGKAP') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[9.5px] font-bold text-[#137333]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" /> LENGKAP
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9.5px] font-bold text-[#D97706]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> BELUM LENGKAP
    </span>
  )
}

function StatusBadgeKonfirmasi({ status }) {
  if (status === 'TERKONFIRMASI') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[9.5px] font-bold text-[#137333]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" /> TERKONFIRMASI
      </span>
    )
  }
  if (status === 'MENUNGGU KONFIRMASI') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9.5px] font-bold text-[#D97706]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> MENUNGGU KONFIRMASI
      </span>
    )
  }
  if (status === 'PERLU REVISI') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-[9.5px] font-bold text-[#DC2626]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" /> PERLU REVISI
      </span>
    )
  }
  return <span className="text-[11px] font-medium text-[#94A3B8]">-</span>
}

/* =========================================================
   EMPTY STATE (STATE 1 - KOSONG PENUH)
========================================================= */
function EmptyStateCard({ title, description, buttonLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#64748B]">
        <FileText size={26} />
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[11px] font-extrabold text-[#0F172A] shadow-xs">
          !
        </span>
      </div>
      <h4 className="mt-4 text-[14px] font-bold text-[#0F172A]">{title}</h4>
      <p className="mt-1.5 max-w-[400px] text-[11px] leading-relaxed text-[#64748B]">
        {description}
      </p>
      {buttonLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#0F172A] px-5 py-2.5 text-[10.5px] font-bold text-white transition hover:bg-[#1E293B]"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}

/* =========================================================
   MODAL ISI / LIHAT BERITA ACARA MAHASISWA (PART 2)
========================================================= */
function StudentBeritaAcaraModal({
  student,
  initialDraft,
  onClose,
  onSave,
  onOpenDocument,
  saving,
}) {
  const konfStatus = statusKonfirmasi(student)
  const isConfirmed = konfStatus === 'TERKONFIRMASI'
  const isRevision = konfStatus === 'PERLU REVISI'
  const revisionNotes = getRevisionNotes(student)
  const docUrls = getDocumentUrls(student)

  // Jika sudah dikonfirmasi mahasiswa, default terkunci sampai admin klik "Ubah Data Berita Acara"
  const [editUnlocked, setEditUnlocked] = useState(!isConfirmed)
  const [form, setForm] = useState(initialDraft)

  useEffect(() => {
    setForm(initialDraft)
    setEditUnlocked(!isConfirmed)
  }, [student.id, initialDraft, isConfirmed])

  const updateField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const initials = student.nama
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(student, form)
  }

  const inputBase =
    'h-[38px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-[11px] text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0A477F] disabled:bg-[#F8FAFC] disabled:text-[#475569]'

  const BerkasLink = ({ url, label }) => (
    <button
      type="button"
      onClick={() => onOpenDocument(url || docUrls.fallback, label, student)}
      className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#0A477F] hover:underline"
    >
      <FileText size={11} /> Lihat Berkas <ExternalLink size={10} />
    </button>
  )

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs sm:p-5">
      <div className="relative flex max-h-[92vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-[16px] font-bold text-[#0F172A]">Isi Berita Acara</h3>
            <p className="mt-0.5 text-[10.5px] text-[#64748B]">Pengisian Draft Berita Acara</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Modal */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {/* Banner Hijau: Data Telah Dikonfirmasi Mahasiswa */}
          {isConfirmed && (
            <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border border-[#86EFAC] bg-[#F0FDF4] p-3.5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#15803D]" />
                <div>
                  <p className="text-[11.5px] font-bold text-[#14532D]">
                    Data Telah Dikonfirmasi Mahasiswa
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#166534]">
                    Mahasiswa telah memeriksa dan menyetujui seluruh atribut kelulusan pada berita
                    acara ini.
                  </p>
                </div>
              </div>
              {!editUnlocked && (
                <button
                  type="button"
                  onClick={() => setEditUnlocked(true)}
                  className="inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] px-3.5 text-[10.5px] font-bold text-white transition hover:bg-[#083866]"
                >
                  Ubah Data Berita Acara <Pencil size={12} />
                </button>
              )}
            </div>
          )}

          {/* Banner Kuning: Permintaan Koreksi Data dari Mahasiswa */}
          {isRevision && (
            <div className="mb-4 rounded-xl border border-[#FDE047] bg-[#FEFCE8] p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#CA8A04]" />
                <div className="w-full">
                  <p className="text-[11.5px] font-bold text-[#854D0E]">
                    Permintaan Koreksi Data dari Mahasiswa
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#A16207]">
                    Mahasiswa menemukan data yang tidak sesuai pada draft Berita Acara. Periksa
                    catatan di bawah, lalu perbarui data melalui form ini.
                  </p>
                  {revisionNotes.length > 0 ? (
                    <ol className="mt-2.5 list-decimal space-y-1 pl-4 text-[10.5px] font-medium text-[#713F12]">
                      {revisionNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-[10.5px] italic text-[#854D0E]">
                      Mahasiswa mengajukan permintaan revisi atribut kelulusan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kartu Identitas Mahasiswa & Info Verifikasi */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E0ECFB] text-[12px] font-bold text-[#0A477F]">
                {initials}
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-[#0F172A]">{student.nama}</h4>
                <p className="text-[10.5px] text-[#64748B]">{student.nim}</p>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-[#CBD5E1]/70 bg-white px-3 py-2.5 text-[10px] text-[#475569]">
              <FileText size={14} className="shrink-0 text-[#0A477F]" />
              <span>
                Pastikan data diisi sesuai dengan berkas persyaratan yudisium yang telah
                diverifikasi. Klik tombol <strong>Lihat Berkas</strong> untuk mengecek dokumen asli.
              </span>
            </div>

            {/* Grid Form Atribut */}
            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {/* IPK */}
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#334155]">IPK</label>
                <input
                  type="text"
                  disabled={!editUnlocked}
                  value={form.ipk}
                  onChange={(e) => updateField('ipk', e.target.value)}
                  placeholder="Contoh: 3,70"
                  className={inputBase}
                />
              </div>

              {/* Jumlah Nilai D */}
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#334155]">
                  Jumlah Nilai D
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!editUnlocked}
                    value={form.jumlahNilaiD}
                    onChange={(e) => updateField('jumlahNilaiD', e.target.value)}
                    placeholder="Contoh: 10"
                    className={`${inputBase} pr-8`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold text-[#94A3B8]">
                    %
                  </span>
                </div>
              </div>

              {/* SKS yang Ditempuh */}
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#334155]">
                  SKS yang Ditempuh
                </label>
                <input
                  type="text"
                  disabled={!editUnlocked}
                  value={form.sksDitempuh}
                  onChange={(e) => updateField('sksDitempuh', e.target.value)}
                  placeholder="Contoh: 144"
                  className={inputBase}
                />
              </div>

              {/* Skor Kemampuan Bahasa Inggris */}
              <div>
                <div className="mb-1 flex items-center justify-between gap-1">
                  <label className="truncate text-[10px] font-bold text-[#334155]">
                    Skor Kemampuan Bahasa Inggris
                  </label>
                  <BerkasLink url={docUrls.bahasaInggris} label="Sertifikat Bahasa Inggris" />
                </div>
                <input
                  type="text"
                  disabled={!editUnlocked}
                  value={form.skorBahasaInggris}
                  onChange={(e) => updateField('skorBahasaInggris', e.target.value)}
                  placeholder="Contoh: TEVocS: 70"
                  className={inputBase}
                />
              </div>

              {/* Judul PA Disetujui/Tidak */}
              <div>
                <div className="mb-1 flex items-center justify-between gap-1">
                  <label className="truncate text-[10px] font-bold text-[#334155]">
                    Judul PA Disetujui/Tidak
                  </label>
                  <BerkasLink url={docUrls.pa} label="Lembar Persetujuan PA" />
                </div>
                <select
                  disabled={!editUnlocked}
                  value={form.judulPaStatus}
                  onChange={(e) => updateField('judulPaStatus', e.target.value)}
                  className={inputBase}
                >
                  <option value="">Pilih status...</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="tidak_disetujui">Tidak disetujui</option>
                </select>
              </div>

              {/* Jumlah Similarity Index */}
              <div>
                <div className="mb-1 flex items-center justify-between gap-1">
                  <label className="truncate text-[10px] font-bold text-[#334155]">
                    Jumlah Similarity Index
                  </label>
                  <BerkasLink url={docUrls.similarity} label="Hasil Cek Similarity" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!editUnlocked}
                    value={form.similarityIndex}
                    onChange={(e) => updateField('similarityIndex', e.target.value)}
                    placeholder="Contoh: 14"
                    className={`${inputBase} pr-8`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold text-[#94A3B8]">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Sertifikat Kegiatan/Kepanitiaan/Kompetisi */}
            <div className="mt-3.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold text-[#334155]">
                  Sertifikat Kegiatan/Kepanitiaan/Kompetisi Level (Internasional/Nasional/Regional/Lokal)
                </label>
                <BerkasLink url={docUrls.kegiatan} label="Sertifikat Kegiatan" />
              </div>
              <input
                type="text"
                disabled={!editUnlocked}
                value={form.sertifikatKegiatan}
                onChange={(e) => updateField('sertifikatKegiatan', e.target.value)}
                placeholder="Contoh: Kepanitiaan Universitas PORSENIGAMA 2023"
                className={inputBase}
              />
            </div>

            {/* Sertifikat Kompetensi */}
            <div className="mt-3.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold text-[#334155]">
                  Sertifikat Kompetensi
                </label>
                <BerkasLink url={docUrls.kompetensi} label="Sertifikat Kompetensi" />
              </div>
              <input
                type="text"
                disabled={!editUnlocked}
                value={form.sertifikatKompetensi}
                onChange={(e) => updateField('sertifikatKompetensi', e.target.value)}
                placeholder="Contoh: BNSP Associate Data Scientist 2025"
                className={inputBase}
              />
            </div>

            {/* Status Pemeriksaan/Hukuman/Pelanggaran Etik */}
            <div className="mt-3.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold text-[#334155]">
                  Status Pemeriksaan/Hukuman/Pelanggaran Etik
                </label>
                <BerkasLink url={docUrls.etik} label="Surat Keterangan Bebas Etik" />
              </div>
              <input
                type="text"
                disabled={!editUnlocked}
                value={form.statusEtik}
                onChange={(e) => updateField('statusEtik', e.target.value)}
                placeholder="Contoh: -"
                className={inputBase}
              />
            </div>
          </div>

          {/* Footer Modal */}
          {editUnlocked && (
            <div className="mt-5 flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="h-[36px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[10.5px] font-bold text-[#475569] transition hover:bg-[#F1F5F9]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex h-[36px] items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] px-5 text-[10.5px] font-bold text-white transition hover:bg-[#083866] disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Simpan Data
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

/* =========================================================
   MODAL KONFIRMASI KIRIM DRAF KE MAHASISWA & AKSI MASSAL
========================================================= */
function SendDraftModal({ prodiKode, periodeLabel, rows, busy, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]"
        >
          <X size={18} />
        </button>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#D97706]">
          <Send size={22} />
        </div>
        <h3 className="mt-4 text-center text-[15px] font-bold text-[#0F172A]">
          Kirim Draf Berita Acara ke Mahasiswa?
        </h3>
        <p className="mt-1.5 text-center text-[10.5px] leading-relaxed text-[#64748B]">
          Sistem akan mengirimkan draf Berita Acara Yudisium ke alamat email UGM seluruh mahasiswa
          terverifikasi pada program studi ini untuk diperiksa dan dikonfirmasi.
        </p>

        {/* Ringkasan Pengiriman sesuai desain */}
        <div className="mt-4 space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-[10.5px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#64748B]">Program Studi</span>
            <span className="font-bold text-[#0F172A]">{prodiKode || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#64748B]">Periode Yudisium</span>
            <span className="font-bold text-[#0F172A]">{periodeLabel || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#64748B]">Total Penerima Email</span>
            <span className="font-bold text-[#0F172A]">{rows.length} Mahasiswa</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="h-[36px] flex-1 rounded-xl border border-[#CBD5E1] bg-white text-[10.5px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex h-[36px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] text-[10.5px] font-bold text-white hover:bg-[#083866] disabled:opacity-60"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Ya, Kirim Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmActionModal({
  icon: Icon,
  tone = 'blue',
  title,
  description,
  rows,
  confirmLabel,
  busy,
  onClose,
  onConfirm,
}) {
  const tones = {
    blue: 'bg-[#E0ECFB] text-[#0A477F]',
    amber: 'bg-[#FEF3C7] text-[#D97706]',
    green: 'bg-[#E6F4EA] text-[#137333]',
  }
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]"
        >
          <X size={18} />
        </button>
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          <Icon size={22} />
        </div>
        <h3 className="mt-4 text-center text-[15px] font-bold text-[#0F172A]">{title}</h3>
        <p className="mt-1.5 text-center text-[11px] leading-relaxed text-[#64748B]">
          {description}
        </p>
        <div className="mt-4 max-h-[160px] space-y-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[11px]">
          {rows.map((r, idx) => (
            <div key={r.id} className="flex justify-between gap-3 text-[#334155]">
              <span className="truncate">
                {idx + 1}. {r.nama}
              </span>
              <span className="shrink-0 text-[#64748B]">{r.nim}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="h-[36px] flex-1 rounded-xl border border-[#CBD5E1] bg-white text-[10.5px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex h-[36px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] text-[10.5px] font-bold text-white hover:bg-[#083866] disabled:opacity-60"
          >
            {busy && <Loader2 size={12} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   MODAL HASIL PENGIRIMAN / AKSI MASSAL (SESUAI DESAIN PART 2)
========================================================= */
function ResultModal({ title, subtitle, results, footnote, ctaLabel = 'Selesai', onClose }) {
  const okCount = results.filter((r) => r.ok).length
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#137333]">
          <MailCheck size={22} />
        </div>

        <h3 className="mt-3.5 text-center text-[15px] font-bold text-[#0F172A]">{title}</h3>
        <p className="mt-1 text-center text-[10.5px] leading-relaxed text-[#64748B]">
          {subtitle || `${okCount} dari ${results.length} berhasil diproses.`}
        </p>

        <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#64748B]">
              RINCIAN PENGIRIMAN / PROSES
            </span>
            <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[8.5px] font-bold text-[#137333]">
              • {okCount}/{results.length} TERKIRIM
            </span>
          </div>
          <div className="max-h-[190px] space-y-1.5 overflow-y-auto text-[10.5px]">
            {results.map((r, idx) => (
              <div key={r.id} className="flex items-start justify-between gap-3 text-[#334155]">
                <span className="truncate">
                  {idx + 1}. {r.nama}
                </span>
                {r.ok ? (
                  <span className="flex shrink-0 items-center gap-1 text-[9.5px] font-bold text-[#137333]">
                    <Check size={11} /> Terkirim
                  </span>
                ) : (
                  <span className="max-w-[200px] text-right text-[9.5px] font-semibold text-[#DC2626]">
                    {r.message}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {footnote && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#0A477F]/20 bg-[#F0F7FF] p-3 text-[10px] leading-4 text-[#0A477F]">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{footnote}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 h-[38px] w-full rounded-xl bg-[#0A477F] text-[10.5px] font-bold text-white transition hover:bg-[#083866]"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}

/* =========================================================
   MODAL DOKUMEN DRAFT BERITA ACARA YUDISIUM (HTML BE / TEMPLATE RESMI)
========================================================= */
function DraftPreviewModal({
  title,
  html,
  loading,
  error,
  draftDocData,
  onClose,
  onDownload,
  downloading,
}) {
  const handlePrintPdf = () => {
    if (onDownload) {
      onDownload()
      return
    }
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs sm:p-5">
      <div className="relative flex max-h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A]">
              {title || 'Dokumen Draft Berita Acara Yudisium'}
            </h3>
            <p className="text-[10px] text-[#64748B]">Pratinjau penuh surat Berita Acara</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={downloading}
              className="flex h-[34px] items-center gap-1.5 rounded-xl bg-[#0A477F] px-3.5 text-[10.5px] font-bold text-white transition hover:bg-[#083866] disabled:opacity-60"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Unduh Draft Berita Acara (PDF)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Pratinjau */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#64748B]">
              <Loader2 size={15} className="animate-spin" /> Memuat pratinjau dokumen...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[11px] text-rose-700">
              {error}
            </div>
          )}

          {html ? (
            <iframe
              title="Pratinjau Berita Acara"
              sandbox=""
              srcDoc={html}
              className="h-[68vh] w-full rounded-xl border border-[#CBD5E1] bg-white"
            />
          ) : (
            !loading &&
            !error &&
            draftDocData && (
              <div className="mx-auto max-w-[780px] rounded-xl border border-[#CBD5E1] bg-white p-6 text-[#0F172A] shadow-xs sm:p-10">
                {/* Kop Surat UGM */}
                <div className="border-b-2 border-[#0F172A] pb-3 text-center">
                  <p className="text-[11px] font-bold tracking-wide">
                    UNIVERSITAS GADJAH MADA • SEKOLAH VOKASI
                  </p>
                  <p className="text-[12px] font-extrabold tracking-wide">
                    DEPARTEMEN TEKNIK ELEKTRO DAN INFORMATIKA
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#475569]">
                    Program Studi Sarjana Terapan {draftDocData.prodiNama}
                  </p>
                </div>

                {/* Judul & Nomor Dokumen */}
                <div className="mt-5 text-center">
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wide">
                    BERITA ACARA YUDISIUM
                  </h4>
                  <p className="mt-0.5 text-[10.5px] text-[#334155]">
                    Nomor: {draftDocData.nomorSurat || '104/UN1/SV.DTEDI/BA-YUD/VI/2026'}
                  </p>
                </div>

                {/* Paragraf Pembuka */}
                <p className="mt-5 text-justify text-[10.5px] leading-relaxed text-[#1E293B]">
                  Pada hari ini, <strong>{draftDocData.tanggalFormatted}</strong>, Program Studi
                  Sarjana Terapan <strong>{draftDocData.prodiNama}</strong>, Departemen Teknik
                  Elektro dan Informatika, Sekolah Vokasi, Universitas Gadjah Mada telah
                  melaksanakan rapat pleno evaluasi kelulusan yudisium untuk{' '}
                  <strong>{draftDocData.periodeLabel}</strong> dengan rincian data kelulusan
                  mahasiswa sebagai berikut:
                </p>

                {/* Tabel Mahasiswa */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse border border-[#CBD5E1] text-[9.5px]">
                    <thead>
                      <tr className="bg-[#F1F5F9] text-left font-bold text-[#0F172A]">
                        <th className="border border-[#CBD5E1] px-2.5 py-2 text-center">No</th>
                        <th className="border border-[#CBD5E1] px-2.5 py-2">Nama & NIM</th>
                        <th className="border border-[#CBD5E1] px-2.5 py-2 text-center">
                          IPK / SKS / D
                        </th>
                        <th className="border border-[#CBD5E1] px-2.5 py-2 text-center">
                          Predikat
                        </th>
                        <th className="border border-[#CBD5E1] px-2.5 py-2">
                          Similarity & Skor Inggris
                        </th>
                        <th className="border border-[#CBD5E1] px-2.5 py-2">
                          Judul PA, Sertifikat Kompetensi & Kegiatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftDocData.rows.map((r, i) => (
                        <tr key={r.id} className="align-top">
                          <td className="border border-[#CBD5E1] px-2.5 py-2 text-center">
                            {i + 1}
                          </td>
                          <td className="border border-[#CBD5E1] px-2.5 py-2">
                            <p className="font-bold">{r.nama}</p>
                            <p className="text-[#475569]">{r.nim}</p>
                          </td>
                          <td className="border border-[#CBD5E1] px-2.5 py-2 text-center">
                            {r.draft.ipk || '-'} / {r.draft.sksDitempuh || '-'} /{' '}
                            {r.draft.jumlahNilaiD || '0'}
                          </td>
                          <td className="border border-[#CBD5E1] px-2.5 py-2 text-center font-semibold">
                            {r.predikat}
                          </td>
                          <td className="border border-[#CBD5E1] px-2.5 py-2">
                            <p>Similarity: {r.draft.similarityIndex ? `${r.draft.similarityIndex}%` : '-'}</p>
                            <p>{r.draft.skorBahasaInggris || '-'}</p>
                          </td>
                          <td className="border border-[#CBD5E1] px-2.5 py-2 space-y-0.5">
                            <p>
                              <strong>PA ({r.draft.judulPaStatus || '-'}):</strong>{' '}
                              {r.draft.judulPa || '-'}
                            </p>
                            <p>
                              <strong>Kompetensi:</strong> {r.draft.sertifikatKompetensi || '-'}
                            </p>
                            <p>
                              <strong>Kegiatan:</strong> {r.draft.sertifikatKegiatan || '-'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Penutup & Tanda Tangan */}
                <p className="mt-5 text-[10.5px] text-[#1E293B]">
                  Demikian Berita Acara Yudisium ini dibuat dengan sesungguhnya untuk dapat
                  dipergunakan sebagaimana mestinya.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-6 text-center text-[10px]">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Ketua Departemen TEDI</p>
                    <div className="mt-12 text-[9px] italic text-[#94A3B8]">
                      (Menunggu Persetujuan Kadep)
                    </div>
                  </div>
                  <div>
                    <p>Yogyakarta, {draftDocData.tanggalFormatted}</p>
                    <p className="font-semibold">
                      Ketua Program Studi {draftDocData.prodiKode}
                    </p>
                    <div className="mx-auto mt-10 inline-block rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1.5 text-[9px] font-semibold text-[#B45309]">
                      Menunggu Tanda Tangan Elektronik Kaprodi
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   KOMPONEN UTAMA BERITA ACARA
========================================================= */
export default function BeritaAcara() {
  const navigate = useNavigate()

  // User Profile
  const [user] = useState(() => getUser())
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = user?.nama || 'Staf Akademik'

  // Data dari API
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pengajuan, setPengajuan] = useState([])
  const [prodis, setProdis] = useState([])
  const [events, setEvents] = useState([])
  const [notice, setNotice] = useState(null)

  // Konfigurasi dokumen (Nomor Dokumen, Tanggal Dokumen, Periode Yudisium)
  const [nomorSurat, setNomorSurat] = useState('')
  const [tanggalSurat, setTanggalSurat] = useState('')
  const [pickedEventId, setPickedEventId] = useState('')
  const [isConfigSaved, setIsConfigSaved] = useState(false)

  // Draft atribut lokal per mahasiswa (sinkron dengan data backend)
  const [localDrafts, setLocalDrafts] = useState({})
  const [editingStudent, setEditingStudent] = useState(null)
  const [savingStudent, setSavingStudent] = useState(false)

  // Tabs & pilihan
  const [activeTab, setActiveTab] = useState('active')
  const [pickedProdiId, setPickedProdiId] = useState('')
  const [selectedBaKey, setSelectedBaKey] = useState(null)

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [filterAtribut, setFilterAtribut] = useState('')
  const [filterKonfirmasi, setFilterKonfirmasi] = useState('')
  const [page, setPage] = useState(1)

  // Aksi & Modals
  const [confirm, setConfirm] = useState(null) // 'send' | 'checklist' | 'ajukan'
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState(null)
  const [preview, setPreview] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const loadAll = useCallback(
    () =>
      Promise.all([
        listPengajuanStaf(),
        listProgramStudi().catch(() => []),
        listEvents().catch(() => []),
      ])
        .then(([pengajuanRes, prodiRes, eventRes]) => {
          const normalized = pengajuanRes.map(normalizePengajuan)
          setPengajuan(normalized)
          setProdis(prodiRes.map(normalizeProdi))
          setEvents(eventRes)

          // Seed draft atribut dari data backend jika belum ada di state lokal
          setLocalDrafts((prev) => {
            const next = { ...prev }
            normalized.forEach((item) => {
              if (!next[item.id]) {
                next[item.id] = extractStudentDraft(item)
              }
            })
            return next
          })
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat data berita acara')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleLogout = async () => {
    await logout()
    setProfileOpen(false)
    navigate('/')
  }

  const flash = (type, text) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 7000)
  }

  /* ---------- turunan ---------- */
  const selectedProdiId = pickedProdiId || (prodis[0] ? String(prodis[0].id) : '')
  const selectedProdi = prodis.find((p) => String(p.id) === selectedProdiId) || null

  const effectiveEvent =
    events.find((e) => String(e.id) === String(pickedEventId)) ||
    events.find((e) => e.is_active) ||
    events[0] ||
    null

  const periodeLabel = effectiveEvent
    ? `${effectiveEvent.nama_event}${effectiveEvent.periode ? ` (${effectiveEvent.periode})` : ''}`
    : ''

  // Mahasiswa prodi aktif yang belum masuk Berita Acara
  const prodiStudents = useMemo(
    () => pengajuan.filter((p) => String(p.prodiId) === selectedProdiId && !p.beritaAcaraId),
    [pengajuan, selectedProdiId]
  )

  const countLengkap = prodiStudents.filter(
    (st) => statusAtribut(st, localDrafts) === 'LENGKAP'
  ).length
  const allAtributLengkap = prodiStudents.length > 0 && countLengkap === prodiStudents.length

  const targets = useMemo(
    () => ({
      send: prodiStudents.filter(
        (p) =>
          (p.status === 'checking_akademik' || p.status === 'verified_akademik') &&
          statusAtribut(p, localDrafts) === 'LENGKAP'
      ),
      checklist: prodiStudents.filter((p) => p.status === 'confirmed_by_student'),
      ajukan: prodiStudents.filter((p) =>
        ['final_checked_akademik', 'confirmed_by_student'].includes(p.status)
      ),
    }),
    [prodiStudents, localDrafts]
  )

  const needRevision = prodiStudents.filter((p) => p.status === 'student_revision_requested')

  // Cek apakah ada BA yang dikembalikan Kaprodi / Pejabat Pengesah
  const returnedBaList = useMemo(
    () =>
      pengajuan.filter(
        (p) =>
          String(p.prodiId) === selectedProdiId &&
          String(p.beritaAcaraStatus || '').toLowerCase().includes('revis')
      ),
    [pengajuan, selectedProdiId]
  )

  // Histori: kelompokkan per Berita Acara
  const baGroups = useMemo(() => {
    const map = new Map()
    pengajuan
      .filter((p) => p.beritaAcaraId)
      .forEach((p) => {
        const key = String(p.beritaAcaraId)
        if (!map.has(key)) {
          const ev = events.find((e) => String(e.id) === String(p.eventId))
          map.set(key, {
            key,
            id: p.beritaAcaraId,
            prodiNama: p.prodiNama,
            eventNama: ev ? ev.nama_event : p.eventName || '-',
            eventPeriode: ev
              ? `Pendaftaran: ${ev.tgl_mulai ? formatDate(ev.tgl_mulai) : '-'} - ${
                  ev.tgl_selesai ? formatDate(ev.tgl_selesai) : '-'
                }`
              : '',
            tanggalYudisium: ev?.tgl_yudisium ? formatDate(ev.tgl_yudisium) : '-',
            status: p.beritaAcaraStatus || '-',
            students: [],
          })
        }
        map.get(key).students.push(p)
      })
    return [...map.values()]
  }, [pengajuan, events])

  const selectedBa = baGroups.find((g) => g.key === selectedBaKey) || null

  const filteredStudents = useMemo(() => {
    const list = activeTab === 'history' ? selectedBa?.students || [] : prodiStudents
    const keyword = search.toLowerCase().trim()
    return list.filter((st) => {
      const matchSearch =
        !keyword ||
        st.nama.toLowerCase().includes(keyword) ||
        String(st.nim).toLowerCase().includes(keyword)
      const matchAtribut = !filterAtribut || statusAtribut(st, localDrafts) === filterAtribut
      const matchKonfirmasi = !filterKonfirmasi || statusKonfirmasi(st) === filterKonfirmasi
      return matchSearch && matchAtribut && matchKonfirmasi
    })
  }, [activeTab, selectedBa, prodiStudents, search, filterAtribut, filterKonfirmasi, localDrafts])

  const showingGroups = activeTab === 'history' && !selectedBa
  const totalRows = showingGroups ? baGroups.length : filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = (list) => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  /* ---------- simpan atribut individu mahasiswa ---------- */
  const handleSaveStudentDraft = async (student, formValues) => {
    setSavingStudent(true)
    try {
      // PUT /api/staf-akademik/pengajuan/{id}/penilaian
      await savePenilaian(student.id, toPenilaianPayload(formValues))

      setLocalDrafts((prev) => ({ ...prev, [student.id]: formValues }))
      setEditingStudent(null)
      flash('success', `Data atribut Berita Acara untuk ${student.nama} berhasil disimpan.`)
      loadAll()
    } catch (err) {
      flash('error', errorMessage(err, `Gagal menyimpan data ${student.nama}`))
    } finally {
      setSavingStudent(false)
    }
  }

  const handleOpenDocument = (url, label, student) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    flash(
      'error',
      `Tautan file ${label} untuk ${student.nama} belum dilampirkan dari server. Silakan cek detail berkas di menu Pengajuan Yudisium.`
    )
  }

  /* ---------- aksi massal ---------- */
  const runBulk = async (list, action) => {
    const out = []
    for (const st of list) {
      try {
        await action(st.id)
        out.push({ id: st.id, nama: st.nama, ok: true })
      } catch (err) {
        out.push({
          id: st.id,
          nama: st.nama,
          ok: false,
          message: errorMessage(err, 'Gagal diproses'),
        })
      }
    }
    return out
  }

  const handleBulkSend = async () => {
    setBusy(true)
    const out = await runBulk(targets.send, kirimKonfirmasi)
    setBusy(false)
    setConfirm(null)
    setResults({
      title: 'Draft Berita Acara Berhasil Dikirim!',
      subtitle: `Notifikasi beserta draf Berita Acara telah berhasil dikirimkan ke email ${out.filter((x) => x.ok).length} mahasiswa Prodi ${selectedProdi?.kode || ''} untuk ditinjau.`,
      results: out,
      footnote:
        'Status seluruh mahasiswa pada tabel kini berubah menjadi Menunggu Konfirmasi hingga mahasiswa menyetujui atau mengajukan revisi.',
      ctaLabel: 'Selesai & Pantau Konfirmasi',
    })
    loadAll()
  }

  const handleBulkChecklist = async () => {
    setBusy(true)
    const out = await runBulk(targets.checklist, checklistAkhir)
    setBusy(false)
    setConfirm(null)
    setResults({
      title: 'Hasil Checklist Akhir',
      subtitle: 'Mahasiswa yang lolos checklist akhir siap diajukan ke Kaprodi.',
      results: out,
      footnote: 'Mahasiswa yang lolos checklist akhir siap diajukan ke Kaprodi melalui Berita Acara.',
      ctaLabel: 'Selesai',
    })
    loadAll()
  }

  const handleAjukan = async () => {
    if (!effectiveEvent) {
      setConfirm(null)
      return flash(
        'error',
        'Belum ada periode yudisium. Buat periode terlebih dahulu di halaman Pengajuan Yudisium.'
      )
    }

    setBusy(true)
    try {
      // Jika masih ada mahasiswa status confirmed_by_student yang belum di-checklist akhir, otomatis proses dulu
      const needChecklistFirst = targets.ajukan.filter((p) => p.status === 'confirmed_by_student')
      for (const st of needChecklistFirst) {
        await checklistAkhir(st.id)
      }

      const created = await ajukanBeritaAcara({
        yudisium_event_id: Number(effectiveEvent.id),
        program_studi_id: Number(selectedProdiId),
        pengajuan_ids: targets.ajukan.map((p) => Number(p.id)),
      })
      const baId = created?.id ?? created?.berita_acara_id ?? created?.berita_acara?.id

      const meta = {}
      if (nomorSurat.trim()) meta.nomor_surat = nomorSurat.trim()
      if (tanggalSurat) meta.tanggal_surat = tanggalSurat
      if (effectiveEvent?.periode) meta.periode = effectiveEvent.periode

      let metaFailed = ''
      if (baId && Object.keys(meta).length > 0) {
        try {
          await updateBeritaAcaraMeta(baId, meta)
        } catch (err) {
          metaFailed = errorMessage(err, 'Gagal menyimpan nomor/tanggal surat')
        }
      }

      setConfirm(null)
      await loadAll()
      flash(
        metaFailed ? 'error' : 'success',
        metaFailed
          ? `Berita Acara berhasil diajukan, tetapi metadata gagal disimpan: ${metaFailed}`
          : `Berita Acara ${selectedProdi?.kode || ''} berhasil dikirim ke Kaprodi.`
      )
    } catch (err) {
      setConfirm(null)
      flash('error', errorMessage(err, 'Gagal mengirim Berita Acara ke Kaprodi'))
    } finally {
      setBusy(false)
    }
  }

  /* ---------- preview & export ---------- */
  const openHistoryPreview = async (baId) => {
    setPreview({
      baId,
      title: `Dokumen Draft Berita Acara Yudisium • ${selectedBa?.eventNama || ''}`,
      html: '',
      loading: true,
      error: '',
      draftDocData: null,
    })
    try {
      const data = await previewBeritaAcara(baId)
      setPreview({
        baId,
        title: `Dokumen Draft Berita Acara Yudisium • ${selectedBa?.eventNama || ''}`,
        html: data?.html || '',
        loading: false,
        error: data?.html ? '' : 'Pratinjau kosong.',
        draftDocData: null,
      })
    } catch (err) {
      setPreview({
        baId,
        title: 'Dokumen Draft Berita Acara Yudisium',
        html: '',
        loading: false,
        error: errorMessage(err, 'Gagal memuat pratinjau'),
        draftDocData: null,
      })
    }
  }

  const openActiveDraftPreview = () => {
    const formattedDate = tanggalSurat
      ? formatDate(tanggalSurat)
      : formatDate(new Date().toISOString().slice(0, 10))

    setPreview({
      baId: null,
      title: `Dokumen Draft Berita Acara Yudisium • ${effectiveEvent?.nama_event || 'Periode Aktif'}`,
      html: '',
      loading: false,
      error: '',
      draftDocData: {
        prodiNama: selectedProdi?.nama || '-',
        prodiKode: selectedProdi?.kode || '-',
        nomorSurat: nomorSurat.trim(),
        tanggalFormatted: formattedDate,
        periodeLabel: periodeLabel || 'Periode Yudisium Aktif',
        rows: prodiStudents.map((st) => ({
          id: st.id,
          nama: st.nama,
          nim: st.nim,
          predikat: getPredikatKelulusan(st, localDrafts),
          draft: localDrafts[st.id] || extractStudentDraft(st),
        })),
      },
    })
  }

  const handleDownload = async (baId) => {
    if (!baId) {
      window.print()
      return
    }
    setDownloading(true)
    try {
      const blob = await exportBeritaAcara(baId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `berita-acara-${baId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      flash(
        'error',
        errorMessage(err, 'Gagal mengunduh PDF (PDF baru tersedia setelah disetujui pejabat pengesah)')
      )
    } finally {
      setDownloading(false)
    }
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setSelectedBaKey(null)
    setSearch('')
    setFilterAtribut('')
    setFilterKonfirmasi('')
    setPage(1)
  }

  const fieldCls =
    'h-[38px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-[10.5px] text-[#1E293B] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0A477F]'
  const thCls =
    'whitespace-nowrap px-4 py-3 text-left text-[8.5px] font-bold uppercase tracking-wider text-[#64748B] sm:px-5'
  const outlineBtn =
    'flex h-[36px] items-center justify-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-[10.5px] font-bold text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-45 sm:px-4'

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-[#1E293B]">
      <Sidebar admin />

      <main className="min-h-screen lg:ml-[280px]">
        {/* TOP NAVBAR */}
        <header className="relative z-30 flex h-[64px] items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 pl-14 sm:h-[72px] sm:px-6 sm:pl-14 lg:px-8 lg:pl-8">
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-bold text-[#0F172A] sm:text-[20px]">
              Berita Acara Staff Administrasi
            </h1>
            <p className="hidden truncate text-[10.5px] text-[#64748B] sm:block">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-[#F8FAFC] sm:gap-2.5 sm:p-1.5"
            >
              <ProfileAvatar photo={user?.avatar} />
              <span className="hidden max-w-[200px] truncate text-[12px] font-bold text-[#1E293B] sm:inline">
                {displayName}
              </span>
              <ChevronDown
                size={14}
                className={`hidden text-[#64748B] transition-transform sm:block ${
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

        {/* CONTAINER */}
        <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {/* HEADER CARD */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-6">
            <h2 className="text-[16px] font-bold text-[#0F172A] sm:text-[18px]">
              Pengelolaan Berita Acara Yudisium
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
              Penyusunan dan validasi data kelulusan mahasiswa terverifikasi per program studi untuk
              penyusunan dokumen Berita Acara.
            </p>
          </section>

          {notice && (
            <div
              className={`mt-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-[11px] font-medium ${
                notice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              <span>{notice.text}</span>
              <button type="button" onClick={() => setNotice(null)} className="shrink-0">
                <X size={13} />
              </button>
            </div>
          )}

          {loadError && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] text-rose-700 sm:px-5">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  loadAll()
                }}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1 font-bold"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* KONFIGURASI DOKUMEN BERITA ACARA (3 KOLOM SESUAI DESAIN) */}
          <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
            <h3 className="text-[13.5px] font-bold text-[#0F172A]">
              Konfigurasi Dokumen Berita Acara
            </h3>
            <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[9.5px] font-bold text-[#334155]">
                    Nomor Dokumen Berita Acara
                  </label>
                  <span className="text-[10px] font-bold text-rose-500">*</span>
                </div>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => {
                    setNomorSurat(e.target.value)
                    setIsConfigSaved(false)
                  }}
                  maxLength={100}
                  placeholder="Contoh: 104/UN1/SV.DTEDI/BA-YUD/VI/2026"
                  className={fieldCls}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[9.5px] font-bold text-[#334155]">Tanggal Dokumen</label>
                  <span className="text-[10px] font-bold text-rose-500">*</span>
                </div>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => {
                    setTanggalSurat(e.target.value)
                    setIsConfigSaved(false)
                  }}
                  className={fieldCls}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[9.5px] font-bold text-[#334155]">Periode Yudisium</label>
                  <span className="text-[10px] font-bold text-rose-500">*</span>
                </div>
                <div className="relative">
                  <select
                    value={effectiveEvent ? String(effectiveEvent.id) : ''}
                    onChange={(e) => {
                      setPickedEventId(e.target.value)
                      setIsConfigSaved(false)
                    }}
                    className={`${fieldCls} appearance-none pr-8`}
                  >
                    {events.length === 0 && <option value="">Belum ada periode</option>}
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.nama_event} {ev.periode ? `(${ev.periode})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsConfigSaved(true)}
                className={`flex h-[34px] w-full items-center justify-center gap-1.5 rounded-xl px-4 text-[10.5px] font-bold text-white transition sm:w-auto ${
                  isConfigSaved ? 'bg-[#16A34A]' : 'bg-[#64748B] hover:bg-[#0A477F]'
                }`}
              >
                {isConfigSaved ? (
                  <>
                    Data Tersimpan <Check size={14} />
                  </>
                ) : (
                  <>
                    Simpan Perubahan <Save size={14} />
                  </>
                )}
              </button>
            </div>
          </section>

          {/* PILIH PROGRAM STUDI BERITA ACARA */}
          <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
            <h3 className="text-[13.5px] font-bold text-[#0F172A]">
              Pilih Program Studi Berita Acara
            </h3>
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {prodis.map((p) => {
                const list = pengajuan.filter(
                  (s) => String(s.prodiId) === String(p.id) && !s.beritaAcaraId
                )
                const lengkap = list.filter(
                  (s) => statusAtribut(s, localDrafts) === 'LENGKAP'
                ).length
                const active = selectedProdiId === String(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPickedProdiId(String(p.id))
                      setSearch('')
                      setPage(1)
                      if (activeTab === 'history') switchTab('active')
                    }}
                    className={`flex flex-col justify-between rounded-xl p-3.5 text-left transition ${
                      active
                        ? 'border-2 border-[#0A477F] bg-[#EEF4FF]/70'
                        : 'border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-[#0A477F] px-2.5 py-0.5 text-[9.5px] font-bold text-white">
                          {p.kode}
                        </span>
                        <span className="text-[10px] font-medium text-[#475569]">
                          {list.length} Mahasiswa
                        </span>
                      </div>
                      {active && (
                        <span className="mt-2 inline-block rounded-md bg-[#DBEAFE] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#0A477F]">
                          PRODI AKTIF
                        </span>
                      )}
                      <h4 className="mt-2 text-[11px] font-bold leading-4 text-[#0F172A]">
                        {p.nama}
                      </h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[9.5px] font-bold text-[#0A477F]">
                      <span>
                        {list.length > 0
                          ? `${lengkap}/${list.length} Atribut Lengkap`
                          : '0 Atribut Lengkap'}
                      </span>
                      <ArrowRight size={12} />
                    </div>
                  </button>
                )
              })}
              {!loading && prodis.length === 0 && (
                <p className="col-span-full text-[11px] text-[#94A3B8]">Belum ada program studi.</p>
              )}
            </div>
          </section>

          {/* BANNER PENGEMBALIAN PEJABAT PENGESAH / REVISI MAHASISWA */}
          {(returnedBaList.length > 0 || needRevision.length > 0) && (
            <section className="mt-5 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-4 text-[#92400E]">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#92400E] text-white">
                  <AlertTriangle size={16} />
                </div>
                <div className="text-[11px]">
                  <h4 className="font-bold text-[#78350F]">
                    {returnedBaList.length > 0
                      ? `Berita Acara Prodi ${selectedProdi?.kode || ''} Dikembalikan oleh Pejabat Pengesah`
                      : `Terdapat Permintaan Perbaikan Data Mahasiswa Prodi ${selectedProdi?.kode || ''}`}
                  </h4>
                  <p className="mt-0.5 leading-4 text-[#92400E]">
                    Terdapat catatan perbaikan pada data atribut kelulusan mahasiswa berikut:
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[10.5px] font-medium text-[#78350F]">
                    {(returnedBaList.length > 0 ? returnedBaList : needRevision).map((s, i) => {
                      const notes = getRevisionNotes(s)
                      return (
                        <li key={s.id}>
                          ({i + 1}) <strong>{s.nama}</strong>
                          {notes.length > 0
                            ? ` — ${notes.join('; ')}`
                            : ' — Periksa kembali kesesuaian atribut dengan berkas asli.'}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* TAB SWAPPER */}
          <div className="mt-5 flex w-full flex-col rounded-xl bg-[#E2E8F0] p-1 sm:inline-flex sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => switchTab('active')}
              className={`flex h-[34px] items-center justify-center gap-2 rounded-lg px-3.5 text-[10.5px] font-bold transition sm:h-[32px] sm:justify-start ${
                activeTab === 'active' ? 'bg-white text-[#0A477F] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              <Inbox size={13} className="shrink-0" />
              <span className="truncate">Penyusunan Berita Acara Aktif</span>
              <span className="rounded-full bg-[#E0ECFB] px-2 py-0.5 text-[8.5px] text-[#0A477F]">
                {prodiStudents.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('history')}
              className={`flex h-[34px] items-center justify-center gap-2 rounded-lg px-3.5 text-[10.5px] font-bold transition sm:h-[32px] sm:justify-start ${
                activeTab === 'history' ? 'bg-white text-[#0A477F] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              <History size={13} className="shrink-0" />
              <span className="truncate">Histori Berita Acara</span>
              <span className="rounded-full bg-[#E0ECFB] px-2 py-0.5 text-[8.5px] text-[#0A477F]">
                {baGroups.length}
              </span>
            </button>
          </div>

          {/* MAIN CARD TABEL */}
          <section className="mt-3.5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <div className="p-4 pb-0 sm:p-5 sm:pb-0">
              {/* Header Navigasi Detail Histori */}
              {activeTab === 'history' && selectedBa && (
                <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBaKey(null)
                      setPage(1)
                    }}
                    className="flex h-[32px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-[10px] font-bold text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    <ChevronLeft size={13} /> Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => openHistoryPreview(selectedBa.id)}
                    className="flex h-[32px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-[10px] font-bold text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    <Eye size={13} /> Lihat Draft
                  </button>
                </div>
              )}

              <h3 className="text-[13.5px] font-bold text-[#0F172A]">
                {activeTab === 'active' ? (
                  <>
                    Daftar Mahasiswa {selectedProdi?.kode || ''} •{' '}
                    {prodiStudents.length === 0 ? (
                      <span className="font-normal text-[#94A3B8]">Belum Aktif</span>
                    ) : (
                      <span>{effectiveEvent?.nama_event || 'Periode Aktif'}</span>
                    )}
                  </>
                ) : selectedBa ? (
                  `Histori Berita Acara Yudisium - ${selectedBa.eventNama}`
                ) : (
                  'Histori Berita Acara Yudisium'
                )}
              </h3>
              {activeTab === 'history' && (
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-[#64748B]">
                  Berita acara yudisium yang sudah dikirim ke Kaprodi tampil di sini. Mahasiswa di
                  dalam histori ini tidak dapat diajukan kembali.
                </p>
              )}

              {/* SEARCH & FILTER BAR */}
              <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full sm:w-[270px] md:w-[310px]">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder={
                      showingGroups
                        ? 'Cari Nama Periode, Nama Mahasiswa, / NIM...'
                        : 'Cari Nama / NIM...'
                    }
                    className="h-[36px] w-full rounded-xl border border-[#CBD5E1] bg-white pl-8 pr-3 text-[10.5px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#0A477F]"
                  />
                </div>

                {!showingGroups && (
                  <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
                    <div className="relative w-full sm:w-[160px]">
                      <select
                        value={filterAtribut}
                        onChange={(e) => {
                          setFilterAtribut(e.target.value)
                          setPage(1)
                        }}
                        className="h-[36px] w-full appearance-none rounded-xl border border-[#CBD5E1] bg-white px-3 pr-8 text-[10.5px] text-[#475569] outline-none focus:border-[#0A477F]"
                      >
                        <option value="">Status Atribut</option>
                        <option value="LENGKAP">LENGKAP</option>
                        <option value="BELUM LENGKAP">BELUM LENGKAP</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />
                    </div>
                    <div className="relative w-full sm:w-[190px]">
                      <select
                        value={filterKonfirmasi}
                        onChange={(e) => {
                          setFilterKonfirmasi(e.target.value)
                          setPage(1)
                        }}
                        className="h-[36px] w-full appearance-none rounded-xl border border-[#CBD5E1] bg-white px-3 pr-8 text-[10.5px] text-[#475569] outline-none focus:border-[#0A477F]"
                      >
                        <option value="">Status Konfirmasi</option>
                        <option value="TERKONFIRMASI">TERKONFIRMASI</option>
                        <option value="MENUNGGU KONFIRMASI">MENUNGGU KONFIRMASI</option>
                        <option value="PERLU REVISI">PERLU REVISI</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KONTEN TABEL ATAU EMPTY STATE */}
            <div className="mt-4 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#64748B]">
                  <Loader2 size={15} className="animate-spin" /> Memuat data...
                </div>
              ) : activeTab === 'active' && prodiStudents.length === 0 ? (
                <EmptyStateCard
                  title="Belum Ada Mahasiswa Siap Diproses"
                  description="Pengajuan mahasiswa harus diperiksa dan diverifikasi terlebih dahulu. Data akan muncul otomatis setelah Staf Akademik menyelesaikan pemeriksaan."
                  buttonLabel="Ke Halaman Pengajuan Yudisium"
                  onAction={() => navigate('/admin/pengajuan-yudisium')}
                />
              ) : showingGroups && baGroups.length === 0 ? (
                <EmptyStateCard
                  title="Belum Ada Histori Berita Acara"
                  description="Belum ada dokumen Berita Acara yang selesai disahkan dan dikirimkan ke Kaprodi pada periode sebelumnya."
                />
              ) : showingGroups ? (
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className={thCls}>NO</th>
                      <th className={thCls}>NAMA PERIODE</th>
                      <th className={thCls}>TANGGAL YUDISIUM</th>
                      <th className={thCls}>JUMLAH LULUSAN</th>
                      <th className={`${thCls} text-center`}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {slice(
                      baGroups.filter((g) => {
                        const q = search.toLowerCase().trim()
                        if (!q) return true
                        return (
                          g.eventNama.toLowerCase().includes(q) ||
                          g.prodiNama.toLowerCase().includes(q) ||
                          g.students.some(
                            (s) =>
                              s.nama.toLowerCase().includes(q) ||
                              String(s.nim).toLowerCase().includes(q)
                          )
                        )
                      })
                    ).map((g, idx) => (
                      <tr key={g.key} className="hover:bg-[#F8FAFC]">
                        <td className="whitespace-nowrap px-4 py-3.5 text-[10.5px] text-[#64748B] sm:px-5">
                          {String((safePage - 1) * PAGE_SIZE + idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5 sm:px-5">
                          <p className="text-[11.5px] font-bold text-[#0F172A]">{g.eventNama}</p>
                          <p className="mt-0.5 text-[9px] text-[#64748B]">
                            {g.eventPeriode || g.prodiNama}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[10.5px] text-[#0F172A] sm:px-5">
                          {g.tanggalYudisium}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[10.5px] text-[#0F172A] sm:px-5">
                          {g.students.length} Mahasiswa
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center sm:px-5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBaKey(g.key)
                              setPage(1)
                            }}
                            className="inline-flex h-[28px] items-center gap-1.5 rounded-lg bg-[#0A477F] px-3.5 text-[9.5px] font-bold text-white hover:bg-[#083866]"
                          >
                            <Eye size={11} /> Lihat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className={thCls}>NO</th>
                      <th className={thCls}>MAHASISWA</th>
                      <th className={thCls}>PREDIKAT KELULUSAN</th>
                      <th className={thCls}>STATUS ATRIBUT</th>
                      <th className={thCls}>STATUS KONFIRMASI</th>
                      <th className={thCls}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {slice(filteredStudents).map((st, idx) => {
                      const attrStatus = statusAtribut(st, localDrafts)
                      const konfStatus = statusKonfirmasi(st)
                      const predikat = getPredikatKelulusan(st, localDrafts)
                      const isRev = konfStatus === 'PERLU REVISI'
                      const isIncomplete = attrStatus === 'BELUM LENGKAP'

                      return (
                        <tr key={st.id} className="hover:bg-[#F8FAFC]">
                          <td className="whitespace-nowrap px-4 py-3 text-[10.5px] text-[#64748B] sm:px-5">
                            {String((safePage - 1) * PAGE_SIZE + idx + 1).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E0ECFB] text-[9.5px] font-bold text-[#0A477F]">
                                {st.nama
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-bold text-[#0F172A]">
                                  {st.nama}
                                </p>
                                <p className="text-[8.5px] text-[#64748B]">{st.nim}</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[10.5px] font-medium text-[#334155] sm:px-5">
                            {predikat}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                            <StatusBadgeAtribut status={attrStatus} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                            <StatusBadgeKonfirmasi status={konfStatus} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                            <button
                              type="button"
                              onClick={() => setEditingStudent(st)}
                              className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 text-[9.5px] font-bold text-[#334155] transition hover:bg-[#F1F5F9]"
                            >
                              <FileText size={11} className="text-[#0A477F]" />
                              {isRev
                                ? 'Perbaiki Berita Acara'
                                : isIncomplete
                                ? 'Isi Berita Acara'
                                : 'Lihat Berita Acara'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-[11px] text-[#94A3B8]">
                          Tidak ada mahasiswa yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION FOOTER */}
            {(showingGroups ? baGroups.length > 0 : prodiStudents.length > 0 || activeTab === 'history') && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-4 py-3.5 sm:px-5">
                <p className="text-[10.5px] text-[#64748B]">
                  {showingGroups
                    ? `Menampilkan ${baGroups.length} periode`
                    : `Menampilkan ${filteredStudents.length} mahasiswa`}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] disabled:opacity-40"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#0A477F] bg-[#E0ECFB] px-1.5 text-[10.5px] font-bold text-[#0A477F]">
                    {safePage}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] disabled:opacity-40"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* BOTTOM ACTION BAR (SESUAI DESAIN STATE 2) */}
          {activeTab === 'active' && prodiStudents.length > 0 && (
            <section className="mt-4 flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs lg:flex-row lg:items-center">
              <div className="flex items-start gap-2.5 text-[10.5px] leading-relaxed text-[#475569] lg:max-w-[360px]">
                <CheckCircle2
                  size={16}
                  className={`mt-0.5 shrink-0 ${
                    allAtributLengkap ? 'text-[#137333]' : 'text-[#94A3B8]'
                  }`}
                />
                <span>
                  {targets.ajukan.length === prodiStudents.length && prodiStudents.length > 0
                    ? `Seluruh mahasiswa ${selectedProdi?.kode || ''} telah mengonfirmasi draf. Siap diteruskan ke Kaprodi!`
                    : 'Lengkapi seluruh atribut mahasiswa agar draft Berita Acara ter-generate otomatis.'}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                <button
                  type="button"
                  disabled={!allAtributLengkap}
                  onClick={openActiveDraftPreview}
                  className={outlineBtn}
                >
                  Lihat Draft <Eye size={13} />
                </button>

                <button
                  type="button"
                  disabled={targets.send.length === 0}
                  onClick={() => setConfirm('send')}
                  className={outlineBtn}
                >
                  Kirim Draft ke Mahasiswa <Send size={13} />
                </button>

                <button
                  type="button"
                  disabled={targets.ajukan.length === 0}
                  onClick={() => setConfirm('ajukan')}
                  className="flex h-[36px] items-center justify-center gap-2 rounded-xl bg-[#0A477F] px-5 text-[10.5px] font-bold text-white transition hover:bg-[#083866] disabled:cursor-not-allowed disabled:bg-[#94A3B8] disabled:opacity-70"
                >
                  Kirim ke Kaprodi <ArrowRight size={13} />
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL ISI / LIHAT / PERBAIKI BERITA ACARA MAHASISWA */}
      {editingStudent && (
        <StudentBeritaAcaraModal
          student={editingStudent}
          initialDraft={localDrafts[editingStudent.id] || extractStudentDraft(editingStudent)}
          saving={savingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={handleSaveStudentDraft}
          onOpenDocument={handleOpenDocument}
        />
      )}

      {/* MODAL KONFIRMASI KIRIM DRAF KE MAHASISWA */}
      {confirm === 'send' && (
        <SendDraftModal
          prodiKode={selectedProdi?.kode}
          periodeLabel={effectiveEvent?.nama_event || '-'}
          rows={targets.send}
          busy={busy}
          onClose={() => setConfirm(null)}
          onConfirm={handleBulkSend}
        />
      )}

      {/* MODAL KONFIRMASI CHECKLIST AKHIR */}
      {confirm === 'checklist' && (
        <ConfirmActionModal
          icon={ListChecks}
          tone="blue"
          title="Lakukan Checklist Akhir?"
          description="Mahasiswa berikut sudah mengonfirmasi data. Setelah checklist akhir, mereka siap diajukan ke Berita Acara."
          rows={targets.checklist}
          confirmLabel="Ya, Checklist Sekarang"
          busy={busy}
          onClose={() => setConfirm(null)}
          onConfirm={handleBulkChecklist}
        />
      )}

      {/* MODAL KONFIRMASI KIRIM KE KAPRODI */}
      {confirm === 'ajukan' && (
        <ConfirmActionModal
          icon={ArrowRight}
          tone="green"
          title={`Kirim Berita Acara ${selectedProdi?.kode || ''} ke Kaprodi?`}
          description={`Berita Acara dibuat untuk ${effectiveEvent?.nama_event || '-'}${
            nomorSurat ? ` dengan nomor ${nomorSurat}` : ''
          }. Mahasiswa di bawah ini akan dimasukkan ke dokumen resmi dan dipindahkan ke tab Histori.`}
          rows={targets.ajukan}
          confirmLabel="Ya, Kirim ke Kaprodi"
          busy={busy}
          onClose={() => setConfirm(null)}
          onConfirm={handleAjukan}
        />
      )}

      {/* MODAL HASIL PENGIRIMAN */}
      {results && <ResultModal {...results} onClose={() => setResults(null)} />}

      {/* MODAL DOKUMEN DRAFT BERITA ACARA YUDISIUM */}
      {preview && (
        <DraftPreviewModal
          title={preview.title}
          html={preview.html}
          loading={preview.loading}
          error={preview.error}
          draftDocData={preview.draftDocData}
          downloading={downloading}
          onDownload={preview.baId ? () => handleDownload(preview.baId) : null}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}