import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserRound,
  FileText,
  FileSearch,
  Search,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  MinusCircle,
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  Inbox,
  X,
  LogOut,
  AlertCircle,
  Lock,
  Check,
  Loader2,
  RotateCw,
  Save,
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import { getUser, logout } from '../../services/auth'
import { errorMessage, fileUrl } from '../../services/api'
import {
  listPengajuanStaf,
  getPengajuanStaf,
  savePenilaian,
  kirimKonfirmasi,
  checklistAkhir,
  listProgramStudi,
  listEvents,
  listForms,
  createEvent,
  updateEvent,
} from '../../services/adminApi'
import {
  normalizePengajuan,
  normalizeProdi,
  statusMeta,
  isActiveStatus,
  formatDate,
  STATUS_META,
} from '../../services/normalize'

const PAGE_SIZE = 10

/* =========================================================
   KONFIGURASI DATA PENILAIAN (9 field, sesuai API)
========================================================= */
const PENILAIAN_FIELDS = [
  { key: 'ipk', label: 'IPK', type: 'number', step: '0.01', placeholder: '3.75' },
  { key: 'persen_nilai_d', label: 'Persentase Nilai D (%)', type: 'number', step: '0.01', placeholder: '0' },
  { key: 'sks_ditempuh', label: 'SKS Ditempuh', type: 'number', step: '1', placeholder: '144' },
  { key: 'similarity_index', label: 'Similarity Index (%)', type: 'number', step: '0.01', placeholder: '18.5' },
  { key: 'skor_bahasa_inggris', label: 'Skor Bahasa Inggris', type: 'number', step: '1', placeholder: '500' },
  { key: 'sertifikat_level', label: 'Level Sertifikat', type: 'text', placeholder: 'Internasional' },
  {
    key: 'status_judul_pa',
    label: 'Status Judul PA',
    type: 'select',
    options: [
      ['disetujui', 'Disetujui'],
      ['tidak_disetujui', 'Tidak disetujui'],
    ],
  },
  { key: 'sertifikat_kompetensi', label: 'Sertifikat Kompetensi', type: 'text', placeholder: 'BNSP Junior Web Developer' },
  { key: 'status_bebas_pelanggaran', label: 'Bebas Pelanggaran Etik', type: 'boolean' },
]

const EMPTY_PENILAIAN = {
  ipk: '',
  persen_nilai_d: '',
  sks_ditempuh: '',
  similarity_index: '',
  skor_bahasa_inggris: '',
  sertifikat_level: '',
  status_judul_pa: '',
  sertifikat_kompetensi: '',
  status_bebas_pelanggaran: false,
}

const PENILAIAN_EDITABLE = ['submitted', 'checking_akademik', 'student_revision_requested']
// Status 'waiting_student_confirmation' ikut diizinkan untuk mengirim ulang konfirmasi
const CAN_SEND_CONFIRMATION = [
  'submitted',
  'checking_akademik',
  'student_revision_requested',
  'waiting_student_confirmation',
]

// Identitas & dokumen mahasiswa hanya dibaca staf: BE belum punya endpoint untuk mengubahnya
// (hanya data penilaian yang bisa disimpan lewat PUT /staf-akademik/pengajuan/{id}/penilaian).
const IDENTITY_EDITABLE = false

function penilaianFromRaw(raw = {}) {
  const src = raw.penilaian ?? raw.data_penilaian ?? raw.penilaian_yudisium ?? raw
  const out = { ...EMPTY_PENILAIAN }
  PENILAIAN_FIELDS.forEach(({ key, type }) => {
    const v = src?.[key]
    if (v === undefined || v === null) return
    out[key] = type === 'boolean' ? Boolean(v) : String(v)
  })
  return out
}

function penilaianPayload(form) {
  const body = {}
  PENILAIAN_FIELDS.forEach(({ key, type }) => {
    const v = form[key]
    if (type === 'boolean') body[key] = Boolean(v)
    else if (type === 'number') body[key] = v === '' ? null : Number(v)
    else body[key] = v === '' ? null : v
  })
  return body
}

/* =========================================================
   HELPER FORMAT TANGGAL & WAKTU (SESUAI DESAIN)
========================================================= */
function formatIndoDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatIndoShortDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function toDateInput(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toTimeInput(value, fallback = '23:59') {
  if (!value) return fallback
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function combineDateTime(dateStr, timeStr = '00:00') {
  if (!dateStr) return null
  const cleanTime = timeStr && /^\d{2}:\d{2}/.test(timeStr) ? timeStr.slice(0, 5) : '00:00'
  const dt = new Date(`${dateStr}T${cleanTime}:00`)
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString()
}

/* =========================================================
   EKSTRAKSI DETAIL PENGAJUAN
========================================================= */
const DOC_KEYS = ['dokumen', 'documents', 'berkas', 'uploads', 'files', 'attachments']
const ANSWER_KEYS = ['jawaban', 'answers', 'field_values', 'values', 'data_form', 'form_data', 'responses', 'isian']

function toItems(raw, keys) {
  for (const k of keys) {
    const v = raw?.[k]
    if (Array.isArray(v)) return v
    if (v && typeof v === 'object') {
      return Object.entries(v).map(([label, value]) => ({ label, value }))
    }
  }
  return []
}

function normalizeItem(it, idx) {
  if (it === null || typeof it !== 'object') return { key: idx, label: `Isian ${idx + 1}`, value: it, file: '' }
  const field = it.field || it.form_field || {}
  const upload = it.upload || it.file || {}
  const fileRaw =
    it.file_url ?? it.url ?? it.path ?? it.file_path ?? upload.url ?? upload.path ?? upload.file_path ?? ''
  const type = field.data_type ?? it.data_type ?? ''
  const valueRaw = it.value ?? it.nilai ?? it.jawaban ?? it.answer ?? it.text ?? null
  const file =
    fileRaw ||
    (['pdf', 'image', 'file'].includes(String(type).toLowerCase()) && typeof valueRaw === 'string' ? valueRaw : '')
  return {
    key: it.id ?? idx,
    label: field.field_name ?? it.field_name ?? it.label ?? it.nama ?? it.title ?? `Isian ${idx + 1}`,
    value: valueRaw,
    file: typeof file === 'string' ? file : '',
    fileName: it.original_name ?? it.file_name ?? upload.original_name ?? upload.file_name ?? '',
    fileSize: it.file_size ?? upload.file_size ?? '',
    badgeNote: field.note ?? it.badge_note ?? it.keterangan ?? '',
    type,
    required: field.is_required ?? it.is_required,
  }
}

function extractDetail(raw = {}) {
  const user = raw.user || raw.mahasiswa || {}
  const items = [...toItems(raw, ANSWER_KEYS), ...toItems(raw, DOC_KEYS)].map(normalizeItem)
  const seen = new Set()
  const unique = items.filter((it) => {
    const id = `${it.label}|${it.file}|${String(it.value)}`
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  const isDoc = (it) => Boolean(it.file) || ['pdf', 'image', 'file'].includes(String(it.type).toLowerCase())
  return {
    whatsapp: raw.whatsapp ?? raw.no_wa ?? raw.no_hp ?? user.whatsapp ?? user.no_wa ?? '',
    ttl: raw.ttl ?? raw.tempat_tanggal_lahir ?? user.ttl ?? '',
    dosenPembimbing: raw.dosen_pembimbing ?? raw.dospem ?? user.dosen_pembimbing ?? '',
    predikat: raw.predikat_kelulusan ?? raw.predikat ?? '',
    videoLink: raw.tautan_video ?? raw.link_video ?? raw.video_presentasi ?? '',
    documents: unique.filter(isDoc),
    answers: unique.filter((it) => !isDoc(it)),
    penilaian: penilaianFromRaw(raw),
  }
}

function resolvePredikat(student) {
  if (!student) return 'Belum Ditentukan'
  if (student.predikat) return student.predikat
  const ipk = Number(student.ipk ?? student.penilaian?.ipk)
  if (!Number.isNaN(ipk) && ipk > 0) {
    return ipk >= 3.51 ? 'Cumlaude' : 'Tidak Cumlaude'
  }
  return isActiveStatus(student.status) ? 'Belum Ditentukan' : 'Cumlaude'
}

/* =========================================================
   PROFILE AVATAR & DROPDOWN
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
          <UserRound size={16} strokeWidth={1.8} className="text-[#0A477F]" />
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
          <LogOut size={16} strokeWidth={2} className="text-[#DC2626]" />
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
   STATUS BADGE
========================================================= */
function StatusBadge({ status }) {
  const meta = statusMeta(status)
  const rawLower = String(status || '').toLowerCase()

  if (rawLower === 'submitted') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-[#475569]">
        <Clock3 size={11} className="text-[#64748B]" /> SUBMITTED
      </span>
    )
  }

  if (rawLower === 'student_revision_requested' || rawLower === 'dikembalikan') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FCA5A5] bg-[#FEF2F2] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-[#DC2626]">
        <RotateCw size={11} className="text-[#DC2626]" /> DIKEMBALIKAN
      </span>
    )
  }

  if (rawLower === 'checking_akademik' || rawLower === 'perbaikan_masuk') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-[#D97706]">
        <AlertCircle size={11} className="text-[#D97706]" /> PERBAIKAN MASUK
      </span>
    )
  }

  if (rawLower === 'final_checked_akademik' || rawLower === 'confirmed_by_student' || meta.tone === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-[#059669]">
        <CheckCircle2 size={11} className="text-[#059669]" /> TERVERIFIKASI
      </span>
    )
  }

  const tones = {
    warning: 'border border-[#FCD34D] bg-[#FFFBEB] text-[#D97706]',
    info: 'border border-[#BFD7F2] bg-[#EEF4FF] text-[#0A477F]',
    neutral: 'border border-[#D7DCE3] bg-white text-[#4B5563]',
  }
  const Icon = meta.tone === 'warning' ? AlertCircle : Clock3
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide ${
        tones[meta.tone] || tones.neutral
      }`}
    >
      <Icon size={11} /> {meta.label}
    </span>
  )
}

/* =========================================================
   EMPTY STATE
========================================================= */
function EmptyTableState({ title, description, onReload, reloading }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2F6] text-[#94A3B8]">
        <FileSearch size={30} strokeWidth={1.75} />
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[11px] font-extrabold text-[#0F172A] shadow-xs">
          !
        </span>
      </div>
      <h4 className="mt-4 text-[14px] font-bold text-[#0F172A]">{title}</h4>
      <p className="mt-1 max-w-[360px] text-[11px] leading-relaxed text-[#64748B]">{description}</p>
      <button
        type="button"
        disabled={reloading}
        onClick={onReload}
        className="mt-4 inline-flex h-[34px] items-center gap-2 rounded-xl bg-[#E8EEF9] px-5 text-[10.5px] font-bold text-[#0A477F] transition hover:bg-[#DCE6F7] disabled:opacity-60"
      >
        <RotateCw size={12} className={reloading ? 'animate-spin' : ''} /> Muat Ulang Data
      </button>
    </div>
  )
}

/* =========================================================
   FILTER SELECT
========================================================= */
function FilterSelect({ value, onChange, children, width = 'w-full sm:w-[140px]' }) {
  return (
    <div className={`relative ${width}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[36px] w-full appearance-none rounded-xl border border-[#CBD5E1] bg-white px-3 pr-8 text-[11px] text-[#475569] outline-none focus:border-[#0A477F]"
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
    </div>
  )
}

/* =========================================================
   DOCUMENT CARD
========================================================= */
function DocumentCard({ document, index, editMode, replacementFile, onSelectFile }) {
  const fileInputRef = useRef(null)
  const href = fileUrl(document.file)
  const no = String(index + 1).padStart(2, '0')
  const hasFile = Boolean(document.file) || Boolean(replacementFile)
  const fileName = replacementFile
    ? replacementFile.name
    : document.fileName || (document.file ? decodeURIComponent(document.file.split('/').pop() || 'berkas') : '')

  return (
    <div className="flex min-h-[136px] flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
            hasFile ? 'bg-[#E0ECFB] text-[#0A477F]' : 'bg-[#E2E8F0] text-[#475569]'
          }`}
        >
          {no}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold leading-4 text-[#1E293B]">{document.label}</p>
          {document.badgeNote && (
            <span className="mt-1 inline-block rounded-md bg-[#FEF3C7] px-1.5 py-0.5 text-[8.5px] font-semibold text-[#B45309]">
              {document.badgeNote}
            </span>
          )}
        </div>
      </div>

      {hasFile ? (
        <div className="my-2.5 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white p-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#FEE2E2] text-[#EF4444]">
            <FileText size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-bold text-[#334155]">{fileName}</p>
            {document.fileSize && <p className="text-[8px] text-[#94A3B8]">{document.fileSize}</p>}
          </div>
        </div>
      ) : (
        <div className="my-2.5 flex items-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-white p-2">
          <MinusCircle size={14} className="shrink-0 text-[#94A3B8]" />
          <p className="text-[8.5px] font-semibold text-[#64748B]">Tidak Berlaku / Belum diunggah</p>
        </div>
      )}

      {editMode ? (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onSelectFile?.(document.key, f)
            }}
          />
          {document.file ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-[#CBD5E1] bg-white text-[9.5px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
            >
              <Eye size={11} /> Lihat
            </a>
          ) : (
            <span className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] text-[9.5px] font-bold text-[#94A3B8]">
              <Eye size={11} /> Lihat
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg bg-[#0A477F] text-[9.5px] font-bold text-white hover:bg-[#083866]"
          >
            <Upload size={11} /> Ganti Berkas
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          {document.file ? (
            <>
              <a
                href={href}
                download
                target="_blank"
                rel="noreferrer"
                className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg bg-[#0A477F] text-[9.5px] font-bold text-white hover:bg-[#083866]"
              >
                <Download size={11} /> Unduh
              </a>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-[#CBD5E1] bg-white text-[9.5px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
              >
                <Eye size={11} /> Lihat
              </a>
            </>
          ) : (
            <>
              <span className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg bg-[#CBD5E1] text-[9.5px] font-bold text-white">
                <Download size={11} /> Unduh
              </span>
              <span className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white text-[9.5px] font-bold text-[#94A3B8]">
                <Eye size={11} /> Lihat
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   POPOUT DETAIL MAHASISWA (MODE: 'periksa' | 'edit' | 'lihat')
========================================================= */
function StudentDetailView({ studentId, initialMode = 'periksa', onClose, onChanged }) {
  const [mode, setMode] = useState(initialMode)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState('')
  const [raw, setRaw] = useState(null)
  const [form, setForm] = useState(EMPTY_PENILAIAN)
  const [identityDraft, setIdentityDraft] = useState({
    nama: '',
    nim: '',
    whatsapp: '',
    ttl: '',
    dosenPembimbing: '',
    predikat: '',
    videoLink: '',
  })
  const [replacedFiles, setReplacedFiles] = useState({})
  const [showRaw, setShowRaw] = useState(false)

  const applyDetail = useCallback((data) => {
    setRaw(data)
    const norm = normalizePengajuan(data)
    const det = extractDetail(data)
    setForm(det.penilaian)
    setIdentityDraft({
      nama: norm.nama || '',
      nim: norm.nim || '',
      whatsapp: det.whatsapp || '',
      ttl: det.ttl || '',
      dosenPembimbing: det.dosenPembimbing || '',
      predikat: det.predikat || '',
      videoLink: det.videoLink || '',
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    getPengajuanStaf(studentId)
      .then((data) => {
        if (!cancelled) applyDetail(data)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, 'Gagal memuat detail pengajuan'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [studentId, applyDetail])

  const student = raw ? normalizePengajuan(raw) : null
  const detail = raw ? extractDetail(raw) : null
  const status = student?.status
  const isEdit = mode === 'edit'
  const isPeriksa = mode === 'periksa'
  const editable = PENILAIAN_EDITABLE.includes(status)

  const reload = async () => {
    const fresh = await getPengajuanStaf(studentId)
    applyDetail(fresh)
    onChanged()
  }

  const run = async (name, action, successText) => {
    setBusy(name)
    setNotice(null)
    try {
      await action()
      await reload()
      setNotice({ type: 'success', text: successText })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'Aksi gagal diproses') })
    } finally {
      setBusy('')
    }
  }

  const handleSaveEdit = () =>
    run(
      'save',
      () => savePenilaian(studentId, penilaianPayload(form)),
      'Perubahan data penilaian berhasil disimpan.'
    )

  const handleVerifyAndSend = () =>
    run(
      'verify',
      async () => {
        if (PENILAIAN_EDITABLE.includes(status)) {
          await savePenilaian(studentId, penilaianPayload(form))
        }
        if (status === 'confirmed_by_student') {
          await checklistAkhir(studentId)
        } else if (CAN_SEND_CONFIRMATION.includes(status)) {
          await kirimKonfirmasi(studentId)
        }
      },
      status === 'confirmed_by_student'
        ? 'Checklist akhir selesai. Mahasiswa berhasil diverifikasi.'
        : 'Data dinyatakan benar dan konfirmasi verifikasi telah dikirim.'
    )

  const inputCls =
    'h-[36px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-[11px] text-[#1E293B] outline-none focus:border-[#0A477F] disabled:bg-[#F8FAFC] disabled:text-[#334155]'
  const labelCls = 'mb-1 block text-[8.5px] font-bold uppercase tracking-wider text-[#64748B]'
  const readCls =
    'flex min-h-[36px] items-center rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-[11px] text-[#1E293B] break-words'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0F172A]/70 p-3 sm:p-6">
      <div className="relative my-auto max-h-[92vh] w-full max-w-[1040px] overflow-y-auto rounded-2xl bg-[#F8FAFC] shadow-2xl">
        <div className="p-4 sm:p-6">
          {/* TOP BAR MODAL */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-[11px] font-semibold text-[#475569] shadow-xs hover:bg-[#F1F5F9]"
            >
              <ChevronLeft size={14} /> Kembali
            </button>
            <div className="flex items-center gap-2">
              {status && <StatusBadge status={status} />}
              <button
                type="button"
                onClick={onClose}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 py-16 text-[12px] text-[#64748B]">
              <Loader2 size={16} className="animate-spin" /> Memuat detail pengajuan...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[11px] text-rose-700">{error}</div>
          )}

          {student && detail && (
            <>
              {notice && (
                <div
                  className={`mt-4 flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-[11px] font-medium ${
                    notice.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  <span>{notice.text}</span>
                  <button onClick={() => setNotice(null)} className="shrink-0">
                    <X size={13} />
                  </button>
                </div>
              )}

              {status === 'student_revision_requested' && student.catatanKoreksi && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[11px] text-amber-900">
                  <p className="font-bold">Mahasiswa melaporkan data salah:</p>
                  <p className="mt-1 whitespace-pre-line">{student.catatanKoreksi}</p>
                  <p className="mt-2 text-[10px] text-amber-700">
                    Koreksi data penilaian di bawah, simpan, lalu kirim ulang konfirmasi ke mahasiswa.
                  </p>
                </div>
              )}

              {status === 'checking_akademik' && student.catatanInternal && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[11px] text-rose-900">
                  <p className="font-bold">Dikembalikan oleh pejabat pengesah:</p>
                  <p className="mt-1 whitespace-pre-line">{student.catatanInternal}</p>
                </div>
              )}

              {/* IDENTITAS MAHASISWA */}
              <section className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
                <div className="flex h-[44px] items-center gap-2 border-b border-[#E2E8F0] bg-[#EEF4FF] px-4 sm:px-5">
                  <UserRound size={16} className="text-[#0A477F]" />
                  <h3 className="text-[14px] font-bold text-[#0A477F]">Identitas Mahasiswa</h3>
                </div>
                <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
                  <div>
                    <label className={labelCls}>NAMA LENGKAP</label>
                    {IDENTITY_EDITABLE ? (
                      <input
                        type="text"
                        value={identityDraft.nama}
                        onChange={(e) => setIdentityDraft({ ...identityDraft, nama: e.target.value })}
                        className={inputCls}
                      />
                    ) : (
                      <div className={readCls}>{student.nama}</div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>NIM</label>
                    {IDENTITY_EDITABLE ? (
                      <input
                        type="text"
                        value={identityDraft.nim}
                        onChange={(e) => setIdentityDraft({ ...identityDraft, nim: e.target.value })}
                        className={inputCls}
                      />
                    ) : (
                      <div className={readCls}>{student.nim}</div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>NO. WA</label>
                    {IDENTITY_EDITABLE ? (
                      <input
                        type="text"
                        value={identityDraft.whatsapp}
                        onChange={(e) => setIdentityDraft({ ...identityDraft, whatsapp: e.target.value })}
                        className={inputCls}
                      />
                    ) : (
                      <div className={readCls}>{detail.whatsapp || '-'}</div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>TEMPAT/TANGGAL LAHIR</label>
                    {IDENTITY_EDITABLE ? (
                      <input
                        type="text"
                        value={identityDraft.ttl}
                        onChange={(e) => setIdentityDraft({ ...identityDraft, ttl: e.target.value })}
                        className={inputCls}
                      />
                    ) : (
                      <div className={readCls}>
                        {detail.ttl || `${student.prodiNama} • ${formatDate(student.submittedAt, true)}`}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>DOSEN PEMBIMBING</label>
                    {IDENTITY_EDITABLE ? (
                      <input
                        type="text"
                        value={identityDraft.dosenPembimbing}
                        onChange={(e) => setIdentityDraft({ ...identityDraft, dosenPembimbing: e.target.value })}
                        className={inputCls}
                      />
                    ) : (
                      <div className={readCls}>{detail.dosenPembimbing || student.email || '-'}</div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>PREDIKAT KELULUSAN</label>
                    {IDENTITY_EDITABLE ? (
                      <input
                        type="text"
                        value={identityDraft.predikat}
                        placeholder="Ketikkan Predikat Kelulusan..."
                        onChange={(e) => setIdentityDraft({ ...identityDraft, predikat: e.target.value })}
                        className={inputCls}
                      />
                    ) : (
                      <div className={readCls}>{detail.predikat || resolvePredikat(student)}</div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>TAUTAN (LINK) VIDEO PRESENTASI TUGAS AKHIR</label>
                    {IDENTITY_EDITABLE ? (
                      <textarea
                        rows={2}
                        value={identityDraft.videoLink}
                        onChange={(e) => setIdentityDraft({ ...identityDraft, videoLink: e.target.value })}
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-[11px] text-[#1E293B] outline-none focus:border-[#0A477F]"
                      />
                    ) : (
                      <div className="min-h-[48px] rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] text-[#1E293B] break-all">
                        {detail.videoLink || '-'}
                      </div>
                    )}
                  </div>

                  {detail.answers.map((a) => (
                    <div key={a.key}>
                      <label className={labelCls}>{a.label}</label>
                      <div className={readCls}>
                        {a.value === null || a.value === ''
                          ? '-'
                          : typeof a.value === 'object'
                          ? JSON.stringify(a.value)
                          : String(a.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* DOKUMEN PERSYARATAN */}
              <section className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
                <div className="flex h-[44px] items-center gap-2 border-b border-[#E2E8F0] bg-[#EEF4FF] px-4 sm:px-5">
                  <FileText size={16} className="text-[#0A477F]" />
                  <h3 className="text-[14px] font-bold text-[#0A477F]">Dokumen Persyaratan</h3>
                </div>
                <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                  {detail.documents.map((doc, idx) => (
                    <DocumentCard
                      key={doc.key}
                      document={doc}
                      index={idx}
                      editMode={IDENTITY_EDITABLE}
                      replacementFile={replacedFiles[doc.key]}
                      onSelectFile={(key, file) => setReplacedFiles((prev) => ({ ...prev, [key]: file }))}
                    />
                  ))}
                  {detail.documents.length === 0 && (
                    <p className="col-span-full text-[11px] text-[#64748B]">
                      Tidak ada dokumen yang terbaca dari response server.
                    </p>
                  )}
                </div>
              </section>

              {/* DATA PENILAIAN YUDISIUM */}
              <section className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
                <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#EEF4FF] px-4 py-2 sm:px-5">
                  <div className="flex items-center gap-2">
                    <Pencil size={15} className="text-[#0A477F]" />
                    <h3 className="text-[14px] font-bold text-[#0A477F]">Data Penilaian Yudisium</h3>
                  </div>
                  {!editable && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#64748B]">
                      <Lock size={11} /> Terkunci pada status ini
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3">
                  {PENILAIAN_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      {f.type === 'boolean' ? (
                        <label className="flex h-[36px] cursor-pointer items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-3 text-[11px] text-[#334155]">
                          <input
                            type="checkbox"
                            disabled={!editable}
                            checked={Boolean(form[f.key])}
                            onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                            className="h-3.5 w-3.5 accent-[#0A477F]"
                          />
                          {form[f.key] ? 'Bebas pelanggaran' : 'Tidak bebas pelanggaran'}
                        </label>
                      ) : f.type === 'select' ? (
                        <select
                          disabled={!editable}
                          value={form[f.key]}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className={inputCls}
                        >
                          <option value="">Pilih status...</option>
                          {f.options.map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          step={f.step}
                          disabled={!editable}
                          value={form[f.key]}
                          placeholder={f.placeholder}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className={inputCls}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* FOOTER AKSI SESUAI MODE */}
              {isEdit && (
                <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => (initialMode === 'edit' ? onClose() : setMode('periksa'))}
                    className="h-[36px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[11px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy) || !editable}
                    onClick={handleSaveEdit}
                    className="inline-flex h-[36px] items-center gap-2 rounded-xl bg-[#0A477F] px-5 text-[11px] font-bold text-white hover:bg-[#083866] disabled:opacity-60"
                  >
                    {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Simpan Perubahan
                  </button>
                </div>
              )}

              {isPeriksa && (
                <div className="mt-5 flex flex-col justify-end gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 text-[11px] font-bold text-[#334155] hover:bg-[#F1F5F9]"
                  >
                    <Pencil size={13} /> Masuk ke Menu Edit
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={handleVerifyAndSend}
                    className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] px-5 text-[11px] font-bold text-white hover:bg-[#083866] disabled:opacity-60"
                  >
                    {busy === 'verify' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Data Benar &amp; Verifikasi Yudisium
                  </button>
                </div>
              )}

              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => setShowRaw((v) => !v)}
                  className="text-[10px] font-semibold text-[#64748B] underline"
                >
                  {showRaw ? 'Sembunyikan data mentah' : 'Data mentah (JSON)'}
                </button>
                {showRaw && (
                  <pre className="mt-2 max-h-[240px] overflow-auto rounded-xl bg-[#0F172A] p-3 text-left text-[10px] leading-4 text-[#E2E8F0]">
                    {JSON.stringify(raw, null, 2)}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   PERIODE YUDISIUM
========================================================= */
const EMPTY_PERIOD = {
  form_id: '',
  nama_event: '',
  tgl_buka: '',
  tgl_tutup: '',
  batas_waktu: '23:59',
  tgl_yudisium: '',
}

function periodFromEvent(ev) {
  return {
    form_id: ev.form_id ?? ev.form?.id ?? '',
    nama_event: ev.nama_event || ev.periode || '',
    tgl_buka: toDateInput(ev.tgl_buka),
    tgl_tutup: toDateInput(ev.tgl_tutup),
    batas_waktu: toTimeInput(ev.tgl_tutup, '23:59'),
    tgl_yudisium: toDateInput(ev.tgl_yudisium),
  }
}

function PeriodSection({ events, forms, onReload }) {
  const [open, setOpen] = useState(true)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [now] = useState(() => Date.now())

  const current = useMemo(() => {
    if (!events || events.length === 0) return null
    return events.find((e) => e.is_active) || events[0]
  }, [events])

  const form = draft ?? (current ? periodFromEvent(current) : { ...EMPTY_PERIOD, form_id: forms[0]?.id ?? '' })
  const setForm = (next) => setDraft(next)

  const running =
    current?.is_active &&
    (!current.tgl_buka || new Date(current.tgl_buka).getTime() <= now) &&
    (!current.tgl_tutup || new Date(current.tgl_tutup).getTime() >= now)

  const isClosed = Boolean(current) && !current.is_active

  const isFormComplete =
    Boolean(form.nama_event?.trim()) &&
    Boolean(form.tgl_buka) &&
    Boolean(form.tgl_tutup) &&
    Boolean(form.batas_waktu) &&
    Boolean(form.tgl_yudisium)

  const buildBody = (activeFlag) => {
    const resolvedFormId = Number(form.form_id || current?.form_id || forms[0]?.id || 0)
    const nama = form.nama_event.trim()
    return {
      form_id: resolvedFormId,
      nama_event: nama,
      periode: nama,
      tgl_buka: combineDateTime(form.tgl_buka, '00:00'),
      tgl_tutup: combineDateTime(form.tgl_tutup, form.batas_waktu || '23:59'),
      tgl_yudisium: combineDateTime(form.tgl_yudisium, '09:00'),
      is_active: activeFlag,
    }
  }

  const handleOpenOrCreatePeriod = async () => {
    if (!isFormComplete) {
      return setNotice({ type: 'error', text: 'Semua field periode wajib diisi sebelum membuka periode.' })
    }
    if (!buildBody(true).form_id) {
      return setNotice({
        type: 'error',
        text: 'Belum ada form pengajuan. Minta Super Admin menambahkan field di menu Form Pengajuan terlebih dahulu.',
      })
    }
    setBusy(true)
    setNotice(null)
    try {
      if (!current) {
        await createEvent(buildBody(true))
      } else {
        await updateEvent(current.id, buildBody(true))
      }
      await onReload()
      setDraft(null)
      setNotice({ type: 'success', text: 'Periode yudisium berhasil dibuka.' })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'Gagal membuka periode') })
    } finally {
      setBusy(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!isFormComplete) {
      return setNotice({ type: 'error', text: 'Semua field periode wajib diisi.' })
    }
    setBusy(true)
    setNotice(null)
    try {
      await updateEvent(current.id, buildBody(Boolean(current.is_active)))
      await onReload()
      setDraft(null)
      setNotice({ type: 'success', text: 'Perubahan periode yudisium berhasil disimpan.' })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'Gagal menyimpan perubahan periode') })
    } finally {
      setBusy(false)
    }
  }

  const handleClosePeriod = async () => {
    setBusy(true)
    setNotice(null)
    try {
      await updateEvent(current.id, { is_active: false })
      await onReload()
      setDraft(null)
      setNotice({ type: 'success', text: 'Periode yudisium telah ditutup.' })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'Gagal menutup periode') })
    } finally {
      setBusy(false)
    }
  }

  const fieldCls =
    'h-[38px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[11px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#0A477F]'
  const labelCls = 'mb-1.5 flex items-center justify-between text-[10px] font-bold text-[#334155]'

  return (
    <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">Periode Yudisium</h3>
          {open ? (
            <p className="mt-0.5 text-[10.5px] text-[#64748B]">
              Atur jadwal pembukaan pendaftaran dan pelaksanaan sidang pleno yudisium.
            </p>
          ) : (
            current && (
              <p className="mt-0.5 text-[10.5px] text-[#64748B]">
                Pendaftaran: {formatIndoShortDate(current.tgl_buka)} – {formatIndoShortDate(current.tgl_tutup)} (
                {toTimeInput(current.tgl_tutup, '23:59')} WIB) • Tanggal Yudisium: {formatIndoShortDate(current.tgl_yudisium)}
              </p>
            )
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {!current ? (
            <span className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold text-[#475569]">
              Belum Ada Periode
            </span>
          ) : isClosed ? (
            <span className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold text-[#475569]">
              {current.nama_event || current.periode} Telah Ditutup
            </span>
          ) : running ? (
            <span className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-[10px] font-bold text-[#059669]">
              {current.nama_event || current.periode} Sedang Berjalan
            </span>
          ) : (
            <span className="rounded-lg border border-[#BFD7F2] bg-[#EEF4FF] px-3 py-1 text-[10px] font-bold text-[#0A477F]">
              {current.nama_event || current.periode} Aktif
            </span>
          )}

          {current && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label="Toggle periode"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9]"
            >
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4">
          {notice && (
            <div
              className={`mb-3 flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-[10.5px] font-medium ${
                notice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              <span>{notice.text}</span>
              <button onClick={() => setNotice(null)} className="shrink-0">
                <X size={12} />
              </button>
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className={labelCls}>
                <span>Nama Periode</span>
                <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={form.nama_event}
                onChange={(e) => setForm({ ...form, nama_event: e.target.value })}
                placeholder="Contoh: Periode Oktober 2026"
                className={fieldCls}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  <span>Tanggal Pendaftaran Dibuka</span>
                  <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  value={form.tgl_buka}
                  onChange={(e) => setForm({ ...form, tgl_buka: e.target.value })}
                  className={fieldCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <span>Tanggal Pendaftaran Ditutup</span>
                  <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  value={form.tgl_tutup}
                  onChange={(e) => setForm({ ...form, tgl_tutup: e.target.value })}
                  className={fieldCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <span>Batas Waktu Penutupan (WIB)</span>
                  <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="time"
                  value={form.batas_waktu}
                  onChange={(e) => setForm({ ...form, batas_waktu: e.target.value })}
                  className={fieldCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <span>Tanggal Yudisium</span>
                  <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  value={form.tgl_yudisium}
                  onChange={(e) => setForm({ ...form, tgl_yudisium: e.target.value })}
                  className={fieldCls}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-end gap-2.5 sm:flex-row">
            {current && current.is_active ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleClosePeriod}
                  className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-xl bg-[#C81E1E] px-5 text-[11px] font-bold text-white transition hover:bg-[#9B1C1C] disabled:opacity-60"
                >
                  Tutup Periode <Lock size={12} />
                </button>
                <button
                  type="button"
                  disabled={busy || !isFormComplete}
                  onClick={handleSaveChanges}
                  className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] px-5 text-[11px] font-bold text-white transition hover:bg-[#083866] disabled:bg-[#CBD5E1] disabled:text-[#94A3B8]"
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : null}
                  Simpan Perubahan <Check size={13} />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busy || !isFormComplete}
                onClick={handleOpenOrCreatePeriod}
                className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-xl bg-[#0A477F] px-5 text-[11px] font-bold text-white transition hover:bg-[#083866] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : null}
                Buka Periode <Check size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

/* =========================================================
   HALAMAN UTAMA ADMIN PENGAJUAN YUDISIUM
========================================================= */
export default function AdminPengajuanYudisium() {
  const navigate = useNavigate()

  const [user] = useState(() => getUser())
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = user?.nama || 'Staf Akademik'

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pengajuan, setPengajuan] = useState([])
  const [prodis, setProdis] = useState([])
  const [events, setEvents] = useState([])
  const [forms, setForms] = useState([])

  // Tabs: 'active' | 'history'
  const [activeTab, setActiveTab] = useState('active')
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(null)

  // Search & Filter
  const [search, setSearch] = useState('')
  const [prodi, setProdi] = useState('')
  const [status, setStatus] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [searchFocused, setSearchFocused] = useState(false)

  // Detail modal: { id, mode: 'periksa' | 'edit' | 'lihat' }
  const [selected, setSelected] = useState(null)

  const loadAll = useCallback(
    () =>
      Promise.all([
        listPengajuanStaf(),
        listProgramStudi().catch(() => []),
        listEvents().catch(() => []),
        listForms().catch(() => []),
      ])
        .then(([pengajuanRes, prodiRes, eventRes, formRes]) => {
          setPengajuan(pengajuanRes.map(normalizePengajuan))
          setProdis(prodiRes.map(normalizeProdi))
          setEvents(eventRes)
          setForms(formRes)
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat data pengajuan')))
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

  const activePeriod = useMemo(() => {
    if (!events || events.length === 0) return null
    return events.find((e) => e.is_active) || events[0]
  }, [events])

  const activeList = useMemo(() => pengajuan.filter((p) => isActiveStatus(p.status)), [pengajuan])
  const historyList = useMemo(() => pengajuan.filter((p) => !isActiveStatus(p.status)), [pengajuan])

  const eventById = useCallback(
    (id) => events.find((e) => String(e.id) === String(id)) || null,
    [events]
  )

  const periods = useMemo(() => {
    const map = new Map()
    historyList.forEach((p) => {
      const key = String(p.eventId ?? 'none')
      if (!map.has(key)) {
        const ev = eventById(p.eventId)
        map.set(key, {
          key,
          nama: ev?.nama_event || ev?.periode || p.eventName || 'Periode Yudisium',
          pendaftaran: ev ? `${formatIndoDate(ev.tgl_buka)} - ${formatIndoDate(ev.tgl_tutup)}` : '-',
          tanggalYudisium: ev?.tgl_yudisium ? formatIndoDate(ev.tgl_yudisium) : '-',
          students: [],
        })
      }
      map.get(key).students.push(p)
    })
    return [...map.values()]
  }, [historyList, eventById])

  const selectedPeriod = periods.find((p) => p.key === selectedPeriodKey) || null

  const applyFilters = (list) => {
    const keyword = search.toLowerCase().trim()
    return list.filter((s) => {
      const matchSearch =
        !keyword || s.nama.toLowerCase().includes(keyword) || String(s.nim).toLowerCase().includes(keyword)
      const matchProdi = !prodi || String(s.prodiId) === String(prodi)
      const matchStatus = !status || s.status === status
      const matchDate = !dateFilter || (s.submittedAt && toDateInput(s.submittedAt) === dateFilter)
      return matchSearch && matchProdi && matchStatus && matchDate
    })
  }

  const baseList = activeTab === 'active' ? activeList : selectedPeriod ? selectedPeriod.students : []
  const filteredStudents = useMemo(
    () => applyFilters(baseList),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseList, search, prodi, status, dateFilter]
  )

  const historySearchMatches = useMemo(() => {
    const keyword = search.toLowerCase().trim()
    if (!keyword) return []
    return historyList
      .filter((s) => s.nama.toLowerCase().includes(keyword) || String(s.nim).toLowerCase().includes(keyword))
      .map((s) => {
        const ev = eventById(s.eventId)
        return {
          ...s,
          periodLabel: ev?.nama_event || ev?.periode || s.eventName || 'Periode Yudisium',
        }
      })
  }, [historyList, search, eventById])

  const showingPeriods = activeTab === 'history' && !selectedPeriod
  const totalRows = showingPeriods ? periods.length : filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = (list) => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetFilters = () => {
    setSearch('')
    setProdi('')
    setStatus('')
    setDateFilter('')
    setPage(1)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setSelectedPeriodKey(null)
    resetFilters()
  }

  const thCls =
    'whitespace-nowrap px-4 py-3 text-left text-[8.5px] font-bold uppercase tracking-wider text-[#64748B] sm:px-5'

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-[#1E293B]">
      <Sidebar admin />

      <main className="min-h-screen lg:ml-[280px]">
        {/* TOP NAVBAR */}
        <header className="relative z-30 flex h-[64px] items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 pl-14 sm:h-[72px] sm:px-6 sm:pl-14 lg:px-8 lg:pl-8">
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-bold text-[#0F172A] sm:text-[20px]">
              Pengajuan Yudisium Staff Administrasi
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
                className={`hidden text-[#64748B] transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`}
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

        {/* BODY CONTENT */}
        <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {/* HEADER CARD */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-[18px] font-bold text-[#0F172A] sm:text-[20px]">Verifikasi Pengajuan Yudisium</h2>
            <p className="mt-1 text-[11.5px] text-[#64748B]">
              Verifikasi identitas dan berkas mahasiswa yang mendaftar yudisium.
            </p>
          </section>

          {loadError && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] text-rose-700 sm:px-5">
              <span>{loadError}</span>
              <button
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

          {/* PERIODE YUDISIUM */}
          <PeriodSection events={events} forms={forms} onReload={loadAll} />

          {/* TAB SWAPPER */}
          <div className="mt-5 inline-flex w-full flex-col rounded-xl bg-[#E2E8F0] p-1 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => switchTab('active')}
              className={`flex h-[32px] items-center justify-center gap-2 rounded-lg px-3.5 text-[11px] font-bold transition sm:justify-start ${
                activeTab === 'active' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#334155]'
              }`}
            >
              <Inbox size={13} className={activeTab === 'active' ? 'text-[#0A477F]' : ''} />
              <span>Antrean Pengajuan Aktif</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  activeTab === 'active' ? 'bg-[#E0ECFB] text-[#0A477F]' : 'bg-[#CBD5E1]/70 text-[#475569]'
                }`}
              >
                {activeList.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('history')}
              className={`flex h-[32px] items-center justify-center gap-2 rounded-lg px-3.5 text-[11px] font-bold transition sm:justify-start ${
                activeTab === 'history' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#334155]'
              }`}
            >
              <History size={13} className={activeTab === 'history' ? 'text-[#0A477F]' : ''} />
              <span>Histori Verifikasi</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  activeTab === 'history' ? 'bg-[#E0ECFB] text-[#0A477F]' : 'bg-[#CBD5E1]/70 text-[#475569]'
                }`}
              >
                {historyList.length}
              </span>
            </button>
          </div>

          {/* MAIN CONTENT CARD */}
          <section className="mt-3.5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <div className="p-5 pb-0">
              {activeTab === 'history' && selectedPeriod && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeriodKey(null)
                    resetFilters()
                  }}
                  className="mb-3.5 inline-flex h-[30px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 text-[10.5px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
                >
                  <ChevronLeft size={13} /> Kembali
                </button>
              )}

              <h3 className="text-[14px] font-bold text-[#0F172A]">
                {activeTab === 'active'
                  ? activeList.length > 0 && activePeriod
                    ? `Antrean Pengajuan Aktif • ${activePeriod.nama_event || activePeriod.periode}`
                    : 'Antrean Pengajuan Aktif'
                  : selectedPeriod
                  ? `Histori Pengajuan Yudisium - ${selectedPeriod.nama}`
                  : historyList.length > 0
                  ? 'Histori Pengajuan Yudisium'
                  : 'Histori Verifikasi'}
              </h3>
              <p className="mt-0.5 text-[11px] text-[#64748B]">
                {activeTab === 'active'
                  ? activeList.length > 0
                    ? 'Periksa kelengkapan dokumen, lalu verifikasi atau kembalikan dengan catatan revisi.'
                    : 'Pengajuan ditampilkan pada tampilan ini'
                  : selectedPeriod
                  ? 'Pengajuan yudisium yang sudah dilakukan verifikasi akan tampil disini.'
                  : historyList.length > 0
                  ? 'Pengajuan yudisium yang sudah dilakukan verifikasi akan tampil disini.'
                  : 'Histori verifikasi ditampilkan pada halaman ini'}
              </p>

              {/* SEARCH & FILTER BAR */}
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                {showingPeriods && historyList.length > 0 ? (
                  <div className="relative w-full">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={search}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setSearchFocused(true)
                        setPage(1)
                      }}
                      placeholder="Cari Nama Periode, Nama Mahasiswa, / NIM..."
                      className="h-[38px] w-full rounded-xl border border-[#CBD5E1] bg-white pl-9 pr-8 text-[11px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#0A477F]"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                      >
                        <X size={13} />
                      </button>
                    )}

                    {searchFocused && search.trim() !== '' && (
                      <div className="absolute left-0 right-0 top-[44px] z-40 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
                        <div className="border-b border-[#F1F5F9] px-4 py-2.5">
                          <p className="text-[11px] font-bold text-[#0F172A]">Hasil Pencarian</p>
                        </div>
                        {historySearchMatches.length > 0 ? (
                          <div className="max-h-[260px] divide-y divide-[#F1F5F9] overflow-y-auto">
                            {historySearchMatches.map((m) => (
                              <div
                                key={m.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[#F8FAFC]"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E0ECFB] text-[10px] font-bold text-[#0A477F]">
                                    {m.nama
                                      .split(' ')
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join('')}
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[11.5px] font-bold text-[#0F172A]">{m.nama}</span>
                                      <span className="text-[10px] text-[#64748B]">{m.nim}</span>
                                      <span className="rounded bg-[#E0ECFB] px-1.5 py-0.5 text-[8.5px] font-bold text-[#0A477F]">
                                        {m.prodiKode}
                                      </span>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-[#64748B]">
                                      <span>Terverifikasi di:</span>
                                      <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 font-semibold text-[#059669]">
                                        {m.periodLabel}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onMouseDown={() => setSelected({ id: m.id, mode: 'lihat' })}
                                  className="inline-flex h-[30px] items-center gap-1.5 rounded-lg bg-[#0A477F] px-3.5 text-[10px] font-bold text-white hover:bg-[#083866]"
                                >
                                  <Eye size={12} /> Buka Data Mahasiswa
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <p className="text-[12px] font-bold text-[#0F172A]">Mahasiswa atau Periode tidak ditemukan</p>
                            <p className="mt-1 text-[10.5px] text-[#64748B]">
                              Pastikan ejaan nama lengkap atau NIM sudah sesuai.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="relative w-full sm:w-[240px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          setPage(1)
                        }}
                        placeholder="Cari Nama / NIM..."
                        className="h-[36px] w-full rounded-xl border border-[#CBD5E1] bg-white pl-8 pr-3 text-[11px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#0A477F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
                      <FilterSelect
                        value={prodi}
                        onChange={(v) => {
                          setProdi(v)
                          setPage(1)
                        }}
                      >
                        <option value="">Semua Prodi</option>
                        {prodis.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.kode || p.nama}
                          </option>
                        ))}
                      </FilterSelect>

                      <FilterSelect
                        value={status}
                        onChange={(v) => {
                          setStatus(v)
                          setPage(1)
                        }}
                        width="w-full sm:w-[155px]"
                      >
                        <option value="">Status</option>
                        {Object.entries(STATUS_META)
                          .filter(([key]) => (activeTab === 'active' ? isActiveStatus(key) : !isActiveStatus(key)))
                          .map(([key, meta]) => (
                            <option key={key} value={key}>
                              {meta.label}
                            </option>
                          ))}
                      </FilterSelect>

                      <div className="relative w-full sm:w-[165px]">
                        <input
                          type={dateFilter ? 'date' : 'text'}
                          onFocus={(e) => {
                            e.target.type = 'date'
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) e.target.type = 'text'
                          }}
                          value={dateFilter}
                          onChange={(e) => {
                            setDateFilter(e.target.value)
                            setPage(1)
                          }}
                          placeholder="Tanggal Pengajuan"
                          className="h-[36px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 pr-8 text-[11px] text-[#475569] outline-none placeholder:text-[#475569] focus:border-[#0A477F]"
                        />
                        {!dateFilter && (
                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* BODY TABEL ATAU EMPTY STATE */}
            <div className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-[11.5px] text-[#64748B]">
                  <Loader2 size={16} className="animate-spin" /> Memuat data pengajuan...
                </div>
              ) : showingPeriods ? (
                periods.length === 0 ? (
                  <EmptyTableState
                    title="Belum Ada Histori Verifikasi"
                    description="Belum ada berkas pengajuan yudisium mahasiswa yang masuk ataupun histori verifikasi pada periode ini."
                    reloading={loading}
                    onReload={() => {
                      setLoading(true)
                      loadAll()
                    }}
                  />
                ) : (
                  <>
                    <div className="overflow-x-auto">
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
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {slice(periods).map((p, idx) => (
                            <tr key={p.key} className="hover:bg-[#F8FAFC]">
                              <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#64748B] sm:px-5">
                                {String((safePage - 1) * PAGE_SIZE + idx + 1).padStart(2, '0')}
                              </td>
                              <td className="px-4 py-4 sm:px-5">
                                <p className="text-[11.5px] font-bold text-[#0F172A]">{p.nama}</p>
                                <p className="mt-0.5 text-[9px] text-[#64748B]">Pendaftaran: {p.pendaftaran}</p>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#0F172A] sm:px-5">
                                {p.tanggalYudisium}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#0F172A] sm:px-5">
                                {p.students.length} Mahasiswa
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-center sm:px-5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPeriodKey(p.key)
                                    resetFilters()
                                  }}
                                  className="inline-flex h-[28px] items-center gap-1.5 rounded-lg bg-[#0A477F] px-3.5 text-[10px] font-bold text-white transition hover:bg-[#083866]"
                                >
                                  <Eye size={11} /> Lihat
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-4 py-3.5 sm:px-5">
                      <p className="text-[10.5px] text-[#64748B]">Menampilkan {periods.length} periode</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={safePage <= 1}
                          onClick={() => setPage(safePage - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] disabled:opacity-40"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-2 text-[10.5px] font-bold text-[#0F172A]">
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
                  </>
                )
              ) : baseList.length === 0 ? (
                <EmptyTableState
                  title={activeTab === 'active' ? 'Belum Ada Pengajuan Yudisium' : 'Belum Ada Histori Verifikasi'}
                  description="Belum ada berkas pengajuan yudisium mahasiswa yang masuk ataupun histori verifikasi pada periode ini."
                  reloading={loading}
                  onReload={() => {
                    setLoading(true)
                    loadAll()
                  }}
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse">
                      <thead>
                        <tr className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
                          <th className={thCls}>NO</th>
                          <th className={thCls}>MAHASISWA</th>
                          <th className={thCls}>NIM</th>
                          <th className={thCls}>PRODI</th>
                          <th className={thCls}>PREDIKAT KELULUSAN</th>
                          <th className={thCls}>STATUS</th>
                          <th className={thCls}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {slice(filteredStudents).map((student, idx) => {
                          const isReturned =
                            String(student.status || '').toLowerCase() === 'student_revision_requested' ||
                            String(student.status || '').toLowerCase() === 'dikembalikan'
                          return (
                            <tr key={student.id} className="hover:bg-[#F8FAFC]">
                              <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#64748B] sm:px-5">
                                {String((safePage - 1) * PAGE_SIZE + idx + 1).padStart(2, '0')}
                              </td>
                              <td className="px-4 py-3.5 sm:px-5">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E0ECFB] text-[10px] font-bold text-[#0A477F]">
                                    {student.nama
                                      .split(' ')
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join('')}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold leading-snug text-[#0F172A]">{student.nama}</p>
                                    <p className="text-[8.5px] text-[#64748B]">
                                      {isReturned ? 'Dikembalikan' : 'Diajukan'}: {formatDate(student.submittedAt, true)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 text-[10.5px] font-semibold text-[#0F172A] sm:px-5">
                                {student.nim}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 sm:px-5">
                                <span className="rounded-lg bg-[#E0ECFB] px-2.5 py-0.5 text-[9.5px] font-bold text-[#0A477F]">
                                  {student.prodiKode}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 text-[10.5px] text-[#475569] sm:px-5">
                                {resolvePredikat(student)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 sm:px-5">
                                <StatusBadge status={student.status} />
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 sm:px-5">
                                <div className="flex items-center gap-1.5">
                                  {activeTab === 'active' ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelected({ id: student.id, mode: 'periksa' })}
                                      className="inline-flex h-[28px] items-center gap-1 rounded-lg bg-[#0A477F] px-3 text-[10px] font-bold text-white hover:bg-[#083866]"
                                    >
                                      <Eye size={11} /> Periksa
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setSelected({ id: student.id, mode: 'lihat' })}
                                      className="inline-flex h-[28px] items-center gap-1 rounded-lg bg-[#0A477F] px-3 text-[10px] font-bold text-white hover:bg-[#083866]"
                                    >
                                      <Eye size={11} /> Lihat
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelected({ id: student.id, mode: 'edit' })}
                                    className="inline-flex h-[28px] items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-[10px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
                                  >
                                    <Pencil size={11} /> Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-[11px] text-[#94A3B8]">
                              Tidak ada pengajuan yang cocok dengan filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION FOOTER */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-4 py-3.5 sm:px-5">
                    <p className="text-[10.5px] text-[#64748B]">Menampilkan {filteredStudents.length} pengajuan</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage(safePage - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] disabled:opacity-40"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-2 text-[10.5px] font-bold text-[#0F172A]">
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
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {selected && (
        <StudentDetailView
          key={`${selected.id}-${selected.mode}`}
          studentId={selected.id}
          initialMode={selected.mode}
          onClose={() => setSelected(null)}
          onChanged={loadAll}
        />
      )}
    </div>
  )
}