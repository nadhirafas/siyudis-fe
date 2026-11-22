import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../services/api'
import { getMyPengajuan } from '../services/mahasiswaApi'
import { normalizeMyPengajuan } from '../services/mahasiswaStatus'

// Pengajuan milik mahasiswa yang login (GET /api/pengajuan/me). pengajuan = null bila belum mengajukan.
export default function useMyPengajuan() {
  const [pengajuan, setPengajuan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(
    () =>
      getMyPengajuan()
        .then((data) => {
          setPengajuan(normalizeMyPengajuan(data))
          setError('')
        })
        .catch((err) => setError(errorMessage(err, 'Gagal memuat data pengajuan')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    load()
  }, [load])

  const reload = useCallback(() => {
    setLoading(true)
    return load()
  }, [load])

  return { pengajuan, loading, error, reload }
}
