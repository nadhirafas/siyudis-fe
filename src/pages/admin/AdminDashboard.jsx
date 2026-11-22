import { useState, useEffect } from 'react'
import { useAreaNavigate } from '../../components/useAreaNavigate'
import {
  ChevronDown,
  UserRound,
  LogOut,
  FileText,
  Clock3,
  ShieldCheck,
  ClipboardList,
  ArrowRight,
  Menu,
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import { getUser, logout } from '../../services/auth'
import { errorMessage } from '../../services/api'
import { listPengajuanStaf, listProgramStudi, listEvents } from '../../services/adminApi'
import { normalizePengajuan, normalizeProdi, formatDate } from '../../services/normalize'

const VERIFY_STATUSES = ['submitted', 'checking_akademik', 'student_revision_requested']

function computeStats(items, prodis) {
  const count = (list, statuses) => list.filter((p) => statuses.includes(p.status)).length
  const summarize = (list) => ({
    total: list.length,
    verify: count(list, VERIFY_STATUSES),
    waiting: count(list, ['waiting_student_confirmation']),
    confirmed: count(list, ['confirmed_by_student']),
    final: count(list, ['final_checked_akademik']),
    inBA: list.filter((p) => p.beritaAcaraId).length,
  })

  const byProdi = new Map()
  prodis.forEach((p) => byProdi.set(String(p.id), { name: p.kode || p.nama, list: [] }))
  items.forEach((p) => {
    const key = String(p.prodiId ?? p.prodiKode)
    if (!byProdi.has(key)) byProdi.set(key, { name: p.prodiKode, list: [] })
    byProdi.get(key).list.push(p)
  })

  const prodiList = [...byProdi.values()]
    .filter((g) => g.list.length > 0)
    .map((g) => ({ name: g.name, ...summarize(g.list) }))

  // Hitung prodi yang belum diterbitkan ke BA (draft prodi aktif)
  const activeDraftProdis = prodiList.filter((p) => p.total - p.inBA > 0)
  const readyProdisCount = activeDraftProdis.filter(
    (p) => p.verify === 0 && p.waiting === 0 && p.confirmed + p.final > 0
  ).length
  const waitingProdisCount = Math.max(0, activeDraftProdis.length - readyProdisCount)

  return {
    all: summarize(items),
    prodi: prodiList,
    activeDraftProdiCount: activeDraftProdis.length,
    readyProdisCount,
    waitingProdisCount,
  }
}

function AdminDashboard() {
  const navigate = useAreaNavigate()

  const [user] = useState(() => getUser())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)

  const displayName = user?.nama || 'Staf Akademik'

  useEffect(() => {
    let cancelled = false
    Promise.all([
      listPengajuanStaf(),
      listProgramStudi().catch(() => []),
      listEvents().catch(() => []),
    ])
      .then(([pengajuan, prodis, events]) => {
        if (cancelled) return
        setStats(computeStats(pengajuan.map(normalizePengajuan), prodis.map(normalizeProdi)))
        const currentEvent =
          events.find((e) => e.is_active || e.status === 'active' || e.status === 'open') || null
        setActiveEvent(currentEvent)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, 'Gagal memuat ringkasan pengajuan'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const hasSubmission = Boolean(stats && stats.all.total > 0)

  const handleLogout = async () => {
    await logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#111827]">
      {/* SIDEBAR */}
      <Sidebar admin isOpen={sidebarOpen} onClose={setSidebarOpen} />

      {/* MAIN CONTENT */}
      <div className="min-h-screen lg:ml-[295px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[72px] lg:h-[82px] items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#172f55] transition hover:bg-slate-100 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={24} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-[18px] sm:text-[23px] lg:text-[25px] font-bold leading-tight text-[#111111]">
                Dashboard Staff Administrasi
              </h1>

              <p className="hidden sm:block mt-0.5 text-[12px] text-[#687588]">
                Sistem Informasi Yudisium Terpadu DTEDI SV UGM
              </p>
            </div>
          </div>

          {/* PROFILE */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-2.5 rounded-full p-1 sm:rounded-xl sm:px-2 sm:py-1.5 transition hover:bg-gray-50"
            >
              <ProfileAvatar photo={user?.avatar} name={displayName} />

              <span className="hidden md:inline max-w-[210px] truncate text-[14px] font-bold text-[#111111]">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className={`hidden md:block text-[#667085] transition-transform ${
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

        {/* CONTENT */}
        <main className="px-4 sm:px-7 py-6 sm:py-7">
          {/* WELCOME BANNER */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#174A7C] to-[#3B6498] px-6 sm:px-10 py-6 sm:py-8 text-white shadow-sm">
            <div className="absolute -right-8 -top-14 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute -right-16 top-5 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute right-20 -top-10 h-28 w-28 rounded-full bg-white/[0.04]" />

            <div className="relative z-10">
              <h2 className="text-[22px] sm:text-[28px] lg:text-[30px] font-bold leading-snug">
                Selamat Datang, {displayName}!
              </h2>

              <p className="mt-2 sm:mt-3 text-[13px] sm:text-[16px] leading-relaxed text-white/95">
                Pusat kendali dan layanan terpadu pendaftaran yudisium Sarjana Terapan DTEDI SV UGM.
              </p>
            </div>
          </section>

          {/* PERIODE YUDISIUM BANNER */}
          {!loading && (
            <PeriodeBanner
              activeEvent={activeEvent}
              onAction={() => navigate('/admin/pengajuan-yudisium')}
            />
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-[13px] text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-5 flex min-h-[200px] items-center justify-center rounded-2xl bg-white text-[13px] text-[#687588] shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
              Memuat ringkasan pengajuan...
            </div>
          ) : hasSubmission ? (
            <ActiveDashboard navigate={navigate} stats={stats} />
          ) : (
            <EmptyDashboard navigate={navigate} />
          )}
        </main>
      </div>
    </div>
  )
}

/* =========================================================
   PERIODE BANNER (EMPTY & ACTIVE)
========================================================= */

function PeriodeBanner({ activeEvent, onAction }) {
  const isOpen = Boolean(activeEvent)
  const tglMulai = activeEvent?.tgl_mulai ? formatDate(activeEvent.tgl_mulai) : null
  const tglSelesai = activeEvent?.tgl_selesai ? formatDate(activeEvent.tgl_selesai) : null
  const tglYudisium = activeEvent?.tgl_yudisium ? formatDate(activeEvent.tgl_yudisium) : null

  return (
    <section className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3.5 shadow-[0_3px_10px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] sm:mt-0">
          <Clock3 size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-[12.5px] font-bold text-[#151C2D]">
            {isOpen
              ? `${activeEvent.nama_event || 'Periode Yudisium'} Sedang Aktif`
              : 'Belum Ada Periode Yudisium yang Dibuka'}
          </p>
          <p className="mt-0.5 text-[11px] text-[#687588]">
            {isOpen
              ? `Pendaftaran dibuka ${tglMulai || '-'} – ${tglSelesai || '-'}${
                  tglYudisium ? `. Yudisium dilaksanakan ${tglYudisium}.` : '.'
                }`
              : 'Formulir pengajuan di sisi mahasiswa saat ini terkunci. Buka periode baru untuk mulai menerima berkas yudisium.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#03447E] px-4 py-2 text-[11.5px] font-bold text-white transition hover:bg-[#063B69] sm:self-center"
      >
        {isOpen ? 'Kelola Periode' : 'Buka Periode Baru'}
        <ArrowRight size={14} />
      </button>
    </section>
  )
}

/* =========================================================
   ACTIVE DASHBOARD
========================================================= */

function ActiveDashboard({ navigate, stats }) {
  const { all, prodi, activeDraftProdiCount, readyProdisCount, waitingProdisCount } = stats
  const totalInDraft = all.waiting + all.confirmed + all.final

  return (
    <>
      {/* RINGKASAN ANTREAN */}
      <section className="mt-5 rounded-2xl bg-white p-4 sm:p-5 shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
        {/* TITLE */}
        <div className="flex items-center gap-3 px-1 sm:px-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#06447B]">
            <ClipboardList size={20} />
          </div>

          <h2 className="text-[16px] sm:text-[17px] font-bold text-[#151C2D]">
            Ringkasan Antrean Yudisium Aktif
          </h2>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mt-3 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SummaryCard
            type="warning"
            badge={`${all.verify} BERKAS MASUK`}
            title={`Perlu Verifikasi ${all.verify} Pengajuan`}
            description={`${all.verify} pengajuan mahasiswa menunggu verifikasi kelengkapan dokumen persyaratan.`}
          />

          <SummaryCard
            type="orange"
            badge={`${waitingProdisCount} DRAFT BERITA ACARA`}
            title="Konfirmasi Kolektif 9 Atribut"
            description={
              all.waiting > 0
                ? `Draft Berita Acara per prodi menunggu respon konfirmasi dari ${all.waiting} mahasiswa.`
                : 'Seluruh draft Berita Acara yang dikirim telah direspon mahasiswa.'
            }
          />

          <SummaryCard
            type="success"
            badge={`${readyProdisCount} BERITA ACARA SIAP KAPRODI`}
            title="BA Lengkap & Siap Diajukan"
            description={
              all.final > 0
                ? `${all.final} mahasiswa telah terkonfirmasi lengkap dan lolos checklist akhir. Siap pengesahan Kaprodi.`
                : `${all.confirmed} mahasiswa terkonfirmasi menunggu checklist akhir sebelum diajukan ke Kaprodi.`
            }
          />
        </div>

        {/* PROGRAM STUDY */}
        {prodi.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-[#F8FAFC] p-3 md:grid-cols-2 xl:grid-cols-4">
            {prodi.map((p) => (
              <ProgramCard
                key={p.name}
                name={p.name}
                total={`${p.total} Pengajuan`}
                verify={String(p.verify)}
                waiting={String(p.waiting + p.confirmed)}
                finish={String(p.final)}
              />
            ))}
          </div>
        )}

        {/* FOOTER SUMMARY */}
        <div className="mt-4 flex flex-col gap-4 px-1 sm:px-2 pb-1 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-[12px] leading-5 text-[#687588]">
            Total {all.total} berkas mahasiswa: {all.verify} verifikasi berkas, {totalInDraft}{' '}
            terkumpul dalam {activeDraftProdiCount} Draft Berita Acara Prodi ({all.final} mahasiswa
            siap, {all.waiting + all.confirmed} mahasiswa menunggu konfirmasi).
          </p>

          <button
            type="button"
            onClick={() => navigate('/admin/pengajuan-yudisium')}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#03447E] px-5 py-3 text-[13px] font-bold text-white transition hover:bg-[#063B69]"
          >
            Mulai Verifikasi Berkas Pengajuan
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* STATUS */}
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatusCard
          title="STATUS PENGAJUAN"
          icon={<Clock3 size={19} />}
          value={`${all.verify} Berkas Menunggu`}
          badge={all.verify > 0 ? 'Pengecekan Berkas' : 'Tidak Ada Antrean'}
          badgeType={all.verify > 0 ? 'warning' : 'neutral'}
          description={`${all.verify} mahasiswa menunggu verifikasi berkas pengajuan yudisium`}
          action="Periksa Antrean"
          onClick={() => navigate('/admin/pengajuan-yudisium')}
        />

        <StatusCard
          title="STATUS BERITA ACARA"
          icon={<FileText size={19} />}
          value={`${readyProdisCount} Siap, ${waitingProdisCount} Menunggu`}
          badge={all.inBA > 0 ? 'Sudah Diterbitkan' : 'Belum Diterbitkan'}
          badgeType={all.inBA > 0 ? 'success' : 'neutral'}
          description={
            all.inBA > 0
              ? `${all.inBA} mahasiswa sudah masuk dalam Berita Acara yang diajukan.`
              : 'Belum ada draft Berita Acara yang diterbitkan ke Kaprodi.'
          }
          action="Kelola Berita Acara"
          onClick={() => navigate('/admin/berita-acara')}
        />
      </section>

      {/* QUICK ACCESS */}
      <QuickAccess navigate={navigate} stats={stats} />
    </>
  )
}

/* =========================================================
   EMPTY DASHBOARD
========================================================= */

function EmptyDashboard({ navigate }) {
  return (
    <>
      {/* EMPTY STATE */}
      <section className="mt-5 flex min-h-[300px] sm:min-h-[330px] flex-col items-center justify-center rounded-2xl bg-white px-5 sm:px-8 py-9 sm:py-10 text-center shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
        <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-2 border-dashed border-[#B8D8FF] bg-[#F8FBFF]">
          <FileText size={36} strokeWidth={1.8} className="text-[#06447B]" />

          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#F59E0B]" />
        </div>

        <h2 className="mt-5 text-[21px] sm:text-[27px] font-bold text-[#151C2D]">
          Belum Ada Pengajuan Yudisium Masuk
        </h2>

        <p className="mt-2 max-w-[700px] text-[13px] sm:text-[15px] leading-6 text-[#687588]">
          Belum ada berkas yudisium mahasiswa yang masuk untuk diverifikasi pada periode ini. Daftar
          berkas akan tampil di sini begitu mahasiswa mengirimkan pengajuan.
        </p>

        <button
          type="button"
          onClick={() => navigate('/admin/pengajuan-yudisium')}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#03447E] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#063B69]"
        >
          Lihat Pengajuan Yudisium
          <ArrowRight size={17} />
        </button>
      </section>

      {/* EMPTY STATUS */}
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatusCard
          title="STATUS PENGAJUAN"
          icon={<Clock3 size={19} />}
          value="0 Berkas Menunggu"
          badge="Tidak Ada Antrean"
          badgeType="neutral"
          description="Belum ada pengajuan yudisium dari mahasiswa."
        />

        <StatusCard
          title="STATUS BERITA ACARA"
          icon={<FileText size={19} />}
          value="0 Draft Berita Acara"
          badge="Belum Diterbitkan"
          badgeType="neutral"
          description="Belum ada draft Berita Acara yang dibuat."
        />
      </section>

      {/* QUICK ACCESS */}
      <QuickAccess navigate={navigate} empty />
    </>
  )
}

/* =========================================================
   QUICK ACCESS
========================================================= */

function QuickAccess({ navigate, stats, empty = false }) {
  const verifyCount = stats?.all?.verify ?? 0
  const draftProdiCount = stats?.activeDraftProdiCount ?? 0

  return (
    <section className="mt-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-2 rounded-full bg-[#03447E]" />

          <h2 className="text-[18px] sm:text-[19px] font-bold text-[#111827]">
            Akses Cepat Layanan
          </h2>
        </div>

        <p className="hidden text-[12px] text-[#7A8797] md:block">
          Pilih layanan utama untuk mengelola yudisium
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <QuickServiceCard
          icon={<FileText size={22} />}
          badge={empty ? '0 Antrean Verifikasi Berkas' : `${verifyCount} Antrean`}
          badgeTone={empty ? 'neutral' : 'warning'}
          title="Pengajuan Yudisium"
          description="Verifikasi identitas dan dokumen persyaratan yang diunggah mahasiswa per program studi secara terpadu."
          button="Verifikasi Berkas"
          onClick={() => navigate('/admin/pengajuan-yudisium')}
        />

        <QuickServiceCard
          icon={<ShieldCheck size={22} />}
          badge={empty ? 'Belum Ada Draft' : `${draftProdiCount} Draft Prodi Aktif`}
          badgeTone={empty ? 'neutral' : 'success'}
          title="Berita Acara"
          description="Penyusunan 9 atribut kelulusan, pengiriman konfirmasi draft ke mahasiswa, dan checklist finalisasi ke Kaprodi."
          button="Kelola Berita Acara"
          onClick={() => navigate('/admin/berita-acara')}
        />
      </div>
    </section>
  )
}

/* =========================================================
   COMPONENTS
========================================================= */

function SummaryCard({ type, badge, title, description }) {
  const styles = {
    warning: {
      wrapper: 'border-[#F6D47A] bg-[#FFFDF7]',
      badge: 'border-[#F6D47A] bg-[#FFF9E8] text-[#B45309]',
      title: 'text-[#252B36]',
      text: 'text-[#B45309]',
    },

    orange: {
      wrapper: 'border-[#FFD0A5] bg-[#FFF9F4]',
      badge: 'border-[#FFD0A5] bg-[#FFF4EA] text-[#C55A11]',
      title: 'text-[#252B36]',
      text: 'text-[#B86A32]',
    },

    success: {
      wrapper: 'border-[#A7E6C3] bg-[#F6FFF9]',
      badge: 'border-[#A7E6C3] bg-[#F0FFF5] text-[#138A52]',
      title: 'text-[#252B36]',
      text: 'text-[#3B7E5B]',
    },
  }

  const style = styles[type]

  return (
    <div className={`rounded-xl border p-4 ${style.wrapper}`}>
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold ${style.badge}`}
      >
        {badge}
      </span>

      <h3 className={`mt-3 text-[13px] font-bold ${style.title}`}>{title}</h3>

      <p className={`mt-2 text-[11px] leading-5 ${style.text}`}>{description}</p>
    </div>
  )
}

function ProgramCard({ name, total, verify, waiting, finish }) {
  return (
    <div className="rounded-xl border border-[#E0E6EE] bg-white px-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-[#26354A]">{name}</span>

        <span className="rounded-full bg-[#F0F5FA] px-2.5 py-1 text-[9px] font-bold text-[#06447B]">
          {total}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3">
        <MiniStat label="Verif" value={verify} type="warning" />
        <MiniStat label="Tunggu" value={waiting} type="neutral" />
        <MiniStat label="Final" value={finish} type="success" />
      </div>
    </div>
  )
}

function MiniStat({ label, value, type }) {
  const valueColor = {
    warning: 'text-[#E67E00]',
    neutral: 'text-[#4B5563]',
    success: 'text-[#18A05E]',
  }

  return (
    <div className="text-center">
      <p className="text-[9px] text-[#A1ACBA]">{label}</p>
      <p className={`mt-1 text-[12px] font-bold ${valueColor[type]}`}>{value}</p>
    </div>
  )
}

function StatusCard({ title, icon, value, badge, badgeType, description, action, onClick }) {
  const badgeStyles = {
    warning: 'border-[#F4D477] bg-[#FFFBEF] text-[#B76A05]',
    success: 'border-[#A7E6C3] bg-[#F0FFF5] text-[#138A52]',
    neutral: 'border-[#DCE4EE] bg-[#F3F6FA] text-[#63738A]',
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-wide text-[#7A8493]">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E1E7EF] text-[#58718F]">
          {icon}
        </div>
      </div>

      <h3 className="mt-4 text-[21px] font-bold text-[#151C2D]">{value}</h3>

      <span
        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${badgeStyles[badgeType]}`}
      >
        <span className="mr-2 mt-[3px] h-1.5 w-1.5 rounded-full bg-current" />
        {badge}
      </span>

      <div className="mt-4 border-t border-[#E8EDF3] pt-3">
        {action ? (
          <div className="flex items-center justify-between gap-3">
            <p className="max-w-[260px] text-[11px] leading-5 text-[#687588]">{description}</p>

            <button
              type="button"
              onClick={onClick}
              className="shrink-0 text-[11px] font-bold text-[#06447B] hover:underline"
            >
              {action} →
            </button>
          </div>
        ) : (
          <p className="text-[11px] leading-5 text-[#687588]">{description}</p>
        )}
      </div>
    </div>
  )
}

function QuickServiceCard({
  icon,
  badge,
  badgeTone = 'neutral',
  title,
  description,
  button,
  onClick,
}) {
  const badgeClasses = {
    warning: 'border-[#F6D47A] bg-[#FFF9E8] text-[#B45309]',
    success: 'border-[#A7E6C3] bg-[#F0FFF5] text-[#138A52]',
    neutral: 'border-[#B9D7FF] bg-[#F3F8FF] text-[#06447B]',
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#06447B]">
          {icon}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${badgeClasses[badgeTone]}`}
        >
          {badge}
        </span>
      </div>

      <h3 className="mt-5 text-[17px] font-bold text-[#151C2D]">{title}</h3>

      <p className="mt-3 min-h-[48px] text-[11px] leading-5 text-[#687588]">{description}</p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#03447E] py-3 text-[12px] font-bold text-white transition hover:bg-[#063B69]"
      >
        {button}
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

// =========================================================
// PROFILE
// =========================================================

function ProfileAvatar({ photo, name = '', size = 'normal' }) {
  const [imgError, setImgError] = useState(false)
  const large = size === 'large'
  const initial = (name || 'S').trim().charAt(0).toUpperCase()

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt="Foto profil"
        onError={() => setImgError(true)}
        className={`rounded-full border-4 border-[#EEF2F6] object-cover ${
          large ? 'h-20 w-20' : 'h-9 w-9 sm:h-10 sm:w-10'
        }`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#0E8388] font-bold text-white ${
        large ? 'h-20 w-20 text-2xl' : 'h-9 w-9 sm:h-10 sm:w-10 text-sm'
      }`}
    >
      {initial}
    </div>
  )
}

function ProfileDropdown({ user, displayName, navigate, handleLogout, setProfileOpen }) {
  const email = user?.email || user?.email_ugm || ''

  return (
    <div className="absolute right-0 top-[56px] sm:top-[65px] z-50 w-[300px] sm:w-[340px] overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
      {email && (
        <div className="border-b border-[#EDF0F4] px-5 py-2.5 text-center">
          <p className="truncate text-[11px] font-medium text-[#687588]">{email}</p>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div className="flex flex-col items-center px-5 pt-5 pb-5">
        <ProfileAvatar photo={user?.avatar} name={displayName} size="large" />

        <p className="mt-4 max-w-[260px] sm:max-w-[290px] truncate text-center text-[17px] sm:text-[18px] font-extrabold text-[#111827]">
          {displayName}
        </p>
      </div>

      {/* PEMBATAS */}
      <div className="h-px bg-[#EDF0F4]" />

      {/* PROFIL SAYA */}
      <button
        type="button"
        onClick={() => {
          setProfileOpen(false)
          navigate('/profile')
        }}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F7F9FC]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF]">
          <UserRound size={20} strokeWidth={1.8} className="text-[#06447B]" />
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#172033]">Profil Saya</p>
          <p className="mt-0.5 text-[11px] text-[#7A8493]">Ubah nama dan foto profil</p>
        </div>
      </button>

      {/* PEMBATAS */}
      <div className="mx-5 h-px bg-[#EDF0F4]" />

      {/* LOGOUT */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-red-50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFE5E5]">
          <LogOut size={20} strokeWidth={2} className="text-[#EF4444]" />
        </div>

        <div>
          <p className="text-[13px] font-bold text-red-500">Keluar / Logout</p>
          <p className="mt-0.5 text-[11px] text-red-400">Akhiri sesi akun di perangkat ini</p>
        </div>
      </button>
    </div>
  )
}

export default AdminDashboard