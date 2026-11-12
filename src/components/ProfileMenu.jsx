import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound, PenTool, LogOut } from 'lucide-react'
import { getUser, clearUser } from '../services/auth'

export default function ProfileMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [user] = useState(() => getUser() || { name: 'Kaprodi TRPL', email: 'trpl_kaprodi@mail.ugm.ac.id', photo: null })

  if (!isOpen) return null

  const handleLogout = () => {
    clearUser()
    onClose()
    navigate('/')
  }

  const DefaultAvatarIcon = () => (
    <div className="relative h-full w-full rounded-full bg-[#c7cbd1] flex items-center justify-center overflow-hidden">
      <div className="absolute top-[22%] h-[36%] w-[36%] rounded-full bg-white" />
      <div className="absolute bottom-[-10%] h-[50%] w-[75%] rounded-full bg-white" />
    </div>
  )

  return (
    <div className="absolute right-0 top-[58px] w-[300px] sm:w-[380px] overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-xl z-50 p-5 sm:p-6">
      <div className="border-b border-gray-100 pb-4">
        <p className="text-xs font-semibold text-gray-400 text-left">{user.email}</p>
      </div>

      <div className="flex flex-col items-center py-5">
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] border-[#e8edf5] bg-[#c7cbd1] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {user?.photo ? (
              <img src={user.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <DefaultAvatarIcon />
            )}
          </div>
          <span className="absolute bottom-0.5 right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[2.5px] border-white bg-[#5dbb67]" />
        </div>

        <p className="mt-4 text-base sm:text-[18px] font-bold text-gray-900 text-center tracking-tight">
          {user.name}
        </p>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-1.5">
        {/* Menu Profil Saya */}
        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/approver/profile')
          }}
          className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
        >
          <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#163b6c]">
            <UserRound size={18} />
          </span>
          <div>
            <span className="block text-xs sm:text-sm font-bold text-gray-900">Profil Saya</span>
            <span className="text-[10px] sm:text-xs text-gray-400">Ubah nama dan foto profil</span>
          </div>
        </button>

        {/* Menu Tanda Tangan (E-sign) Khusus Approver */}
        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/approver/profile')
          }}
          className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-gray-50 transition"
        >
          <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D97706]">
            <PenTool size={18} />
          </span>
          <div>
            <span className="block text-xs sm:text-sm font-bold text-gray-900">Tanda Tangan</span>
            <span className="text-[10px] sm:text-xs text-gray-400">Kelola e-sign Anda</span>
          </div>
        </button>

        <div className="border-t border-gray-100 my-1" />

        {/* Menu Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-red-50/60 transition"
        >
          <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fde8e7] text-[#d9362b]">
            <LogOut size={18} />
          </span>
          <div>
            <span className="block text-xs sm:text-sm font-bold text-[#d9362b]">Keluar / Logout</span>
            <span className="text-[10px] sm:text-xs text-red-400">Akhiri sesi akun di perangkat ini</span>
          </div>
        </button>
      </div>
    </div>
  )
}