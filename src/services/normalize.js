/* =========================================================
   Normalizer — backend belum menyediakan contoh response,
   jadi semua pembacaan dibuat toleran terhadap variasi nama field.
========================================================= */

export function abbreviate(name = '') {
  return String(name)
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((w) => w && !['dan', '&', 'of'].includes(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function normalizeProdi(p = {}) {
  const nama = p.nama ?? p.nama_program_studi ?? p.name ?? ''
  return {
    id: p.id,
    nama,
    kode: p.kode ?? p.kode_prodi ?? p.singkatan ?? abbreviate(nama),
  }
}

export function normalizePengajuan(p = {}) {
  const user = p.user || p.mahasiswa || {}
  const prodi = normalizeProdi(p.program_studi || p.programStudi || user.program_studi || {})
  const prodiNama = prodi.nama || (typeof p.prodi === 'string' ? p.prodi : '') || '-'
  const ba = p.berita_acara || p.beritaAcara || null

  return {
    raw: p,
    id: p.id ?? p.pengajuan_id,
    nama: p.nama ?? p.nama_mahasiswa ?? user.nama ?? '-',
    nim: p.nomor_induk ?? p.nim ?? user.nomor_induk ?? user.nim ?? '-',
    email: p.email ?? user.email ?? '',
    prodiId: p.program_studi_id ?? prodi.id ?? user.program_studi_id ?? null,
    prodiKode: prodi.kode || abbreviate(prodiNama) || '-',
    prodiNama,
    status: p.status ?? '',
    eventId: p.yudisium_event_id ?? p.event_id ?? p.yudisium_event?.id ?? null,
    eventName: p.yudisium_event?.nama_event ?? p.event?.nama_event ?? '',
    submittedAt: p.submitted_at ?? p.tanggal_pengajuan ?? p.created_at ?? null,
    beritaAcaraId: p.berita_acara_id ?? ba?.id ?? null,
    beritaAcaraStatus: ba?.status ?? null,
  }
}

export function normalizeUser(u = {}) {
  const role = u.role
  const roleName =
    typeof role === 'string' ? role : role?.name ?? role?.nama ?? role?.nama_role ?? u.role_name ?? ''
  const prodi = normalizeProdi(u.program_studi || u.programStudi || {})
  return {
    raw: u,
    id: u.id,
    nama: u.nama ?? u.name ?? '-',
    email: u.email ?? '',
    nim: u.nomor_induk ?? '',
    roleId: u.role_id ?? role?.id ?? null,
    roleName,
    prodiId: u.program_studi_id ?? prodi.id ?? null,
    prodiKode: prodi.kode || '',
    prodiNama: prodi.nama || '',
  }
}

/* ---------------- Role ---------------- */
export function roleKey(name = '') {
  const r = String(name).toLowerCase().replace(/[_-]/g, ' ').trim()
  if (r.includes('super')) return 'super_admin'
  if (r.includes('staf') || r.includes('staff')) return 'staf_akademik'
  if (r.includes('kaprodi') || r.includes('program studi') || r.includes('prodi')) return 'kaprodi'
  if (r.includes('manit')) return 'manit'
  if (r.includes('kadep') || r.includes('departemen')) return 'kadep'
  if (r.includes('mahasiswa')) return 'mahasiswa'
  return r || 'lainnya'
}

export const ROLE_LABEL = {
  mahasiswa: 'Mahasiswa',
  staf_akademik: 'Staf Akademik',
  kaprodi: 'Kepala Program Studi',
  manit: 'Manit',
  kadep: 'Kepala Departemen',
  super_admin: 'Super Admin',
}

/* ---------------- Status pengajuan ---------------- */
export const STATUS_META = {
  submitted: { label: 'SUBMITTED', tone: 'neutral' },
  checking_akademik: { label: 'DIPERIKSA', tone: 'info' },
  student_revision_requested: { label: 'PERBAIKAN MASUK', tone: 'warning' },
  waiting_student_confirmation: { label: 'MENUNGGU KONFIRMASI', tone: 'warning' },
  confirmed_by_student: { label: 'DIKONFIRMASI', tone: 'success' },
  final_checked_akademik: { label: 'TERVERIFIKASI', tone: 'success' },
}

export function statusMeta(status) {
  return (
    STATUS_META[status] || {
      label: String(status || '-').replace(/_/g, ' ').toUpperCase(),
      tone: 'neutral',
    }
  )
}

// Antrean aktif = belum final-checked akademik
export const ACTIVE_STATUSES = [
  'submitted',
  'checking_akademik',
  'student_revision_requested',
  'waiting_student_confirmation',
  'confirmed_by_student',
]

export const isActiveStatus = (s) => ACTIVE_STATUSES.includes(s)

/* ---------------- Tanggal ---------------- */
export function formatDate(value, withTime = false) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

// ISO -> value untuk <input type="datetime-local">
export function toLocalInput(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null)
