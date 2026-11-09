import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  FileCode,
  X,
  Check,
  Upload,
  ArrowLeft,
  ChevronRight,
  File,
  AlertCircle,
  FileCheck,
  Loader2
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import ProfileMenu from '../../components/ProfileMenu'
import { errorMessage } from '../../services/api'
import { normalizeProdi } from '../../services/normalize'
import {
  listProgramStudi,
  getBeritaAcaraTemplate,
  updateBeritaAcaraTemplate
} from '../../services/adminApi'



// ==========================================
// PLACEHOLDER (daftar resmi dari backend; deskripsi sebagai penjelasan di UI)
// ==========================================
const FALLBACK_PLACEHOLDERS = [
  'prodi', 'periode', 'nomor_surat', 'tanggal_surat', 'tabel_mahasiswa',
  'ttd_kaprodi', 'ttd_manit', 'ttd_kadep', 'nama_kaprodi', 'nama_manit', 'nama_kadep'
]

const PLACEHOLDER_INFO = {
  prodi: { label: 'Nama Program Studi', source: 'sistem', sample: 'Teknologi Rekayasa Perangkat Lunak' },
  periode: { label: 'Periode Yudisium', source: 'manual', sample: 'Genap 2025/2026' },
  nomor_surat: { label: 'Nomor Surat', source: 'manual', sample: 'BA/001/DTEDI/2026' },
  tanggal_surat: { label: 'Tanggal Surat', source: 'manual', sample: '15 Oktober 2026' },
  tabel_mahasiswa: { label: 'Tabel Mahasiswa (identitas + data penilaian)', source: 'sistem', sample: '<table border="1" cellpadding="4" style="border-collapse:collapse;width:100%"><tr><th>No</th><th>Nama</th><th>NIM</th><th>IPK</th></tr><tr><td>1</td><td>Contoh Mahasiswa</td><td>22/000000/SV/00000</td><td>3,75</td></tr></table>' },
  ttd_kaprodi: { label: 'Tanda Tangan Kaprodi', source: 'ttd', sample: '[TTD]' },
  ttd_manit: { label: 'Tanda Tangan Manit (Ketua Rapat Pleno)', source: 'ttd', sample: '[TTD]' },
  ttd_kadep: { label: 'Tanda Tangan Kadep', source: 'ttd', sample: '[TTD]' },
  nama_kaprodi: { label: 'Nama Kaprodi', source: 'ttd', sample: 'Nama Kaprodi' },
  nama_manit: { label: 'Nama Manit', source: 'ttd', sample: 'Nama Manit' },
  nama_kadep: { label: 'Nama Kadep', source: 'ttd', sample: 'Nama Kadep' }
}

const SOURCE_GROUPS = [
  { key: 'sistem', title: 'Diisi Otomatis dari Data Sistem', dot: 'bg-blue-600' },
  { key: 'manual', title: 'Diisi dari Metadata Berita Acara (Staf Akademik)', dot: 'bg-slate-400' },
  { key: 'ttd', title: 'Tanda Tangan & Nama Pejabat (E-Signature)', dot: 'bg-amber-500' }
]

const SAMPLE_TEMPLATE = `<div style="font-family: serif;">
  <h2 style="text-align:center">BERITA ACARA YUDISIUM</h2>
  <h3 style="text-align:center">{{prodi}} - {{periode}}</h3>
  <p>Nomor: {{nomor_surat}}</p>
  <p>Tanggal: {{tanggal_surat}}</p>
  {{tabel_mahasiswa}}
  <table width="100%">
    <tr>
      <td>Kaprodi<br>{{ttd_kaprodi}}<br>{{nama_kaprodi}}</td>
      <td>Ketua Rapat Pleno<br>{{ttd_manit}}<br>{{nama_manit}}</td>
      <td>Kepala Departemen<br>{{ttd_kadep}}<br>{{nama_kadep}}</td>
    </tr>
  </table>
</div>`

const stripBraces = (p) => String(p).replace(/[{}\s]/g, '')

function renderPreview(html, allowed) {
  return allowed.reduce(
    (out, name) => out.split(`{{${name}}}`).join(PLACEHOLDER_INFO[name]?.sample ?? `[${name}]`),
    html
  )
}

// ==========================================
// 2. HALAMAN UTAMA TEMPLATE BERITA ACARA
// ==========================================
export default function SuperAdminTemplateBeritaAcara() {
  const textareaRef = useRef(null)

  const [viewMode, setViewMode] = useState('list') // 'list' | 'mapping'
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { type, text }

  const [prodiTemplates, setProdiTemplates] = useState([]) // [{ prodi, template, allowed, error }]
  const [selectedId, setSelectedId] = useState(null)

  const [editItem, setEditItem] = useState(null) // item yang sedang diedit
  const [draft, setDraft] = useState('')
  const [editTab, setEditTab] = useState('Kode') // 'Kode' | 'Pratinjau'
  const [formError, setFormError] = useState('')

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 5000)
  }

  const loadAll = useCallback(
    () =>
      listProgramStudi()
        .then((list) => {
          const prodis = list.map(normalizeProdi)
          return Promise.all(
            prodis.map((prodi) =>
              getBeritaAcaraTemplate(prodi.id)
                .then((data) => ({
                  prodi,
                  template: data?.template ?? data?.berita_acara_template ?? null,
                  allowed: (data?.allowed_placeholders ?? FALLBACK_PLACEHOLDERS).map(stripBraces)
                }))
                .catch((err) => ({
                  prodi,
                  template: null,
                  allowed: FALLBACK_PLACEHOLDERS,
                  error: errorMessage(err, 'Gagal memuat template')
                }))
            )
          )
        })
        .then((items) => {
          setProdiTemplates(items)
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat program studi')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const selectedItem = prodiTemplates.find((i) => i.prodi.id === selectedId) || null
  const hasTemplate = (item) => Boolean(item.template && String(item.template).trim())

  const usedPlaceholders = useMemo(() => {
    if (!selectedItem?.template) return new Set()
    return new Set([...selectedItem.template.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gi)].map((m) => m[1]))
  }, [selectedItem])

  const openEditor = (item) => {
    setEditItem(item)
    setDraft(item.template || '')
    setEditTab('Kode')
    setFormError('')
  }

  const closeEditor = () => {
    setEditItem(null)
    setDraft('')
    setFormError('')
  }

  const insertPlaceholder = (name) => {
    const token = `{{${name}}}`
    const el = textareaRef.current
    if (!el) return setDraft((d) => d + token)
    const start = el.selectionStart ?? draft.length
    const end = el.selectionEnd ?? draft.length
    const next = draft.slice(0, start) + token + draft.slice(end)
    setDraft(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + token.length
    })
  }

  const handleFileLoad = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setDraft(String(reader.result || ''))
      setFormError('')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // validasi ringan di sisi klien (server tetap sumber kebenaran)
  const validateDraft = (allowed) => {
    if (!draft.trim()) return 'Template tidak boleh kosong.'
    if (/<script/i.test(draft)) return 'Template tidak boleh mengandung tag <script>.'
    const unknown = [...draft.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gi)]
      .map((m) => m[1])
      .filter((name) => !allowed.includes(name))
    if (unknown.length) return `Placeholder tidak dikenali: ${[...new Set(unknown)].map((n) => `{{${n}}}`).join(', ')}`
    return ''
  }

  const handleSave = async () => {
    const problem = validateDraft(editItem.allowed)
    if (problem) return setFormError(problem)
    setSaving(true)
    setFormError('')
    try {
      await updateBeritaAcaraTemplate(editItem.prodi.id, draft)
      await loadAll()
      closeEditor()
      showToast('success', `Template Berita Acara ${editItem.prodi.nama} berhasil disimpan.`)
    } catch (err) {
      setFormError(errorMessage(err, 'Gagal menyimpan template'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <Sidebar admin />

      <div className="min-h-screen lg:pl-[295px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
      <div>
        <h1 className="text-[20px] font-bold text-[#0F172A]">Template Berita Acara</h1>
        <p className="text-[10.5px] text-[#64748B]">
          Sistem Informasi Yudisium Terpadu DTEDI SV UGM
        </p>
      </div>
      <ProfileMenu fallbackName="Super Admin" />
    </header>

        <main className="p-6 space-y-5">
          {toast && (
            <div
              className={`flex items-center justify-between rounded-xl border px-5 py-3.5 text-xs font-medium shadow-sm ${
                toast.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{toast.text}</span>
              </div>
              <button onClick={() => setToast(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          {loadError && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <span>{loadError}</span>
              <button
                onClick={() => {
                  setLoading(true)
                  loadAll()
                }}
                className="rounded-lg bg-white px-3 py-1.5 font-bold border border-rose-200"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* VIEW 1: DAFTAR TEMPLATE */}
          {viewMode === 'list' && (
            <>
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Template Berita Acara</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Atur format dokumen, variabel dinamis, dan struktur pengesahan berita acara kelulusan yudisium.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Template per Program Studi</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Setiap prodi memiliki format Berita Acara tersendiri berupa HTML dengan placeholder dinamis (mis. <code className="font-mono">{'{{prodi}}'}</code>, <code className="font-mono">{'{{tabel_mahasiswa}}'}</code>). Data mahasiswa, nomor surat, tanggal, dan tanda tangan pejabat diisi otomatis oleh sistem.
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                    <Loader2 size={16} className="animate-spin" /> Memuat template...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {prodiTemplates.map((item) => {
                      const active = hasTemplate(item)
                      return (
                        <div
                          key={item.prodi.id}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <FileCode size={20} />
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                  active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {active ? 'Template Aktif' : 'Belum Diatur'}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{item.prodi.nama}</h4>
                              {item.error ? (
                                <p className="mt-2 text-[11px] text-rose-600 font-medium">{item.error}</p>
                              ) : active ? (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {item.template.length.toLocaleString('id-ID')} karakter HTML
                                </p>
                              ) : (
                                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                                  <AlertCircle size={14} className="shrink-0" />
                                  <span>Staf akademik belum bisa generate Berita Acara untuk prodi ini</span>
                                </div>
                              )}
                            </div>

                            <div className="flex h-28 w-full items-center justify-center rounded-xl border border-slate-100 bg-[#F8FAFC]">
                              {active ? (
                                <File size={36} className="text-slate-300" />
                              ) : (
                                <FileCheck size={36} className="text-slate-300" />
                              )}
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            {active && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(item.prodi.id)
                                  setViewMode('mapping')
                                }}
                                className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900"
                              >
                                <ChevronRight size={16} /> Lihat Pemetaan Placeholder ({item.allowed.length})
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={Boolean(item.error)}
                              onClick={() => openEditor(item)}
                              className="w-full rounded-xl bg-[#0B3A68] py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs disabled:opacity-50"
                            >
                              {active ? 'Edit Template' : 'Atur Template'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {prodiTemplates.length === 0 && !loadError && (
                      <p className="text-xs text-slate-400">Belum ada program studi terdaftar.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 2: PEMETAAN PLACEHOLDER */}
          {viewMode === 'mapping' && selectedItem && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={16} /> Kembali ke Template Berita Acara
              </button>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Pemetaan Placeholder Template</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placeholder yang diizinkan backend, dan apakah sudah dipakai di template prodi ini.
                  </p>
                  <span className="mt-3 inline-block rounded-lg bg-[#0B3A68] px-3.5 py-1.5 text-xs font-bold text-white">
                    {selectedItem.prodi.nama}
                  </span>
                </div>

                {SOURCE_GROUPS.map((group) => {
                  const names = selectedItem.allowed.filter(
                    (n) => (PLACEHOLDER_INFO[n]?.source || 'sistem') === group.key
                  )
                  if (names.length === 0) return null
                  return (
                    <div key={group.key} className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${group.dot}`} />
                          {group.title}
                        </span>
                        <span className="text-slate-400 font-normal">{names.length} placeholder</span>
                      </div>
                      <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                        {names.map((name) => {
                          const used = usedPlaceholders.has(name)
                          return (
                            <div key={name} className="grid grid-cols-12 items-center p-3.5 bg-white text-xs gap-4">
                              <div className="col-span-5 flex items-center">
                                <span className="font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md text-[11px] inline-block">
                                  {`{{${name}}}`}
                                </span>
                              </div>
                              <div className="col-span-4 text-left">
                                <p className="font-semibold text-slate-800">{PLACEHOLDER_INFO[name]?.label || name}</p>
                              </div>
                              <div className="col-span-3 text-right">
                                {used ? (
                                  <span className="text-emerald-600 font-bold inline-flex items-center gap-1 text-[11px]">
                                    <Check size={14} /> Terpakai
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium text-[11px]">Belum dipakai</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor(selectedItem)}
                    className="rounded-xl bg-[#0B3A68] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs"
                  >
                    Edit Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: EDITOR TEMPLATE */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Template Berita Acara</h3>
                <p className="text-[11px] text-slate-400">{editItem.prodi.nama}</p>
              </div>
              <button onClick={closeEditor} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex rounded-lg bg-slate-100 p-1">
                {['Kode', 'Pratinjau'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditTab(tab)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                      editTab === tab ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraft(SAMPLE_TEMPLATE)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  Pakai Contoh
                </button>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
                  <Upload size={13} /> Muat File .html
                  <input type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleFileLoad} />
                </label>
              </div>
            </div>

            {editTab === 'Kode' ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  placeholder="<div>...{{prodi}}...</div>"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 font-mono text-[11px] leading-5 outline-none focus:border-blue-500 focus:bg-white"
                />
                <div>
                  <p className="mb-1.5 text-[11px] font-bold text-slate-600">Sisipkan placeholder di posisi kursor:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {editItem.allowed.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => insertPlaceholder(name)}
                        title={PLACEHOLDER_INFO[name]?.label}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                      >
                        {`{{${name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <iframe
                title="Pratinjau template"
                sandbox=""
                srcDoc={renderPreview(draft, editItem.allowed)}
                className="h-[420px] w-full rounded-xl border border-slate-200 bg-white"
              />
            )}

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400">
              Hanya placeholder dari daftar di atas yang diizinkan, dan tag {'<script>'} ditolak. Pratinjau memakai data contoh; hasil akhir mengikuti data berita acara sebenarnya.
            </p>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-[#0B3A68] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs disabled:opacity-60"
              >
                {saving && <Loader2 size={13} className="animate-spin" />} Simpan & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
