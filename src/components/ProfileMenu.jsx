import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { getUser, logout } from '../services/auth'

function Avatar({ photo, large = false }) {
  return photo ? (
    <img
      src={photo}
      alt="Foto profil"
      className={`rounded-full border-2 border-[#EEF2F6] object-cover ${large ? 'h-16 w-16' : 'h-8 w-8'}`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full bg-[#CBD5E1] text-[#475569] ${
        large ? 'h-16 w-16' : 'h-8 w-8'
      }`}
    >
      <UserRound size={large ? 32 : 18} />
    </div>
  )
}

// Menu profil di pojok kanan atas: foto, nama, dropdown Profil Saya & Logout.
// Tampilan sama dengan halaman Dashboard / Pengajuan Yudisium / Berita Acara.
export default function ProfileMenu({ fallbackName = 'Pengguna' }) {
  const navigate = useNavigate()
  const [user] = useState(() => getUser())
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const displayName = user?.nama || fallbackName

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-[#F8FAFC]"
      >
        <Avatar photo={user?.avatar} />
        <span className="max-w-[200px] truncate text-[12px] font-bold text-[#1E293B]">{displayName}</span>
        <ChevronDown size={14} className={`text-[#64748B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] z-50 w-[260px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
          <div className="flex flex-col items-center px-5 pb-4 pt-5">
            <Avatar photo={user?.avatar} large />
            <p className="mt-3 max-w-[220px] truncate text-center text-[14px] font-bold text-[#0F172A]">{displayName}</p>
          </div>

          <div className="h-px bg-[#F1F5F9]" />

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-[#F8FAFC]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FF]">
              <UserRound size={16} strokeWidth={1.8} className="text-[#0A477F]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#1E293B]">Profil Saya</p>
              <p className="text-[10px] text-[#64748B]">Ubah nama dan foto profil</p>
            </div>
          </button>

          <div className="mx-5 h-px bg-[#F1F5F9]" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-red-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFE5E5]">
              <LogOut size={16} strokeWidth={2} className="text-[#DC2626]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-red-600">Keluar / Logout</p>
              <p className="text-[10px] text-red-400">Akhiri sesi akun di perangkat ini</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
