import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (options.responseType === 'blob') {
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Gagal mengunduh file PDF')
    }
    return response.blob()
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Request gagal (${response.status})`)
    error.status = response.status
    error.errors = data.errors
    throw error
  }

  return data
}

// =========================================================
// PROFIL & E-SIGNATURE (Kaprodi / Kadep / Manit)
// =========================================================
export function getMyProfile() {
  return request('/profile')
}

export function updateMyProfile(payload) {
  if (payload instanceof FormData) {
    payload.append('_method', 'PUT')
    return request('/profile', { method: 'POST', body: payload })
  }
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getMySignature() {
  return request('/signature/me')
}

export function saveMySignature(file, hasExisting = false) {
  const formData = new FormData()
  formData.append('file', file)

  if (hasExisting) {
    formData.append('_method', 'PUT')
    return request('/signature/me', { method: 'POST', body: formData })
  }

  return request('/signature', { method: 'POST', body: formData })
}

// =========================================================
// MASTER DATA
// =========================================================
export function getProgramStudiList() {
  return request('/program-studi')
}

export function getYudisiumEvents() {
  return request('/yudisium-events')
}

// =========================================================
// BERITA ACARA & APPROVAL (role: 'kaprodi' | 'kadep' | 'manit')
// =========================================================
export function getBeritaAcaraList(role, params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)

  const qs = query.toString() ? `?${query.toString()}` : ''
  return request(`/${role}/berita-acara${qs}`)
}

export function getBeritaAcaraDetail(role, id) {
  return request(`/${role}/berita-acara/${id}`)
}

export function approveBeritaAcara(role, id) {
  return request(`/${role}/berita-acara/${id}/approve`, {
    method: 'PATCH',
  })
}

export function rejectBeritaAcara(role, id, catatanRevisiInternal) {
  return request(`/${role}/berita-acara/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({
      catatan_revisi_internal: catatanRevisiInternal,
    }),
  })
}

export function previewBeritaAcaraHtml(id) {
  return request(`/berita-acara/${id}/preview`)
}

export function exportBeritaAcaraPdf(id) {
  return request(`/berita-acara/${id}/export`, {
    responseType: 'blob',
  })
}