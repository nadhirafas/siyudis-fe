import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  Settings,
  FileSpreadsheet,
  FileCode,
  History,
  Menu,
  X,
} from 'lucide-react'

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getUser, getUserRoles } from '../services/auth'
import ugmLogo from '../assets/ugm-logo.png'

export default function Sidebar({ admin = false, isOpen, onClose, hideFloatingButton = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [internalOpen, setInternalOpen] = useState(false)

  const controlled = typeof isOpen === 'boolean'
  const mobileOpen = controlled ? isOpen : internalOpen
  const openSidebar = () => (controlled ? onClose?.(true) : setInternalOpen(true))
  const closeSidebar = () => (controlled ? onClose?.(false) : setInternalOpen(false))

  const currentUser = getUser()
  const userRoles = getUserRoles(currentUser)
  const hasStafRole = userRoles.includes('staf_akademik') || userRoles.includes('super_admin')

  const isInSuperPath = location.pathname.startsWith('/super-admin')
  const isInAdminPath = location.pathname.startsWith('/admin')

  const area = isInSuperPath
    ? 'super'
    : isInAdminPath || admin || hasStafRole
    ? 'staf'
    : 'mahasiswa'

  const buildMenus = (base) => [
    { label: 'Dashboard', icon: Home, path: `${base}/dashboard` },
    { label: 'Pengajuan Yudisium', icon: FileText, path: `${base}/pengajuan-yudisium` },
    { label: 'Berita Acara', icon: ShieldCheck, path: `${base}/berita-acara` },
    { label: 'Panduan & Dokumen', icon: BookOpen, path: `${base}/panduan` },
  ]

  const menus =
    area === 'super'
      ? [
          ...buildMenus('/super-admin'),
          {
            label: 'Manajemen Role',
            icon: Settings,
            path: '/super-admin/management-role',
            section: 'Super Admin',
          },
          { label: 'Form Pengajuan', icon: FileSpreadsheet, path: '/super-admin/form-management' },
          { label: 'Template Berita Acara', icon: FileCode, path: '/super-admin/template-berita-acara' },
          { label: 'Riwayat Perubahan', icon: History, path: '/super-admin/riwayat-perubahan' },
        ]
      : area === 'staf'
      ? buildMenus('/admin')
      : buildMenus('')

  const handleNavigate = (path) => {
    navigate(path)
    closeSidebar()
  }

  return (
    <>
      {/* TRIGGER TOMBOL HAMBURGER DI LUAR JIKA DIPERLUKAN */}
      {!controlled && !hideFloatingButton && (
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Buka menu"
          className="fixed left-3.5 top-5 z-40 flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-[#0F172A] shadow-xs backdrop-blur-xs transition hover:bg-white lg:hidden"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>
      )}

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[295px] bg-[#063E73] shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full w-full">
          {/* MOBILE CLOSE BUTTON */}
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute right-4 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>

          {/* LOGO + BRAND */}
          <div className="absolute left-[20px] top-[22px] flex h-[52px] w-[230px] items-center gap-[10px]">
            <img
              src={ugmLogo}
              alt="UGM"
              className="h-[52px] w-[52px] shrink-0 object-contain"
            />

            <div className="flex flex-col justify-center">
              <p className="text-[18px] font-bold leading-[20px] tracking-[-0.2px] text-white">
                SIYUDIS
              </p>

              <p className="mt-[2px] whitespace-nowrap text-[9px] font-medium leading-[12px] text-white/70">
                Departemen Teknik Elektro dan Informatika
              </p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="absolute left-[20px] top-[104px] h-px w-[255px] bg-white/40" />

          {/* MENU */}
          <nav className="absolute inset-x-0 bottom-[24px] top-[132px] flex w-[295px] flex-col gap-[8px] overflow-y-auto px-[16px]">
            {menus.map((menu) => {
              const Icon = menu.icon

              const active =
                location.pathname === menu.path ||
                location.pathname.startsWith(`${menu.path}/`)

              return (
                <div key={menu.path} className="flex flex-col gap-[8px]">
                  {menu.section && (
                    <p className="mt-3 border-t border-white/20 px-3 pt-4 text-[10px] font-bold uppercase tracking-wider text-white/50">
                      {menu.section}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleNavigate(menu.path)}
                    className={`flex h-[44px] w-full shrink-0 items-center gap-[16px] rounded-[12px] px-[16px] text-left transition-all ${
                      active
                        ? 'bg-[#2D628F] font-semibold text-white'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.2 : 1.9}
                      className={
                        active
                          ? 'shrink-0 text-[#FFBE3B]'
                          : 'shrink-0 text-white/80'
                      }
                    />

                    <span className="whitespace-nowrap text-[15px] leading-[20px]">
                      {menu.label}
                    </span>
                  </button>
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}