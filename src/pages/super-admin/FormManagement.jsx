import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  Check,
  Trash2,
  Eye,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import ProfileMenu from '../../components/ProfileMenu'
import { errorMessage } from '../../services/api'
import { normalizeProdi } from '../../services/normalize'
import {
  listForms,
  createForm,
  updateForm,
  deleteForm,
  listFields,
  createField,
  updateField,
  deleteField,
  listProgramStudi
} from '../../services/adminApi'

// ==========================================
// 2. TOGGLE SWITCH COMPONENT
// ==========================================
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#0B3A68]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ==========================================
// 3. MODAL WRAPPER BASE
// ==========================================
function ModalWrapper({ title, onClose, children, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
      <div className={`w-full ${maxWidth} rounded-2xl bg-[#F8FAFC] p-6 shadow-2xl transition-all border border-slate-100 max-h-[90vh] overflow-y-auto`}>
        <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ==========================================
// TIPE DATA FIELD
// ==========================================
const DATA_TYPES = [
  // Nilai harus sama dengan enum BE: freetext, pdf, link, image, number, single_option
  { value: 'freetext', label: 'Teks Singkat', group: 'identitas' },
  { value: 'number', label: 'Angka', group: 'identitas' },
  { value: 'link', label: 'Tautan/Link', group: 'identitas' },
  { value: 'pdf', label: 'Unggah PDF/PNG', group: 'dokumen' },
  { value: 'image', label: 'Unggah Gambar (JPG/PNG)', group: 'dokumen' }
]

const FILE_TYPES = ['pdf', 'image', 'file', 'png', 'jpg', 'jpeg', 'upload', 'document']

const typeLabel = (t) => DATA_TYPES.find((d) => d.value === t)?.label || t || '-'
const isFileType = (t) => FILE_TYPES.includes(String(t || '').toLowerCase())

const GROUPS = { IDENTITAS: 'Identitas Diri', DOKUMEN: 'Dokumen Persyaratan' }

function normalizeField(f) {
  return {
    id: f.id,
    name: f.field_name ?? '',
    description: f.field_desc ?? '',
    type: f.data_type ?? 'freetext',
    required: Boolean(f.is_required),
    visible: f.is_visible === undefined || f.is_visible === null ? true : Boolean(f.is_visible),
    order: f.order_position ?? 0,
    prodiId: f.program_studi_id ?? null,
    group: isFileType(f.data_type) ? GROUPS.DOKUMEN : GROUPS.IDENTITAS,
    maxFileSize: f.max_file_size ?? '5 MB',
    conditionalRules: f.conditional_rules ?? []
  }
}

const EMPTY_NEW = {
  name: '',
  description: '',
  type: 'freetext',
  required: true,
  visible: true,
  prodiId: '',
  maxFileSize: '5 MB',
  conditionalRules: []
}

// ==========================================
// 4. MAIN FORM MANAGEMENT PAGE
// ==========================================
export default function SuperAdminFormManagement() {
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fieldsLoading, setFieldsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [forms, setForms] = useState([])
  const [selectedFormId, setSelectedFormId] = useState('')
  const [fields, setFields] = useState([])
  const [prodiList, setProdiList] = useState([])

  const [currentView, setCurrentView] = useState('management')

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(GROUPS.IDENTITAS)
  const [newFieldData, setNewFieldData] = useState(EMPTY_NEW)
  const [activeReviewField, setActiveReviewField] = useState(null)
  const [reviewTab, setReviewTab] = useState('Lihat')
  const [deleteConfirmField, setDeleteConfirmField] = useState(null)
  const [formModal, setFormModal] = useState(null)
  const [deleteFormConfirm, setDeleteFormConfirm] = useState(false)

  const notify = (type, text) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 5000)
  }

  const selectedForm = forms.find((f) => String(f.id) === String(selectedFormId)) || null

  const prodiName = (id) => {
    if (!id) return 'Semua program studi'
    const p = prodiList.find((x) => String(x.id) === String(id))
    return p ? p.kode || p.nama : `Prodi #${id}`
  }

  const loadForms = useCallback(
    (preferId) =>
      Promise.all([listForms(), listProgramStudi().catch(() => [])])
        .then(([formRes, prodiRes]) => {
          setForms(formRes)
          setProdiList(prodiRes.map(normalizeProdi))
          setSelectedFormId((current) => {
            const wanted = preferId ?? current
            if (wanted && formRes.some((f) => String(f.id) === String(wanted))) return String(wanted)
            return formRes[0] ? String(formRes[0].id) : ''
          })
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat daftar form')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    loadForms()
  }, [loadForms])

  const loadFields = useCallback(
    (formId) =>
      listFields(formId)
        .then((res) => {
          setFields(res.map(normalizeField).sort((a, b) => a.order - b.order))
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat field form')))
        .finally(() => setFieldsLoading(false)),
    []
  )

  useEffect(() => {
    if (!selectedFormId) return
    loadFields(selectedFormId)
  }, [selectedFormId, loadFields])

  const handleSelectForm = (id) => {
    setFields([])
    setFieldsLoading(Boolean(id))
    setSelectedFormId(id)
  }

  const identityFields = useMemo(() => fields.filter((f) => f.group === GROUPS.IDENTITAS), [fields])
  const documentFields = useMemo(() => fields.filter((f) => f.group === GROUPS.DOKUMEN), [fields])

  const handleSaveForm = async () => {
    if (!formModal.nama_form.trim()) return notify('error', 'Nama form wajib diisi.')
    setSaving(true)
    try {
      const body = { nama_form: formModal.nama_form.trim(), deskripsi: formModal.deskripsi.trim() }
      if (formModal.mode === 'create') {
        const res = await createForm(body)
        const created = res?.data ?? res
        await loadForms(created?.id)
        notify('success', 'Form baru berhasil dibuat.')
      } else {
        await updateForm(selectedFormId, body)
        await loadForms(selectedFormId)
        notify('success', 'Perubahan berhasil disimpan.')
      }
      setFormModal(null)
    } catch (err) {
      notify('error', errorMessage(err, 'Gagal menyimpan form'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteForm = async () => {
    setSaving(true)
    try {
      await deleteForm(selectedFormId)
      setDeleteFormConfirm(false)
      setFields([])
      await loadForms('')
      notify('success', 'Form berhasil dihapus.')
    } catch (err) {
      setDeleteFormConfirm(false)
      notify('error', errorMessage(err, 'Gagal menghapus form'))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAddModal = (group) => {
    setSelectedGroup(group)
    setNewFieldData({ ...EMPTY_NEW, type: group === GROUPS.DOKUMEN ? 'pdf' : 'freetext' })
    setIsAddModalOpen(true)
  }

  const handleSaveNewField = async (e) => {
    e.preventDefault()
    if (!newFieldData.name.trim()) return notify('error', 'Nama field wajib diisi!')

    const nextOrder = fields.reduce((max, f) => Math.max(max, Number(f.order) || 0), 0) + 1
    const body = {
      field_name: newFieldData.name.trim(),
      field_desc: newFieldData.description.trim(),
      data_type: newFieldData.type,
      is_required: newFieldData.required,
      is_visible: newFieldData.visible,
      order_position: nextOrder
      // TODO: endpoint belum ada — API field belum mendukung max_file_size (batas upload tetap 5 MB di server)
      // dan conditional_rules; keduanya tidak dikirim agar tidak menimbulkan kesan tersimpan.
    }
    if (newFieldData.prodiId) body.program_studi_id = Number(newFieldData.prodiId)

    setSaving(true)
    try {
      let formId = selectedFormId
      if (!formId) {
        // Belum ada form sama sekali -> buat form pengajuan default (POST /admin/forms)
        const res = await createForm({
          nama_form: 'Form Pengajuan Yudisium',
          deskripsi: 'Formulir pengajuan yudisium mahasiswa',
        })
        const created = res?.data ?? res
        formId = String(created?.id ?? '')
        if (!formId) throw new Error('Form baru gagal dibuat: server tidak mengembalikan ID form.')
        await loadForms(formId)
      }
      await createField(formId, body)
      setIsAddModalOpen(false)
      await loadFields(formId)
      notify('success', 'Field baru berhasil ditambahkan!')
    } catch (err) {
      notify('error', errorMessage(err, 'Gagal menambahkan field'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFieldEdit = async () => {
    if (!activeReviewField) return
    if (!activeReviewField.name.trim()) return notify('error', 'Nama field wajib diisi!')
    setSaving(true)
    try {
      await updateField(selectedFormId, activeReviewField.id, {
        field_name: activeReviewField.name.trim(),
        field_desc: activeReviewField.description,
        data_type: activeReviewField.type,
        is_required: activeReviewField.required,
        is_visible: activeReviewField.visible,
        program_studi_id: activeReviewField.prodiId ? Number(activeReviewField.prodiId) : null
        // TODO: endpoint belum ada — max_file_size & conditional_rules belum didukung API
      })
      setActiveReviewField(null)
      await loadFields(selectedFormId)
      notify('success', 'Perubahan field berhasil disimpan.')
    } catch (err) {
      notify('error', errorMessage(err, 'Gagal menyimpan perubahan field'))
    } finally {
      setSaving(false)
    }
  }

  const handleExecuteDelete = async () => {
    if (!deleteConfirmField) return
    setSaving(true)
    try {
      await deleteField(selectedFormId, deleteConfirmField.id)
      setDeleteConfirmField(null)
      setActiveReviewField(null)
      await loadFields(selectedFormId)
      notify('success', 'Field berhasil dihapus.')
    } catch (err) {
      setDeleteConfirmField(null)
      notify('error', errorMessage(err, 'Gagal menghapus field'))
    } finally {
      setSaving(false)
    }
  }

  const handleMove = async (field, direction) => {
    const list = field.group === GROUPS.IDENTITAS ? identityFields : documentFields
    const idx = list.findIndex((f) => f.id === field.id)
    const neighbor = list[idx + direction]
    if (!neighbor) return
    setSaving(true)
    try {
      await Promise.all([
        updateField(selectedFormId, field.id, { order_position: neighbor.order }),
        updateField(selectedFormId, neighbor.id, { order_position: field.order })
      ])
      await loadFields(selectedFormId)
    } catch (err) {
      notify('error', errorMessage(err, 'Gagal mengubah urutan field'))
    } finally {
      setSaving(false)
    }
  }

  const noticeBar = notice && (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium shadow-sm ${
        notice.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      <div className="flex items-center gap-2">
        {notice.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
        <span>{notice.text}</span>
      </div>
      <button onClick={() => setNotice(null)}>
        <X size={14} />
      </button>
    </div>
  )

  const headerBar = (
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:px-8 pl-14 lg:pl-8">
        <div>
          <h1 className="text-[20px] font-bold text-[#0F172A]">Form Pengajuan Yudisium</h1>
          <p className="text-[10.5px] text-[#64748B]">
            Sistem Informasi Yudisium Terpadu DTEDI SV UGM
          </p>
        </div>
        <ProfileMenu fallbackName="Ningrum" />
      </header>
    )

  // ==========================================
  // VIEW: PRATINJAU FORM MAHASISWA
  // ==========================================
  if (currentView === 'preview') {
    const visibleIdentity = identityFields.filter((f) => f.visible)
    const visibleDocs = documentFields.filter((f) => f.visible)
    return (
      <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
        <Sidebar admin />
        <div className="min-h-screen lg:pl-[295px]">
          {headerBar}
          <main className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-blue-200 bg-[#EBF3FB] px-5 py-3.5 text-xs text-slate-700 shadow-sm gap-3">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-[#0B3A68] shrink-0" />
                <span>
                  <b>Mode Pratinjau.</b> Tampilan ini sama dengan form yang diakses mahasiswa, mengikuti susunan field saat ini. Isian tidak dikirim dan tidak disimpan.
                </span>
              </div>
              <button
                onClick={() => setCurrentView('management')}
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
              >
                Kembali ke Form Pengajuan
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Pratinjau Form Mahasiswa</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Lengkapi identitas diri, data akademik, dan dokumen-dokumen yang dibutuhkan untuk melakukan pengajuan yudisium.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Identitas Diri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleIdentity.map((field, idx) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {idx + 1}. {field.name}
                      {field.required && <span className="text-rose-500"> *</span>}
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder={field.description}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Dokumen Persyaratan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {visibleDocs.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 hover:border-slate-200 transition"
                  >
                    <div>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-[10px] font-bold text-slate-600 mb-2">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">
                        {field.name}
                        {field.required && <span className="text-rose-500"> *</span>}
                      </h4>
                      <p className="mt-1.5 text-[10px] text-slate-500 leading-relaxed">{field.description}</p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 font-bold text-slate-700 shadow-2xs">
                        Pilih Berkas {typeLabel(field.type)}
                      </span>
                      <span className="text-slate-400 font-medium">Maks {field.maxFileSize || '5 MB'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // ==========================================
  // KOMPONEN BARIS FIELD
  // ==========================================
  const renderFieldRow = (field, idx, list, padded) => (
    <div
      key={field.id}
      className={`flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:border-slate-200 transition ${
        field.visible ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col text-slate-300">
          <button
            type="button"
            disabled={idx === 0 || saving}
            onClick={() => handleMove(field, -1)}
            className="hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            disabled={idx === list.length - 1 || saving}
            onClick={() => handleMove(field, 1)}
            className="hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
          {padded ? String(idx + 1).padStart(2, '0') : idx + 1}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">{field.name}</span>
            <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
              {typeLabel(field.type)}
            </span>
            {field.prodiId && (
              <span className="rounded bg-amber-100/80 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                Khusus {prodiName(field.prodiId)}
              </span>
            )}
          </div>
          <span className="mt-0.5 block text-[10px] font-bold text-rose-500">
            {field.required ? 'Wajib' : 'Opsional'}
          </span>
        </div>
      </div>
      <button
        onClick={() => {
          setActiveReviewField({ ...field })
          setReviewTab('Lihat')
        }}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition"
      >
        <Eye size={16} />
      </button>
    </div>
  )

  const prodiSelectEl = (value, onChange) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-white pr-8"
      >
        <option value="">Semua program studi</option>
        {prodiList.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nama}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
    </div>
  )

  const typeOptions = (group) => DATA_TYPES.filter((d) => d.group === group)

  // ==========================================
  // VIEW: UTAMA
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <Sidebar admin />

      <div className="min-h-screen lg:pl-[295px]">
        {headerBar}

        <main className="p-6 space-y-5">
          {noticeBar}

          {loadError && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <span>{loadError}</span>
              <button
                onClick={() => {
                  setLoading(true)
                  loadForms()
                }}
                className="rounded-lg bg-white px-3 py-1.5 font-bold border border-rose-200"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* KARTU HEADER UTAMA SEPERTI DESIGN */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedForm?.nama_form || 'Form Pengajuan Yudisium'}</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {fields.length} field aktif ({identityFields.length} identitas, {documentFields.length} dokumen) — perubahan berlaku untuk pengajuan baru
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                disabled={!selectedFormId}
                onClick={() => setCurrentView('preview')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                Pratinjau Form Mahasiswa
              </button>
              <button
                disabled={saving}
                onClick={async () => {
                  // Setiap perubahan field sudah tersimpan langsung ke server; tombol ini memuat ulang data terbaru.
                  if (selectedFormId) {
                    setSaving(true)
                    await loadFields(selectedFormId)
                    setSaving(false)
                  }
                  notify('success', 'Semua perubahan field sudah tersimpan di server dan berlaku untuk pengajuan baru.')
                }}
                className="rounded-xl bg-[#0B3A68] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>

          {/* KARTU MANAJEMEN FIELD */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-6">
            {(loading || fieldsLoading) && (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Memuat...
              </div>
            )}

            {!loading && !selectedFormId && !loadError && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                Belum ada form pengajuan. Form dibuat otomatis saat Anda menambahkan field pertama di bawah.
              </p>
            )}

            {!loading && !fieldsLoading && (
              <>
                {/* GRUP 1: IDENTITAS DIRI */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 border-l-2 border-[#0B3A68] pl-2.5">Identitas Diri</span>
                    <span className="text-[11px] text-slate-400">{identityFields.length} field</span>
                  </div>
                  <div className="space-y-2">
                    {identityFields.map((field, idx) => renderFieldRow(field, idx, identityFields, false))}
                  </div>
                  <button
                    onClick={() => handleOpenAddModal(GROUPS.IDENTITAS)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-3 text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    + Tambah Field Identitas
                  </button>
                </div>

                {/* GRUP 2: DOKUMEN PERSYARATAN */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 border-l-2 border-[#0B3A68] pl-2.5">Dokumen Persyaratan</span>
                    <span className="text-[11px] text-slate-400">{documentFields.length} dokumen</span>
                  </div>
                  <div className="space-y-2">
                    {documentFields.map((field, idx) => renderFieldRow(field, idx, documentFields, true))}
                  </div>
                  <button
                    onClick={() => handleOpenAddModal(GROUPS.DOKUMEN)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-3 text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    + Tambah Dokumen Persyaratan
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: TAMBAH FIELD BARU SESUAI DESAIN */}
      {isAddModalOpen && (
        <ModalWrapper title="Tambah Field Baru" onClose={() => setIsAddModalOpen(false)} maxWidth="max-w-xl">
          <form onSubmit={handleSaveNewField} className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Tambah Field Baru</h4>
                <p className="text-[11px] text-slate-400">Field baru untuk grup {selectedGroup}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Field</label>
                <input
                  type="text"
                  value={newFieldData.name}
                  onChange={(e) => setNewFieldData({ ...newFieldData, name: e.target.value })}
                  placeholder="Masukkan nama field"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Petunjuk Pengisian</label>
                <textarea
                  value={newFieldData.description}
                  onChange={(e) => setNewFieldData({ ...newFieldData, description: e.target.value })}
                  placeholder="Ketikkan Deskripsi / Petunjuk Pengisian"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Data</label>
                <div className="relative">
                  <select
                    value={newFieldData.type}
                    onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-white pr-8"
                  >
                    {typeOptions(selectedGroup === GROUPS.DOKUMEN ? 'dokumen' : 'identitas').map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {selectedGroup === GROUPS.DOKUMEN && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran Maksimal File</label>
                  <select
                    value={newFieldData.maxFileSize}
                    onChange={(e) => setNewFieldData({ ...newFieldData, maxFileSize: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="2 MB">2 MB</option>
                    <option value="5 MB">5 MB</option>
                    <option value="10 MB">10 MB</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5 bg-white">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Wajib Diisi (Default)</span>
                  <span className="text-[10px] text-slate-400">Berlaku jika tidak ada aturan kondisional yang menimpanya</span>
                </div>
                <ToggleSwitch
                  checked={newFieldData.required}
                  onChange={(val) => setNewFieldData({ ...newFieldData, required: val })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5 bg-white">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Tampilkan di Form</span>
                  <span className="text-[10px] text-slate-400">Nonaktifkan untuk menyembunyikan tanpa menghapus field</span>
                </div>
                <ToggleSwitch
                  checked={newFieldData.visible}
                  onChange={(val) => setNewFieldData({ ...newFieldData, visible: val })}
                />
              </div>

              {/* ATURAN KONDISIONAL SESUAI DESIGN */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Info size={14} className="text-amber-700" />
                  <span>Aturan Kondisional</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Belum ada aturan kondisional. Field ini akan memakai nilai "Wajib Diisi (Default)" di atas untuk semua mahasiswa.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setNewFieldData({
                      ...newFieldData,
                      conditionalRules: [...newFieldData.conditionalRules, { prodi: '', action: 'Wajib' }]
                    })
                  }
                  className="mt-1 text-xs font-bold text-[#0B3A68] hover:underline"
                >
                  + Tambah Aturan Kondisional
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-[#0B3A68] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs disabled:opacity-60"
              >
                {saving && <Loader2 size={13} className="animate-spin" />} Tambah Field
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* MODAL: TINJAU FIELD */}
      {activeReviewField && (
        <ModalWrapper title="Tinjau Field" onClose={() => setActiveReviewField(null)} maxWidth="max-w-xl">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{activeReviewField.name}</h4>
                  <p className="text-[11px] text-slate-400">Field dalam grup {activeReviewField.group}</p>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {['Lihat', 'Edit'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setReviewTab(tab)}
                      className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                        reviewTab === tab ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {reviewTab === 'Lihat' ? (
                <div className="space-y-3 text-xs pt-2">
                  {[
                    ['Nama Field', activeReviewField.name],
                    ['Tipe Data', typeLabel(activeReviewField.type)],
                    ['Deskripsi', activeReviewField.description || '-'],
                    ['Wajib Diisi', activeReviewField.required ? 'Ya' : 'Tergantung aturan kondisional'],
                    ['Tampil di Form', activeReviewField.visible ? 'Ya' : 'Tidak'],
                    ['Ukuran Maks. File', activeReviewField.maxFileSize || '5 MB']
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2.5">
                      <span className="text-slate-400 font-medium shrink-0">{label}</span>
                      <span className="font-bold text-slate-800 max-w-[280px] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Field</label>
                    <input
                      type="text"
                      value={activeReviewField.name}
                      onChange={(e) => setActiveReviewField({ ...activeReviewField, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Petunjuk Pengisian</label>
                    <textarea
                      value={activeReviewField.description}
                      onChange={(e) => setActiveReviewField({ ...activeReviewField, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Data</label>
                    <select
                      value={activeReviewField.type}
                      onChange={(e) => setActiveReviewField({ ...activeReviewField, type: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-white"
                    >
                      {typeOptions(activeReviewField.group === GROUPS.DOKUMEN ? 'dokumen' : 'identitas').map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isFileType(activeReviewField.type) && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran Maksimal File</label>
                      <select
                        value={activeReviewField.maxFileSize}
                        onChange={(e) => setActiveReviewField({ ...activeReviewField, maxFileSize: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="2 MB">2 MB</option>
                        <option value="5 MB">5 MB</option>
                        <option value="10 MB">10 MB</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5">
                    <span className="text-xs font-bold text-slate-800">Wajib Diisi (Default)</span>
                    <ToggleSwitch
                      checked={activeReviewField.required}
                      onChange={(val) => setActiveReviewField({ ...activeReviewField, required: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5">
                    <span className="text-xs font-bold text-slate-800">Tampilkan di Form</span>
                    <ToggleSwitch
                      checked={activeReviewField.visible}
                      onChange={(val) => setActiveReviewField({ ...activeReviewField, visible: val })}
                    />
                  </div>

                  {/* ATURAN KONDISIONAL AKTIF */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Info size={14} className="text-amber-700" />
                      <span>Aturan Kondisional Aktif</span>
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-100 text-xs">
                        <span>Jika Program Studi</span>
                        <span className="font-bold text-slate-700">Teknologi Rekayasa Internet</span>
                        <span>→ jadikan Wajib</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-100 text-xs">
                        <span>Jika Program Studi</span>
                        <span className="font-bold text-slate-700">Teknologi Rekayasa Internet</span>
                        <span>→ jadikan Opsional</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-rose-700">Zona Berbahaya</h5>
                <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                  Menghapus field akan menyembunyikannya dari form baru. Data yang sudah disubmit mahasiswa sebelumnya tidak akan terhapus.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmField(activeReviewField)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 size={14} /> Hapus Field Ini
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewField(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveFieldEdit}
                    className="flex items-center gap-1.5 rounded-xl bg-[#0B3A68] px-4 py-2 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs disabled:opacity-60"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />} Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* MODAL: KONFIRMASI HAPUS FIELD */}
      {deleteConfirmField && (
        <ModalWrapper title="" onClose={() => setDeleteConfirmField(null)} maxWidth="max-w-md">
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Hapus "{deleteConfirmField.name}"?</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Field ini akan hilang dari form pengajuan untuk pendaftar baru. Tindakan ini tidak memengaruhi data yang sudah disubmit mahasiswa sebelumnya.
              </p>
            </div>
            <div className="flex justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmField(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                disabled={saving}
                onClick={handleExecuteDelete}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-2xs disabled:opacity-60"
              >
                Ya, Hapus Field
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  )
}