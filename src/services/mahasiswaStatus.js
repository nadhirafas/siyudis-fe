/* =========================================================
   Normalizer & pemetaan status khusus Mahasiswa.
   Response backend belum punya contoh, jadi dibaca toleran.
========================================================= */
import { formatDate } from './normalize'

export const FILE_TYPES = ['pdf', 'image', 'file', 'png', 'jpg', 'jpeg', 'upload', 'document']
export const isFileType = (t) => FILE_TYPES.includes(String(t || '').toLowerCase())

// data_type -> aturan unggah di UI (server menerima pdf, jpg, jpeg, png maks 5MB)
export function uploadRule(type) {
  const t = String(type || '').toLowerCase()
  if (t === 'pdf') return { accept: '.pdf', label: 'PDF' }
  if (t === 'image' || t === 'png' || t === 'jpg' || t === 'jpeg') return { accept: '.jpg,.jpeg,.png', label: 'JPG/PNG' }
  return { accept: '.pdf,.jpg,.jpeg,.png', label: 'PDF/JPG/PNG' }
}

export const isWhatsappField = (f) => /whatsapp|\bwa\b|no\.?\s*hp/i.test(f?.name || '')

/* ---------------- Periode / event ---------------- */
export function normalizeEvent(e) {
  if (!e || typeof e !== 'object') return null
  return {
    id: e.id ?? null,
    nama: e.nama_event ?? '',
    periode: e.periode ?? '',
    tglBuka: e.tgl_buka ?? null,
    tglTutup: e.tgl_tutup ?? null,
    tglYudisium: e.tgl_yudisium ?? null,
    isActive: e.is_active === undefined ? true : Boolean(e.is_active),
  }
}

export function isEventOpen(event, now = Date.now()) {
  if (!event || !event.isActive) return false
  if (event.tglBuka && new Date(event.tglBuka).getTime() > now) return false
  if (event.tglTutup && new Date(event.tglTutup).getTime() < now) return false
  return true
}

/* ---------------- Pencarian struktur response (nama key backend belum pasti) ---------------- */
const looksLikeField = (x) => x && typeof x === 'object' && ('field_name' in x || 'data_type' in x)

// Cari array field form di kedalaman mana pun: [{ field_name, data_type, ... }]
export function findFieldArray(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 7) return null
  if (Array.isArray(node)) {
    if (node.length > 0 && node.every(looksLikeField)) return node
    for (const item of node) {
      const found = findFieldArray(item, depth + 1)
      if (found) return found
    }
    return null
  }
  for (const value of Object.values(node)) {
    const found = findFieldArray(value, depth + 1)
    if (found) return found
  }
  return null
}

// Cari objek periode (punya nama_event) di kedalaman mana pun
export function findEventObject(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 7) return null
  if (!Array.isArray(node) && 'nama_event' in node) return node
  for (const value of Object.values(Array.isArray(node) ? node : node)) {
    const found = findEventObject(value, depth + 1)
    if (found) return found
  }
  return null
}

// NIM yang tersimpan kadang berupa potongan email (tanpa angka) -> bukan NIM, jangan diisikan otomatis
export const cleanNim = (v) => (/\d/.test(String(v ?? '')) ? String(v).trim() : '')

/* ---------------- Form aktif ---------------- */
export function normalizeFormField(f = {}) {
  return {
    id: f.id ?? f.form_field_id,
    name: f.field_name ?? f.name ?? '',
    description: f.field_desc ?? f.description ?? '',
    type: f.data_type ?? 'text',
    required: f.is_required === undefined ? true : Boolean(f.is_required),
    visible: f.is_visible === undefined || f.is_visible === null ? true : Boolean(f.is_visible),
    order: f.order_position ?? 0,
    prodiId: f.program_studi_id ?? null,
  }
}

// Response GET /pengajuan/active-form -> { event, eventId, formName, fields }
// Struktur dibaca dengan pencarian bertingkat agar tahan terhadap perbedaan nama key backend.
export function normalizeActiveForm(data) {
  if (!data || typeof data !== 'object') return null
  const eventRaw = findEventObject(data)
  const rawFields = findFieldArray(data) ?? []
  const form = data.form ?? data.data?.form ?? eventRaw?.form ?? null
  const fields = rawFields
    .map(normalizeFormField)
    .filter((f) => f.id !== undefined && f.visible)
    .sort((a, b) => a.order - b.order)
  const event = normalizeEvent(eventRaw)
  return {
    event,
    eventId: eventRaw?.id ?? data.yudisium_event_id ?? data.event_id ?? null,
    formName: form?.nama_form ?? '',
    fields,
  }
}

/* ---------------- Pengajuan milik mahasiswa ---------------- */
export function normalizeMyPengajuan(data) {
  const d = data && typeof data === 'object' ? data.pengajuan ?? data : null
  if (!d || (d.id === undefined && d.pengajuan_id === undefined && !d.status)) return null

  const rawValues = d.field_values ?? d.fieldValues ?? d.values ?? d.jawaban ?? d.answers ?? []
  const list = Array.isArray(rawValues)
    ? rawValues
    : Object.entries(rawValues || {}).map(([k, v]) => ({ form_field_id: k, value: v }))

  const fieldValues = list.map((it, idx) => {
    const field = it.field ?? it.form_field ?? {}
    const upload = it.upload ?? {}
    return {
      key: it.id ?? idx,
      fieldId: it.form_field_id ?? it.field_id ?? field.id,
      name: field.field_name ?? it.field_name ?? '',
      description: field.field_desc ?? '',
      type: field.data_type ?? it.data_type ?? '',
      required: field.is_required,
      order: field.order_position ?? idx,
      value: it.value ?? it.nilai ?? '',
      fileName: it.original_name ?? it.file_name ?? upload.original_name ?? '',
      size: it.size ?? it.file_size ?? upload.size ?? null,
      uploadedAt: it.updated_at ?? it.created_at ?? null,
    }
  })

  const ba = d.berita_acara ?? d.beritaAcara ?? null
  return {
    raw: d,
    id: d.pengajuan_id ?? d.id ?? null,
    status: d.status ?? '',
    eventId: d.yudisium_event_id ?? d.event_id ?? d.yudisium_event?.id ?? null,
    event: normalizeEvent(d.yudisium_event ?? d.event),
    submittedAt: d.submitted_at ?? d.created_at ?? null,
    updatedAt: d.updated_at ?? null,
    catatan: d.catatan_revisi ?? d.catatan_revisi_mahasiswa ?? d.catatan ?? d.revision_note ?? '',
    fieldValues,
    beritaAcaraId: d.berita_acara_id ?? ba?.id ?? null,
    beritaAcaraStatus: ba?.status ?? d.berita_acara_status ?? null,
  }
}

/* ---------------- Tahap status (dipakai Dashboard) ---------------- */
const AFTER_STAFF = [
  'student_revision_requested',
  'waiting_student_confirmation',
  'confirmed_by_student',
  'final_checked_akademik',
  'completed',
]
const AFTER_STUDENT = ['confirmed_by_student', 'final_checked_akademik', 'completed']

function flags(p) {
  const s = p?.status
  const ba = p?.beritaAcaraStatus
  const completed = s === 'completed' || ba === 'completed'
  const approvedKaprodi = completed || ba === 'approved_kaprodi'
  const inBA = Boolean(p?.beritaAcaraId) || ba === 'diajukan'
  const staffVerified = AFTER_STAFF.includes(s) || approvedKaprodi || inBA
  const studentConfirmed = AFTER_STUDENT.includes(s) || approvedKaprodi
  const draftAvailable = s === 'waiting_student_confirmation' || studentConfirmed
  return { completed, approvedKaprodi, inBA, staffVerified, studentConfirmed, draftAvailable }
}

// Bentuk sama dengan DEFAULT_STATUS lama di StudentDashboard
export function buildYudisiumStatus(p) {
  if (!p) {
    return {
      tahap1: { status: 'not_started', submittedAt: null },
      tahap2: { status: 'waiting', draftBAAvailable: false, studentConfirmed: false, completedAt: null },
      tahap3: { status: 'waiting', validatedAt: null },
      tahap4: { status: 'waiting', approvedAt: null },
      tahap5: { status: 'waiting', issuedAt: null },
    }
  }
  const f = flags(p)
  return {
    tahap1: { status: f.staffVerified ? 'completed' : 'processing', submittedAt: p.submittedAt },
    tahap2: {
      status: f.studentConfirmed ? 'completed' : f.staffVerified ? 'processing' : 'waiting',
      draftBAAvailable: f.draftAvailable,
      studentConfirmed: f.studentConfirmed,
      completedAt: null,
    },
    tahap3: { status: f.approvedKaprodi ? 'completed' : f.inBA ? 'review' : 'waiting', validatedAt: null },
    tahap4: { status: f.completed ? 'completed' : f.approvedKaprodi ? 'processing' : 'waiting', approvedAt: null },
    tahap5: { status: f.completed ? 'completed' : 'waiting', issuedAt: null },
  }
}

/* ---------------- Tracking 7 langkah (halaman Pelacakan) ---------------- */
// mode: 'normal' | 'revisi' | 'disetujui'
export function trackingState(p) {
  if (!p) return { step: 0, mode: 'normal', canEdit: false }
  const f = flags(p)
  const s = p.status
  if (f.completed) return { step: 7, mode: 'disetujui', canEdit: false }
  if (f.approvedKaprodi) return { step: 5, mode: 'normal', canEdit: false }
  if (f.inBA || s === 'final_checked_akademik' || s === 'confirmed_by_student') {
    return { step: 4, mode: 'normal', canEdit: false }
  }
  if (s === 'student_revision_requested') return { step: 3, mode: 'revisi', canEdit: false }
  if (s === 'waiting_student_confirmation') return { step: 3, mode: 'normal', canEdit: false }
  return { step: 2, mode: 'normal', canEdit: s === 'submitted' }
}

export function trackingDates(p) {
  return { 1: p?.submittedAt ? formatDate(p.submittedAt) : '' }
}

/* ---------------- Tampilan halaman Berita Acara mahasiswa ---------------- */
// '1' draft belum tersedia | '2' review draft | '4A' sudah dikonfirmasi | '4B' revisi terkirim | '5' terbit
export function beritaAcaraViewState(p) {
  if (!p) return '1'
  const f = flags(p)
  if (f.completed) return '5'
  if (p.status === 'waiting_student_confirmation') return '2'
  if (p.status === 'student_revision_requested') return '4B'
  if (f.studentConfirmed) return '4A'
  return '1'
}

/* ---------------- Rekap penilaian (9 data) ---------------- */
export const REKAP_FIELDS = [
  ['ipk', 'IPK'],
  ['persen_nilai_d', 'Persentase Nilai D (%)'],
  ['sks_ditempuh', 'SKS Ditempuh'],
  ['similarity_index', 'Similarity Index (%)'],
  ['skor_bahasa_inggris', 'Skor Bahasa Inggris'],
  ['sertifikat_level', 'Level Sertifikat'],
  ['status_judul_pa', 'Status Judul PA'],
  ['sertifikat_kompetensi', 'Sertifikat Kompetensi'],
  ['status_bebas_pelanggaran', 'Bebas Pelanggaran Etik'],
]

const esc = (v) =>
  String(v ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// Susun dokumen HTML rekap data (ditampilkan di viewer pratinjau, tanpa script)
export function buildRekapHtml(rekap, identity = {}) {
  const src = rekap?.penilaian ?? rekap?.data_penilaian ?? rekap ?? {}
  const rows = REKAP_FIELDS.map(([key, label]) => {
    let v = src[key]
    if (typeof v === 'boolean') v = v ? 'Ya' : 'Tidak'
    return `<tr><td>${esc(label)}</td><td>${v === undefined || v === null || v === '' ? '-' : esc(v)}</td></tr>`
  }).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Georgia,serif;margin:32px;color:#111}
    h2{text-align:center;margin:0 0 4px} p.sub{text-align:center;margin:0 0 24px;color:#555;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px}
    td{border:1px solid #cbd5e1;padding:8px 12px} td:first-child{width:45%;background:#f8fafc;font-weight:bold}
  </style></head><body>
    <h2>REKAP DATA PENILAIAN YUDISIUM</h2><p class="sub">Draft untuk dikonfirmasi mahasiswa</p>
    <table>
      <tr><td>Nama</td><td>${esc(identity.nama)}</td></tr>
      <tr><td>NIM</td><td>${esc(identity.nim)}</td></tr>
      <tr><td>Program Studi</td><td>${esc(identity.prodi)}</td></tr>
    </table>
    <table>${rows}</table>
  </body></html>`
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return ''
  const n = Number(bytes)
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(n / 1024))} KB`
}
