import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  Settings,
  FileSpreadsheet,
  FileCode,
  Menu,
  X,
} from 'lucide-react'

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ugmLogo from '../assets/ugm-logo.png'
import { getUser } from '../services/auth'

function Sidebar({ admin = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = getUser()
  const inSuperArea = location.pathname.startsWith('/super-admin')
  // Area kerja ditentukan dari URL: /super-admin/* = 7 menu, /admin/* = 4 menu
  const area = inSuperArea ? 'super' : admin ? 'staf' : 'mahasiswa'

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
            section: 'Pengaturan Super Admin',
          },
          { label: 'Form Pengajuan', icon: FileSpreadsheet, path: '/super-admin/form-management' },
          { label: 'Template Berita Acara', icon: FileCode, path: '/super-admin/template-berita-acara' },
        ]
      : area === 'staf'
      ? buildMenus('/admin')
      : buildMenus('')

  const roleLabel = area === 'super' ? 'Super Admin' : area === 'staf' ? 'Staf Akademik' : null

  const handleNavigate = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <>
      {/* ================================
          MOBILE HEADER / HAMBURGER
      ================================= */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="
          fixed
          left-4
          top-4
          z-50
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-[#063E73]
          text-white
          shadow-md
          transition
          hover:bg-[#174A7C]
          lg:hidden
        "
        aria-label="Buka menu"
      >
        <Menu size={22} />
      </button>

      {/* ================================
          MOBILE OVERLAY
      ================================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            lg:hidden
          "
        />
      )}

      {/* ================================
          SIDEBAR
      ================================= */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-[295px]
          bg-[#063E73]
          shadow-xl
          transition-transform
          duration-300
          lg:translate-x-0
          lg:shadow-none
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <div className="relative h-full w-full">

          {/* ================================
              MOBILE CLOSE BUTTON
          ================================= */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="
              absolute
              right-4
              top-4
              z-10
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-white/80
              transition
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>

          {/* ================================
              LOGO + BRAND
          ================================= */}
          <div
            className="
              absolute
              left-[20px]
              top-[22px]
              flex
              h-[52px]
              w-[256px]
              items-center
              gap-[10px]
            "
          >
            <img
              src={ugmLogo}
              alt="UGM"
              className="
                h-[52px]
                w-[52px]
                shrink-0
                object-contain
              "
            />

            <div className="flex flex-col justify-center">
              <p
                className="
                  text-[18px]
                  font-bold
                  leading-[20px]
                  tracking-[-0.2px]
                  text-white
                "
              >
                SIYUDIS
              </p>

              <p
                className="
                  mt-[2px]
                  whitespace-nowrap
                  text-[9px]
                  font-medium
                  leading-[12px]
                  text-white/70
                "
              >
                Departemen Teknik Elektro dan Informatika
              </p>
            </div>
          </div>

          {/* ================================
              DIVIDER
          ================================= */}
          <div
            className="
              absolute
              left-[20px]
              top-[104px]
              h-px
              w-[255px]
              bg-white/40
            "
          />

          {/* ================================
              MENU
          ================================= */}
          <nav
            className="
              absolute
              left-0
              top-[140px]
              flex
              bottom-[84px]
              overflow-y-auto
              w-[295px]
              flex-col
              gap-[8px]
              px-[16px]
            "
          >
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
                  className={`
                    flex
                    h-[44px]
                    w-full
                    shrink-0
                    items-center
                    gap-[16px]
                    rounded-[12px]
                    px-[16px]
                    text-left
                    transition-all
                    ${
                      active
                        ? 'bg-[#2D628F] font-semibold text-white'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }
                  `}
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

                  <span
                    className="
                      whitespace-nowrap
                      text-[16px]
                      leading-[20px]
                    "
                  >
                    {menu.label}
                  </span>
                </button>
                </div>
              )
            })}
          </nav>

          {/* ================================
              LABEL ROLE AKTIF
          ================================= */}
          {roleLabel && (
            <div className="absolute inset-x-[16px] bottom-[20px] rounded-[12px] bg-white/10 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">Masuk sebagai</p>
              <p className="truncate text-[13px] font-bold text-white">{roleLabel}</p>
              <p className="truncate text-[10px] text-white/60">{user?.nama || ''}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar