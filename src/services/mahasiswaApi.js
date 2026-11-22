import { apiRequest, unwrap, unwrapList, ApiError } from './api'

/* =========================================================
   MAHASISWA — Auth / Profil  (Postman folder 1)
========================================================= */
export const getProfile = async () => unwrap(await apiRequest('/me'))

// Body: { nama, nomor_induk, program_studi_id } — semua opsional
export const updateProfile = async (body) => unwrap(await apiRequest('/me', { method: 'PATCH', body }))

/* =========================================================
   MAHASISWA — Pengajuan  (Postman folder 2)
========================================================= */
export const listProgramStudi = async () => unwrapList(await apiRequest('/program-studi'))

// 404 = belum ada periode/form aktif -> null
export async function getActiveForm() {
  try {
    return unwrap(await apiRequest('/pengajuan/active-form'))
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// 404 = mahasiswa belum pernah mengajukan -> null
export async function getMyPengajuan() {
  try {
    return unwrap(await apiRequest('/pengajuan/me'))
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// Upload satu berkas (maks 5MB; pdf/jpg/jpeg/png). Mengembalikan data berisi file_url.
export async function uploadDokumen(file) {
  const formData = new FormData()
  formData.append('file', file)
  return unwrap(await apiRequest('/uploads', { method: 'POST', formData }))
}

// Body: { yudisium_event_id, field_values: [{ form_field_id, value }] }  — hanya 1x seumur mahasiswa (409)
export const submitPengajuan = (body) => apiRequest('/pengajuan', { method: 'POST', body })

// Body: { field_values: [...] } — hanya selama status masih 'submitted' (409 bila sudah diproses)
export const revisiPengajuan = (body) => apiRequest('/pengajuan', { method: 'PUT', body })

/* =========================================================
   MAHASISWA — Konfirmasi Data  (Postman folder 3)
========================================================= */
export const getRekap = async () => unwrap(await apiRequest('/pengajuan/me/rekap'))

// konfirmasi: 'benar' | 'salah' ; catatan wajib bila 'salah'
export const konfirmasiData = (body) => apiRequest('/pengajuan/me/konfirmasi', { method: 'PATCH', body })

/* =========================================================
   Berita Acara — Preview & Export  (Postman folder 10)
========================================================= */
export const previewBeritaAcara = async (id) => unwrap(await apiRequest(`/berita-acara/${id}/preview`))
export const exportBeritaAcara = (id) => apiRequest(`/berita-acara/${id}/export`, { responseType: 'blob' })
