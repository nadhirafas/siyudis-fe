import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  X,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  Users,
  Building,
  AlertCircle,
  FileEdit,
  Trash2,
  Loader2,
  Check
} from 'lucide-react'

import Sidebar from '../../components/Sidebar'
import ProfileMenu from '../../components/ProfileMenu'
import { getUser } from '../../services/auth'
import { errorMessage } from '../../services/api'
import { normalizeUser, roleKey, ROLE_LABEL } from '../../services/normalize'
import {
  listRoles,
  listUsers,
  listProgramStudi,
  createUser,
  updateUser,
  deleteUser,
} from '../../services/adminApi'



// ==========================================
// METADATA ROLE (deskripsi & ikon; data role & jumlah dari API)
// ==========================================
const ROLE_META = {
  mahasiswa: {
    icon: GraduationCap,
    desc: 'Role default akun baru: form pengajuan, pantau progres, konfirmasi data',
    tags: ['Form Pengajuan', 'Pantau Progres', 'Konfirmasi Data'],
    note: 'Otomatis diberikan saat login pertama dengan email @mail.ugm.ac.id. Berubah hanya jika Super Admin mengubahnya.'
  },
  staf_akademik: {
    icon: Users,
    desc: 'Verifikasi berkas, input penilaian, kelola Berita Acara',
    tags: ['Verifikasi Berkas', 'Input Penilaian', 'Kelola Berita Acara']
  },
  kaprodi: {
    icon: Shield,
    desc: 'Approval per Berita Acara, e-signature',
    tags: ['Approval Berita Acara', 'E-Signature']
  },
  manit: {
    icon: FileEdit,
    desc: 'Approval paralel, preview tabel Berita Acara',
    tags: ['Approval Paralel', 'Preview Tabel BA', 'E-Signature']
  },
  kadep: {
    icon: Building,
    desc: 'Approval paralel, preview tabel Berita Acara',
    tags: ['Approval Paralel', 'Preview Tabel BA', 'E-Signature']
  },
  super_admin: {
    icon: ShieldCheck,
    desc: 'Semua akses Staf Akademik, ditambah Pengaturan Sistem',
    tags: ['Semua Akses Staf Akademik', 'Pengaturan Sistem']
  }
}

const inputCls =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-white'

function ProdiSelect({ value, onChange, prodiList }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">Semua Prodi / Tidak terikat prodi</option>
      {prodiList.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nama ?? p.nama_program_studi}
        </option>
      ))}
    </select>
  )
}

const TAB_TO_KEY = {
  Mahasiswa: 'mahasiswa',
  'Staf Akademik': 'staf_akademik',
  Kaprodi: 'kaprodi',
  Manit: 'manit',
  Kadep: 'kadep'
}

const PAGE_SIZE = 15

const EMPTY_FORM = { nama: '', email: '', role_id: '', program_studi_id: '' }

// ==========================================
// MAIN PAGE: MANAJEMEN ROLE
// ==========================================
export default function ManajemenRole() {
  const currentUser = getUser()

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }
  const [saving, setSaving] = useState(false)

  // Filters, search & pagination
  const [activeTabFilter, setActiveTabFilter] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [selectedUserModal, setSelectedUserModal] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const flash = (type, text) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 5000)
  }

  const loadAll = useCallback(
    () =>
      Promise.all([listRoles(), listUsers(), listProgramStudi().catch(() => [])])
        .then(([roleRes, userRes, prodiRes]) => {
          setRoles(roleRes)
          setUsers(userRes.map(normalizeUser))
          setProdiList(prodiRes)
          setLoadError('')
        })
        .catch((err) => setLoadError(errorMessage(err, 'Gagal memuat data pengguna')))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const initials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  const prodiLabel = (u) => u.prodiKode || u.prodiNama || 'Semua Prodi'

  const roleNameById = (id) => {
    const r = roles.find((x) => String(x.id) === String(id))
    return r ? r.name ?? r.nama ?? r.nama_role ?? '' : ''
  }

  // Kartu role dari data API + jumlah pengguna
  const roleCards = useMemo(
    () =>
      roles.map((r) => {
        const name = r.name ?? r.nama ?? r.nama_role ?? ''
        const key = roleKey(name)
        const meta = ROLE_META[key] || { icon: ShieldCheck, tags: [] }
        return {
          id: r.id,
          key,
          name: ROLE_LABEL[key] || name,
          count: users.filter((u) => String(u.roleId) === String(r.id)).length,
          ...meta
        }
      }),
    [roles, users]
  )

  const filterCounts = useMemo(() => {
    const counts = { Semua: users.length, Mahasiswa: 0, 'Staf Akademik': 0, Kaprodi: 0, Manit: 0, Kadep: 0 }
    users.forEach((u) => {
      const k = roleKey(u.roleName)
      if (k === 'mahasiswa') counts.Mahasiswa++
      if (k === 'staf_akademik') counts['Staf Akademik']++
      if (k === 'kaprodi') counts.Kaprodi++
      if (k === 'manit') counts.Manit++
      if (k === 'kadep') counts.Kadep++
    })
    return counts
  }, [users])

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return users.filter((u) => {
      const matchesTab = activeTabFilter === 'Semua' || roleKey(u.roleName) === TAB_TO_KEY[activeTabFilter]
      const matchesSearch =
        !q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.nim.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [users, activeTabFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ---------- Kelola pengguna (PUT /admin/users/{id}) ----------
  const handleOpenUserModal = (user) => {
    setSelectedUserModal(user)
    setEditForm({
      nama: user.nama,
      email: user.email,
      role_id: user.roleId ?? '',
      program_studi_id: user.prodiId ?? ''
    })
  }

  const handleSaveUser = async () => {
    if (!selectedUserModal) return
    if (!editForm.nama.trim()) return flash('error', 'Nama wajib diisi.')
    if (!editForm.role_id) return flash('error', 'Pilih role pengguna.')

    setSaving(true)
    try {
      await updateUser(selectedUserModal.id, {
        nama: editForm.nama.trim(),
        role_id: Number(editForm.role_id),
        program_studi_id: editForm.program_studi_id ? Number(editForm.program_studi_id) : null
      })
      setSelectedUserModal(null)
      flash('success', 'Perubahan pengguna berhasil disimpan.')
      await loadAll()
    } catch (err) {
      flash('error', errorMessage(err, 'Gagal menyimpan perubahan pengguna'))
    } finally {
      setSaving(false)
    }
  }

  // ---------- Hapus pengguna (DELETE /admin/users/{id}) ----------
  const handleDeleteUser = async () => {
    if (!selectedUserModal) return
    setSaving(true)
    try {
      await deleteUser(selectedUserModal.id)
      setConfirmDelete(false)
      setSelectedUserModal(null)
      flash('success', 'Pengguna berhasil dihapus.')
      await loadAll()
    } catch (err) {
      setConfirmDelete(false)
      flash('error', errorMessage(err, 'Gagal menghapus pengguna'))
    } finally {
      setSaving(false)
    }
  }

  // ---------- Tambah pengguna internal (POST /admin/users) ----------
  const assignableRoles = roles.filter((r) => roleKey(r.name ?? r.nama ?? r.nama_role ?? '') !== 'mahasiswa')

  const handleCreateUser = async () => {
    if (!createForm.nama.trim() || !createForm.email.trim() || !createForm.role_id) {
      return flash('error', 'Nama, email, dan role wajib diisi.')
    }
    setSaving(true)
    try {
      await createUser({
        nama: createForm.nama.trim(),
        email: createForm.email.trim(),
        role_id: Number(createForm.role_id),
        program_studi_id: createForm.program_studi_id ? Number(createForm.program_studi_id) : null
      })
      setIsCreateOpen(false)
      setCreateForm(EMPTY_FORM)
      flash('success', 'Pengguna baru berhasil ditambahkan.')
      await loadAll()
    } catch (err) {
      flash('error', errorMessage(err, 'Gagal menambahkan pengguna'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <Sidebar admin />

      <div className="min-h-screen lg:pl-[295px]">
        {/* HEADER TOP BAR */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
      <div>
        <h1 className="text-[20px] font-bold text-[#0F172A]">Manajemen Role</h1>
        <p className="text-[10.5px] text-[#64748B]">
          Sistem Informasi Yudisium Terpadu DTEDI SV UGM
        </p>
      </div>
      <ProfileMenu fallbackName="Super Admin" />
    </header>

        <main className="p-6 space-y-5">
          {/* NOTIFIKASI */}
          {notice && (
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium shadow-sm ${
                notice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{notice.text}</span>
              </div>
              <button onClick={() => setNotice(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Pengaturan Sistem</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Kelola role pengguna, form pengajuan, dan template Berita Acara. Hanya dapat diakses oleh akun dengan hak Super Admin.
            </p>
          </div>

          {loadError && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <span>{loadError}</span>
              <button
                onClick={() => {
                  setLoading(true)
                  loadAll()
                }}
                className="rounded-lg bg-white px-3 py-1.5 font-bold text-rose-700 border border-rose-200">
                Coba lagi
              </button>
            </div>
          )}

          {/* ROLE PENGGUNA */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Role Pengguna</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {roles.length} role aktif di sistem. Role bawaan tidak dapat ditambah atau dihapus dari halaman ini.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Memuat role...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleCards.map((r) => {
                  const IconComp = r.icon || ShieldCheck
                  return (
                    <div
                      key={r.id}
                      className="flex min-h-[140px] flex-col justify-between rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-4 hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100/70 text-[#0B3A68] shrink-0">
                            <IconComp size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                            <span className="text-[10px] text-slate-400">{r.count} pengguna</span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(r.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {r.note && (
                        <p className="mt-3 text-[10px] text-slate-400 leading-relaxed border-t border-slate-200/60 pt-2">
                          {r.note}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* PENGGUNA & ROLE */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pengguna & Role</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daftar seluruh akun dan role yang dimiliki.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateForm(EMPTY_FORM)
                  setIsCreateOpen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B3A68] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs"
              >
                <Plus size={16} /> Tambah Pengguna
              </button>
            </div>

            {/* TAB FILTERS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['Semua', 'Mahasiswa', 'Staf Akademik', 'Kaprodi', 'Manit', 'Kadep'].map((tab) => {
                const active = activeTabFilter === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTabFilter(tab)
                      setPage(1)
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      active ? 'bg-[#0B3A68] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`rounded-full px-1.5 text-[10px] ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {filterCounts[tab] || 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Cari Nama / Email / NIM..."
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* TABLE */}
            <div className="rounded-xl border border-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Pengguna</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Prodi</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        <Loader2 size={16} className="mx-auto animate-spin" />
                      </td>
                    </tr>
                  )}
                  {!loading && pagedUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada pengguna yang cocok.
                      </td>
                    </tr>
                  )}
                  {pagedUsers.map((u) => {
                    const key = roleKey(u.roleName)
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                              {initials(u.nama)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.nama}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                                key === 'mahasiswa' || key === 'super_admin'
                                  ? 'bg-amber-100/80 text-amber-800'
                                  : 'bg-blue-100/80 text-blue-900'
                              }`}
                            >
                              {ROLE_LABEL[key] || u.roleName || '-'}
                            </span>
                            {key === 'mahasiswa' && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">{prodiLabel(u)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenUserModal(u)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-400 pt-2">
              <span>{filteredUsers.length} pengguna</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  className="p-1 text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-[#0B3A68] px-1.5 text-xs font-bold text-white">
                  {safePage}
                </span>
                <span>/ {totalPages}</span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="p-1 text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: KELOLA PENGGUNA */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Kelola Pengguna</h3>
              <button onClick={() => setSelectedUserModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 border border-slate-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-700">
                {initials(selectedUserModal.nama)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedUserModal.nama}</h4>
                <p className="text-xs text-slate-400">{selectedUserModal.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama</label>
              <input
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Role</h4>
                <p className="text-[11px] text-slate-400">Satu pengguna memegang satu role pada satu waktu.</p>
              </div>
              {roles.map((r) => {
                const name = r.name ?? r.nama ?? r.nama_role ?? ''
                const key = roleKey(name)
                const meta = ROLE_META[key] || { icon: ShieldCheck, desc: '' }
                const RoleIcon = meta.icon
                const checked = String(editForm.role_id) === String(r.id)
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                      checked ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={checked}
                      onChange={() => setEditForm({ ...editForm, role_id: r.id })}
                      className="mt-0.5 h-4 w-4 accent-[#0B3A68]"
                    />
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      <RoleIcon size={16} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{ROLE_LABEL[key] || name}</span>
                      <span className="text-[10px] text-slate-400">{meta.desc}</span>
                    </div>
                  </label>
                )
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi</label>
              <ProdiSelect
                prodiList={prodiList}
                value={editForm.program_studi_id}
                onChange={(v) => setEditForm({ ...editForm, program_studi_id: v })}
              />
            </div>

            {roleKey(roleNameById(editForm.role_id)) === 'super_admin' && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-amber-900">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-700" />
                <span className="text-[11px] leading-relaxed">
                  Memberi hak Super Admin akan memberi akses penuh ke Pengaturan Sistem (Manajemen Role, Form Pengajuan, Template Berita Acara) kepada pengguna ini.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={String(selectedUserModal.id) === String(currentUser?.id)}
                title={
                  String(selectedUserModal.id) === String(currentUser?.id)
                    ? 'Anda tidak dapat menghapus akun sendiri'
                    : ''
                }
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} /> Hapus Pengguna
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserModal(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveUser}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0B3A68] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#072F57] transition shadow-2xs disabled:opacity-60"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />} Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KONFIRMASI HAPUS */}
      {confirmDelete && selectedUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hapus "{selectedUserModal.nama}"?</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Akun ini akan dihapus dari SIYUDIS dan tidak dapat login lagi. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={saving}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-60"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PENGGUNA */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Pengguna</h3>
                <p className="text-[11px] text-slate-400">
                  Untuk staf dan pejabat. Akun mahasiswa dibuat otomatis saat login Google pertama.
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama</label>
                <input
                  value={createForm.nama}
                  onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
                  placeholder="Nama lengkap"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="nama@ugm.ac.id"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={createForm.role_id}
                  onChange={(e) => setCreateForm({ ...createForm, role_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Pilih role</option>
                  {assignableRoles.map((r) => {
                    const name = r.name ?? r.nama ?? r.nama_role ?? ''
                    return (
                      <option key={r.id} value={r.id}>
                        {ROLE_LABEL[roleKey(name)] || name}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi</label>
                <ProdiSelect
                  prodiList={prodiList}
                  value={createForm.program_studi_id}
                  onChange={(v) => setCreateForm({ ...createForm, program_studi_id: v })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleCreateUser}
                className="flex items-center gap-1.5 rounded-xl bg-[#0B3A68] px-5 py-2 text-xs font-bold text-white hover:bg-[#072F57] transition disabled:opacity-60"
              >
                {saving && <Loader2 size={13} className="animate-spin" />} Simpan Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
