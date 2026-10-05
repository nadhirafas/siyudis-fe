import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  Menu,
  X,
} from 'lucide-react'

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ugmLogo from '../assets/ugm-logo.png'

function Sidebar({ admin = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menus = admin
    ? [
        {
          label: 'Dashboard',
          icon: Home,
          path: '/admin/dashboard',
        },
        {
          label: 'Pengajuan Yudisium',
          icon: FileText,
          path: '/admin/pengajuan-yudisium',
        },
        {
          label: 'Berita Acara',
          icon: ShieldCheck,
          path: '/admin/berita-acara',
        },
        {
          label: 'Panduan & Dokumen',
          icon: BookOpen,
          path: '/admin/panduan',
        },
      ]
    : [
        {
          label: 'Dashboard',
          icon: Home,
          path: '/dashboard',
        },
        {
          label: 'Pengajuan Yudisium',
          icon: FileText,
          path: '/pengajuan-yudisium',
        },
        {
          label: 'Berita Acara',
          icon: ShieldCheck,
          path: '/berita-acara',
        },
        {
          label: 'Panduan & Dokumen',
          icon: BookOpen,
          path: '/panduan',
        },
      ]

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
              h-[200px]
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
                <button
                  key={menu.path}
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
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar