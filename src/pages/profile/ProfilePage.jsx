import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  Home,
  FileText,
  ShieldCheck,
  BookOpen,
  UserRound,
  Camera,
  CloudUpload,
  Trash2,
  CircleAlert,
  LockKeyhole,
  Mail,
  Save,
  X,
  Contact,
} from 'lucide-react'

import { getUser, saveUser } from '../../services/auth'

import ugmLogo from '../../assets/ugm-logo.png'

function ProfilePage() {
  const navigate = useNavigate()

  // =========================================================
  // USER DATA
  // =========================================================

  const initialUser = getUser()

  const [user, setUser] = useState(initialUser)

  const [name, setName] = useState(initialUser?.nama || '')

  const [photo, setPhoto] = useState(initialUser?.avatar || null)

  // =========================================================
  // ROLE
  // =========================================================

  const getRoleName = (userData) => {
    if (!userData) {
      return 'mahasiswa'
    }


    if (userData.role?.name) {
      return userData.role.name
    }

    if (typeof userData.role === 'string') {
      return userData.role
    }

    if (userData.role_id) {
      return `role_id:${userData.role_id}`
    }

    return 'mahasiswa'
  }

  const normalizeRole = (roleName) => {
    const role = roleName?.toLowerCase()?.trim()

    // ---------------------------------------------------------
    // MAHASISWA
    // ---------------------------------------------------------

    if (role === 'mahasiswa') {
      return 'mahasiswa'
    }

    // ---------------------------------------------------------
    // STAF AKADEMIK
    // ---------------------------------------------------------

    if (
      role === 'staf akademik' ||
      role === 'staff akademik' ||
      role === 'staf administrasi' ||
      role === 'staff administrasi' ||
      role === 'admin'
    ) {
      return 'staf_akademik'
    }

    // ---------------------------------------------------------
    // SUPER ADMIN
    // ---------------------------------------------------------

    if (
      role === 'super admin' ||
      role === 'super_admin' ||
      role === 'superadmin'
    ) {
      return 'super_admin'
    }

    // ---------------------------------------------------------
    // KAPRODI
    // ---------------------------------------------------------

    if (
      role === 'kaprodi' ||
      role === 'kepala program studi' ||
      role === 'kepala_prodi'
    ) {
      return 'kaprodi'
    }

    // ---------------------------------------------------------
    // MANIT
    // ---------------------------------------------------------

    if (role === 'manit') {
      return 'manit'
    }

    // ---------------------------------------------------------
    // KADEP
    // ---------------------------------------------------------

    if (
      role === 'kadep' ||
      role === 'kepala departemen' ||
      role === 'kepala_departemen'
    ) {
      return 'kadep'
    }

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------

    return 'mahasiswa'
  }

  const rawRole = getRoleName(user)

  const role = normalizeRole(rawRole)

  // =========================================================
  // ROLE CONFIGURATION
  // =========================================================

  const roleConfig = {
    mahasiswa: {
      label: 'Mahasiswa',
      title: 'Profil Mahasiswa',
      heading: 'Kelola Profile Mahasiswa',
      description:
        'Perbarui data personal dan foto profil akun SIYUDIS Anda.',
      dashboard: '/dashboard',
    },

    staf_akademik: {
      label: 'Staf Akademik',
      title: 'Profil Staf Akademik',
      heading: 'Kelola Profil Staf Akademik',
      description:
        'Perbarui data personal dan foto profil akun SIYUDIS Anda.',
      dashboard: '/admin/dashboard',
    },

    super_admin: {
      label: 'Super Admin',
      title: 'Profil Super Admin',
      heading: 'Kelola Profil Super Admin',
      description:
        'Perbarui data personal dan foto profil akun SIYUDIS Anda.',
      dashboard: '/admin/dashboard',
    },

    kaprodi: {
      label: 'Kaprodi',
      title: 'Profil Kaprodi',
      heading: 'Kelola Profil Kaprodi',
      description:
        'Perbarui data personal dan foto profil akun SIYUDIS Anda.',
      dashboard: '/kepala-prodi/dashboard',
    },

    manit: {
      label: 'Manit',
      title: 'Profil Manit',
      heading: 'Kelola Profil Manit',
      description:
        'Perbarui data personal dan foto profil akun SIYUDIS Anda.',
      dashboard: '/management/dashboard',
    },

    kadep: {
      label: 'Kadep',
      title: 'Profil Kadep',
      heading: 'Kelola Profil Kadep',
      description:
        'Perbarui data personal dan foto profil akun SIYUDIS Anda.',
      dashboard: '/management/dashboard',
    },
  }

  const config = roleConfig[role] || roleConfig.mahasiswa

  // =========================================================
  // UPLOAD FOTO
  // =========================================================

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Format file harus PNG, JPG, atau WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2.0 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setPhoto(reader.result)
    }

    reader.onerror = () => {
      alert('Foto gagal diproses.')
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  // =========================================================
  // HAPUS FOTO
  // =========================================================

  const handleDeletePhoto = () => {
    setPhoto(null)
  }

  // =========================================================
  // BATAL
  // =========================================================

  const handleCancel = () => {
    navigate(config.dashboard)
  }

  // =========================================================
  // SIMPAN
  // =========================================================

  const handleSave = () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      alert('Nama tidak boleh kosong.')
      return
    }

    const updatedUser = {
      ...user,
      nama: trimmedName,
      avatar: photo,
    }

    // Gunakan saveUser agar seluruh data user tetap dipertahankan
    // termasuk role, role_id, email, permissions, dll.
    saveUser(updatedUser)

    setUser(updatedUser)
    setName(trimmedName)
    setPhoto(photo)

    alert('Perubahan profil berhasil disimpan.')
  }

  return (
    <div className="min-h-screen bg-[#F2F7FC] flex">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="w-[272px] min-h-screen shrink-0 bg-[#063E73] text-white">

        {/* BRAND */}

        <div className="px-[19px] pt-[21px]">

          <div className="flex items-center gap-[10px]">

            {/* LOGO UGM */}

            <img
              src={ugmLogo}
              alt="Logo UGM"
              className="h-[47px] w-[47px] object-contain"
            />

            <div className="min-w-0">

              <div className="text-[16px] leading-[19px] font-bold">
                SIYUDIS
              </div>

              <div className="mt-[2px] text-[9px] leading-[12px] text-white/80 whitespace-nowrap">
                Departemen Teknik Elektro dan Informatika
              </div>

            </div>

          </div>

          <div className="mt-[23px] border-t border-white/45" />

        </div>

        {/* NAVIGATION */}

        <nav className="mt-[35px] px-[15px]">

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => navigate(config.dashboard)}
            className="
              w-full
              h-[43px]
              rounded-[11px]
              px-[15px]
              flex
              items-center
              gap-[15px]
              bg-[#2B6090]
              border
              border-white/15
              text-left
            "
          >
            <Home
              size={19}
              strokeWidth={2}
              className="text-[#FFD43B]"
            />

            <span className="text-[14px] font-semibold text-white">
              Dashboard
            </span>
          </button>

          {/* PENGAJUAN YUDISIUM */}

          <button
            type="button"
            className="
              w-full
              h-[43px]
              mt-[3px]
              rounded-[11px]
              px-[15px]
              flex
              items-center
              gap-[15px]
              text-left
              text-white/65
              hover:bg-white/5
            "
          >
            <FileText
              size={19}
              strokeWidth={1.8}
            />

            <span className="text-[14px]">
              Pengajuan Yudisium
            </span>
          </button>

          {/* BERITA ACARA */}

          <button
            type="button"
            className="
              w-full
              h-[43px]
              mt-[3px]
              rounded-[11px]
              px-[15px]
              flex
              items-center
              gap-[15px]
              text-left
              text-white/65
              hover:bg-white/5
            "
          >
            <ShieldCheck
              size={19}
              strokeWidth={1.8}
            />

            <span className="text-[14px]">
              Berita Acara
            </span>
          </button>

          {/* PANDUAN */}

          <button
            type="button"
            className="
              w-full
              h-[43px]
              mt-[3px]
              rounded-[11px]
              px-[15px]
              flex
              items-center
              gap-[15px]
              text-left
              text-white/65
              hover:bg-white/5
            "
          >
            <BookOpen
              size={19}
              strokeWidth={1.8}
            />

            <span className="text-[14px]">
              Panduan &amp; Dokumen
            </span>
          </button>

        </nav>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 min-w-0">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            h-[74px]
            bg-white
            border-b
            border-[#E3E8EF]
            flex
            items-center
            justify-between
            px-[29px]
          "
        >

          {/* TITLE */}

          <div>

            <h1 className="text-[24px] leading-[29px] font-extrabold text-[#080808]">
              {config.title}
            </h1>

            <p className="mt-[2px] text-[12px] leading-[17px] text-[#667085]">
              Sistem Informasi Yudisium Terpadu DTEDI SV UGM
            </p>

          </div>

          {/* USER */}

          <div className="flex items-center gap-[11px]">

            <ProfileAvatar
              photo={photo}
              size="small"
            />

            <span className="text-[13px] font-bold text-[#111111]">
              {name || config.label}
            </span>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="px-[27px] py-[34px]">

          <div className="max-w-[930px] mx-auto">

            {/* =================================================
                INTRO CARD
            ================================================= */}

            <section
              className="
                h-[113px]
                rounded-[15px]
                bg-white
                px-[41px]
                flex
                flex-col
                justify-center
                shadow-[0_5px_13px_rgba(15,23,42,0.08)]
              "
            >

              <h2 className="text-[23px] leading-[28px] font-extrabold text-[#0A0A0A]">
                {config.heading}
              </h2>

              <p className="mt-[7px] text-[14px] leading-[20px] text-[#59606D]">
                {config.description}
              </p>

            </section>

            {/* =================================================
                FOTO PROFILE
            ================================================= */}

            <section
              className="
                mt-[22px]
                rounded-[15px]
                bg-white
                px-[25px]
                py-[21px]
                shadow-[0_5px_13px_rgba(15,23,42,0.08)]
              "
            >

              {/* HEADER */}

              <div className="flex items-center gap-[11px]">

                <div
                  className="
                    h-[40px]
                    w-[40px]
                    rounded-[9px]
                    bg-[#DDE8FF]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <UserRound
                    size={20}
                    strokeWidth={2}
                    className="text-[#163D68]"
                  />
                </div>

                <div>

                  <h3 className="text-[15px] leading-[19px] font-bold text-[#173152]">
                    Foto Profile
                  </h3>

                  <p className="mt-[1px] text-[12px] leading-[17px] text-[#7A808B]">
                    Ditampilkan pada profile akun Anda.
                  </p>

                </div>

              </div>

              {/* PHOTO AREA */}

              <div className="mt-[20px] flex items-center gap-[22px]">

                {/* FOTO */}

                <div className="relative shrink-0">

                  {/* FRAME FOTO */}

                  <div
                    className="
                      h-[132px]
                      w-[132px]
                      rounded-[12px]
                      border-[3px]
                      border-[#D9E5FF]
                      bg-white
                      flex
                      items-center
                      justify-center
                      overflow-hidden
                    "
                  >

                    {photo ? (
                      <img
                        src={photo}
                        alt="Foto profile"
                        className="
                          h-[124px]
                          w-[124px]
                          rounded-full
                          object-cover
                        "
                        onError={() => setPhoto(null)}
                      />
                    ) : (
                      <DefaultProfilePhoto />
                    )}

                  </div>

                  {/* CAMERA BUTTON */}

                  <label
                    htmlFor="photo-upload"
                    className="
                      absolute
                      right-[-8px]
                      bottom-[-9px]
                      h-[32px]
                      w-[32px]
                      rounded-[10px]
                      bg-[#062F5D]
                      border-[2px]
                      border-white
                      flex
                      items-center
                      justify-center
                      cursor-pointer
                      hover:bg-[#08477F]
                    "
                  >
                    <Camera
                      size={16}
                      strokeWidth={2}
                      className="text-white"
                    />
                  </label>

                  {/* FILE INPUT */}

                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                </div>

                {/* RIGHT SIDE */}

                <div className="flex-1 min-w-0">

                  {/* BUTTONS */}

                  <div className="flex items-center gap-[7px]">

                    {/* UPLOAD */}

                    <label
                      htmlFor="photo-upload"
                      className="
                        h-[32px]
                        px-[13px]
                        rounded-[10px]
                        bg-[#062F5D]
                        text-white
                        text-[12px]
                        font-semibold
                        flex
                        items-center
                        gap-[6px]
                        cursor-pointer
                        hover:bg-[#08477F]
                      "
                    >

                      <CloudUpload
                        size={16}
                        strokeWidth={2}
                      />

                      <span>
                        Unggah Foto Baru
                      </span>

                    </label>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="
                        h-[32px]
                        px-[12px]
                        rounded-[10px]
                        bg-[#FFD9D7]
                        text-[#C62828]
                        text-[12px]
                        font-semibold
                        flex
                        items-center
                        gap-[5px]
                        hover:bg-[#FFC9C6]
                      "
                    >

                      <Trash2
                        size={15}
                        strokeWidth={2}
                      />

                      <span>
                        Hapus Foto
                      </span>

                    </button>

                  </div>

                  {/* INFO */}

                  <div
                    className="
                      mt-[10px]
                      min-h-[42px]
                      rounded-[11px]
                      bg-[#EEF2FF]
                      px-[12px]
                      py-[9px]
                      flex
                      items-center
                      gap-[8px]
                    "
                  >

                    <CircleAlert
                      size={17}
                      strokeWidth={2}
                      className="shrink-0 text-[#927500]"
                    />

                    <p className="text-[12px] leading-[17px] text-[#394355]">

                      <span className="font-bold">
                        Ketentuan Foto Profile:
                      </span>{' '}

                      Format file PNG, JPG, atau WebP dengan ukuran maksimal 2.0 MB.

                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                DATA AKUN
            ================================================= */}

            <section
              className="
                mt-[22px]
                rounded-[15px]
                bg-white
                px-[25px]
                py-[27px]
                shadow-[0_5px_13px_rgba(15,23,42,0.08)]
              "
            >

              {/* HEADER */}

              <div className="flex items-center gap-[11px]">

                <div
                  className="
                    h-[40px]
                    w-[40px]
                    rounded-[9px]
                    bg-[#DDE8FF]
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Contact
                    size={20}
                    strokeWidth={2}
                    className="text-[#163D68]"
                  />

                </div>

                <div>

                  <h3 className="text-[15px] leading-[19px] font-bold text-[#173152]">
                    Data Akun
                  </h3>

                  <p className="mt-[1px] text-[12px] leading-[17px] text-[#7A808B]">
                    Identitas dari pengguna akun.
                  </p>

                </div>

              </div>

              {/* FORM */}

              <div className="mt-[26px]">

                {/* NAMA */}

                <div>

                  <label className="text-[12px] leading-[16px] font-bold text-[#172033]">
                    Nama
                  </label>

                  <div
                    className="
                      mt-[7px]
                      h-[41px]
                      rounded-[10px]
                      border
                      border-[#D2D8E0]
                      bg-white
                      flex
                      items-center
                    "
                  >

                    <UserRound
                      size={17}
                      strokeWidth={2}
                      className="ml-[11px] mr-[12px] text-[#78818D]"
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value)
                      }}
                      className="
                        flex-1
                        h-full
                        bg-transparent
                        outline-none
                        pr-[12px]
                        text-[13px]
                        text-[#253044]
                      "
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="mt-[9px]">

                  <div className="flex items-center justify-between">

                    <label
                      className="
                        flex
                        items-center
                        gap-[5px]
                        text-[12px]
                        leading-[16px]
                        font-bold
                        text-[#172033]
                      "
                    >

                      <span>
                        Email Institusi SSO UGM
                      </span>

                      <LockKeyhole
                        size={13}
                        strokeWidth={2}
                        className="text-[#6D7480]"
                      />

                    </label>

                    <span className="text-[10px] leading-[14px] font-bold text-[#7A7F89]">
                      TERKUNCI
                    </span>

                  </div>

                  {/* EMAIL INPUT */}

                  <div
                    className="
                      mt-[7px]
                      h-[41px]
                      rounded-[10px]
                      border
                      border-[#D2D8E0]
                      bg-[#EEF2FF]
                      flex
                      items-center
                    "
                  >

                    <Mail
                      size={17}
                      strokeWidth={2}
                      className="ml-[11px] mr-[12px] text-[#78818D]"
                    />

                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="
                        flex-1
                        h-full
                        bg-transparent
                        outline-none
                        pr-[12px]
                        text-[12px]
                        text-[#4B5563]
                      "
                    />

                  </div>

                  <p className="mt-[7px] text-[12px] leading-[17px] text-[#858B96]">
                    Tersinkronisasi otomatis via Google Workspace UGM Mail.
                  </p>

                </div>

                {/* BUTTONS */}

                <div className="mt-[22px] flex justify-end gap-[10px]">

                  {/* BATAL */}

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      h-[32px]
                      px-[17px]
                      rounded-[11px]
                      bg-[#EEF2FF]
                      text-[#253044]
                      text-[12px]
                      font-semibold
                      flex
                      items-center
                      gap-[5px]
                      hover:bg-[#E5E9F8]
                    "
                  >

                    <X
                      size={15}
                      strokeWidth={2}
                    />

                    <span>
                      Batal
                    </span>

                  </button>

                  {/* SIMPAN */}

                  <button
                    type="button"
                    onClick={handleSave}
                    className="
                      h-[32px]
                      px-[21px]
                      rounded-[11px]
                      bg-[#063E73]
                      text-white
                      text-[12px]
                      font-semibold
                      flex
                      items-center
                      gap-[6px]
                      hover:bg-[#08477F]
                    "
                  >

                    <Save
                      size={15}
                      strokeWidth={2}
                    />

                    <span>
                      Simpan Perubahan
                    </span>

                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  )
}

// =============================================================
// DEFAULT PROFILE PHOTO
// =============================================================

function DefaultProfilePhoto() {
  return (
    <div
      className="
        relative
        h-[124px]
        w-[124px]
        rounded-full
        bg-[#C4C8CE]
        overflow-hidden
      "
    >

      {/* HEAD */}

      <div
        className="
          absolute
          left-1/2
          top-[25px]
          -translate-x-1/2
          h-[38px]
          w-[38px]
          rounded-full
          bg-white
        "
      />

      {/* BODY */}

      <div
        className="
          absolute
          left-1/2
          bottom-[17px]
          -translate-x-1/2
          h-[42px]
          w-[74px]
          rounded-t-full
          bg-white
        "
      />

    </div>
  )
}

// =============================================================
// HEADER PROFILE AVATAR
// =============================================================

function ProfileAvatar({ photo, size }) {
  const [imageError, setImageError] = useState(false)

  if (size !== 'small') {
    return null
  }

  const showPhoto = photo && !imageError

  return (
    <div
      className="
        h-[36px]
        w-[36px]
        rounded-full
        overflow-hidden
        bg-[#C4C8CE]
        flex
        items-center
        justify-center
      "
    >

      {showPhoto ? (
        <img
          src={photo}
          alt="Foto profil"
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="relative h-full w-full">

          {/* HEAD */}

          <div
            className="
              absolute
              left-1/2
              top-[7px]
              -translate-x-1/2
              h-[12px]
              w-[12px]
              rounded-full
              bg-white
            "
          />

          {/* BODY */}

          <div
            className="
              absolute
              left-1/2
              bottom-[4px]
              -translate-x-1/2
              h-[13px]
              w-[23px]
              rounded-t-full
              bg-white
            "
          />

        </div>
      )}

    </div>
  )
}

export default ProfilePage