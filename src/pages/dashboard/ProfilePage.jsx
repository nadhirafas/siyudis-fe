import { useState } from 'react'
import { useNavigate } from 'react-router'

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

import { getUser } from '../../services/auth'
import ugmLogo from '../../assets/ugm-logo.png'

function ProfilePage() {
  const navigate = useNavigate()

  // =========================================================
  // USER DATA
  // =========================================================

  const initialUser = getUser() || {
    name: 'Nadhira',
    email: 'nadhirafarraaisyasui@mail.ugm.ac.id',
    photo: null,
  }

  const [user, setUser] = useState(initialUser)
  const [name, setName] = useState(initialUser.name)
  const [photo, setPhoto] = useState(initialUser.photo || null)

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

    const imageUrl = URL.createObjectURL(file)

    setPhoto(imageUrl)

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
    navigate('/dashboard')
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
      name: trimmedName,
      photo,
    }

    localStorage.setItem(
      'siyudis_user',
      JSON.stringify(updatedUser)
    )

    setUser(updatedUser)
    setName(trimmedName)

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
            onClick={() => navigate('/dashboard')}
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
              Profile Mahasiswa
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
              {user.name}
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
                Kelola Profile Mahasiswa
              </h2>

              <p className="mt-[7px] text-[14px] leading-[20px] text-[#59606D]">
                Perbarui data personal dan foto profil akun SIYUDIS Anda.
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
                      /* FOTO YANG DIUPLOAD - BULAT */
                      <img
                        src={photo}
                        alt="Foto profile"
                        className="
                          h-[124px]
                          w-[124px]
                          rounded-full
                          object-cover
                        "
                      />
                    ) : (
                      /* FOTO DEFAULT - BULAT */
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
                      value={user.email}
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

/* =============================================================
   DEFAULT PROFILE PHOTO

   Frame luar:
   - kotak rounded

   Foto di dalam:
   - BULAT
   - abu-abu
   - kepala + badan putih
============================================================= */

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
          top-[31px]
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
          bottom-[18px]
          -translate-x-1/2
          h-[43px]
          w-[75px]
          rounded-t-full
          bg-white
        "
      />

    </div>
  )
}

/* =============================================================
   HEADER PROFILE AVATAR
============================================================= */

function ProfileAvatar({ photo, size }) {
  if (size !== 'small') {
    return null
  }

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
      {photo ? (
        <img
          src={photo}
          alt="Foto profil"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="relative h-full w-full">

          {/* HEAD */}
          <div
            className="
              absolute
              left-1/2
              top-[8px]
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