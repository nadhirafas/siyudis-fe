/* =========================================================
   Riwayat Perubahan (Super Admin)

   TODO: endpoint belum ada — Postman belum punya endpoint log aktivitas (siapa mengubah apa, kapan,
   dan kondisi sebelum/sesudah). Daftar ini DITURUNKAN dari data yang tersedia:
   GET /api/staf-akademik/pengajuan (status pengajuan + berita_acara). Konsekuensinya:
   - satu entri per pengajuan / per Berita Acara = kondisi TERKINI, bukan log lengkap;
   - nama pelaku hanya diketahui untuk Mahasiswa; untuk Staf/Kaprodi/Manit/Kadep ditampilkan nama role;
   - "kondisi sebelumnya" diturunkan dari alur status, bukan dari nilai yang tersimpan.
   Bila backend menambah endpoint log, cukup ganti buildRiwayat() dengan pembacaan endpoint itu.
========================================================= */
import { normalizePengajuan } from './normalize'

export const ROLE_TABS = ['Semua Role', 'Mahasiswa', 'Staf Administrasi', 'Kaprodi', 'Kadep', 'Manit', 'Super Admin']
export const MODULES = ['Pengajuan Yudisium', 'Berita Acara']
export const CHANGE_TYPES = ['Pengajuan Revisi', 'Dikembalikan', 'Perubahan Data & Berkas', 'Pengesahan Berita Acara']

const pick = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '') ?? ''

const BA_REJECTED = /tolak|reject|kembali|return/i

function ms(value) {
  const t = value ? new Date(value).getTime() : 0
  return Number.isNaN(t) ? 0 : t
}

// Entri untuk satu mahasiswa yang belum masuk Berita Acara
function studentEntry(p) {
  const raw = p.raw || {}
  const time = pick(raw.updated_at, raw.submitted_at, raw.created_at, p.submittedAt)
  const base = {
    id: `p-${p.id}`,
    time,
    prodi: p.prodiKode,
    studentMeta: [p.nim, p.prodiKode].filter((v) => v && v !== '-').join(' • '),
  }
  const studentActor = { actor: p.nama, actorMeta: base.studentMeta, roles: ['Mahasiswa'] }
  const stafActor = { actor: 'Staf Akademik', actorMeta: '', roles: ['Staf Administrasi'] }
  const catatan = pick(raw.catatan_revisi, raw.catatan_revisi_mahasiswa, raw.catatan)

  switch (p.status) {
    case 'student_revision_requested':
      return {
        ...base, ...studentActor, module: 'Berita Acara', type: 'Pengajuan Revisi',
        statusLabel: 'Pengajuan Revisi',
        title: `Draf Berita Acara ${p.prodiKode}`, subtitle: 'Pengajuan Revisi • Modul Berita Acara',
        detail: `Mengajukan revisi data pada Draf Berita Acara ${p.prodiKode}${catatan ? `: ${catatan}` : '.'}`,
        before: 'Status: Menunggu konfirmasi data oleh Mahasiswa',
        after: `Status: Revisi diminta, menunggu perbaikan Staf Administrasi${catatan ? `\nCatatan: ${catatan}` : ''}`,
      }
    case 'confirmed_by_student':
      return {
        ...base, ...studentActor, module: 'Berita Acara', type: 'Perubahan Data & Berkas',
        statusLabel: 'Perubahan Data & Berkas',
        title: `Draf Berita Acara ${p.prodiKode}`, subtitle: 'Konfirmasi Data • Modul Berita Acara',
        detail: `Mengonfirmasi bahwa data pada Draf Berita Acara ${p.prodiKode} sudah benar.`,
        before: 'Status: Menunggu konfirmasi data oleh Mahasiswa',
        after: 'Status: Terkonfirmasi Mahasiswa, menunggu checklist akhir Staf Administrasi',
      }
    case 'waiting_student_confirmation':
      return {
        ...base, ...stafActor, module: 'Berita Acara', type: 'Perubahan Data & Berkas',
        statusLabel: 'Perubahan Data & Berkas',
        title: `Draf Berita Acara ${p.prodiKode}`, subtitle: 'Kirim Draf • Modul Berita Acara',
        detail: `Mengirim draf data atas nama ${p.nama} (${p.prodiKode}) kepada Mahasiswa untuk dikonfirmasi.`,
        before: 'Status: Data penilaian sedang diperiksa Staf Administrasi',
        after: 'Status: Menunggu konfirmasi data oleh Mahasiswa',
      }
    case 'checking_akademik':
      return {
        ...base, ...stafActor, module: 'Berita Acara', type: 'Perubahan Data & Berkas',
        statusLabel: 'Perubahan Data & Berkas',
        title: `Berita Acara ${p.prodiKode}`, subtitle: 'Perubahan Data • Modul Berita Acara',
        detail: `Memperbarui 9 atribut kelulusan atas nama ${p.nama} (${p.prodiKode}).`,
        before: 'Status: Pengajuan diterima, atribut kelulusan belum lengkap',
        after: 'Status: Atribut kelulusan diisi Staf Administrasi, belum dikirim ke Mahasiswa',
      }
    case 'final_checked_akademik':
      return {
        ...base, ...stafActor, module: 'Berita Acara', type: 'Perubahan Data & Berkas',
        statusLabel: 'Perubahan Data & Berkas',
        title: `Berita Acara ${p.prodiKode}`, subtitle: 'Checklist Akhir • Modul Berita Acara',
        detail: `Menyelesaikan checklist akhir atas nama ${p.nama} (${p.prodiKode}).`,
        before: 'Status: Terkonfirmasi Mahasiswa, menunggu checklist akhir',
        after: 'Status: Lolos checklist akhir, siap diajukan dalam Berita Acara',
      }
    default:
      return {
        ...base, ...studentActor, module: 'Pengajuan Yudisium', type: 'Perubahan Data & Berkas',
        statusLabel: 'Perubahan Data & Berkas',
        title: `Pengajuan Yudisium ${p.prodiKode}`, subtitle: 'Perubahan Data & Berkas • Modul Pengajuan Yudisium',
        detail: `Mengajukan atau memperbarui berkas pengajuan yudisium atas nama ${p.nama}.`,
        before: 'Status: Belum ada pengajuan',
        after: 'Status: Pengajuan masuk, menunggu verifikasi Staf Administrasi',
      }
  }
}

// Entri untuk satu Berita Acara (gabungan beberapa mahasiswa)
function beritaAcaraEntry(baId, students) {
  const first = students[0]
  const raw = first.raw || {}
  const ba = raw.berita_acara || raw.beritaAcara || {}
  const status = String(first.beritaAcaraStatus || ba.status || '').toLowerCase()
  const time = pick(
    ba.updated_at,
    ...students.map((s) => s.raw?.updated_at).sort((a, b) => ms(b) - ms(a)),
    first.submittedAt
  )
  const prodi = first.prodiKode
  const count = students.length
  const base = {
    id: `ba-${baId}`, time, prodi, module: 'Berita Acara', actorMeta: '',
    title: `Berita Acara Prodi ${prodi}`,
  }
  const note = pick(ba.catatan, ba.catatan_penolakan, ba.alasan, ba.reject_reason)

  if (status === 'completed' || status === 'selesai') {
    return {
      ...base, actor: 'Manit & Kadep', roles: ['Manit', 'Kadep'], type: 'Pengesahan Berita Acara',
      statusLabel: 'Pengesahan Berita Acara', subtitle: 'Pengesahan Berita Acara • Modul Berita Acara',
      detail: `Mengesahkan secara final Berita Acara Yudisium Prodi ${prodi} (${count} mahasiswa) dan menerbitkan dokumen ke Histori.`,
      before: 'Status: Menunggu pengesahan akhir Manager Unit (Manit) dan Kadep',
      after: 'Status: Disahkan final & terkunci di Histori Berita Acara',
    }
  }
  if (status === 'approved_kaprodi') {
    return {
      ...base, actor: 'Kaprodi', roles: ['Kaprodi'], type: 'Pengesahan Berita Acara',
      statusLabel: 'Pengesahan Berita Acara', subtitle: 'Pengesahan Berita Acara • Modul Berita Acara',
      detail: `Menyetujui dan menandatangani Berita Acara Yudisium Prodi ${prodi} (${count} mahasiswa), diteruskan ke Manit dan Kadep.`,
      before: 'Status: Menunggu validasi Kepala Program Studi',
      after: 'Status: Disetujui Kaprodi, menunggu pengesahan Manit dan Kadep',
    }
  }
  if (BA_REJECTED.test(status)) {
    return {
      ...base, actor: 'Pejabat Pengesah', roles: ['Kaprodi', 'Kadep', 'Manit'], type: 'Dikembalikan',
      statusLabel: 'Dikembalikan', subtitle: 'Dikembalikan • Modul Berita Acara',
      detail: `Mengembalikan Draf Berita Acara ${prodi} ke Staf Administrasi.${note ? ` Catatan: '${note}'` : ''}`,
      before: 'Status: Menunggu persetujuan pejabat pengesah',
      after: `Status: Dikembalikan ke Staf Administrasi${note ? `\nCatatan: ${note}` : ''}`,
    }
  }
  // 'diajukan' / status lain: diajukan staf ke Kaprodi
  return {
    ...base, actor: 'Staf Akademik', roles: ['Staf Administrasi'], type: 'Perubahan Data & Berkas',
    statusLabel: 'Perubahan Data & Berkas', subtitle: 'Pengajuan Berita Acara • Modul Berita Acara',
    detail: `Mengajukan Berita Acara Yudisium Prodi ${prodi} (${count} mahasiswa) ke Kepala Program Studi.`,
    before: 'Status: Lolos checklist akhir, belum diajukan',
    after: 'Status: Diajukan, menunggu validasi Kepala Program Studi',
  }
}

// list = respons GET /staf-akademik/pengajuan (sudah berupa array item mentah)
export function buildRiwayat(list) {
  const items = (list || []).map(normalizePengajuan).filter((p) => p.id !== undefined && p.id !== null)
  const baGroups = new Map()
  const entries = []

  items.forEach((p) => {
    if (p.beritaAcaraId) {
      const key = String(p.beritaAcaraId)
      if (!baGroups.has(key)) baGroups.set(key, [])
      baGroups.get(key).push(p)
    } else {
      entries.push(studentEntry(p))
    }
  })
  baGroups.forEach((students, id) => entries.push(beritaAcaraEntry(id, students)))

  return entries.sort((a, b) => ms(b.time) - ms(a.time))
}

export function countByType(entries) {
  const out = Object.fromEntries(CHANGE_TYPES.map((t) => [t, 0]))
  entries.forEach((e) => {
    out[e.type] = (out[e.type] || 0) + 1
  })
  return out
}

export function filterRiwayat(entries, { role, module, type, query }) {
  const q = String(query || '').toLowerCase().trim()
  return entries.filter((e) => {
    if (role && role !== 'Semua Role' && !e.roles.includes(role)) return false
    if (module && e.module !== module) return false
    if (type && e.type !== type) return false
    if (q) {
      const hay = `${e.actor} ${e.actorMeta} ${e.detail} ${e.title} ${e.prodi}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}
