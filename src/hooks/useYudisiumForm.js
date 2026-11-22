import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, errorMessage, fileUrl } from '../services/api'
import { getUser, saveUser } from '../services/auth'
import {
  getActiveForm,
  getMyPengajuan,
  getProfile,
  listProgramStudi,
  revisiPengajuan,
  submitPengajuan,
  updateProfile,
  uploadDokumen,
} from '../services/mahasiswaApi'
import {
  cleanNim,
  isEventOpen,
  isFileType,
  isWhatsappField,
  normalizeActiveForm,
  normalizeMyPengajuan,
  uploadRule,
} from '../services/mahasiswaStatus'

const UPLOAD_FAILED = new Error('upload-failed')

const stripPhone = (v) => String(v || '').replace(/^\+?62/, '').replace(/^0/, '').replace(/\D/g, '')
const isWhatsappValid = (v) => /^8\d{8,12}$/.test(v || '')

// Bila form aktif sudah ditutup, definisi field diambil dari data pengajuan itu sendiri
function formFromPengajuan(p) {
  const fields = p.fieldValues
    .filter((fv) => fv.fieldId !== undefined && fv.name)
    .map((fv) => ({
      id: fv.fieldId,
      name: fv.name,
      description: fv.description,
      type: fv.type || 'text',
      required: fv.required === undefined ? true : Boolean(fv.required),
      visible: true,
      order: fv.order,
      prodiId: null,
    }))
    .sort((a, b) => a.order - b.order)
  return { event: p.event, eventId: p.eventId, formName: '', fields }
}

/**
 * Logika bersama Form Pengajuan (mode 'create') dan Form Edit/Perbaikan (mode 'edit').
 * Data dari API: GET /me, /program-studi, /pengajuan/active-form, /pengajuan/me;
 * submit lewat POST /uploads lalu POST (baru) atau PUT (revisi) /pengajuan.
 */
export default function useYudisiumForm(mode = 'create') {
  const isEdit = mode === 'edit'
  const navigate = useNavigate()

  const [user, setUser] = useState(() => getUser())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeForm, setActiveForm] = useState(null)
  const [pengajuan, setPengajuan] = useState(null)
  const [prodiList, setProdiList] = useState([])
  const [profile, setProfile] = useState({ name: '', nim: '', prodiId: '' })
  const [values, setValues] = useState({})
  const [files, setFiles] = useState({})
  const [fileErrors, setFileErrors] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [integrityChecked, setIntegrityChecked] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [changingProdi, setChangingProdi] = useState(false)
  const [now] = useState(() => Date.now())

  /* ---------------- load awal ---------------- */
  useEffect(() => {
    let cancelled = false

    Promise.all([
      getProfile().catch(() => null),
      listProgramStudi().catch(() => []),
      getActiveForm().catch(() => null),
      getMyPengajuan().catch(() => null),
    ])
      .then(([profileRaw, prodis, formRaw, pengajuanRaw]) => {
        if (cancelled) return

        const merged =
          profileRaw && typeof profileRaw === 'object' ? { ...getUser(), ...profileRaw } : getUser()
        if (profileRaw && typeof profileRaw === 'object') saveUser(merged)
        setUser(merged)
        setProdiList(prodis)

        const p = normalizeMyPengajuan(pengajuanRaw)
        setPengajuan(p)

        if (!isEdit && p) {
          navigate('/pelacakan-yudisium', { replace: true })
          return
        }
        if (isEdit && !p) {
          navigate('/pengajuan-yudisium', { replace: true })
          return
        }

        let form = normalizeActiveForm(formRaw)
        if (formRaw && form && form.fields.length === 0) {
          // Bantu diagnosa: lihat struktur response di Console bila form tampil kosong
          console.warn('[SIYUDIS] active-form tidak berisi field yang terbaca. Response mentah:', formRaw)
        }
        if (isEdit && p && (!form || form.fields.length === 0)) form = formFromPengajuan(p)
        setActiveForm(form)

        setProfile({
          name: merged?.nama || merged?.name || '',
          nim: cleanNim(merged?.nomor_induk || merged?.nim),
          prodiId: String(merged?.program_studi_id ?? merged?.program_studi?.id ?? ''),
        })

        if (isEdit && p && form) {
          const nextValues = {}
          const nextFiles = {}
          form.fields.forEach((f) => {
            const fv = p.fieldValues.find((v) => String(v.fieldId) === String(f.id))
            if (!fv || fv.value === '' || fv.value === null) return
            if (isFileType(f.type)) {
              const rawUrl = String(fv.value)
              nextFiles[f.id] = {
                existing: true,
                value: rawUrl,
                url: fileUrl(rawUrl),
                name: fv.fileName || decodeURIComponent(rawUrl.split('/').pop() || 'berkas'),
                size: fv.size,
              }
            } else {
              nextValues[f.id] = isWhatsappField(f) ? stripPhone(fv.value) : String(fv.value)
            }
          })
          setValues(nextValues)
          setFiles(nextFiles)
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, 'Gagal memuat formulir pengajuan'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, navigate])

  /* ---------------- turunan ---------------- */
  const fields = useMemo(() => activeForm?.fields ?? [], [activeForm])
  const textFields = useMemo(() => fields.filter((f) => !isFileType(f.type)), [fields])
  const fileFields = useMemo(() => fields.filter((f) => isFileType(f.type)), [fields])

  // Bentuk yang dipakai <DocumentCard />
  const documents = useMemo(
    () =>
      fileFields.map((f, idx) => {
        const rule = uploadRule(f.type)
        return {
          id: f.id,
          no: idx + 1,
          title: f.name,
          description: f.description,
          accept: rule.accept,
          type: rule.label,
          badge: f.required ? undefined : 'Opsional',
        }
      }),
    [fileFields]
  )

  const event = activeForm?.event ?? null
  const isClosed = isEdit ? false : !activeForm || !event || !isEventOpen(event, now)
  const editBlocked = isEdit && pengajuan ? pengajuan.status !== 'submitted' : false

  const prodiOptions = useMemo(
    () => prodiList.map((p) => ({ value: String(p.id), label: p.nama ?? p.nama_program_studi ?? '' })),
    [prodiList]
  )

  /* ---------------- validasi ---------------- */
  const rawFieldErrors = useMemo(() => {
    const errs = {}
    if (!profile.name.trim()) errs.name = 'Kolom ini wajib diisi.'
    if (!profile.nim.trim()) errs.nim = 'Kolom ini wajib diisi.'
    if (!profile.prodiId) errs.prodi = 'Pilih salah satu program studi.'

    textFields.forEach((f) => {
      const v = String(values[f.id] ?? '').trim()
      const key = `f_${f.id}`
      if (isWhatsappField(f)) {
        if ((f.required || v) && !isWhatsappValid(v)) {
          errs[key] = 'Kolom ini wajib diisi dengan nomor WhatsApp aktif yang valid.'
        }
        return
      }
      if (f.required && !v) {
        errs[key] = 'Kolom ini wajib diisi.'
      } else if (v && String(f.type).toLowerCase() === 'url' && !/^https?:\/\/\S+$/i.test(v)) {
        errs[key] = 'Tautan harus diawali http:// atau https://.'
      } else if (v && String(f.type).toLowerCase() === 'number' && Number.isNaN(Number(v))) {
        errs[key] = 'Isian harus berupa angka.'
      }
    })
    return errs
  }, [profile, textFields, values])

  const hasDocumentError = Object.values(fileErrors).some(Boolean)
  const requiredFiles = fileFields.filter((f) => f.required)
  const allDocumentsUploaded = requiredFiles.every((f) => Boolean(files[f.id]))
  const uploadedCount = requiredFiles.filter((f) => Boolean(files[f.id])).length

  const fieldError = useMemo(() => {
    const out = {}
    Object.entries(rawFieldErrors).forEach(([key, msg]) => {
      if (touched[key] || submitAttempted) out[key] = msg
    })
    Object.entries(serverErrors).forEach(([key, msg]) => {
      if (msg) out[key] = msg
    })
    return out
  }, [rawFieldErrors, serverErrors, touched, submitAttempted])

  const canSubmit =
    !isClosed &&
    !editBlocked &&
    !loading &&
    !submitting &&
    !changingProdi &&
    Object.keys(rawFieldErrors).length === 0 &&
    allDocumentsUploaded &&
    !hasDocumentError &&
    integrityChecked

  const hasError = hasDocumentError || Object.values(fieldError).some(Boolean)
  const footerState = canSubmit ? 'valid' : hasError ? 'error' : 'empty'

  /* ---------------- aksi ---------------- */
  const markTouched = (key) => setTouched((prev) => ({ ...prev, [key]: true }))
  const setProfileField = (key, value) => setProfile((prev) => ({ ...prev, [key]: value }))
  const setValue = (fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    setServerErrors((prev) => ({ ...prev, [`f_${fieldId}`]: '' }))
  }
  const setFile = (fieldId, file) => setFiles((prev) => ({ ...prev, [fieldId]: file }))
  const setFileError = (fieldId, message) => setFileErrors((prev) => ({ ...prev, [fieldId]: message }))

  // Form yang tampil difilter backend sesuai prodi mahasiswa -> ganti prodi = simpan ke /me lalu muat ulang form
  const changeProdi = async (prodiId) => {
    setProfile((prev) => ({ ...prev, prodiId }))
    if (!prodiId) return
    setChangingProdi(true)
    setSubmitError('')
    try {
      const updated = await updateProfile({ program_studi_id: Number(prodiId) })
      const merged = {
        ...getUser(),
        ...(updated && typeof updated === 'object' ? updated : {}),
        program_studi_id: Number(prodiId),
      }
      saveUser(merged)
      setUser(merged)
      const raw = await getActiveForm()
      setActiveForm(normalizeActiveForm(raw))
    } catch (err) {
      setSubmitError(errorMessage(err, 'Gagal mengganti program studi'))
    } finally {
      setChangingProdi(false)
    }
  }

  const submit = async () => {
    setSubmitAttempted(true)
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitError('')
    setServerErrors({})

    // field yang dikirim, urut sama dengan indeks `field_values.N` pada error 422 Laravel
    const sentIds = []

    try {
      // 1) simpan perubahan identitas ke PATCH /me
      const changed = {}
      if (profile.name.trim() !== (user?.nama || '')) changed.nama = profile.name.trim()
      if (profile.nim.trim() !== (user?.nomor_induk || user?.nim || '')) changed.nomor_induk = profile.nim.trim()
      if (String(profile.prodiId) !== String(user?.program_studi_id ?? user?.program_studi?.id ?? '')) {
        changed.program_studi_id = Number(profile.prodiId)
      }
      if (Object.keys(changed).length > 0) {
        const updated = await updateProfile(changed)
        const merged = { ...getUser(), ...(updated && typeof updated === 'object' ? updated : {}), ...changed }
        saveUser(merged)
        setUser(merged)
      }

      // 2) unggah berkas baru -> file_url
      const urls = {}
      for (const f of fileFields) {
        const file = files[f.id]
        if (!file) continue
        if (file instanceof File) {
          try {
            const up = await uploadDokumen(file)
            const url = up?.file_url ?? up?.url ?? up?.path ?? ''
            if (!url) throw new Error('Server tidak mengembalikan file_url')
            urls[f.id] = url
          } catch (err) {
            setFileErrors((prev) => ({ ...prev, [f.id]: errorMessage(err, 'Gagal mengunggah berkas') }))
            throw UPLOAD_FAILED
          }
        } else {
          urls[f.id] = file.value
        }
      }

      // 3) susun field_values
      const field_values = []
      fields.forEach((f) => {
        let value
        if (isFileType(f.type)) {
          value = urls[f.id]
        } else {
          const raw = String(values[f.id] ?? '').trim()
          value = isWhatsappField(f) && raw ? `+62${raw}` : raw
        }
        if (value === undefined || value === '') return
        field_values.push({ form_field_id: Number(f.id), value })
        sentIds.push(f.id)
      })

      // 4) kirim
      if (isEdit) {
        await revisiPengajuan({ field_values })
      } else {
        await submitPengajuan({
          yudisium_event_id: Number(activeForm?.eventId ?? event?.id),
          field_values,
        })
      }

      navigate('/pelacakan-yudisium')
    } catch (err) {
      if (err === UPLOAD_FAILED) {
        setSubmitError('Sebagian berkas gagal diunggah. Periksa pesan di kartu berkas yang bertanda merah.')
      } else if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) {
          const next = {}
          Object.entries(err.errors).forEach(([key, msgs]) => {
            const m = key.match(/^field_values\.(\d+)\./)
            if (m && sentIds[Number(m[1])] !== undefined) {
              next[`f_${sentIds[Number(m[1])]}`] = [].concat(msgs).join(' ')
            }
          })
          setServerErrors(next)
        }
        setSubmitError(errorMessage(err, 'Pengajuan gagal dikirim'))
        if (err.status === 409 && !isEdit) {
          setTimeout(() => navigate('/pelacakan-yudisium'), 1800)
        }
      } else {
        setSubmitError(errorMessage(err, 'Pengajuan gagal dikirim'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    user,
    loading,
    loadError,
    activeForm,
    pengajuan,
    event,
    isClosed,
    editBlocked,
    profile,
    setProfileField,
    changeProdi,
    changingProdi,
    prodiOptions,
    textFields,
    documents,
    values,
    setValue,
    files,
    setFile,
    fileErrors,
    setFileError,
    integrityChecked,
    setIntegrityChecked,
    touched,
    markTouched,
    fieldError,
    hasDocumentError,
    uploadedCount,
    requiredCount: requiredFiles.length,
    canSubmit,
    footerState,
    submitAttempted,
    submitting,
    submitError,
    submit,
  }
}
