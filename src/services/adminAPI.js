import { apiRequest, unwrap, unwrapList } from './api'

/* =========================================================
   REFERENSI
========================================================= */
export const listProgramStudi = async () => unwrapList(await apiRequest('/program-studi'))

/* =========================================================
   SUPER ADMIN — Roles & Users  (Postman folder 15)
========================================================= */
export const listRoles = async () => unwrapList(await apiRequest('/admin/roles'))
export const listUsers = async (params = {}) =>
  unwrapList(await apiRequest('/admin/users', { params: { limit: 200, ...params } }))
export const createUser = (body) => apiRequest('/admin/users', { method: 'POST', body })
export const updateUser = (id, body) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body })
export const deleteUser = (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' })

/* =========================================================
   SUPER ADMIN — Forms & Fields  (folder 11 & 12)
========================================================= */
export const listForms = async () => unwrapList(await apiRequest('/admin/forms'))
export const createForm = (body) => apiRequest('/admin/forms', { method: 'POST', body })
export const updateForm = (id, body) => apiRequest(`/admin/forms/${id}`, { method: 'PUT', body })
export const deleteForm = (id) => apiRequest(`/admin/forms/${id}`, { method: 'DELETE' })

export const listFields = async (formId) => unwrapList(await apiRequest(`/admin/forms/${formId}/fields`))
export const createField = (formId, body) =>
  apiRequest(`/admin/forms/${formId}/fields`, { method: 'POST', body })
export const updateField = (formId, fieldId, body) =>
  apiRequest(`/admin/forms/${formId}/fields/${fieldId}`, { method: 'PATCH', body })
export const deleteField = (formId, fieldId) =>
  apiRequest(`/admin/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' })

/* =========================================================
   Periode Yudisium / Events  (folder 13, jalur /admin/events)
========================================================= */
export const listEvents = async (params) => unwrapList(await apiRequest('/admin/events', { params }))
export const getEvent = async (id) => unwrap(await apiRequest(`/admin/events/${id}`))
export const createEvent = (body) => apiRequest('/admin/events', { method: 'POST', body })
export const updateEvent = (id, body) => apiRequest(`/admin/events/${id}`, { method: 'PUT', body })
export const deleteEvent = (id) => apiRequest(`/admin/events/${id}`, { method: 'DELETE' })

/* =========================================================
   SUPER ADMIN — Template Berita Acara  (folder 14)
========================================================= */
export const getBeritaAcaraTemplate = async (prodiId) =>
  unwrap(await apiRequest(`/admin/program-studi/${prodiId}/berita-acara-template`))
export const updateBeritaAcaraTemplate = (prodiId, template) =>
  apiRequest(`/admin/program-studi/${prodiId}/berita-acara-template`, {
    method: 'PUT',
    body: { template },
  })

/* =========================================================
   ADMIN (Staf Akademik) — Pengajuan  (folder 4)
========================================================= */
export const listPengajuanStaf = async (params = {}) =>
  unwrapList(await apiRequest('/staf-akademik/pengajuan', { params: { limit: 200, ...params } }))
export const getPengajuanStaf = async (id) => unwrap(await apiRequest(`/staf-akademik/pengajuan/${id}`))
export const savePenilaian = (id, body) =>
  apiRequest(`/staf-akademik/pengajuan/${id}/penilaian`, { method: 'PUT', body })
export const kirimKonfirmasi = (id) =>
  apiRequest(`/staf-akademik/pengajuan/${id}/kirim-konfirmasi`, { method: 'POST' })
export const checklistAkhir = (id) =>
  apiRequest(`/staf-akademik/pengajuan/${id}/checklist`, { method: 'POST' })

/* =========================================================
   ADMIN (Staf Akademik) — Berita Acara  (folder 5 & 10)
========================================================= */
export const ajukanBeritaAcara = async (body) =>
  unwrap(await apiRequest('/staf-akademik/berita-acara', { method: 'POST', body }))
export const updateBeritaAcaraMeta = (id, body) =>
  apiRequest(`/staf-akademik/berita-acara/${id}`, { method: 'PATCH', body })
export const previewBeritaAcara = async (id) => unwrap(await apiRequest(`/berita-acara/${id}/preview`))
export const exportBeritaAcara = (id) =>
  apiRequest(`/berita-acara/${id}/export`, { responseType: 'blob' })
