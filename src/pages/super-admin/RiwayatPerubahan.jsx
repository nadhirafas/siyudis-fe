import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  MessageSquareWarning,
  Undo2,
  FilePenLine,
  CircleCheck,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import ProfileMenu from '../../components/ProfileMenu'
import { errorMessage } from '../../services/api'
import { listPengajuanStaf } from '../../services/adminApi'
import {
  CHANGE_TYPES,
  MODULES,
  ROLE_TABS,
  buildRiwayat,
  countByType,
  filterRiwayat,
} from '../../services/riwayat'

const PAGE_SIZE = 10

// ==========================================
// STYLE BADGE
// ==========================================
const ROLE_STYLE = {
  Mahasiswa: 'bg-slate-100 text-slate-600 border-slate-200',
  'Staf Administrasi': 'bg-teal-50 text-teal-700 border-teal-200',
  Kaprodi: 'bg-blue-50 text-blue-700 border-blue-200',
  Kadep: 'bg-amber-50 text-amber-700 border-amber-200',
  Manit: 'bg-purple-50 text-purple-700 border-purple-200',
  'Super Admin': 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const TYPE_STYLE = {
  'Pengajuan Revisi': 'bg-[#FFF8E1] text-[#B45309] border-[#FDE68A]',
  Dikembalikan: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  'Perubahan Data & Berkas': 'bg-[#EEF4FF] text-[#1D4ED8] border-[#BFDBFE]',
  'Pengesahan Berita Acara': 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
}

function RoleChip({ role }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
        ROLE_STYLE[role] || ROLE_STYLE.Mahasiswa
      }`}
    >
      {role}
    </span>
  )
}

function TypeChip({ type, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
        TYPE_STYLE[type] || TYPE_STYLE['Perubahan Data & Berkas']
      }`}
    >
      <span className="text-[14px] leading-none">•</span>
      {label || type}
    </span>
  )
}

function initials(name = '') {
  return (
    String(name)
      .replace(/[^\p{L}\s&]/gu, '')
      .split(/\s+/)
      .filter((w) => w && w !== '&')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

// "29 Okt 2026, 15:10"
function formatWaktu(value, withWib = false) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date}, ${time}${withWib ? ' WIB' : ''}`
}

// ==========================================
// KARTU RINGKASAN
// ==========================================
const STAT_CARDS = [
  {
    type: 'Pengajuan Revisi',
    unit: 'Pengajuan',
    icon: MessageSquareWarning,
    color: 'text-[#D97706]',
    iconBox: 'bg-[#FFF8E1] text-[#D97706] border-[#FDE68A]',
    desc: 'Koreksi data draf Berita Acara yang diajukan oleh Mahasiswa',
  },
  {
    type: 'Dikembalikan',
    unit: 'Dikembalikan',
    icon: Undo2,
    color: 'text-[#DC2626]',
    iconBox: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    desc: 'Berkas/draf dikembalikan oleh Staf, Kaprodi, Kadep, atau Manit',
  },
  {
    type: 'Perubahan Data & Berkas',
    unit: 'Perubahan',
    icon: FilePenLine,
    color: 'text-[#0B3A68]',
    iconBox: 'bg-[#EEF4FF] text-[#1D4ED8] border-[#BFDBFE]',
    desc: 'Edit atribut Berita Acara, unggah ulang berkas, & konfigurasi',
  },
  {
    type: 'Pengesahan Berita Acara',
    unit: 'Pengesahan',
    icon: CircleCheck,
    color: 'text-[#047857]',
    iconBox: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    desc: 'Persetujuan & TTD Elektronik oleh Kaprodi, Kadep, & Manit',
  },
]

// ==========================================
// MODAL DETAIL
// ==========================================
function DetailModal({ entry, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-[880px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-7 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detail Riwayat Perubahan</h3>
            <p className="mt-0.5 text-xs text-slate-500">{formatWaktu(entry.time, true)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dilakukan Oleh</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#E0ECFB] text-lg font-bold text-[#0B3A68]">
                  {initials(entry.actor)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-900">{entry.actor}</p>
                  {entry.actorMeta && <p className="truncate text-xs text-slate-400">{entry.actorMeta}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {entry.roles.map((r) => (
                      <RoleChip key={r} role={r} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kategori dan Modul</p>
              <p className="mt-3 text-lg font-bold text-slate-900">{entry.title}</p>
              <p className="mt-1 text-xs text-slate-500">{entry.subtitle}</p>
              <div className="mt-2">
                <TypeChip type={entry.type} label={entry.statusLabel} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Perbandingan Data / Catatan:</h4>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="min-h-[130px] rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kondisi Sebelumnya</p>
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-600">{entry.before}</p>
              </div>
              <div className="min-h-[130px] rounded-2xl border border-blue-200 bg-[#EFF6FF] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0B3A68]">Kondisi Sesudah / Catatan</p>
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-600">{entry.after}</p>
              </div>
            </div>
            {/* TODO: endpoint belum ada — kondisi sebelumnya/sesudah diturunkan dari alur status, bukan dari log nilai yang tersimpan. */}
            <p className="mt-3 text-[10px] text-slate-400">
              Kondisi sebelumnya diturunkan dari alur status; backend belum menyimpan log perubahan nilai.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// HALAMAN UTAMA
// ==========================================
export default function RiwayatPerubahan() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [entries, setEntries] = useState([])

  const [role, setRole] = useState('Semua Role')
  const [query, setQuery] = useState('')
  const [module, setModule] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const load = useCallback(
    () =>
      listPengajuanStaf()
        .then((list) => {
          setEntries(buildRiwayat(list))
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat riwayat perubahan')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => countByType(entries), [entries])
  const filtered = useMemo(
    () => filterRiwayat(entries, { role, module, type, query }),
    [entries, role, module, type, query]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetFilter = () => {
    setRole('Semua Role')
    setQuery('')
    setModule('')
    setType('')
    setPage(1)
  }

  const selectCls =
    'h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs text-slate-600 outline-none focus:border-blue-500'

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <Sidebar admin />

      <div className="min-h-screen lg:pl-[295px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-4 pl-14 lg:px-8 lg:pl-8">
          <div>
            <h1 className="text-[20px] font-bold text-[#0F172A]">Riwayat Perubahan</h1>
            <p className="text-[10.5px] text-[#64748B]">Sistem Informasi Yudisium Terpadu DTEDI SV UGM</p>
          </div>
          <ProfileMenu fallbackName="Super Admin" />
        </header>

        <main className="space-y-5 p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Riwayat Perubahan dan Aktivitas Sistem</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Pantau seluruh pengajuan revisi, pengembalian dokumen, perubahan data, dan pengesahan yang dilakukan oleh
              Mahasiswa, Staf Administrasi, Kaprodi, Manit, maupun Kadep.
            </p>
          </div>

          {/* KARTU RINGKASAN */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map((c) => {
              const Icon = c.icon
              const active = type === c.type
              return (
                <button
                  key={c.type}
                  type="button"
                  onClick={() => {
                    setType(active ? '' : c.type)
                    setPage(1)
                  }}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                    active ? 'border-[#0B3A68] ring-1 ring-[#0B3A68]' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-bold text-slate-800">{c.type}</p>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${c.iconBox}`}>
                      <Icon size={16} />
                    </span>
                  </div>
                  <p className={`mt-3 text-2xl font-extrabold ${c.color}`}>
                    {loading ? '…' : `${counts[c.type] || 0} ${c.unit}`}
                  </p>
                  <p className="mt-2 text-[10.5px] leading-snug text-slate-400">{c.desc}</p>
                </button>
              )
            })}
          </div>

          {/* DAFTAR RIWAYAT */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Riwayat Perubahan</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Klik tab role atau pilih jenis perubahan untuk menyaring catatan aktivitas sistem.
                </p>
              </div>
              <button type="button" onClick={resetFilter} className="shrink-0 text-xs font-bold text-[#0B3A68] hover:underline">
                Reset Filter
              </button>
            </div>

            {/* TAB ROLE */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
              {ROLE_TABS.map((tab) => {
                const active = role === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setRole(tab)
                      setPage(1)
                    }}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      active ? 'bg-[#0B3A68] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            {/* PENCARIAN & FILTER */}
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_240px]">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Cari nama pengguna, mahasiswa, NIM, atau rincian perubahan..."
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <select
                  value={module}
                  onChange={(e) => {
                    setModule(e.target.value)
                    setPage(1)
                  }}
                  className={selectCls}
                >
                  <option value="">Semua Modul</option>
                  {MODULES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value)
                    setPage(1)
                  }}
                  className={selectCls}
                >
                  <option value="">Semua Jenis Perubahan</option>
                  {CHANGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {loadError && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <span className="flex items-center gap-2">
                  <AlertCircle size={14} /> {loadError}
                </span>
                <button
                  onClick={() => {
                    setLoading(true)
                    load()
                  }}
                  className="rounded-lg border border-rose-200 bg-white px-3 py-1 font-bold"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* TABEL */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Waktu</th>
                    <th className="px-4 py-3">Pengguna & Role</th>
                    <th className="px-4 py-3">Modul & Status Aksi</th>
                    <th className="px-4 py-3">Rincian Perubahan / Catatan</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        <Loader2 size={18} className="mx-auto animate-spin" />
                      </td>
                    </tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        {entries.length === 0
                          ? 'Belum ada aktivitas pengajuan yang tercatat.'
                          : 'Tidak ada riwayat yang cocok dengan filter.'}
                      </td>
                    </tr>
                  )}
                  {rows.map((e) => (
                    <tr key={e.id} className="align-middle hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-5 py-5 text-slate-600">{formatWaktu(e.time)}</td>
                      <td className="px-4 py-5">
                        <p className="font-bold text-slate-900">{e.actor}</p>
                        {e.actorMeta && <p className="mt-0.5 text-[10px] text-slate-400">{e.actorMeta}</p>}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {e.roles.map((r) => (
                            <RoleChip key={r} role={r} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-medium text-slate-800">{e.module}</p>
                        <div className="mt-1.5">
                          <TypeChip type={e.type} label={e.statusLabel} />
                        </div>
                      </td>
                      <td className="max-w-[320px] px-4 py-5 leading-relaxed text-slate-600">{e.detail}</td>
                      <td className="px-4 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelected(e)}
                          className="inline-flex flex-col items-center gap-0.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          <Eye size={13} className="text-[#0B3A68]" />
                          <span className="leading-tight">Lihat</span>
                          <span className="leading-tight">Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                <p>Menampilkan {filtered.length} riwayat perubahan</p>
                {/* TODO: endpoint belum ada — log aktivitas lengkap belum tersedia di API */}
                <p className="mt-0.5 text-[10px]">
                  Daftar diturunkan dari status pengajuan & Berita Acara terkini; log aktivitas lengkap belum disediakan backend.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#0B3A68] bg-[#E0ECFB] px-2 font-bold text-[#0B3A68]">
                  {safePage}
                </span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                  aria-label="Berikutnya"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selected && <DetailModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
