import { clearToken, clearUser, getToken } from './auth'

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Origin backend (tanpa /api) — dipakai untuk file storage relatif, mis. /storage/xxx.pdf
export const BACKEND_ORIGIN = API_URL.replace(/\/api$/, '')

export class ApiError extends Error {
  constructor(message, status, errors, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors || null // validation errors Laravel: { field: [msg] }
    this.data = data || null
  }
}

function buildQuery(params) {
  if (!params) return ''
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    q.append(key, value)
  })
  const str = q.toString()
  return str ? `?${str}` : ''
}

/**
 * Request ke backend Laravel (Sanctum Bearer token).
 * options: { method, body, params, formData, responseType: 'json' | 'blob' }
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, params, formData, responseType = 'json' } = options

  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (formData) {
    payload = formData // browser mengisi Content-Type + boundary sendiri
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: payload,
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi atau pastikan backend berjalan.', 0)
  }

  if (response.status === 401) {
    clearToken()
    clearUser()
    if (window.location.pathname !== '/') window.location.href = '/'
    throw new ApiError('Sesi berakhir, silakan login kembali.', 401)
  }

  if (responseType === 'blob') {
    if (!response.ok) {
      let message = 'Gagal mengunduh file'
      try {
        message = (await response.json()).message || message
      } catch { /* abaikan */ }
      throw new ApiError(message, response.status)
    }
    return response.blob()
  }

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || `Permintaan gagal (${response.status})`,
      response.status,
      data?.errors,
      data,
    )
  }

  return data
}

/* ---------------- helpers membaca response ---------------- */

// { status:'success', data: X } -> X
export function unwrap(res) {
  if (res && typeof res === 'object' && 'data' in res) return res.data
  return res
}

// Ambil array dari berbagai bentuk: [..] | {data:[..]} | {data:{data:[..]}} | {data:{items:[..]}}
export function unwrapList(res) {
  if (Array.isArray(res)) return res
  const d = res?.data
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.items)) return d.items
  if (Array.isArray(res?.items)) return res.items
  return []
}

// Pesan error ramah: gabungkan pesan validasi Laravel bila ada
export function errorMessage(err, fallback = 'Terjadi kesalahan') {
  if (!err) return fallback
  if (err.errors && typeof err.errors === 'object') {
    const lines = Object.values(err.errors).flat().filter(Boolean)
    if (lines.length) return lines.join(' ')
  }
  return err.message || fallback
}

// URL file (bisa relatif) -> absolut
export function fileUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${BACKEND_ORIGIN}/${String(path).replace(/^\//, '')}`
}
