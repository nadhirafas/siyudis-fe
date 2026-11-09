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
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { getUser, logout } from '../../services/auth'
import { errorMessage } from '../../services/api'
import {
  listPengajuanStaf,
  listProgramStudi,
  listEvents,
  kirimKonfirmasi,
  checklistAkhir,
  ajukanBeritaAcara,
  updateBeritaAcaraMeta,
  previewBeritaAcara,
  exportBeritaAcara,
} from '../../services/adminApi'
import { normalizePengajuan, normalizeProdi, statusMeta, formatDate } from '../../services/normalize'

const PAGE_SIZE = 10

/* =========================================================
   TURUNAN STATUS (dari status pengajuan di backend)
========================================================= */
// Atribut (9 data penilaian) dianggap lengkap bila data sudah dikirim ke mahasiswa untuk dikonfirmasi
const ATRIBUT_LENGKAP = ['waiting_student_confirmation', 'confirmed_by_student', 'final_checked_akademik']

const statusAtribut = (p) => (ATRIBUT_LENGKAP.includes(p.status) || p.beritaAcaraId ? 'LENGKAP' : 'BELUM LENGKAP')

function statusKonfirmasi(p) {
  if (p.beritaAcaraId || ['confirmed_by_student', 'final_checked_akademik'].includes(p.status)) return 'TERKONFIRMASI'
  if (p.status === 'waiting_student_confirmation') return 'MENUNGGU KONFIRMASI'
  if (p.status === 'student_revision_requested') return 'PERLU REVISI'
  return '-'
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
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[9.5px] font-bold text-[#137333]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" /> LENGKAP
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9.5px] font-bold text-[#D97706]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> BELUM LENGKAP
    </span>
  )
}

function StatusBadgeKonfirmasi({ status }) {
  if (status === 'TERKONFIRMASI') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[9.5px] font-bold text-[#137333]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" /> TERKONFIRMASI
      </span>
    )
  }
  if (status === 'MENUNGGU KONFIRMASI') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9.5px] font-bold text-[#D97706]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> MENUNGGU KONFIRMASI
      </span>
    )
  }
  if (status === 'PERLU REVISI') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-[9.5px] font-bold text-[#DC2626]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" /> PERLU REVISI
      </span>
    )
  }
  return <span className="text-[10.5px] text-[#94A3B8]">-</span>
}

/* =========================================================
   MODAL KONFIRMASI AKSI MASSAL
========================================================= */
function ConfirmActionModal({ icon: Icon, tone = 'blue', title, description, rows, confirmLabel, busy, onClose, onConfirm }) {
  const tones = {
    blue: 'bg-[#E0ECFB] text-[#0A477F]',
    amber: 'bg-[#FEF3C7] text-[#D97706]',
    green: 'bg-[#E6F4EA] text-[#137333]',
  }
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]">
          <X size={18} />
        </button>
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={22} />
        </div>
        <h3 className="mt-4 text-center text-[15px] font-bold text-[#0F172A]">{title}</h3>
        <p className="mt-1.5 text-center text-[11px] leading-relaxed text-[#64748B]">{description}</p>
        <div className="mt-4 max-h-[160px] space-y-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[11px]">
          {rows.map((r, idx) => (
            <div key={r.id} className="flex justify-between gap-3 text-[#334155]">
              <span>
                {idx + 1}. {r.nama}
              </span>
              <span className="text-[#64748B]">{r.nim}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="h-[36px] flex-1 rounded-xl border border-[#CBD5E1] bg-white text-[10.5px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
          >
            Batal
          </button>
          <button
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
   MODAL HASIL AKSI MASSAL
========================================================= */
function ResultModal({ title, results, footnote, onClose }) {
  const okCount = results.filter((r) => r.ok).length
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#0F172A]">
          <X size={18} />
        </button>
        <h3 className="text-[15px] font-bold text-[#0F172A]">{title}</h3>
        <p className="mt-1 text-[11px] text-[#64748B]">
          {okCount} dari {results.length} berhasil diproses.
        </p>
        <div className="mt-4 max-h-[260px] space-y-1.5 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[10.5px]">
          {results.map((r, idx) => (
            <div key={r.id} className="flex items-start justify-between gap-3 text-[#334155]">
              <span>
                {idx + 1}. {r.nama}
              </span>
              {r.ok ? (
                <span className="flex shrink-0 items-center gap-1 text-[9.5px] font-semibold text-[#137333]">
                  <Check size={11} /> Berhasil
                </span>
              ) : (
                <span className="max-w-[220px] text-right text-[9.5px] font-semibold text-[#DC2626]">{r.message}</span>
              )}
            </div>
          ))}
        </div>
        {footnote && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#0A477F]/20 bg-[#F0F7FF] p-3 text-[10px] leading-4 text-[#0A477F]">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{footnote}</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-5 h-[36px] w-full rounded-xl bg-[#0A477F] text-[10.5px] font-bold text-white hover:bg-[#083866]"
        >
          Selesai
        </button>
      </div>
    </div>
  )
}

/* =========================================================
   MODAL PRATINJAU BERITA ACARA (HTML dari backend)
========================================================= */
function PreviewModal({ html, loading, error, onClose, onDownload, downloading }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-[900px] flex-col rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-[14px] font-bold text-[#0F172A]">Pratinjau Berita Acara</h3>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                disabled={downloading}
                className="flex h-[30px] items-center gap-1.5 rounded-xl bg-[#0A477F] px-3 text-[10px] font-bold text-white hover:bg-[#083866] disabled:opacity-60"
              >
                {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Unduh PDF
              </button>
            )}
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A]">
              <X size={18} />
            </button>
          </div>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#64748B]">
            <Loader2 size={15} className="animate-spin" /> Memuat pratinjau...
          </div>
        )}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[11px] text-rose-700">{error}</div>}
        {html && <iframe title="Pratinjau Berita Acara" sandbox="" srcDoc={html} className="h-[70vh] w-full rounded-xl border border-[#E2E8F0] bg-white" />}
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

  // Konfigurasi dokumen (dikirim ke backend saat Berita Acara diajukan)
  const [nomorSurat, setNomorSurat] = useState('')
  const [tanggalSurat, setTanggalSurat] = useState('')
  const [periodeDraft, setPeriodeDraft] = useState(null)
  const [pickedEventId, setPickedEventId] = useState('')
  const [isConfigSaved, setIsConfigSaved] = useState(false)

  // Tabs & pilihan
  const [activeTab, setActiveTab] = useState('active')
  const [pickedProdiId, setPickedProdiId] = useState('')
  const [selectedBaKey, setSelectedBaKey] = useState(null)

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [filterAtribut, setFilterAtribut] = useState('')
  const [filterKonfirmasi, setFilterKonfirmasi] = useState('')
  const [page, setPage] = useState(1)

  // Aksi
  const [confirm, setConfirm] = useState(null) // 'send' | 'checklist' | 'ajukan'
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState(null)
  const [preview, setPreview] = useState(null) // { baId, html, loading, error }
  const [downloading, setDownloading] = useState(false)

  const loadAll = useCallback(
    () =>
      Promise.all([listPengajuanStaf(), listProgramStudi().catch(() => []), listEvents().catch(() => [])])
        .then(([pengajuanRes, prodiRes, eventRes]) => {
          setPengajuan(pengajuanRes.map(normalizePengajuan))
          setProdis(prodiRes.map(normalizeProdi))
          setEvents(eventRes)
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
    events.find((e) => String(e.id) === String(pickedEventId)) || events.find((e) => e.is_active) || events[0] || null
  const periodeText = periodeDraft ?? effectiveEvent?.periode ?? ''

  // Mahasiswa prodi yang belum masuk Berita Acara
  const prodiStudents = useMemo(
    () => pengajuan.filter((p) => String(p.prodiId) === selectedProdiId && !p.beritaAcaraId),
    [pengajuan, selectedProdiId]
  )

  const targets = useMemo(
    () => ({
      send: prodiStudents.filter((p) => p.status === 'checking_akademik'),
      checklist: prodiStudents.filter((p) => p.status === 'confirmed_by_student'),
      ajukan: prodiStudents.filter((p) => p.status === 'final_checked_akademik'),
    }),
    [prodiStudents]
  )

  const needRevision = prodiStudents.filter((p) => p.status === 'student_revision_requested')

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
            eventNama: ev ? `${ev.nama_event}${ev.periode ? ` — ${ev.periode}` : ''}` : p.eventName || '-',
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
      const matchSearch = !keyword || st.nama.toLowerCase().includes(keyword) || String(st.nim).toLowerCase().includes(keyword)
      const matchAtribut = !filterAtribut || statusAtribut(st) === filterAtribut
      const matchKonfirmasi = !filterKonfirmasi || statusKonfirmasi(st) === filterKonfirmasi
      return matchSearch && matchAtribut && matchKonfirmasi
    })
  }, [activeTab, selectedBa, prodiStudents, search, filterAtribut, filterKonfirmasi])

  const showingGroups = activeTab === 'history' && !selectedBa
  const totalRows = showingGroups ? baGroups.length : filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = (list) => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const countLengkap = prodiStudents.filter((st) => statusAtribut(st) === 'LENGKAP').length

  /* ---------- aksi massal ---------- */
  const runBulk = async (list, action) => {
    const out = []
    for (const st of list) {
      try {
        await action(st.id)
        out.push({ id: st.id, nama: st.nama, ok: true })
      } catch (err) {
        out.push({ id: st.id, nama: st.nama, ok: false, message: errorMessage(err, 'Gagal diproses') })
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
      title: 'Hasil Pengiriman Email Konfirmasi',
      results: out,
      footnote:
        'Status mahasiswa yang berhasil berubah menjadi Menunggu Konfirmasi hingga mahasiswa menyetujui atau meminta revisi data.',
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
      results: out,
      footnote: 'Mahasiswa yang lolos checklist akhir siap diajukan ke Kaprodi melalui Berita Acara.',
    })
    loadAll()
  }

  const handleAjukan = async () => {
    if (!effectiveEvent) {
      setConfirm(null)
      return flash('error', 'Belum ada periode yudisium. Buat periode terlebih dahulu di halaman Pengajuan Yudisium.')
    }
    setBusy(true)
    try {
      const created = await ajukanBeritaAcara({
        yudisium_event_id: Number(effectiveEvent.id),
        program_studi_id: Number(selectedProdiId),
        pengajuan_ids: targets.ajukan.map((p) => Number(p.id)),
      })
      const baId = created?.id ?? created?.berita_acara_id ?? created?.berita_acara?.id

      const meta = {}
      if (nomorSurat.trim()) meta.nomor_surat = nomorSurat.trim()
      if (tanggalSurat) meta.tanggal_surat = tanggalSurat
      if (periodeText.trim()) meta.periode = periodeText.trim()

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
          : `Berita Acara ${selectedProdi?.kode || ''} berhasil diajukan ke Kaprodi.`
      )
    } catch (err) {
      setConfirm(null)
      flash('error', errorMessage(err, 'Gagal mengajukan Berita Acara'))
    } finally {
      setBusy(false)
    }
  }

  /* ---------- preview & export ---------- */
  const openPreview = async (baId) => {
    setPreview({ baId, html: '', loading: true, error: '' })
    try {
      const data = await previewBeritaAcara(baId)
      setPreview({ baId, html: data?.html || '', loading: false, error: data?.html ? '' : 'Pratinjau kosong.' })
    } catch (err) {
      setPreview({ baId, html: '', loading: false, error: errorMessage(err, 'Gagal memuat pratinjau') })
    }
  }

  const handleDownload = async (baId) => {
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
      flash('error', errorMessage(err, 'Gagal mengunduh PDF (PDF baru tersedia setelah Manit dan Kadep menyetujui)'))
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
    'h-[36px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-[10.5px] text-[#1E293B] outline-none focus:border-[#0A477F]'
  const thCls = 'px-5 py-2.5 text-left text-[8.5px] font-bold uppercase text-[#64748B]'
  const outlineBtn =
    'flex h-[36px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 text-[10.5px] font-bold text-[#475569] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-[#1E293B]">
      <Sidebar admin />

      <main className="ml-[280px] min-h-screen">
        {/* TOP NAVBAR */}
        <header className="relative z-30 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
          <div>
            <h1 className="text-[20px] font-bold text-[#0F172A]">Berita Acara Staff Administrasi</h1>
            <p className="text-[10.5px] text-[#64748B]">Sistem Informasi Yudisium Terpadu DTEDI SV UGM</p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-[#F8FAFC]"
            >
              <ProfileAvatar photo={user?.avatar} />
              <span className="max-w-[200px] truncate text-[12px] font-bold text-[#1E293B]">{displayName}</span>
              <ChevronDown size={14} className={`text-[#64748B] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
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
        <div className="mx-auto max-w-[1100px] px-8 py-6">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <h2 className="text-[18px] font-bold text-[#0F172A]">Pengelolaan Berita Acara Yudisium</h2>
            <p className="mt-1 text-[11px] text-[#64748B]">
              Kirim draf data ke mahasiswa, lakukan checklist akhir, lalu ajukan Berita Acara per program studi ke Kaprodi.
            </p>
          </section>

          {notice && (
            <div
              className={`mt-5 flex items-center justify-between rounded-xl border px-4 py-3 text-[11px] font-medium ${
                notice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              <span>{notice.text}</span>
              <button onClick={() => setNotice(null)}>
                <X size={13} />
              </button>
            </div>
          )}

          {loadError && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-[11px] text-rose-700">
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

          {/* KONFIGURASI DOKUMEN */}
          <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <h3 className="text-[13.5px] font-bold text-[#0F172A]">Konfigurasi Dokumen Berita Acara</h3>
            <p className="mt-0.5 text-[10.5px] text-[#64748B]">
              Nilai di bawah dikirim ke backend bersamaan dengan pengajuan Berita Acara.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[9.5px] font-bold text-[#475569]">Periode Yudisium (Event)</label>
                <div className="relative">
                  <select
                    value={effectiveEvent ? String(effectiveEvent.id) : ''}
                    onChange={(e) => {
                      setPickedEventId(e.target.value)
                      setPeriodeDraft(null)
                    }}
                    className={`${fieldCls} appearance-none pr-8`}
                  >
                    {events.length === 0 && <option value="">Belum ada periode</option>}
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.nama_event} — {ev.periode}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold text-[#475569]">Periode (tercetak di dokumen)</label>
                <input
                  type="text"
                  value={periodeText}
                  onChange={(e) => {
                    setPeriodeDraft(e.target.value)
                    setIsConfigSaved(false)
                  }}
                  placeholder="Genap 2025/2026"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold text-[#475569]">Nomor Surat</label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => {
                    setNomorSurat(e.target.value)
                    setIsConfigSaved(false)
                  }}
                  maxLength={100}
                  placeholder="BA/001/DTEDI/2026"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold text-[#475569]">Tanggal Surat</label>
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
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsConfigSaved(true)}
                disabled={isConfigSaved}
                className={`flex h-[34px] items-center gap-1.5 rounded-xl px-4 text-[10.5px] font-bold text-white transition ${
                  isConfigSaved ? 'bg-[#137333]' : 'bg-[#0A477F] hover:bg-[#083866]'
                }`}
              >
                {isConfigSaved ? (
                  <>
                    Siap Dikirim <Check size={14} />
                  </>
                ) : (
                  <>
                    Terapkan <Save size={14} />
                  </>
                )}
              </button>
            </div>
          </section>

          {/* PILIH PROGRAM STUDI */}
          <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <h3 className="text-[13.5px] font-bold text-[#0F172A]">Pilih Program Studi Berita Acara</h3>
            <div className="mt-3.5 grid grid-cols-4 gap-3">
              {prodis.map((p) => {
                const list = pengajuan.filter((s) => String(s.prodiId) === String(p.id) && !s.beritaAcaraId)
                const lengkap = list.filter((s) => statusAtribut(s) === 'LENGKAP').length
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
                      active ? 'border-2 border-[#0A477F] bg-[#EEF4FF]' : 'border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-[#0A477F] px-2 py-0.5 text-[9.5px] font-bold text-white">{p.kode}</span>
                        <span className="text-[10px] font-medium text-[#475569]">{list.length} Mahasiswa</span>
                      </div>
                      <h4 className="mt-2.5 text-[11px] font-bold leading-4 text-[#0F172A]">{p.nama}</h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[9.5px] font-bold text-[#0A477F]">
                      <span>
                        {lengkap}/{list.length} Atribut Lengkap
                      </span>
                      <ArrowRight size={12} />
                    </div>
                  </button>
                )
              })}
              {!loading && prodis.length === 0 && <p className="col-span-4 text-[11px] text-[#94A3B8]">Belum ada program studi.</p>}
            </div>
          </section>

          {/* BANNER REVISI */}
          {needRevision.length > 0 && (
            <section className="mt-5 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-4 text-[#92400E]">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FDE68A] text-[#D97706]">
                  <AlertTriangle size={16} />
                </div>
                <div className="text-[11px]">
                  <h4 className="font-bold text-[#B45309]">
                    {needRevision.length} mahasiswa {selectedProdi?.kode} meminta revisi data
                  </h4>
                  <p className="mt-0.5 leading-4 text-[#78350F]">
                    {needRevision.map((s, i) => (
                      <span key={s.id} className="font-semibold">
                        {i > 0 && ', '}({i + 1}) {s.nama}
                      </span>
                    ))}{' '}
                    — perbaiki data penilaian di halaman Pengajuan Yudisium, lalu kirim ulang konfirmasi.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* TAB SWAPPER */}
          <div className="mt-5 inline-flex rounded-xl bg-[#E2E8F0] p-1">
            <button
              type="button"
              onClick={() => switchTab('active')}
              className={`flex h-[32px] items-center gap-2 rounded-lg px-3.5 text-[10.5px] font-bold transition ${
                activeTab === 'active' ? 'bg-white text-[#0A477F] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              <Inbox size={13} /> Penyusunan Berita Acara Aktif
              <span className="rounded-full bg-[#E0ECFB] px-2 py-0.5 text-[8.5px] text-[#0A477F]">{prodiStudents.length}</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('history')}
              className={`flex h-[32px] items-center gap-2 rounded-lg px-3.5 text-[10.5px] font-bold transition ${
                activeTab === 'history' ? 'bg-white text-[#0A477F] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              <History size={13} /> Histori Berita Acara
              <span className="rounded-full bg-[#E0ECFB] px-2 py-0.5 text-[8.5px] text-[#0A477F]">{baGroups.length}</span>
            </button>
          </div>

          {/* MAIN CARD TABEL */}
          <section className="mt-3.5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <div className="p-5 pb-0">
              {activeTab === 'history' && selectedBa && (
                <div className="mb-3.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBaKey(null)
                      setPage(1)
                    }}
                    className="flex h-[30px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 text-[10px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
                  >
                    <ChevronLeft size={13} /> Kembali
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openPreview(selectedBa.id)}
                      className="flex h-[30px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 text-[10px] font-bold text-[#475569] hover:bg-[#F1F5F9]"
                    >
                      <Eye size={13} /> Lihat Draft
                    </button>
                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleDownload(selectedBa.id)}
                      className="flex h-[30px] items-center gap-1.5 rounded-xl bg-[#0A477F] px-3 text-[10px] font-bold text-white hover:bg-[#083866] disabled:opacity-60"
                    >
                      {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Unduh PDF
                    </button>
                  </div>
                </div>
              )}

              <h3 className="text-[13.5px] font-bold text-[#0F172A]">
                {activeTab === 'active'
                  ? `Daftar Mahasiswa ${selectedProdi?.kode || ''}${effectiveEvent ? ` - ${effectiveEvent.nama_event}` : ''}`
                  : selectedBa
                  ? `Berita Acara ${selectedBa.prodiNama} - ${selectedBa.eventNama}`
                  : 'Histori Berita Acara Yudisium'}
              </h3>
              <p className="mt-0.5 text-[10.5px] text-[#64748B]">
                {activeTab === 'active'
                  ? 'Mahasiswa yang belum masuk Berita Acara. Yang sudah diajukan ke Kaprodi pindah ke tab Histori.'
                  : 'Berita Acara yang sudah diajukan ke Kaprodi. Mahasiswa di dalamnya tidak dapat diajukan kembali.'}
              </p>

              {/* SEARCH & FILTER BAR */}
              {!showingGroups && (
                <div className="mt-3.5 flex items-center gap-2.5">
                  <div className="relative w-[300px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                      }}
                      placeholder="Cari Nama / NIM..."
                      className="h-[36px] w-full rounded-xl border border-[#CBD5E1] bg-white pl-8 pr-3 text-[10.5px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#0A477F]"
                    />
                  </div>
                  <div className="relative w-[160px]">
                    <select
                      value={filterAtribut}
                      onChange={(e) => {
                        setFilterAtribut(e.target.value)
                        setPage(1)
                      }}
                      className="h-[36px] w-full appearance-none rounded-xl border border-[#CBD5E1] bg-white px-3 pr-8 text-[10.5px] text-[#475569] outline-none focus:border-[#0A477F]"
                    >
                      <option value="">Status Atribut</option>
                      <option>LENGKAP</option>
                      <option>BELUM LENGKAP</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  </div>
                  <div className="relative w-[190px]">
                    <select
                      value={filterKonfirmasi}
                      onChange={(e) => {
                        setFilterKonfirmasi(e.target.value)
                        setPage(1)
                      }}
                      className="h-[36px] w-full appearance-none rounded-xl border border-[#CBD5E1] bg-white px-3 pr-8 text-[10.5px] text-[#475569] outline-none focus:border-[#0A477F]"
                    >
                      <option value="">Status Konfirmasi</option>
                      <option>TERKONFIRMASI</option>
                      <option>MENUNGGU KONFIRMASI</option>
                      <option>PERLU REVISI</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  </div>
                </div>
              )}
            </div>

            {/* TABEL DATA UTAMA */}
            <div className="mt-4 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-[11px] text-[#64748B]">
                  <Loader2 size={15} className="animate-spin" /> Memuat data...
                </div>
              ) : showingGroups ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className={thCls}>NO</th>
                      <th className={thCls}>PERIODE / PRODI</th>
                      <th className={thCls}>TANGGAL YUDISIUM</th>
                      <th className={thCls}>STATUS BA</th>
                      <th className={thCls}>JUMLAH</th>
                      <th className={`${thCls} text-center`}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {slice(baGroups).map((g, idx) => (
                      <tr key={g.key} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3 text-[10.5px] text-[#64748B]">{String((safePage - 1) * PAGE_SIZE + idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-3">
                          <p className="text-[11px] font-bold text-[#0F172A]">{g.eventNama}</p>
                          <p className="text-[8.5px] text-[#64748B]">{g.prodiNama}</p>
                        </td>
                        <td className="px-5 py-3 text-[10.5px] text-[#0F172A]">{g.tanggalYudisium}</td>
                        <td className="px-5 py-3 text-[10.5px] font-semibold uppercase text-[#0A477F]">{String(g.status).replace(/_/g, ' ')}</td>
                        <td className="px-5 py-3 text-[10.5px] text-[#0F172A]">{g.students.length} Mahasiswa</td>
                        <td className="px-5 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBaKey(g.key)
                              setPage(1)
                            }}
                            className="inline-flex h-[28px] items-center gap-1 rounded-lg bg-[#0A477F] px-3 text-[9.5px] font-bold text-white hover:bg-[#083866]"
                          >
                            <Eye size={11} /> Lihat
                          </button>
                        </td>
                      </tr>
                    ))}
                    {baGroups.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-[11px] text-[#94A3B8]">
                          Belum ada Berita Acara yang diajukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className={thCls}>NO</th>
                      <th className={thCls}>MAHASISWA</th>
                      <th className={thCls}>STATUS PENGAJUAN</th>
                      <th className={thCls}>STATUS ATRIBUT</th>
                      <th className={thCls}>STATUS KONFIRMASI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {slice(filteredStudents).map((st, idx) => {
                      const meta = statusMeta(st.status)
                      return (
                        <tr key={st.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-5 py-3 text-[10.5px] text-[#64748B]">{String((safePage - 1) * PAGE_SIZE + idx + 1).padStart(2, '0')}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E0ECFB] text-[9.5px] font-bold text-[#0A477F]">
                                {st.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-[#0F172A]">{st.nama}</p>
                                <p className="text-[8.5px] text-[#64748B]">{st.nim}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[10px] font-bold text-[#475569]">{meta.label}</td>
                          <td className="px-5 py-3">
                            <StatusBadgeAtribut status={statusAtribut(st)} />
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadgeKonfirmasi status={statusKonfirmasi(st)} />
                          </td>
                        </tr>
                      )
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-[11px] text-[#94A3B8]">
                          Tidak ada mahasiswa yang cocok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-5 py-3.5">
              <p className="text-[10.5px] text-[#64748B]">
                {showingGroups ? `Menampilkan ${baGroups.length} berita acara` : `Menampilkan ${filteredStudents.length} mahasiswa`}
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
                <span className="px-1 text-[10.5px] text-[#64748B]">/ {totalPages}</span>
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
          </section>

          {/* BOTTOM ACTION BAR */}
          {activeTab === 'active' && (
            <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
              <div className="flex max-w-[380px] items-start gap-2 text-[11px] text-[#475569]">
                <CheckCircle2
                  size={16}
                  className={`mt-0.5 shrink-0 ${targets.ajukan.length > 0 ? 'text-[#137333]' : 'text-[#94A3B8]'}`}
                />
                <span>
                  {targets.ajukan.length > 0
                    ? `${targets.ajukan.length} mahasiswa ${selectedProdi?.kode || ''} lolos checklist akhir dan siap diajukan ke Kaprodi.`
                    : `${countLengkap}/${prodiStudents.length} mahasiswa atribut lengkap. Belum ada yang siap diajukan.`}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={targets.send.length === 0}
                  onClick={() => setConfirm('send')}
                  className={outlineBtn}
                >
                  <Send size={13} /> Kirim Draft ke Mahasiswa ({targets.send.length})
                </button>
                <button
                  type="button"
                  disabled={targets.checklist.length === 0}
                  onClick={() => setConfirm('checklist')}
                  className={outlineBtn}
                >
                  <ListChecks size={13} /> Checklist Akhir ({targets.checklist.length})
                </button>
                <button
                  type="button"
                  disabled={targets.ajukan.length === 0}
                  onClick={() => setConfirm('ajukan')}
                  className="flex h-[36px] items-center gap-2 rounded-xl bg-[#0A477F] px-5 text-[10.5px] font-bold text-white transition hover:bg-[#083866] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ajukan ke Kaprodi ({targets.ajukan.length}) <ArrowRight size={13} />
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {confirm === 'send' && (
        <ConfirmActionModal
          icon={Send}
          tone="amber"
          title="Kirim Draf Data ke Mahasiswa?"
          description="Sistem mengirim email konfirmasi ke mahasiswa berikut agar memeriksa kebenaran data penilaiannya."
          rows={targets.send}
          confirmLabel="Ya, Kirim Sekarang"
          busy={busy}
          onClose={() => setConfirm(null)}
          onConfirm={handleBulkSend}
        />
      )}
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
      {confirm === 'ajukan' && (
        <ConfirmActionModal
          icon={ArrowRight}
          tone="green"
          title={`Ajukan Berita Acara ${selectedProdi?.kode || ''} ke Kaprodi?`}
          description={`Berita Acara dibuat untuk periode ${effectiveEvent?.nama_event || '-'}${
            nomorSurat ? `, nomor ${nomorSurat}` : ''
          }. Mahasiswa di bawah ini akan dimasukkan dan tidak bisa diajukan ulang.`}
          rows={targets.ajukan}
          confirmLabel="Ya, Ajukan"
          busy={busy}
          onClose={() => setConfirm(null)}
          onConfirm={handleAjukan}
        />
      )}
      {results && <ResultModal {...results} onClose={() => setResults(null)} />}
      {preview && (
        <PreviewModal
          html={preview.html}
          loading={preview.loading}
          error={preview.error}
          downloading={downloading}
          onDownload={() => handleDownload(preview.baId)}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
