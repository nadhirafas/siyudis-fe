import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveUser } from '../../services/auth'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')

        console.log('TOKEN:', token)

        if (!token) {
          throw new Error('Token login tidak ditemukan')
        }

        localStorage.setItem('siyudis_token', token)

        const API_URL = import.meta.env.VITE_API_URL

        console.log('API URL:', API_URL)

        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('STATUS:', response.status)

        const result = await response.json()

        console.log('RESULT:', result)

        if (!response.ok) {
          throw new Error(result.message || 'Gagal mengambil data pengguna')
        }

        if (result.status !== 'success') {
          throw new Error('Data pengguna tidak valid')
        }

        saveUser(result.data)

        navigate('/dashboard', { replace: true })
      } catch (err) {
        console.error('AUTH CALLBACK ERROR:', err)
        setError(err.message || 'Login gagal')
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F7FB]">
        <div className="rounded-xl bg-white border border-[#E0E7EF] p-8 text-center">
          <h1 className="text-lg font-bold text-[#111827]">
            Login gagal
          </h1>

          <p className="mt-2 text-sm text-[#65758B]">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F7FB]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#D5E1EC] border-t-[#07548C]" />

        <p className="mt-4 text-sm font-medium text-[#526780]">
          Menyiapkan dashboard...
        </p>
      </div>
    </div>
  )
}

export default AuthCallback